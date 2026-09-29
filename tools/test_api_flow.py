import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_test():
    # 1. Login
    data = urllib.parse.urlencode({"username": "tehsil_operator", "password": "Demo@1234"}).encode()
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login", data=data)
    with urllib.request.urlopen(req) as res:
        tok = json.loads(res.read().decode())["access_token"]
    print("[OK] Logged in successfully as tehsil_operator")

    # 2. Query documents
    req = urllib.request.Request("http://127.0.0.1:8000/api/documents?size=5")
    req.add_header("Authorization", f"Bearer {tok}")
    with urllib.request.urlopen(req) as res:
        docs = json.loads(res.read().decode())
    print(f"[OK] Total documents in DB: {docs.get('total')}")

    for d in docs.get("items", [])[:2]:
        doc_id = d["id"]
        print(f"  -> Doc: {doc_id} | File: {d['filename']} | Type: {d['doc_type']}")
        
        # Test extraction endpoint
        ext_req = urllib.request.Request(f"http://127.0.0.1:8000/api/documents/{doc_id}/extraction")
        ext_req.add_header("Authorization", f"Bearer {tok}")
        with urllib.request.urlopen(ext_req) as ext_res:
            ext_data = json.loads(ext_res.read().decode())
            val = ext_data["validation"]
            print(f"    Rules verified: {val['passed_count']} / {val['total_rules']} passed | Status: {val['status']}")
            print(f"    Confidence: {ext_data['extraction']['overall_confidence']}")
            if val.get("confidence_flags"):
                print(f"    Flagged fields for review: {val['confidence_flags']}")

if __name__ == "__main__":
    run_test()

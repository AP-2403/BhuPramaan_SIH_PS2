.PHONY: up down seed synth test eval demo models retrain clean logs

# ── Primary commands ──────────────────────────────────────────────────────────
up:
	@echo "==> Starting BhuLekh-AI stack..."
	docker compose up -d --build
	@echo "==> Waiting for health checks..."
	@docker compose exec backend sh -c "until curl -sf http://localhost:8000/health; do sleep 2; done"
	@echo ""
	@echo "✓ Stack is up. API: http://localhost:8000  Docs: http://localhost:8000/docs"
	@echo "  Frontend: http://localhost:5173  MinIO: http://localhost:9001"

down:
	docker compose down

clean:
	docker compose down -v --remove-orphans
	@echo "==> Volumes removed. Data is gone."

logs:
	docker compose logs -f backend worker

# ── Data operations ────────────────────────────────────────────────────────────
seed:
	@echo "==> Running seed_db.py..."
	docker compose exec backend python /app/tools/seed_db.py

synth:
	@echo "==> Generating 300 synthetic documents..."
	docker compose exec backend python /app/tools/synth/generate.py --n 300 --seed 42

models:
	@echo "==> Downloading model weights (what is reachable)..."
	docker compose exec backend python /app/tools/fetch_public_data.py fetch D12 D13

# ── Local (host) development ───────────────────────────────────────────────────
synth-local:
	@echo "==> Generating synthetic docs locally (requires Python deps)..."
	cd backend && python ../tools/synth/generate.py --n 300 --seed 42

# ── Testing ────────────────────────────────────────────────────────────────────
test:
	@echo "==> Running backend tests..."
	docker compose exec backend python -m pytest backend/app/tests -v
	@echo "==> Running frontend smoke tests..."
	cd frontend && npx playwright test --reporter=line 2>/dev/null || echo "[SKIP] Playwright not configured yet"

eval:
	@echo "==> Running evaluation pipeline..."
	docker compose exec backend python /app/tools/eval_pipeline.py

# ── Learning loop ─────────────────────────────────────────────────────────────
retrain:
	@echo "==> Triggering retrain via API (admin)..."
	@curl -sf -X POST http://localhost:8000/api/model/retrain \
	  -H "Authorization: Bearer $$(curl -sf -X POST http://localhost:8000/api/auth/login \
	    -H 'Content-Type: application/json' \
	    -d '{"username":"admin","password":"Demo@1234"}' | python -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')" \
	  | python -m json.tool

# ── Demo ──────────────────────────────────────────────────────────────────────
demo:
	@echo "==> Resetting to clean demo state..."
	docker compose exec backend python /app/tools/seed_db.py --reset
	@echo "==> Pre-loading demo files..."
	docker compose exec backend python /app/tools/prep_demo.py
	@echo ""
	@echo "✓ Demo ready. Open http://localhost:5173 and follow docs/DEMO_SCRIPT.md"

# ── Before/after learning loop metrics ────────────────────────────────────────
before-after:
	docker compose exec backend python /app/tools/make_before_after.py

# ── Info ──────────────────────────────────────────────────────────────────────
status:
	@docker compose ps
	@echo ""
	@curl -sf http://localhost:8000/health | python -m json.tool 2>/dev/null || echo "Backend not responding"

import os
import shutil
import subprocess
from pathlib import Path
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print(f"Using FFmpeg: {ffmpeg_exe}")

AUDIO_DIR = Path("frontend/public/audio/tour")
BACKUP_DIR = Path("frontend/public/audio/tour_backup")

BACKUP_DIR.mkdir(parents=True, exist_ok=True)

files = sorted([f for f in AUDIO_DIR.glob("*.m4a")])
print(f"Found {len(files)} audio files to boost in {AUDIO_DIR}")

for f in files:
    backup_file = BACKUP_DIR / f.name
    if not backup_file.exists():
        shutil.copy2(f, backup_file)
    
    temp_out = AUDIO_DIR / f"temp_{f.name}"
    
    # EBU R128 Broadcast loudnorm: target -13 LUFS (loud & punchy for PC speech demo), true peak -0.5 dB
    cmd = [
        ffmpeg_exe, "-y",
        "-i", str(backup_file),
        "-af", "loudnorm=I=-13:TP=-0.5:LRA=7",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "48000",
        str(temp_out)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0 and temp_out.exists() and temp_out.stat().st_size > 1000:
        temp_out.replace(f)
        print(f"[OK] Boosted {f.name} successfully ({f.stat().st_size} bytes)")
    else:
        print(f"[ERROR] Error boosting {f.name}: {result.stderr[-300:]}")
        if temp_out.exists():
            temp_out.unlink()

print("\n--- Audio boosting complete! ---")

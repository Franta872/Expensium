#!/usr/bin/env python3
from pathlib import Path
import json
import zipfile

root = Path(__file__).resolve().parents[1]
extension = root / "extension"
dist = root / "dist"
manifest = json.loads((extension / "manifest.json").read_text(encoding="utf-8"))
target = dist / f"expensium-{manifest['version']}.zip"
dist.mkdir(exist_ok=True)
if target.exists(): target.unlink()
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(extension.rglob("*")):
        if file.is_file(): archive.write(file, file.relative_to(extension))
print(target)

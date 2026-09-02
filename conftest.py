"""Top-level pytest configuration to make local `app` packages importable

This file prepends any discovered `*/app` parent directories to `sys.path`
so tests collected from the repository root can import packages like `app`.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EXCLUDE = {'.venv', 'venv', 'env', 'node_modules', '.git'}

for app_dir in ROOT.rglob('*/app'):
    # skip virtual envs and irrelevant folders
    if any(part in EXCLUDE for part in app_dir.parts):
        continue
    parent = str(app_dir.parent)
    if parent not in sys.path:
        sys.path.insert(0, parent)

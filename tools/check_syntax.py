import py_compile
import sys
from pathlib import Path

exclude_dirs = {'.venv', 'venv', 'env', 'node_modules', '.git', 'public', 'outputs', 'uploads', 'logs', 'pdf_vector_db'}
errors = []
for p in Path('.').rglob('*.py'):
    if any(part in exclude_dirs for part in p.parts):
        continue
    try:
        py_compile.compile(str(p), doraise=True)
    except Exception as e:
        errors.append(f"{p}: {e}")

if errors:
    print('SYNTAX ERRORS FOUND')
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print('No syntax errors found')
    sys.exit(0)

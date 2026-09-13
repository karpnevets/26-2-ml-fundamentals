"""Execute every notebook in a fresh process. No network or saved outputs."""
import json
import os
from pathlib import Path
import subprocess
import sys

for path in sorted(Path('notebooks').glob('week-*.ipynb')):
    nb = json.loads(path.read_text(encoding='utf-8'))
    assert nb['nbformat'] == 4
    cells = nb['cells']
    assert len({c['id'] for c in cells}) == len(cells)
    assert all(c.get('outputs', []) == [] for c in cells)
    snippets = ['import matplotlib; matplotlib.use("Agg")']
    for index, cell in enumerate(cells):
        if cell['cell_type'] == 'code':
            source = ''.join(cell['source'])
            compile(source, f'{path}:cell-{index}', 'exec')
            snippets.append(source)
    result = subprocess.run([sys.executable, '-c', '\n'.join(snippets)],
        capture_output=True, text=True, encoding='utf-8', timeout=180,
        env={**os.environ, 'PYTHONIOENCODING':'utf-8','MPLBACKEND':'Agg'})
    if result.returncode:
        print(result.stderr)
        raise RuntimeError(str(path))
    print(f'PASS {path}: all code cells executed in order')

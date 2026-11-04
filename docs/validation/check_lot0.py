"""Validate this documentation; optional immutable source anchor verification."""
import argparse, hashlib, json, re
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--references',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
count=0
for p in root.rglob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if '://' in target or target.startswith('#'): continue
        assert (p.parent/target.split('#')[0]).exists(),(p,target)
        count+=1
for p in root.rglob('*.json'): json.loads(p.read_text())
anchors=json.loads((root/'audit/anchors.json').read_text())
if args.references:
    for a in anchors:
        path=args.references/a['repository']/a['file']
        assert path.exists(),path
        assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sha256'],path
        assert a['needle'] in path.read_text().splitlines()[a['line']-1],a
spec=(root/'KOBE_V1_SPEC.md').read_text()
for color in ['#151419','#B86637','#872F35','#E5B963','#F0E5CE']: assert color in spec
for f in ['KOBE_V1_SPEC.md','KOBE_PROGRESS.md','ARCHITECTURE.md','RULES_AND_ASSETS.md','LOTS.md','contracts/INTERFACES.md','audit/RECOVERY.md','audit/COMPANIONS.md']: assert (root/f).exists()
assert len(anchors)==26
print(f'PASS: {count} relative links, JSON, 26 source anchors'+(' and hashes' if args.references else ' (source bytes not checked)')+', palette and required documents')

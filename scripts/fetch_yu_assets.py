"""Fetch only Yu XII's two models and the pinned Spine 3.8 browser runtime."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen
import json

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'live2d'
WEB_REV = '63d96eeba95d3e6d65479e9c7ff27a49913ecb5c'
MODEL_REV = '8a3857c250a5c271429aefa82c660ff35803166e'
FILES = [('SHUAXINDIARY/ArknightsLive2d-Web', WEB_REV,
          'assets/js/spine-webgl.js', 'vendor/spine-webgl.js')]
for variant, folder, stem in [
    ('chibi', 'models/2026_yu_nian#12', 'build_char_2026_yu_nian#12'),
    ('portrait', 'models_illust/dyn_illust_2026_yu_nian#12', 'dyn_illust_char_2026_yu_nian#12'),
]:
    for ext in ('atlas', 'png', 'skel'):
        FILES.append(('isHarryh/Ark-Models', MODEL_REV,
                      f'{folder}/{stem}.{ext}', f'models/{variant}/model.{ext}'))


def fetch(item):
    repo, revision, source, target = item
    url = f'https://raw.githubusercontent.com/{repo}/{revision}/{quote(source, safe="/")}'
    with urlopen(url, timeout=90) as response:
        original = response.read()
    data = original
    changes = []
    if target.endswith('.atlas'):
        lines = data.decode('utf-8').splitlines(keepends=True)
        page = next(i for i, line in enumerate(lines) if line.strip())
        lines[page] = 'model.png\n'
        data = ''.join(lines).encode('utf-8')
        changes.append('Rename the single atlas page to model.png.')
    if target.endswith('spine-webgl.js'):
        code = data.decode('utf-8')
        for old, new in [('encodeURIComponent(url)', 'encodeURI(url)'),
                         ('encodeURIComponent(path)', 'encodeURI(path)')]:
            count = code.count(old)
            if not count:
                raise RuntimeError(f'Expected runtime URL patch not found: {old}')
            code = code.replace(old, new)
            changes.append(f'{old} -> {new} ({count} occurrences); preserve URL separators.')
        data = code.encode('utf-8')
    destination = ROOT / target
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    return dict(file=target, source=url, bytes=len(data), sha256=sha256(data).hexdigest(),
                originalSha256=sha256(original).hexdigest(), adaptations=changes)


if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(fetch, FILES))
    manifest = dict(character='Yu', outfit='0011 Manufacture / XII',
                    webRevision=WEB_REV, modelRevision=MODEL_REV, files=records)
    (ROOT / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    for record in records:
        print(record['file'], record['bytes'])

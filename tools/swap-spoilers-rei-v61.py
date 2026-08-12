from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

import cv2
import numpy as np
import requests
from PIL import Image, ImageOps

OLD_VERSION = 'spoilers-alternates-v60'
NEW_VERSION = 'spoilers-rei-align-v61'
ROOT = Path(__file__).resolve().parents[1]
CARD_ROOT = ROOT / 'assets/revive/member-cards'
MANIFEST = CARD_ROOT / 'manifest.json'
SOURCE_PAGE = 'https://www.ptt.cc/bbs/IVE_STARSHIP/M.1769526059.A.0FF.html'
OFFICIAL_POST = 'https://x.com/IVEstarship/status/2016150820228890959'
REI_IDS = ['QzkZue5','JGJe8Z2','k82x3Cr','9lCLKgA','cwCDsBn','6Vw8aFa','eimFTEB','HptaZta','tcMoUt2','BXTxBOk','Mzwjkxd','LdhiE6g','kFQu8tO','blUwr2A','Eimswes']
CURRENT_ORDINAL = 1
ANCHORS = ['gaeul', 'yujin', 'wonyoung', 'liz', 'leeseo']
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36'}
CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha(path.read_bytes())


def decode(data: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(data))
    image = ImageOps.exif_transpose(image).convert('RGB')
    image.load()
    return image


def download(image_id: str) -> tuple[str, bytes, Image.Image]:
    urls = [f'https://i.imgur.com/{image_id}.jpg', f'https://imgur.com/{image_id}.jpg']
    last = None
    for url in urls:
        try:
            response = requests.get(url, headers=HEADERS, timeout=45)
            response.raise_for_status()
            return url, response.content, decode(response.content)
        except Exception as exc:
            last = exc
    raise last


def normalized_face(image: Image.Image):
    small = image.copy()
    small.thumbnail((900, 900))
    arr = cv2.cvtColor(np.asarray(small), cv2.COLOR_RGB2GRAY)
    faces = CASCADE.detectMultiScale(arr, scaleFactor=1.08, minNeighbors=4, minSize=(42, 42))
    if len(faces) == 0:
        return None
    h, w = arr.shape[:2]
    x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
    return np.array([fw / w, fh / h, (x + fw / 2) / w, (y + fh / 2) / h], dtype=float)


def signature(image: Image.Image):
    preview = image.copy()
    preview.thumbnail((320, 320))
    arr = np.asarray(preview, dtype=np.uint8)
    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [18, 8], [0, 180, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    edge = float((cv2.Canny(gray, 80, 180) > 0).mean())
    return {'hist': hist, 'edge': edge, 'aspect': image.width / image.height, 'face': normalized_face(image)}


def mean_anchor():
    sigs = []
    for member in ANCHORS:
        path = CARD_ROOT / 'spoilers' / f'{member}.jpg'
        with Image.open(path) as raw:
            image = ImageOps.exif_transpose(raw).convert('RGB')
            image.load()
        sig = signature(image)
        sigs.append(sig)
        print('ANCHOR', member, 'face', None if sig['face'] is None else sig['face'].round(4).tolist(), 'aspect', round(sig['aspect'], 4), 'edge', round(sig['edge'], 4))
    faces = [s['face'] for s in sigs if s['face'] is not None]
    return {
        'hist': np.mean([s['hist'] for s in sigs], axis=0),
        'edge': float(np.mean([s['edge'] for s in sigs])),
        'aspect': float(np.mean([s['aspect'] for s in sigs])),
        'face': np.mean(faces, axis=0) if faces else None,
    }


def score(sig, anchor):
    corr = cv2.compareHist(sig['hist'].astype(np.float32), anchor['hist'].astype(np.float32), cv2.HISTCMP_CORREL)
    hist_penalty = (1.0 - float(corr)) * 2.2
    edge_penalty = abs(sig['edge'] - anchor['edge']) * 5.0
    aspect_penalty = abs(sig['aspect'] - anchor['aspect']) * 2.0
    if anchor['face'] is None:
        face_penalty = 0.0
    elif sig['face'] is None:
        face_penalty = 3.0
    else:
        face_penalty = float(np.sum(np.abs(sig['face'] - anchor['face']) * np.array([4.0, 4.0, 2.5, 3.0])))
    return face_penalty + hist_penalty + edge_penalty + aspect_penalty


def save_jpeg(image: Image.Image, path: Path):
    image.save(path, 'JPEG', quality=92, optimize=True, progressive=True, subsampling=0)


manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
record = next(item for item in manifest['assets'] if item['set'] == 'spoilers' and item['member'] == 'rei')
protected = [p for p in CARD_ROOT.glob('*/*.jpg') if not (p.parent.name == 'spoilers' and p.stem == 'rei')]
protected_before = {str(p.relative_to(ROOT)): file_sha(p) for p in protected}
rei_path = CARD_ROOT / 'spoilers' / 'rei.jpg'
old_hash = file_sha(rei_path)
anchor = mean_anchor()
print('ANCHOR TARGET', None if anchor['face'] is None else anchor['face'].round(4).tolist(), round(anchor['aspect'], 4), round(anchor['edge'], 4))

candidates = []
for ordinal, image_id in enumerate(REI_IDS, start=1):
    if ordinal == CURRENT_ORDINAL:
        continue
    try:
        url, raw, image = download(image_id)
        sig = signature(image)
        value = score(sig, anchor)
        candidates.append((value, ordinal, url, image))
    except Exception as exc:
        print('SKIP', ordinal, image_id, type(exc).__name__, str(exc)[:120])

if not candidates:
    raise RuntimeError('No usable alternate SPOILERS candidates for Rei')
candidates.sort(key=lambda item: item[0])
print('TOP REI', [(ordinal, round(value, 4)) for value, ordinal, *_ in candidates[:8]])
value, ordinal, url, image = candidates[0]
save_jpeg(image, rei_path)
new_hash = file_sha(rei_path)
if new_hash == old_hash:
    raise RuntimeError('Rei replacement produced same binary')

record.update({
    'source': url,
    'resolved_source': url,
    'bytes': rei_path.stat().st_size,
    'sha256': new_hash,
    'source_page': SOURCE_PAGE,
    'official_post': OFFICIAL_POST,
    'concept': 'SPOILERS CONCEPT PHOTO · FIVE-CARD-ALIGNED REI ALTERNATE',
    'source_ordinal': ordinal,
    'selection_method': 'alternate official SPOILERS cut selected against the five retained SPOILERS cards; previous Rei cut excluded',
    'dimensions': [image.width, image.height],
    'anchor_score': round(float(value), 6),
})
record.pop('match_features', None)
MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

for path in list(ROOT.rglob('*.html')) + list(ROOT.rglob('*.js')) + list(ROOT.rglob('*.css')):
    if '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    if OLD_VERSION in text:
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION), encoding='utf-8')
        print('VERSION', path.relative_to(ROOT))

protected_after = {str(p.relative_to(ROOT)): file_sha(p) for p in protected}
if protected_before != protected_after:
    changed = [k for k in protected_before if protected_before[k] != protected_after.get(k)]
    raise RuntimeError(f'Protected member cards changed: {changed}')

members_html = (ROOT / 'members.html').read_text(encoding='utf-8')
loader = (ROOT / 'album-theme-sync.js').read_text(encoding='utf-8')
if f'album-theme-sync.js?v={NEW_VERSION}' not in members_html:
    raise RuntimeError('members.html loader version mismatch')
if f"MOBILE_ASSET_VERSION = '{NEW_VERSION}'" not in loader:
    raise RuntimeError('album-theme-sync.js internal version mismatch')

print('SELECT REI cut', ordinal, (image.width, image.height), rei_path.stat().st_size, new_hash, 'score', round(value, 4))
print('IMMUTABLE VERIFIED', len(protected_after), 'other card files')
print('DONE', NEW_VERSION)

from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

import cv2
import numpy as np
import requests
from PIL import Image, ImageOps

OLD_VERSION = 'challengers-gaeul-align-v59'
NEW_VERSION = 'spoilers-alternates-v60'
ROOT = Path(__file__).resolve().parents[1]
CARD_ROOT = ROOT / 'assets/revive/member-cards'
MANIFEST = CARD_ROOT / 'manifest.json'
SOURCE_PAGE = 'https://www.ptt.cc/bbs/IVE_STARSHIP/M.1769526059.A.0FF.html'

IDS = {
    'gaeul': ['07h20N1','cwa7j4g','YtKKf47','lQvLCY3','2yaY0XK','UgLtHZh','R0f7Xu9','y6Arh2j','gqfqpZN','BSfahVV','yTa3Sbf','2W0faZv','C0ajbJB','rsk8hIZ','k9nUzdD'],
    'yujin': ['C9eiRHl','0j0gGiC','p3c6Wy1','i044efx','SZJR1oO','UjADZyW','mab4H6J','ZkDenaP','vXhTZ1Q','xEGSPgr','QjWa261','5704Dl8','5FE8s5z','nVYXSzD','ftmjW86'],
    'rei': ['QzkZue5','JGJe8Z2','k82x3Cr','9lCLKgA','cwCDsBn','6Vw8aFa','eimFTEB','HptaZta','tcMoUt2','BXTxBOk','Mzwjkxd','LdhiE6g','kFQu8tO','blUwr2A','Eimswes'],
    'wonyoung': ['7um9Vbl','PCP9J1j','ZWQOCpD','syoXyLW','rO8ke1s','YqTiecz','iFPRhoE','RZrFwNo','G2HVxDh','uxkvCZK','8l3FTzp','bD8hryY','nUwIaLx','L2s0Q8V','vTSKTwv'],
    'liz': ['gRgyYBN','FkD8Hj5','NT3KDm4','SXIa32q','QhTt2po','LGoLGU2','8Pt8qOZ','rxZehvW','y74kzOr','cDI7HKP','WvpWYkD','GD4LXKr','VeeR7AZ','kCWzjxJ','CbVrDva'],
    'leeseo': ['qZgZL3X','wADkLMC','fAxHA7F','p6V7PWS','jwF6PO3','KGSGu9d','v8Hx7FJ','2wfP9xh','PWHBROy','JzR0f2N','fnzIxcz','V7mLr5T','FXwyhEe','H3CiZjF','f9BLVAY'],
}

CURRENT_ORDINAL = {
    'gaeul': 7,
    'yujin': 3,
    'rei': 13,
    'wonyoung': 13,
    'liz': 1,
    'leeseo': 10,
}
TARGETS = ['gaeul', 'rei', 'liz', 'leeseo']
ANCHORS = ['yujin', 'wonyoung']
OFFICIAL_POSTS = {
    'gaeul': 'https://x.com/IVEstarship/status/2016151017696723199',
    'yujin': 'https://x.com/IVEstarship/status/2016151111749820512',
    'rei': 'https://x.com/IVEstarship/status/2016150820228890959',
    'wonyoung': 'https://x.com/IVEstarship/status/2016150607573483593',
    'liz': 'https://x.com/IVEstarship/status/2016150914076443139',
    'leeseo': 'https://x.com/IVEstarship/status/2016150712049402127',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}
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


def download(url: str) -> tuple[bytes, Image.Image]:
    image_id = url.rsplit('/', 1)[-1].split('.', 1)[0]
    attempts = [
        f'https://i.imgur.com/{image_id}.jpg',
        f'https://i.imgur.com/{image_id}.jpeg',
        f'https://imgur.com/{image_id}.jpg',
        f'https://imgur.com/{image_id}.jpeg',
    ]
    errors = []
    session = requests.Session()
    session.headers.update(HEADERS)
    for candidate in attempts:
        try:
            response = session.get(candidate, timeout=45, allow_redirects=True)
            response.raise_for_status()
            image = decode(response.content)
            return response.content, image
        except Exception as exc:
            errors.append(f'{candidate}: {type(exc).__name__} {str(exc)[:90]}')
    raise RuntimeError(' | '.join(errors))


def normalized_face(image: Image.Image):
    small = image.copy()
    small.thumbnail((900, 900))
    arr = cv2.cvtColor(np.asarray(small), cv2.COLOR_RGB2GRAY)
    faces = CASCADE.detectMultiScale(arr, scaleFactor=1.08, minNeighbors=4, minSize=(42, 42))
    if len(faces) == 0:
        return None
    h, w = arr.shape[:2]
    x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
    return np.array([
        fw / w,
        fh / h,
        (x + fw / 2) / w,
        (y + fh / 2) / h,
    ], dtype=float)


def visual_signature(image: Image.Image):
    preview = image.copy()
    preview.thumbnail((320, 320))
    arr = np.asarray(preview, dtype=np.uint8)
    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [18, 8], [0, 180, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    edge_density = float((cv2.Canny(gray, 80, 180) > 0).mean())
    aspect = image.width / image.height
    face = normalized_face(image)
    return {'hist': hist, 'edge': edge_density, 'aspect': aspect, 'face': face}


def mean_anchor_signature():
    sigs = []
    for member in ANCHORS:
        path = CARD_ROOT / 'spoilers' / f'{member}.jpg'
        with Image.open(path) as raw:
            image = ImageOps.exif_transpose(raw).convert('RGB')
            image.load()
        sig = visual_signature(image)
        sigs.append(sig)
        print('ANCHOR', member, CURRENT_ORDINAL[member], 'face', None if sig['face'] is None else sig['face'].round(4).tolist(), 'aspect', round(sig['aspect'], 4), 'edge', round(sig['edge'], 4))
    faces = [s['face'] for s in sigs if s['face'] is not None]
    return {
        'hist': np.mean([s['hist'] for s in sigs], axis=0),
        'edge': float(np.mean([s['edge'] for s in sigs])),
        'aspect': float(np.mean([s['aspect'] for s in sigs])),
        'face': np.mean(faces, axis=0) if faces else None,
    }


def score(sig, anchor):
    hist_corr = cv2.compareHist(sig['hist'].astype(np.float32), anchor['hist'].astype(np.float32), cv2.HISTCMP_CORREL)
    hist_penalty = (1.0 - float(hist_corr)) * 2.2
    edge_penalty = abs(sig['edge'] - anchor['edge']) * 5.0
    aspect_penalty = abs(sig['aspect'] - anchor['aspect']) * 2.0
    if anchor['face'] is None:
        face_penalty = 0.0
    elif sig['face'] is None:
        face_penalty = 3.0
    else:
        weights = np.array([4.0, 4.0, 2.5, 3.0])
        face_penalty = float(np.sum(np.abs(sig['face'] - anchor['face']) * weights))
    return face_penalty + hist_penalty + edge_penalty + aspect_penalty


def save_jpeg(image: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'JPEG', quality=92, optimize=True, progressive=True, subsampling=0)


manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
records = {(item['set'], item['member']): item for item in manifest['assets']}

protected_paths = [p for p in CARD_ROOT.glob('*/*.jpg') if not (p.parent.name == 'spoilers' and p.stem in TARGETS)]
protected_before = {str(p.relative_to(ROOT)): file_sha(p) for p in protected_paths}
anchor_before = {m: file_sha(CARD_ROOT / 'spoilers' / f'{m}.jpg') for m in ANCHORS}

anchor = mean_anchor_signature()
print('ANCHOR TARGET face', None if anchor['face'] is None else anchor['face'].round(4).tolist(), 'aspect', round(anchor['aspect'], 4), 'edge', round(anchor['edge'], 4))

selections = {}
for member in TARGETS:
    candidates = []
    current_ordinal = CURRENT_ORDINAL[member]
    for ordinal, image_id in enumerate(IDS[member], start=1):
        if ordinal == current_ordinal:
            continue
        url = f'https://i.imgur.com/{image_id}.jpg'
        try:
            raw, image = download(url)
            sig = visual_signature(image)
            value = score(sig, anchor)
            candidates.append((value, ordinal, url, raw, image, sig))
        except Exception as exc:
            print('SKIP', member, ordinal, url, type(exc).__name__, str(exc)[:240])
    if not candidates:
        raise RuntimeError(f'No usable alternate SPOILERS candidates for {member}')
    candidates.sort(key=lambda item: item[0])
    print('TOP', member, [(ordinal, round(value, 4)) for value, ordinal, *_ in candidates[:6]])
    best = candidates[0]
    value, ordinal, url, raw, image, sig = best
    if ordinal == current_ordinal:
        raise RuntimeError(f'{member} did not change')
    out = CARD_ROOT / 'spoilers' / f'{member}.jpg'
    old_hash = file_sha(out)
    save_jpeg(image, out)
    new_hash = file_sha(out)
    if new_hash == old_hash:
        raise RuntimeError(f'{member} alternate produced the same binary')
    record = records[('spoilers', member)]
    record.update({
        'source': url,
        'resolved_source': url,
        'bytes': out.stat().st_size,
        'sha256': new_hash,
        'source_page': SOURCE_PAGE,
        'official_post': OFFICIAL_POSTS[member],
        'concept': 'SPOILERS CONCEPT PHOTO · YUJIN/WONYOUNG-ALIGNED ALTERNATE',
        'source_ordinal': ordinal,
        'selection_method': 'alternate official SPOILERS cut selected against retained Yujin/Wonyoung card framing; previous cut excluded',
        'dimensions': [image.width, image.height],
        'anchor_score': round(float(value), 6),
    })
    record.pop('match_features', None)
    selections[member] = (ordinal, new_hash, out.stat().st_size, image.width, image.height, value)

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

for path in list(ROOT.rglob('*.html')) + list(ROOT.rglob('*.js')) + list(ROOT.rglob('*.css')):
    if '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    if OLD_VERSION in text:
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION), encoding='utf-8')
        print('VERSION', path.relative_to(ROOT))

protected_after = {str(p.relative_to(ROOT)): file_sha(p) for p in protected_paths}
if protected_before != protected_after:
    changed = [k for k in protected_before if protected_before[k] != protected_after.get(k)]
    raise RuntimeError(f'Protected member cards changed: {changed}')
for member, digest in anchor_before.items():
    current = file_sha(CARD_ROOT / 'spoilers' / f'{member}.jpg')
    if current != digest:
        raise RuntimeError(f'Anchor {member} changed unexpectedly')

members_html = (ROOT / 'members.html').read_text(encoding='utf-8')
loader = (ROOT / 'album-theme-sync.js').read_text(encoding='utf-8')
if f'album-theme-sync.js?v={NEW_VERSION}' not in members_html:
    raise RuntimeError('members.html loader version mismatch')
if f"MOBILE_ASSET_VERSION = '{NEW_VERSION}'" not in loader:
    raise RuntimeError('album-theme-sync.js internal version mismatch')

for member in TARGETS:
    ordinal, digest, size, width, height, value = selections[member]
    print('SELECT', member, 'cut', ordinal, (width, height), size, digest[:16], 'score', round(value, 4))
print('ANCHORS UNCHANGED', anchor_before)
print('IMMUTABLE VERIFIED', len(protected_after), 'protected card files')
print('DONE', NEW_VERSION)

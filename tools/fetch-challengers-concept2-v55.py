from __future__ import annotations

from io import BytesIO
from pathlib import Path
import hashlib
import json
import urllib.request

from PIL import Image, ImageOps

OLD_VERSION = 'challengers-card-owner-sync-v54'
NEW_VERSION = 'challengers-concept2-cards-v55'
SOURCE_PAGE = 'https://www.pannchoa.com/2026/02/theqoo-ive-2nd-album-revive-challengers_3.html'

SOURCES = {
    'gaeul': {
        'source': 'https://blogger.googleusercontent.com/img/a/AVvXsEhgV9_rkDOVY6gK2PwWD40xAfbLtiysKMv-TsGFnRwpOUmj5UppWl75_sxQrQhbkBpJZAym9RhZH4uuCoxOqFWPnaLOYOdpve0Vn51_GTWKcci0JK8RWFjb2wTjcCeU8BC6uvtkfPm5i7-S7JIHefmUs3_-Es4UiqQrgk1emh40WRw2S_sIIyxz-GIM46Cg',
        'official_post': 'https://x.com/IVEstarship/status/2018686237352079410',
    },
    'yujin': {
        'source': 'https://blogger.googleusercontent.com/img/a/AVvXsEjjeynLY8Ypr6XP3l4BE_iirXCAYkPObbXbaY_Aps1z77M0NAXKQmy5krafm2sglAzW4-7vF9i_cPipRbhmKAHduN83K4pbzv93aSIV4xYKb-rJpXrho4xmrnRlJ7fuEBdA4TB3nAFmKS21iV7kDqx8IJRb_RIWE3IfhQL7r4c9-io2WmAQbM1L6iIEltA8',
        'official_post': 'https://x.com/IVEstarship/status/2018686596204159478',
    },
    'rei': {
        'source': 'https://blogger.googleusercontent.com/img/a/AVvXsEj99OH4Vbe3TmKg4YH_EXA5avOfOH_AJ7sTt0cHwlxtegYoGt0ZX93bCfwrWTJBhDCBxurx4lZAP8WdqQAwV1z6nvReB46Jtj93PcT9sREKLMr4rmHDJJ5b1PQqXbDPZwOAUrPWIyJfamtbAukOS6GOIdKth64lFZUfcPXxZV675GXD_6I5Y22m5WnPCqhP',
        'official_post': 'https://x.com/IVEstarship/status/2018686360610029824',
    },
    'wonyoung': {
        'source': 'https://blogger.googleusercontent.com/img/a/AVvXsEjrK1AQ9FVa2W1mYCybq273VndYSZUgditIdQUsuI2MfONKq1X9jPv8ohYjILZnDjLUhkQTA6WvnVHYJ-6kLSB51zKk7d6Jmf6KgXKJ_zeyIa9PL-rL3f1-f-pGV6fCvO7e43Vy4Kyfzg9qn3z5sh3mIagDbFKa1HqCm7oUEZWSTUdOWoAqx9VS9dIWWmBG',
        'official_post': 'https://x.com/IVEstarship/status/2018686484816027989',
    },
    'liz': {
        'source': 'https://blogger.googleusercontent.com/img/a/AVvXsEjEBHw2GS78pmn7dseng2eI1ToEFqK6w64urcSAKexayG5CDdCcCXmlQqb3t79BRsDgceEU9s-6Nf2tB9we5gC498Ps3L3t0Mj0oU8AA-AAaApewS7C1D9G7eREFqLOR0DceDuvxm76xIcYlqdqRu8QfNV7gk6Z4KHTugFgpWtWwpEHcDtL4lPx5VBkphrn',
        'official_post': 'https://x.com/IVEstarship/status/2018685965313741223',
    },
    'leeseo': {
        'source': 'https://blogger.googleusercontent.com/img/a/AVvXsEisTjCpozQIMBLJMXHxiMmpIWAIpeFQwTp7C0QDrM17xcgDlrmRpkZ5hWdfss_QZ_N3vjY837wdRFsue7iqNeqFI0tMKyj9upbIN-he8qjc--8RQ7Lck_gRaCdkGUqgyiksc9qCGyLe4gdjt4-oBLzZmx46GVXXf2FmF35JO7_PZiv_jZFgs9QFjuWIZ9QF',
        'official_post': 'https://x.com/IVEstarship/status/2018686118691012895',
    },
}


def fetch_image(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            'Referer': SOURCE_PAGE,
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
    if len(data) < 50_000:
        raise RuntimeError(f'download too small: {len(data)} bytes from {url}')
    return data


def write_jpeg(member: str, source: str) -> tuple[int, str, tuple[int, int]]:
    raw = fetch_image(source)
    with Image.open(BytesIO(raw)) as image:
        image.load()
        image = ImageOps.exif_transpose(image).convert('RGB')
        width, height = image.size
        if width < 700 or height < 700:
            raise RuntimeError(f'{member} image is unexpectedly small: {width}x{height}')
        target = Path(f'assets/revive/member-cards/challengers/{member}.jpg')
        image.save(target, 'JPEG', quality=93, optimize=True, progressive=True)
    payload = target.read_bytes()
    return len(payload), hashlib.sha256(payload).hexdigest(), (width, height)


results: dict[str, dict[str, object]] = {}
for member, meta in SOURCES.items():
    byte_count, digest, dimensions = write_jpeg(member, meta['source'])
    results[member] = {
        'bytes': byte_count,
        'sha256': digest,
        'dimensions': list(dimensions),
    }
    print(member, byte_count, digest[:12], dimensions)

manifest_path = Path('assets/revive/member-cards/manifest.json')
manifest = json.loads(manifest_path.read_text())
for asset in manifest['assets']:
    if asset.get('set') != 'challengers':
        continue
    member = asset['member']
    meta = SOURCES[member]
    asset.update({
        'source': meta['source'],
        'resolved_source': meta['source'],
        'bytes': results[member]['bytes'],
        'sha256': results[member]['sha256'],
        'source_page': SOURCE_PAGE,
        'official_post': meta['official_post'],
        'concept': 'CHALLENGERS CONCEPT PHOTO 2',
        'dimensions': results[member]['dimensions'],
    })
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

# Update CHALLENGERS copy to match the new street/industrial portrait series.
core_path = Path('revive-member-sets.js')
core = core_path.read_text()
core = core.replace(
    "description: 'Black-stage portraits cut by laser green light and cold mint styling.',\n      themeColor: '#10e68a',\n      tags: ['Laser green', 'Black stage', 'Cold mint', 'Challenge mode'],",
    "description: 'Industrial street portraits mixing cobalt blue, hard red, metallic pink, black, and raw concrete.',\n      themeColor: '#b62d24',\n      tags: ['Industrial blue', 'Hard red', 'Metallic pink', 'Street edge'],",
)
core_path.write_text(core)

# Production-wide version/cache bust.
for path in Path('.').rglob('*'):
    if not path.is_file() or path.suffix not in {'.html', '.js', '.css'}:
        continue
    try:
        text = path.read_text()
    except UnicodeDecodeError:
        continue
    if OLD_VERSION in text:
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION))

# Validate top-level loader and internal mobile token match.
index = Path('index.html').read_text()
members = Path('members.html').read_text()
loader = Path('album-theme-sync.js').read_text()
needle = f'album-theme-sync.js?v={NEW_VERSION}'
if needle not in index or needle not in members:
    raise RuntimeError('HTML album-theme loader token not bumped to v55')
if f"const MOBILE_ASSET_VERSION = '{NEW_VERSION}';" not in loader:
    raise RuntimeError('MOBILE_ASSET_VERSION does not match v55')
if f"const CARD_ASSET_VERSION = '{NEW_VERSION}';" not in Path('revive-member-sets.js').read_text():
    raise RuntimeError('CARD_ASSET_VERSION does not match v55')

Path('tools/fetch-challengers-concept2-v55.py').unlink(missing_ok=True)
Path('.github/workflows/fetch-challengers-concept2-v55.yml').unlink(missing_ok=True)

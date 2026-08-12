from __future__ import annotations

import hashlib
import io
import itertools
import json
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np
import requests
from PIL import Image

OLD_VERSION = 'coherent-member-cardsets-v56'
NEW_VERSION = 'portrait-matched-cardsets-v57'
ROOT = Path(__file__).resolve().parents[1]
CARD_ROOT = ROOT / 'assets/revive/member-cards'
MANIFEST = CARD_ROOT / 'manifest.json'
MEMBERS = ['gaeul', 'yujin', 'rei', 'wonyoung', 'liz', 'leeseo']

SOURCE_PAGES = {
    'bangers': 'https://www.ptt.cc/bbs/IVE_STARSHIP/M.1771426264.A.F85.html',
    'challengers': 'https://www.pannchoa.com/2026/02/theqoo-ive-2nd-album-revive-challengers_3.html',
    'spoilers': 'https://www.ptt.cc/bbs/IVE_STARSHIP/M.1769526059.A.0FF.html',
}

OFFICIAL_POSTS = {
    'bangers': {
        'gaeul': 'https://x.com/IVEstarship/status/2024121969587761165',
        'yujin': 'https://x.com/IVEstarship/status/2024121836557185221',
        'rei': 'https://x.com/IVEstarship/status/2024121756412236221',
        'wonyoung': 'https://x.com/IVEstarship/status/2024122160810451353',
        'liz': 'https://x.com/IVEstarship/status/2024122105168855228',
        'leeseo': 'https://x.com/IVEstarship/status/2024121904383004940',
    },
    'challengers': {
        'gaeul': 'https://x.com/IVEstarship/status/2018686237352079410',
        'yujin': 'https://x.com/IVEstarship/status/2018686596204159478',
        'rei': 'https://x.com/IVEstarship/status/2018686360610029824',
        'wonyoung': 'https://x.com/IVEstarship/status/2018686484816027989',
        'liz': 'https://x.com/IVEstarship/status/2018685965313741223',
        'leeseo': 'https://x.com/IVEstarship/status/2018686118691012895',
    },
    'spoilers': {
        'gaeul': 'https://x.com/IVEstarship/status/2016151017696723199',
        'yujin': 'https://x.com/IVEstarship/status/2016151111749820512',
        'rei': 'https://x.com/IVEstarship/status/2016150820228890959',
        'wonyoung': 'https://x.com/IVEstarship/status/2016150607573483593',
        'liz': 'https://x.com/IVEstarship/status/2016150914076443139',
        'leeseo': 'https://x.com/IVEstarship/status/2016150712049402127',
    },
}

BANGERS_IDS = {
    'gaeul': ['WuNitxa', '4hsGTOs', 'Nhq7TJZ', '8YcTOah', 'YMGFk57', 'zEOpLCc'],
    'yujin': ['bx3bimk', 'KCZkQiX', 'YQO5HMt', 'JH54fPO', 'v7Pc3Lo', '1yZPmkJ'],
    'rei': ['4UCnYQC', 'm1ERSWg', 'RgMYhff', 'UdfuGpO', 'mjqKUkm', 'qRPBMwl'],
    'wonyoung': ['QJEOoxJ', 'IHBkZIr', 'rM2XNeL', '3FwuzId', 'IOEwPMi', 'KC353pM'],
    'liz': ['X9GMWnT', 'vQ9l4no', '357dsaD', 'QMaMpC1', 'SIpgS1v', 'j7ERyM7'],
    'leeseo': ['dCKfure', 'YfLymCh', '7RlyvTg', 'iXT2yLw', 'goQWero', 'zga7qNB'],
}

SPOILERS_IDS = {
    'gaeul': ['07h20N1','cwa7j4g','YtKKf47','lQvLCY3','2yaY0XK','UgLtHZh','R0f7Xu9','y6Arh2j','gqfqpZN','BSfahVV','yTa3Sbf','2W0faZv','C0ajbJB','rsk8hIZ','k9nUzdD'],
    'yujin': ['C9eiRHl','0j0gGiC','p3c6Wy1','i044efx','SZJR1oO','UjADZyW','mab4H6J','ZkDenaP','vXhTZ1Q','xEGSPgr','QjWa261','5704Dl8','5FE8s5z','nVYXSzD','ftmjW86'],
    'rei': ['QzkZue5','JGJe8Z2','k82x3Cr','9lCLKgA','cwCDsBn','6Vw8aFa','eimFTEB','HptaZta','tcMoUt2','BXTxBOk','Mzwjkxd','LdhiE6g','kFQu8tO','blUwr2A','Eimswes'],
    'wonyoung': ['7um9Vbl','PCP9J1j','ZWQOCpD','syoXyLW','rO8ke1s','YqTiecz','iFPRhoE','RZrFwNo','G2HVxDh','uxkvCZK','8l3FTzp','bD8hryY','nUwIaLx','L2s0Q8V','vTSKTwv'],
    'liz': ['gRgyYBN','FkD8Hj5','NT3KDm4','SXIa32q','QhTt2po','LGoLGU2','8Pt8qOZ','rxZehvW','y74kzOr','cDI7HKP','WvpWYkD','GD4LXKr','VeeR7AZ','kCWzjxJ','CbVrDva'],
    'leeseo': ['qZgZL3X','wADkLMC','fAxHA7F','p6V7PWS','jwF6PO3','KGSGu9d','v8Hx7FJ','2wfP9xh','PWHBROy','JzR0f2N','fnzIxcz','V7mLr5T','FXwyhEe','H3CiZjF','f9BLVAY'],
}

CHALLENGERS_URLS = {
    'liz': [
        'https://blogger.googleusercontent.com/img/a/AVvXsEjEBHw2GS78pmn7dseng2eI1ToEFqK6w64urcSAKexayG5CDdCcCXmlQqb3t79BRsDgceEU9s-6Nf2tB9we5gC498Ps3L3t0Mj0oU8AA-AAaApewS7C1D9G7eREFqLOR0DceDuvxm76xIcYlqdqRu8QfNV7gk6Z4KHTugFgpWtWwpEHcDtL4lPx5VBkphrn',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhevpjhT6zO1vqHu7sNnweKO4SKV1Ff-MibevNF_eG-6k3B3mLCLYCFfiKrjxto5kqtPEeqZiIdeVlr76olkuNg73-L_yPXZadvDQ6AHI63t51_6FxYIKs86IJUQ9KQ0Nt2DlM4Rgb4OfB6Ikx5P99ePyUQK1ordZdoxSq_KLfqjYQiq_jxIXDTOidzoA6-',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhJtK_7_vf-Yd8al-8yM0e8STsWd8BkFasi396Wb_Ki0KCaAUuivIwcg5LYMaNZH68o7Y9uyL2LXQyd3voT1gCLM15x3B80xbfZdHcUiXDrTQrUa5IfAM6u0qGLRWwsRBFy8RgipCHDkpU2bme8kaZcsMELWF05bs5Ui7Idp_7rbRULNlQ1dTDNunMVGeqg',
        'https://blogger.googleusercontent.com/img/a/AVvXsEi8xv27SYReAnAL76lVaoxBwitUYnSVXPFg38-hw65oWP450DRnZ8BcatZfM38FTXcybzWvP36KCNjP1ADq6c4RUlDWlgX_CWuE9AgrJrBOYSqih90N49zEYF2HXom0He00o7YqIMCaS2jRT0ppQuFT5BBQFbafX39WzIQPatfBmWeEcG3ZTLnCS448IIhb',
        'https://blogger.googleusercontent.com/img/a/AVvXsEirwa64acXg7D0w0BWlnrKHzJA-GZJ-j9So-IyadK-RtxzoiHLRltukcRe0NmBu2iE1ZD4C73IV3BxFxfFmvpYvEMSAISpc1abZ6ClIMJ8v1Acc-VL7cKQwac59JMZNQhtRfzIb8OFTDI3xAed6E64vUhdlhFA35qULFOOBLcOIUygiVS6Fy0hmHqlFW5Vt',
    ],
    'leeseo': [
        'https://blogger.googleusercontent.com/img/a/AVvXsEisTjCpozQIMBLJMXHxiMmpIWAIpeFQwTp7C0QDrM17xcgDlrmRpkZ5hWdfss_QZ_N3vjY837wdRFsue7iqNeqFI0tMKyj9upbIN-he8qjc--8RQ7Lck_gRaCdkGUqgyiksc9qCGyLe4gdjt4-oBLzZmx46GVXXf2FmF35JO7_PZiv_jZFgs9QFjuWIZ9QF',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhUgSXWFSWD92fnYZUfksPbL8UZAyyD-v8tf1cEBav_I0ER02kMVSTVFfRkFbEHc1kAyIsF-iTKU-wdScq21PHXZ5mnT3WOf1wNFoIB9yw9LGvLqbegxsUyC56YF22Ww0NY5liwJl6DpxbwytSsf3kI_foqrX1HA763SKXm5TiwJOzjszlvj1v4SBctjfKC',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhHXEMrmlMCAokTirqBRAfKZ8awDWiIzo1TwGJeDZWjLC4Nh8iJy7g2nPMjauB1MGtCaTnJ1SCSc3BSjiwerpb_c-0eFuQuAd-HlItejBOwrsnJ-LNIUS2oSB2apDUZzQedrSfxp7IxOBwLJAmKzMM7W2lQlbuEJSgLf5bqslqlFC55aedPd9XMZrYD54z6',
        'https://blogger.googleusercontent.com/img/a/AVvXsEjd_09eRfoQZSgVQfV69rDhGB-HtAjo5YL5a-mAs2MHFPtSS3BxUEjX5f87t2DN61jv4p0beObpxv8rBTSJ4CL11HMChe9v91y86AUPdSrRmTmhZL-KbGDn47lIVPJuiDnJfj9OfcqU3vOl6hhic5ybTGJ6i6vVf8FNOehU6lyjTe-d1OY0Kjm6S-Z0NJH5',
        'https://blogger.googleusercontent.com/img/a/AVvXsEgIqZ0JFDmupIvet1uM0U3PPjocBlWoxkSVYLV4pZmdLIIvEvY_RjWWCbQA7YjVBPUZFkKbGf0xsdMmZ4PlqztZxGo9mUrXoP9zsP5h27pIp6lVpPUf0ZNolTHHhbBTAp-zFo-nf3lcVCbFxnfOSfqecLhCEuxJP79cwiCEB3uCz043o-dcTsIkxb2Pmkdy',
    ],
    'gaeul': [
        'https://blogger.googleusercontent.com/img/a/AVvXsEhgV9_rkDOVY6gK2PwWD40xAfbLtiysKMv-TsGFnRwpOUmj5UppWl75_sxQrQhbkBpJZAym9RhZH4uuCoxOqFWPnaLOYOdpve0Vn51_GTWKcci0JK8RWFjb2wTjcCeU8BC6uvtkfPm5i7-S7JIHefmUs3_-Es4UiqQrgk1emh40WRw2S_sIIyxz-GIM46Cg',
        'https://blogger.googleusercontent.com/img/a/AVvXsEjlVzrUmp0F8qBEAQDbYIF08Ti2hgDRA_4My3lzAqaeukqaf8y7LH6f4Z1_h1DT7ojqZOZj7nKicTsN2LF1XZqKwo0hjnZn4hhFis1IzvVFsY7copiyxpQfS8zuV3u9jZ05_BTsX1ojG6ArnaVNkr1SAOYPcoFDeBLp3ePcGlZVqIozP9Z3vjTR2fXcuvq7',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhaO0KwQZ6lHvyPtGJw9Uzq_gjFOzzoI7NYlZZrC9I6uRsGTj8qqkD75t_bCszCe5CKS4EWxjESZMv9AMMl0Oedvi7QpXACJ7NS5fqOZx7KeSACSvitnA7cqZ50zhulGGzJ0OH7plcJmrP3oFsr4MXhJ4P1rgNjW8QdwxQq4gmm7ydN1ceb82P30gRd2AVD',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhKYjyniPHdtoKym0gRP0TnVbyirLMF_Ui9XPlBKVsyCN86B2g1oqC4YdotKwt7V2D21KpBsstIQPn1P1_j7h3NgsOGDrcHze1SQzL9V6r8ur-pbQubkjqUWu4hz5I-EyCpofWawRXUohn8n-4KXxUg1szv_kcTgpLuJ59rOIytrV-hGQxsem5sBBXjmOR3',
        'https://blogger.googleusercontent.com/img/a/AVvXsEgpXQtKIEGOww-rvOcEI2z03BhS3nDrdO7zJUIwYwUIMzu66SDGLZxCyP7DMHv2DSuEUv2Awz_U-AgXM4THFdAQBq7LotzUsNTELJE8RT11DttQMKp9unEgxv049hA_As0Y9JiB5huEAoJiXLtfqpcDgz_QoH2vO_PKfTEkYhQ1KFNsbzr8_w2aAAEFaB9M',
    ],
    'rei': [
        'https://blogger.googleusercontent.com/img/a/AVvXsEj99OH4Vbe3TmKg4YH_EXA5avOfOH_AJ7sTt0cHwlxtegYoGt0ZX93bCfwrWTJBhDCBxurx4lZAP8WdqQAwV1z6nvReB46Jtj93PcT9sREKLMr4rmHDJJ5b1PQqXbDPZwOAUrPWIyJfamtbAukOS6GOIdKth64lFZUfcPXxZV675GXD_6I5Y22m5WnPCqhP',
        'https://blogger.googleusercontent.com/img/a/AVvXsEga17-b47rqOXmDPTNUsY7UfrOaRG5pFKTSFV3ncV6QqGpC8KviGejxDXGwKBdpHepUEKMdV80dZY1Xh9Vj8V2SxojLmtQQiko4CNLymQMFbgxx3QUQtGwvqG1q5EM47CdRu73oN1aVnXw2aH2Ts640uy5ZEIP5K0VC8BmuMXKHiWHq7MHUhDbD63HJ6xXS',
        'https://blogger.googleusercontent.com/img/a/AVvXsEidFP9BL4iPtLz1g8IuCNJuTkOlH4gl9gbB8VnxPdYe_GkZedJoDJghKUE_aCjhtZIsk9pduUN49zaFWzhtG6UWyd5NtGcJ8c3G_aj3CBJJrwQOZrwGGgJd48w320jK741woWxf4KyaQYcko9dXg0dl5bvRBGBWypq-oD3JQLkpyBH4RaUM_11vG5kG0GPv',
        'https://blogger.googleusercontent.com/img/a/AVvXsEiYIaJvQrlrqJgl1xfdxQDc-AUVymKilErEjpPGr6q2qwA2WMPOI9cSzlDKtPahVGWWXwWgTs5r2XQGsyeyRL_f7V3LN7noFbf9Ti-qrmPI0IB-p_ECEFy2kKN0x29FitcIYkkPXxzog94tEqC5m2aVrEGl7EHZgVlx0UmFIW7qakYQG3bjt2IWrwHdMYP5',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhybZ8VK70c-Qw9G952uhG9YaG_u_AmifXQW62XuYGeSxL-MovlWrlikqcID_asnfPkUIjTw8I3tvs7gu9Oy9uNJcif3yrwmrZIh5s8wDMmygYtsmCMl1qEY3P7e6Qj2U7aQfDIWDV9QQAP3RGNfSWqdCQY_Yd1hr4_tR8ROD9l34V0Yeey-lFSWweEWpyP',
    ],
    'wonyoung': [
        'https://blogger.googleusercontent.com/img/a/AVvXsEjrK1AQ9FVa2W1mYCybq273VndYSZUgditIdQUsuI2MfONKq1X9jPv8ohYjILZnDjLUhkQTA6WvnVHYJ-6kLSB51zKk7d6Jmf6KgXKJ_zeyIa9PL-rL3f1-f-pGV6fCvO7e43Vy4Kyfzg9qn3z5sh3mIagDbFKa1HqCm7oUEZWSTUdOWoAqx9VS9dIWWmBG',
        'https://blogger.googleusercontent.com/img/a/AVvXsEjPQZ5Pw9uxKFvG4BekcgveiXwrkgtKcyHdJfAYL3YAbbr5dCUr5YwJyELzOD1eP5oJbyoSllo3Dp60Y5UCKzediaOthHLe7c7brwscYyhzmCKLnmEVfLf7gNtkH1tMsguI4uJJKRHJaJd0zz7m1rVZP-RDILqYRx39atFFsHRx096qCI6A00IK02wvVsEf',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhdZb2XuWmYgpqOpONm-Go6qXANJee-93iVeC3yAkqlbEWv4DjtVF3ypyFzy8TzQspekY4TBOF7wMHZiPZS7vVVy-HEbdvKgqmxkjxg06W21r9QzDkKykh0bnBrnV6tGD6uik-tslwmCq-SyI1KMWBN1MWBKbWEyRIVfoiyWr1eUyJ0C0H2tuCBPesEiQRo',
        'https://blogger.googleusercontent.com/img/a/AVvXsEh5MHTwAMJMG-kdTPBq1kNtRP8_k78zxnB-vg12YXzi7_gH_2CZbQ0NR9h7X3oZnBzx5ZEC3eKFEe_qIVXjH1S9okx6RtxnJmKi1zsLH1Uot92CwDeLBiVeS3PXIXoqnUKrxlgiGSxm3s7DvEmI-6ddQtTHX0SH68x__g2p5vQsHNJOdo7cwo_XF3E7CgFW',
        'https://blogger.googleusercontent.com/img/a/AVvXsEhXcGPA28VQG8JNxSg7a5Yb77XZwMv0f1FUCfRkl-Ua4m7xSRbd2jd5ZJUnZwxRUOrdKFmC6lsq9LjXEBUws_1MSFEJhzdJYbY--FwVEmaYN0XU_dTXqA1PTPhMcZdmtZLVir2lF19d0T_Z8RXkneD300YvduHEGjorGHRIvz8Yx0cqMKEmDxY8Qd4lmNve',
    ],
    'yujin': [
        'https://blogger.googleusercontent.com/img/a/AVvXsEjjeynLY8Ypr6XP3l4BE_iirXCAYkPObbXbaY_Aps1z77M0NAXKQmy5krafm2sglAzW4-7vF9i_cPipRbhmKAHduN83K4pbzv93aSIV4xYKb-rJpXrho4xmrnRlJ7fuEBdA4TB3nAFmKS21iV7kDqx8IJRb_RIWE3IfhQL7r4c9-io2WmAQbM1L6iIEltA8',
        'https://blogger.googleusercontent.com/img/a/AVvXsEiVn01jJ-nv3Q8lGKWNVaz9rcHXCf8TyIEbNl7kXLX298F9yeJmIInss3d-jsgf73VeBJbQUPmcflLZ62BKkgVzcsZ_Gqc8dSCLOD4x5DdFqyAXmjHyfz0Bfj7pe-cWRg434l-Fg7MrNzV3DXnyFJBHyxpDs1y8dA_insDa_dy_1kk-rol7WWcLNLtbM04F',
        'https://blogger.googleusercontent.com/img/a/AVvXsEiL7HP5rMfWvJUpVEGki7ScPk1KHx5klhmVoZ6vfsl2zoOxHKQX2LlLK3iX5nR_vNVSoaUtSsp0Ov-K7YoUDS4wDCJiyMR0oLY-32WlGqlYm4PR4p3Yyt3yPNVR18Nr9LRK1r3voqg6KdVSyI67Zx3gYjmaGr25WvMu6qN9Uw2dIyTAjcQmsqsHUbBfZ5bK',
        'https://blogger.googleusercontent.com/img/a/AVvXsEiouq-W5a5btNIYM113mfL1F8xAawIEMe31PWukCPmci_eBZairbLzwc32LQQCfVSsr9QU2uwotyxoPVUj231OrEP-WBhO9riYTiFoJdanrtLhrWk5MetV4nUS4mmCRY9VOJ56JXrgo6BymEu3HYZ4QaTeWAclonQw4GziGdR_Xw1NjL-GfRFYOBib3Dfvw',
        'https://blogger.googleusercontent.com/img/a/AVvXsEiAM3Lm3Rz1zLVJzGjtjMl6X3fuzNEYpVrouYSYDJ6UVjHqsIaYPNuqOM97xGW7gBjn2G7bz7eGKy0DNA456rkB2ULgZcZw1doQCKmA-wiRrM1fa5pA13Lo3cojIbuBUzDffnP8A1Yytq_oRowLh3QqBXs2hn4TJw5yuOLalWjrfdX1u5O_ZMJcmVHnkjcC',
    ],
}

CONCEPT_LABEL = {
    'bangers': 'BANGERS CONCEPT PHOTO · PORTRAIT-MATCHED CUT',
    'challengers': 'CHALLENGERS CONCEPT PHOTO 2 · PORTRAIT-MATCHED CUT',
    'spoilers': 'SPOILERS CONCEPT PHOTO · PORTRAIT-MATCHED CUT',
}

SESSION = requests.Session()
SESSION.headers.update({'User-Agent': 'Mozilla/5.0 IVE-Cosmic-Archive/1.0'})
CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def loved_hashes() -> dict[str, str]:
    return {m: sha256_bytes((CARD_ROOT / 'loved-ive' / f'{m}.jpg').read_bytes()) for m in MEMBERS}


def download(url: str) -> bytes:
    last = None
    for _ in range(3):
        try:
            response = SESSION.get(url, timeout=45)
            response.raise_for_status()
            if len(response.content) < 25_000:
                raise RuntimeError(f'image too small: {len(response.content)} bytes')
            Image.open(io.BytesIO(response.content)).verify()
            return response.content
        except Exception as exc:
            last = exc
    raise RuntimeError(f'failed to download {url}: {last}')


def image_urls(set_id: str, member: str) -> list[str]:
    if set_id == 'bangers':
        return [f'https://i.imgur.com/{image_id}.jpg' for image_id in BANGERS_IDS[member]]
    if set_id == 'spoilers':
        return [f'https://i.imgur.com/{image_id}.jpg' for image_id in SPOILERS_IDS[member]]
    return CHALLENGERS_URLS[member]


def visual_features(data: bytes) -> dict[str, float] | None:
    arr = np.frombuffer(data, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        return None
    h, w = bgr.shape[:2]
    if h < 200 or w < 200:
        return None

    scale = min(1.0, 1400.0 / max(h, w))
    if scale < 1.0:
        scan = cv2.resize(bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    else:
        scan = bgr
    sh, sw = scan.shape[:2]
    gray = cv2.cvtColor(scan, cv2.COLOR_BGR2GRAY)
    min_side = max(32, int(min(sh, sw) * 0.055))
    faces = CASCADE.detectMultiScale(gray, scaleFactor=1.07, minNeighbors=4, minSize=(min_side, min_side))
    if len(faces) == 0:
        faces = CASCADE.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(min_side, min_side))
    if len(faces) == 0:
        return None

    x, y, fw, fh = max(faces, key=lambda box: box[2] * box[3])
    face_w = fw / sw
    face_h = fh / sh
    center_x = (x + fw / 2) / sw
    center_y = (y + fh / 2) / sh

    edge = cv2.Canny(gray, 90, 180)
    border_h = max(1, int(sh * 0.2))
    border_w = max(1, int(sw * 0.14))
    mask = np.zeros_like(edge, dtype=np.uint8)
    mask[:border_h, :] = 1
    mask[-border_h:, :] = 1
    mask[:, :border_w] = 1
    mask[:, -border_w:] = 1
    border_edge = float(edge[mask == 1].mean() / 255.0)

    return {
        'face_w': face_w,
        'face_h': face_h,
        'center_x': center_x,
        'center_y': center_y,
        'aspect': w / h,
        'border_edge': border_edge,
        'width': float(w),
        'height': float(h),
    }


def feature_vector(features: dict[str, float]) -> np.ndarray:
    return np.array([
        features['face_w'],
        features['face_h'],
        features['center_x'],
        features['center_y'],
        features['aspect'],
        features['border_edge'],
    ], dtype=float)


def target_from_loved() -> np.ndarray:
    vectors = []
    for member in MEMBERS:
        data = (CARD_ROOT / 'loved-ive' / f'{member}.jpg').read_bytes()
        features = visual_features(data)
        if features:
            vectors.append(feature_vector(features))
            print('LOVED TARGET', member, {k: round(v, 4) for k, v in features.items() if k not in ('width','height')})
    if len(vectors) < 3:
        print('Face detection sparse on LOVED IVE; using conservative portrait target')
        return np.array([0.22, 0.22, 0.50, 0.34, 0.80, 0.09], dtype=float)
    return np.median(np.vstack(vectors), axis=0)


WEIGHTS = np.array([5.0, 5.0, 2.2, 3.0, 1.5, 1.2], dtype=float)
SCALES = np.array([0.11, 0.11, 0.20, 0.20, 0.22, 0.10], dtype=float)


def target_distance(vec: np.ndarray, target: np.ndarray) -> float:
    return float(np.sum(WEIGHTS * ((vec - target) / SCALES) ** 2))


def select_set(set_id: str, target: np.ndarray) -> dict[str, dict]:
    candidates: dict[str, list[dict]] = {}
    for member in MEMBERS:
        member_candidates = []
        urls = image_urls(set_id, member)
        for ordinal, url in enumerate(urls, 1):
            try:
                data = download(url)
                features = visual_features(data)
                if not features:
                    print('NO FACE', set_id, member, ordinal, url)
                    continue
                vec = feature_vector(features)
                member_candidates.append({
                    'ordinal': ordinal,
                    'url': url,
                    'data': data,
                    'features': features,
                    'vec': vec,
                    'target_score': target_distance(vec, target),
                })
            except Exception as exc:
                print('CANDIDATE FAIL', set_id, member, ordinal, exc)
        if not member_candidates:
            raise RuntimeError(f'No usable {set_id} candidates for {member}')
        member_candidates.sort(key=lambda item: item['target_score'])
        candidates[member] = member_candidates[:5]
        print('TOP', set_id, member, [(c['ordinal'], round(c['target_score'], 2)) for c in candidates[member]])

    best_combo = None
    best_score = math.inf
    lists = [candidates[m] for m in MEMBERS]
    for combo in itertools.product(*lists):
        matrix = np.vstack([item['vec'] for item in combo])
        base = sum(item['target_score'] for item in combo)
        # Strongly reward a six-card set that shares the same framing geometry.
        consistency = (
            16.0 * np.var(matrix[:, 0])
            + 16.0 * np.var(matrix[:, 1])
            + 7.0 * np.var(matrix[:, 2])
            + 10.0 * np.var(matrix[:, 3])
            + 4.0 * np.var(matrix[:, 4])
            + 3.0 * np.var(matrix[:, 5])
        ) * 100.0
        score = base + float(consistency)
        if score < best_score:
            best_score = score
            best_combo = combo

    assert best_combo is not None
    selected = {member: item for member, item in zip(MEMBERS, best_combo)}
    print('SELECTED', set_id, 'score', round(best_score, 3), {
        member: item['ordinal'] for member, item in selected.items()
    })
    return selected


def write_jpeg(data: bytes, path: Path) -> tuple[int, int, int, str]:
    with Image.open(io.BytesIO(data)) as img:
        rgb = img.convert('RGB')
        width, height = rgb.size
        out = io.BytesIO()
        rgb.save(out, format='JPEG', quality=95, optimize=True, progressive=True)
    payload = out.getvalue()
    path.write_bytes(payload)
    return width, height, len(payload), sha256_bytes(payload)


def update_manifest(all_selected: dict[str, dict[str, dict]]) -> None:
    manifest = json.loads(MANIFEST.read_text())
    by_key = {(entry['set'], entry['member']): entry for entry in manifest['assets']}
    for set_id, selected in all_selected.items():
        for member, item in selected.items():
            width, height, byte_count, digest = write_jpeg(
                item['data'], CARD_ROOT / set_id / f'{member}.jpg'
            )
            entry = by_key[(set_id, member)]
            entry.clear()
            entry.update({
                'set': set_id,
                'member': member,
                'path': f'assets/revive/member-cards/{set_id}/{member}.jpg',
                'source': item['url'],
                'resolved_source': item['url'],
                'bytes': byte_count,
                'sha256': digest,
                'source_page': SOURCE_PAGES[set_id],
                'official_post': OFFICIAL_POSTS[set_id][member],
                'concept': CONCEPT_LABEL[set_id],
                'source_ordinal': item['ordinal'],
                'selection_method': 'closest portrait geometry to existing LOVED IVE cardset, then six-card consistency',
                'dimensions': [width, height],
                'match_features': {
                    key: round(value, 5)
                    for key, value in item['features'].items()
                    if key not in ('width', 'height')
                },
            })
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')


def replace_version_tokens() -> None:
    result = subprocess.run(
        ['git', 'grep', '-Il', OLD_VERSION],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    paths = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    for rel in paths:
        path = ROOT / rel
        text = path.read_text()
        path.write_text(text.replace(OLD_VERSION, NEW_VERSION))
        print('VERSION', rel)


def assert_local_renderers() -> None:
    for rel in ['revive-member-sets.js', 'mobile-version-cardsets.js']:
        text = (ROOT / rel).read_text()
        for set_id in ['bangers', 'challengers', 'spoilers', 'loved-ive']:
            expected = f'assets/revive/member-cards/{set_id}/'
            if expected not in text:
                raise RuntimeError(f'{rel} missing local {set_id} mapping')
    if NEW_VERSION not in (ROOT / 'album-theme-sync.js').read_text():
        raise RuntimeError('album-theme-sync.js not bumped')
    for rel in ['index.html', 'members.html']:
        text = (ROOT / rel).read_text()
        needle = f'album-theme-sync.js?v={NEW_VERSION}'
        if needle not in text:
            raise RuntimeError(f'{rel} loader token mismatch')


def main() -> None:
    loved_before = loved_hashes()
    target = target_from_loved()
    print('TARGET VECTOR', [round(float(v), 5) for v in target])

    selected = {
        set_id: select_set(set_id, target)
        for set_id in ['bangers', 'challengers', 'spoilers']
    }
    update_manifest(selected)
    replace_version_tokens()
    assert_local_renderers()

    loved_after = loved_hashes()
    if loved_before != loved_after:
        raise RuntimeError('LOVED IVE binaries changed; aborting')
    print('LOVED IVE unchanged', loved_after)

    workflow = ROOT / '.github/workflows/match-member-cardsets-v57.yml'
    script = ROOT / 'tools/match-member-cardsets-v57.py'
    if workflow.exists():
        workflow.unlink()
    if script.exists():
        script.unlink()


if __name__ == '__main__':
    main()

"""비밀번호로 데이터 파일을 암호화합니다 (AES-256-GCM, PBKDF2-SHA256 300,000회).

사용법 (저장소 루트에서):
    python3 tools/encrypt.py <비밀번호>

입력:  data.js, report-data.js  (평문 — 저장소에 올리지 마세요, .gitignore 처리됨)
출력:  data.enc.js, report-data.enc.js  (암호문 — 이 파일만 배포)

비밀번호를 바꾸려면 새 비밀번호로 다시 실행한 뒤 .enc.js 두 파일을 올리면 됩니다.
"""
import sys, os, json, base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

ITER = 300_000
FILES = {"data.js": ("data.enc.js", "GS_ENC_DATA"), "report-data.js": ("report-data.enc.js", "GS_ENC_REPORT")}

def encrypt(pw: str, plain: bytes):
    salt = os.urandom(16); iv = os.urandom(12)
    key = PBKDF2HMAC(hashes.SHA256(), 32, salt, ITER).derive(pw.encode())
    ct = AESGCM(key).encrypt(iv, plain, None)
    b = lambda x: base64.b64encode(x).decode()
    return {"v": 1, "iter": ITER, "salt": b(salt), "iv": b(iv), "ct": b(ct)}

if __name__ == "__main__":
    pw = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("DASH_PASSWORD")
    if not pw:
        sys.exit("비밀번호가 없습니다. 인자로 주거나 DASH_PASSWORD 환경변수를 설정하세요.\n" + __doc__)
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    for src, (dst, var) in FILES.items():
        p = os.path.join(root, src)
        if not os.path.exists(p):
            print("skip (없음):", src); continue
        enc = encrypt(pw, open(p, "rb").read())
        open(os.path.join(root, dst), "w").write(f"window.{var}={json.dumps(enc)};\n")
        print("wrote", dst)

"""Prepare the VM's ignored .env without displaying credentials or rotating existing DB keys."""
import argparse
import base64
import re
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEST = Path(__file__).with_name('.env')


def read_env(path):
    result = {}
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        if not line.strip() or line.lstrip().startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
            if line.split('=', 1)[1].strip().startswith("'"):
                value = value.replace("\\'", "'")
        result[key.strip()] = value
    return result


parser = argparse.ArgumentParser()
parser.add_argument('--public-host', help='Actual DNS hostname only, without https:// or /api')
args = parser.parse_args()
if args.public_host and not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?', args.public_host):
    parser.error('Invalid hostname')

if DEST.exists():
    settings = read_env(DEST)
else:
    local = read_env(ROOT / 'Backend' / '.env')
    allowed = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD',
               'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
               'GOOGLE_API_KEY', 'DEV_MOMO_ENDPOINT', 'DEV_ACCESS_KEY', 'DEV_PARTNER_CODE', 'DEV_SECRET_KEY']
    settings = {key: local[key] for key in allowed if key in local}
    settings.update({
        'DB_NAME': 'luminovels',
        'DB_PASSWORD': 'Prm39!' + secrets.token_urlsafe(24),
        'REDIS_PASSWORD': secrets.token_urlsafe(32),
        'JWT_SECRET': base64.b64encode(secrets.token_bytes(32)).decode(),
        'MAIL_PROVIDER': 'smtp',
        'JPA_DDL_AUTO': 'update',  # bootstrap a NEW database, then change to validate
        'PUBLIC_HOST': 'localhost',
        'PUBLIC_BASE_URL': '',
    })
if args.public_host:
    settings['PUBLIC_HOST'] = args.public_host.lower()
    settings['PUBLIC_BASE_URL'] = 'https://' + args.public_host.lower()
if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]{0,63}', settings['DB_NAME']):
    parser.error('DB_NAME must be a simple SQL database identifier')

lines = ["# PRIVATE: generated locally; never commit or paste this file into chat."]
for key, value in settings.items():
    if '\n' in value or '\r' in value:
        parser.error('Multiline environment value is not supported: ' + key)
    lines.append(key + "='" + value.replace("'", "\\'") + "'")
DEST.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('Prepared private VM environment at ' + str(DEST))
print('Public host: ' + settings['PUBLIC_HOST'])

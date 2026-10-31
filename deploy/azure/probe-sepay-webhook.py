"""Verify deployed webhook authentication without creating an order or crediting any coins."""
import hashlib
import hmac
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

settings = {}
for line in Path(__file__).with_name('.env').read_text(encoding='utf-8-sig').splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        key, value = line.split('=', 1)
        settings[key.strip()] = value.strip().strip("'\"")

url = settings['PUBLIC_BASE_URL'] + '/api/payments/sepay/test/webhook'
body = json.dumps({'id': 1, 'transferType': 'in', 'content': 'unrelated deployment health probe'}).encode()
timestamp = str(int(time.time()))
signature = 'sha256=' + hmac.new(settings.get('SEPAY_WEBHOOK_SECRET', '').encode(),
                                  timestamp.encode() + b'.' + body, hashlib.sha256).hexdigest()
checks = [
    ('Unsigned rejected', body, {}, 401),
    ('Signed unrelated transaction acknowledged', body,
     {'X-SePay-Timestamp': timestamp, 'X-SePay-Signature': signature}, 200),
    ('Modified body rejected', body + b' ',
     {'X-SePay-Timestamp': timestamp, 'X-SePay-Signature': signature}, 401),
]
if settings.get('SEPAY_WEBHOOK_AUTH_MODE', 'hmac').lower() == 'apikey':
    checks = [
        ('Missing API key rejected', body, {}, 401),
        ('Correct API key accepted', body,
         {'Authorization': 'Apikey ' + settings['SEPAY_WEBHOOK_API_KEY']}, 200),
        ('Wrong API key rejected', body, {'Authorization': 'Apikey invalid-probe-key'}, 401),
    ]
    if settings.get('SEPAY_VIRTUAL_ACCOUNT'):
        # Deliberately nonexistent order: exercise bank/VA validation without crediting anyone.
        payload = {'id': 1, 'transferType': 'in', 'content': 'NV' + '0' * 32,
                   'gateway': settings['SEPAY_BANK_NAME'], 'accountNumber': settings['SEPAY_ACCOUNT_NUMBER'],
                   'transferAmount': 10000, 'subAccount': settings['SEPAY_VIRTUAL_ACCOUNT']}
        auth = {'Authorization': 'Apikey ' + settings['SEPAY_WEBHOOK_API_KEY']}
        checks.extend([
            ('Configured VA accepted for nonexistent order', json.dumps(payload).encode(), auth, 200),
            ('Wrong VA rejected', json.dumps({**payload, 'subAccount': 'UNCONFIGURED-VA'}).encode(), auth, 400),
            ('Missing VA rejected', json.dumps({**payload, 'subAccount': None}).encode(), auth, 400),
        ])
for label, payload, headers, expected in checks:
    req = urllib.request.Request(url, data=payload, method='POST',
                                 headers={'Content-Type': 'application/json', **headers})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.status
            result = response.read()
    except urllib.error.HTTPError as error:
        status, result = error.code, error.read()
    assert status == expected, f'{label}: expected {expected}, received {status}'
    if status == 200:
        assert json.loads(result) == {'success': True}
    print(f'{label}: HTTP {status}')
print('No order created; no coins credited. Dashboard delivery still needs an actual simulation.')

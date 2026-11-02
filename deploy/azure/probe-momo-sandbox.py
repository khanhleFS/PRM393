import hashlib,hmac,json,uuid,urllib.request
from pathlib import Path
values={}
for line in Path(__file__).with_name('.env').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1)
  values[k]=v[1:-1].replace("\\'", "'") if v.startswith("'") and v.endswith("'") else v
endpoint=values.get('DEV_MOMO_ENDPOINT','').rstrip('/')
if endpoint not in ['https://test-payment.momo.vn/v2/gateway/api','https://test-payment.momo.vn/v2/gateway/api/create']:
 raise SystemExit('Not an official sandbox endpoint; skipped')
base=values['PUBLIC_BASE_URL']; ident=str(uuid.uuid4())
p={'partnerCode':values['DEV_PARTNER_CODE'],'accessKey':values['DEV_ACCESS_KEY'],'requestId':ident,'orderId':ident,'amount':'10000','orderInfo':'Azure VM sandbox connectivity test','redirectUrl':base+'/payment-result.html','ipnUrl':base+'/api/orders/momo/callback','extraData':'','requestType':'captureWallet','lang':'vi'}
keys=['accessKey','amount','extraData','ipnUrl','orderId','orderInfo','partnerCode','redirectUrl','requestId','requestType']
raw='&'.join(k+'='+p[k] for k in keys)
p['signature']=hmac.new(values['DEV_SECRET_KEY'].encode(),raw.encode(),hashlib.sha256).hexdigest()
url=endpoint if endpoint.endswith('/create') else endpoint+'/create'
r=urllib.request.Request(url,data=json.dumps(p).encode(),headers={'Content-Type':'application/json'},method='POST')
with urllib.request.urlopen(r,timeout=25) as response: result=json.load(response)
print(json.dumps({'executedOnAzureVM':True,'resultCode':result.get('resultCode'),'message':result.get('message'),'payUrlReturned':bool(result.get('payUrl')),'paymentPerformed':False},ensure_ascii=True))

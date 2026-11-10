import urllib.request, re, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://github.com/portalcorp/pgvector_compiled/releases'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as r:
        html = r.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'/portalcorp/pgvector_compiled/releases/download/[^"\'>\s]+', html)
        print('Found assets:')
        for m in set(matches):
            print('https://github.com' + m)
except Exception as e:
    print('Error:', e)


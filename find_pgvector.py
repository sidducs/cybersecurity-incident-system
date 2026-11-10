import urllib.request, re, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://github.com/pgvector/pgvector/releases'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as r:
        html = r.read().decode('utf-8', errors='ignore')
        links = re.findall(r'/pgvector/pgvector/releases/download/[^\s"\'<>]+', html)
        print('Found links:')
        for l in set(links):
            print('https://github.com' + l)
except Exception as e:
    print('Error:', e)


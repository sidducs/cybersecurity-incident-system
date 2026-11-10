import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Query without hitting unauthenticated rate limit by asking for tags
url = 'https://github.com/andreiramani/pgvector_pgsql_windows/tags'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as r:
        html = r.read().decode('utf-8', errors='ignore')
        import re
        tags = re.findall(r'/andreiramani/pgvector_pgsql_windows/releases/tag/([^"\'>\s]+)', html)
        print('Found tags:', set(tags))
except Exception as e:
    print('Error:', e)


import pymupdf
test_svg = """<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="100" fill="white"/>
<text x="10" y="50" font-family="Arial" font-size="20" fill="black">Test Render</text>
</svg>"""
doc = pymupdf.open(stream=test_svg.encode('utf-8'), filetype='svg')
page = doc[0]
pix = page.get_pixmap(dpi=150)
print('Pixmap size:', pix.width, 'x', pix.height)

# Génère dist/nargisse.html (fichier unique : images, musiques, polices et fonctionnalités de l’admin intégrées)
import base64, re, os, mimetypes
for ext, m in [('.woff2', 'font/woff2'), ('.woff', 'font/woff'), ('.ttf', 'font/ttf'), ('.otf', 'font/otf'), ('.m4a', 'audio/mp4'), ('.webp', 'image/webp')]:
    mimetypes.add_type(m, ext)

def d(p):
    mime = mimetypes.guess_type(p)[0] or 'application/octet-stream'
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(p, 'rb').read()).decode())

def rd(p): return open(p, encoding='utf-8').read()

FEATS = ['petals', 'music', 'frames', 'backgrounds', 'envelopes', 'fonts', 'palettes', 'venues']
css_s = rd('css/studio.css'); css_i = rd('css/invite.css')
files = ['data/features/%s.js' % n for n in FEATS if os.path.exists('data/features/%s.js' % n)] + ['js/%s.js' % n for n in ['catalog', 'music', 'render', 'studio']]
js = ''.join(rd(p) + '\n' for p in files)
for n in ['envelope', 'venue', 'couple']:
    js = js.replace("'assets/%s.jpg'" % n, "'%s'" % d('assets/%s.jpg' % n))
# fichiers envoyés depuis l’admin (uploads/…) → intégrés en base64
js = re.sub(r'uploads/[\w./-]+', lambda m: d(m.group(0)) if os.path.exists(m.group(0)) else m.group(0), js)

html = rd('index.html')
html = re.sub(r'<link rel="stylesheet" href="css/studio.css"><link rel="stylesheet" href="css/invite.css">',
              lambda m: '<style id="studio-css">' + css_s + '</style><style id="bundle-css">' + css_i + '</style>', html)
html = re.sub(r'<script src="(?:js|data)/[^"]+"></script>\n?', '', html)
html = html.replace('</body>', '<script id="bundle-js">' + js + '</script>\n</body>')
os.makedirs('dist', exist_ok=True)
open('dist/nargisse.html', 'w', encoding='utf-8').write(html)
print(len(html))

import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, dst, tol = sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 22
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(np.float32)
h, w, _ = a.shape
# background reference: median of a 3px border ring
ring = np.concatenate([a[:3].reshape(-1,3), a[-3:].reshape(-1,3), a[:, :3].reshape(-1,3), a[:, -3:].reshape(-1,3)])
# local-adaptive: distance to a smooth blurred version of the border-coloured background (handles gradients)
bg = np.asarray(im.filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
d_local = np.sqrt(((a - bg) ** 2).sum(-1))
d_ref = np.sqrt(((a - np.median(ring, 0)) ** 2).sum(-1))
lum = a.mean(-1)
d = np.minimum(d_local * 1.0, d_ref)
# candidate background = low difference AND reasonably light
cand = ((d < tol) & (lum > 120)).astype(np.uint8) * 255
m = Image.fromarray(cand, 'L')
# keep only the part connected to the border: flood from many border points
fill = Image.new('L', (w + 2, h + 2), 255); fill.paste(m, (1, 1))
ImageDraw.floodfill(fill, (0, 0), 128, thresh=0)
f = np.asarray(fill)[1:-1, 1:-1]
bgmask = (f == 128)
alpha = np.where(bgmask, 0, 255).astype(np.uint8)
am = Image.fromarray(alpha, 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
rgba = im.convert('RGBA'); rgba.putalpha(am)
bbox = am.point(lambda v: 255 if v > 24 else 0).getbbox()
rgba = rgba.crop(bbox)
# normalise: tall canvas 600x900, bottle fits 92% height / 86% width, bottom-aligned
cw, ch = 600, 900
s = min(ch * 0.92 / rgba.height, cw * 0.86 / rgba.width)
rgba = rgba.resize((max(1, int(rgba.width * s)), max(1, int(rgba.height * s))), Image.LANCZOS)
out = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
out.paste(rgba, ((cw - rgba.width) // 2, ch - rgba.height - int(ch * 0.02)), rgba)
out.save(dst, 'WEBP', quality=90, method=6)
print(dst, bbox, rgba.size, 'bg%%=%.1f' % (bgmask.mean() * 100))

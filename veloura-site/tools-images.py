"""Converts studio renders into the site's WebP images.
Usage: python3 tools-images.py <render_dir> public/img"""
import sys, os, glob
from PIL import Image
src, dst = sys.argv[1:3]
os.makedirs(f'{dst}/products', exist_ok=True); os.makedirs(f'{dst}/cut', exist_ok=True)
def crop(im, pad=0.03):
    bb = im.getbbox()
    if not bb: return im
    w, h = im.size; p = int(max(w, h) * pad)
    return im.crop((max(0, bb[0]-p), max(0, bb[1]-p), min(w, bb[2]+p), min(h, bb[3]+p)))
for f in glob.glob(f'{src}/p-*.png'):
    Image.open(f).convert('RGB').save(f"{dst}/products/{os.path.basename(f)[2:-4]}.webp", 'WEBP', quality=80, method=6)
for f in glob.glob(f'{src}/c-*.png'):
    im = crop(Image.open(f).convert('RGBA')); im.thumbnail((420, 700))
    im.save(f"{dst}/cut/{os.path.basename(f)[2:-4]}.webp", 'WEBP', quality=82, method=6)
for n in ['case-noir', 'case-rose', 'gift-noir', 'gift-rose']:
    p = f'{src}/{n}.png'
    if os.path.exists(p):
        im = crop(Image.open(p).convert('RGBA')); im.thumbnail((1100, 800)); im.save(f'{dst}/{n}.webp', 'WEBP', quality=82, method=6)
tot = sum(os.path.getsize(os.path.join(dp, x)) for dp, _, fs in os.walk(dst) for x in fs)
print('images total', tot // 1024, 'KB')

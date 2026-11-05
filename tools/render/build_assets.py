"""Converts studio renders (PNG) into optimized theme assets (WebP) and demo product photos.
Usage: python3 tools/render/build_assets.py <render_dir> veloura-theme/assets demo-content/product-images"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFilter
src, assets, demo = sys.argv[1:4]
os.makedirs(demo, exist_ok=True)

def crop_alpha(im, pad=0.04):
    bb = im.getbbox()
    if not bb: return im
    w, h = im.size; p = int(max(w, h) * pad)
    return im.crop((max(0, bb[0]-p), max(0, bb[1]-p), min(w, bb[2]+p), min(h, bb[3]+p)))

def feather(im, frac=0.1):
    """Fade alpha to zero toward the image edges so cut-outs never show a hard rectangle."""
    w, h = im.size
    mask = Image.new('L', (w, h), 255)
    d = ImageDraw.Draw(mask)
    fx, fy = int(w * frac), int(h * frac)
    for i in range(max(fx, fy)):
        v = int(255 * (i / max(fx, fy)) ** 1.6)
        d.rectangle([i * fx // max(fx, fy), i * fy // max(fx, fy), w - 1 - i * fx // max(fx, fy), h - 1 - i * fy // max(fx, fy)], outline=v)
    a = im.getchannel('A')
    from PIL import ImageChops
    im.putalpha(ImageChops.multiply(a, mask))
    return im

def save(im, name, maxw, q=82):
    im = im.copy()
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    path = os.path.join(assets, name)
    im.save(path, 'WEBP', quality=q, method=6)
    print(f'{name:32s} {im.size} {os.path.getsize(path)//1024} KB')

# Transparent cut-outs used as layered hero art / fallbacks
for n, w in [('display-noir', 1200), ('display-rose', 1200), ('bottle-noir', 700), ('bottle-rose', 700),
             ('gift-noir', 1100), ('gift-rose', 1100), ('discovery-noir', 1200), ('discovery-rose', 1200),
             ('scale-noir', 1000), ('scale-rose', 1000)]:
    im = Image.open(f'{src}/{n}.png').convert('RGBA')
    im = crop_alpha(im)
    im = feather(im, 0.12 if n.startswith('display') else 0.06)
    save(im, f'veloura-{n}.webp', w)
# Opaque textures
for n in ['marble-noir', 'marble-rose', 'satin-rose']:
    save(Image.open(f'{src}/{n}.png').convert('RGB'), f'veloura-texture-{n}.webp', 1600, 72)

# Demo product photos (square, brand studio backgrounds) — generic, label-free
def studio_bg(world, size=1600):
    bg = Image.new('RGB', (size, size))
    d = ImageDraw.Draw(bg)
    top, bot = ((28, 29, 33), (8, 8, 10)) if world == 'noir' else ((250, 213, 226), (243, 166, 197))
    for y in range(size):
        t = y / size
        d.line([(0, y), (size, y)], fill=tuple(int(top[i] + (bot[i]-top[i]) * t) for i in range(3)))
    glow = Image.new('L', (size, size), 0)
    ImageDraw.Draw(glow).ellipse((size*0.15, size*0.1, size*0.85, size*0.8), fill=90 if world == 'noir' else 120)
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.12))
    tint = Image.new('RGB', (size, size), (185, 155, 107) if world == 'noir' else (255, 240, 245))
    return Image.composite(tint, bg, glow)
for f in sorted(glob.glob(f'{src}/demo/*.png')):
    name = os.path.basename(f)[:-4]
    world = name.split('-')[0]
    bottle = crop_alpha(Image.open(f).convert('RGBA'), 0.02)
    canvas = studio_bg(world).convert('RGBA')
    scale = 1150 / bottle.height
    bottle = bottle.resize((round(bottle.width * scale), 1150), Image.LANCZOS)
    canvas.alpha_composite(bottle, ((1600 - bottle.width)//2, 1600 - 1150 - 170))
    out = os.path.join(demo, f'demo-{name}.webp')
    canvas.convert('RGB').save(out, 'WEBP', quality=84, method=6)
    print(out, os.path.getsize(out)//1024, 'KB')

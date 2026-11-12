"""Extract full tubes from shelf photos by perspective-straightening a measured quad,
relight them, and export transparent cap + body layers for the interactive tube."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

P = "/home/claude/kingcallobookings-gif/smokey-dreamz/assets/photos/"
OUT = "/home/claude/site/assets/tubes/"
W = 220

# quad: TL, BL, BR, TR in source pixels; cap = fraction of height that is the cap
JOBS = {
    "white-wedding": ("prerolls.jpg", [(561, 498), (599, 788), (661, 788), (624, 498)], 0.16, False),
    "ethos-cookies": ("prerolls.jpg", [(309, 140), (388, 404), (439, 390), (362, 125)], 0.12, True),
    "captain-crunch": ("counter.jpg", [(963, 590), (968, 788), (1032, 788), (1037, 590)], 0.2, False),
}

def straighten(src, quad, ratio=None):
    im = Image.open(P + src).convert("RGB")
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = quad
    length = np.hypot((x0 + x3) / 2 - (x1 + x2) / 2, (y0 + y3) / 2 - (y1 + y2) / 2)
    width = np.hypot(x3 - x0, y3 - y0)
    H = int(W * length / width)
    flat = im.transform((W, H), Image.QUAD, [c for pt in quad for c in pt], Image.BICUBIC)
    return flat

def tube_mask(w, h, cap_frac, closed_bottom=True):
    m = Image.new("L", (w * 4, h * 4), 0)
    d = ImageDraw.Draw(m)
    r = w * 4 * 0.1
    d.rounded_rectangle((0, 0, w * 4 - 1, h * 4 - 1), radius=r, fill=255)
    return m.resize((w, h), Image.LANCZOS)

def relight(img):
    img = img.filter(ImageFilter.MedianFilter(3))
    img = ImageEnhance.Brightness(img).enhance(1.35)
    img = ImageEnhance.Contrast(img).enhance(1.18)
    img = ImageEnhance.Color(img).enhance(1.2)
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=2))
    w, h = img.size
    x = np.linspace(-1, 1, w)
    shade = (0.62 + 0.5 * np.sqrt(np.clip(1 - x ** 2, 0, 1)))[None, :, None]   # cylinder falloff
    spec = (np.exp(-((x + 0.45) / 0.09) ** 2) * 85 + np.exp(-((x - 0.62) / 0.05) ** 2) * 30)[None, :, None]
    arr = np.clip(np.array(img).astype(float) * shade + spec, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def export(name, img, cap_frac):
    w, h = img.size
    rgba = img.convert("RGBA"); rgba.putalpha(tube_mask(w, h, cap_frac))
    cut = int(h * cap_frac)
    cap, body = rgba.crop((0, 0, w, cut)), rgba.crop((0, cut, w, h))
    cap.save(OUT + f"{name}-cap.webp", "WEBP", quality=82, method=6)
    body.save(OUT + f"{name}-body.webp", "WEBP", quality=80, method=6)
    rgba.save(f"/home/claude/pre/full-{name}.png")
    return cut, h

if __name__ == "__main__":
    import os, json
    os.makedirs(OUT, exist_ok=True)
    meta = {}
    for name, (src, quad, cap, _) in JOBS.items():
        img = relight(straighten(src, quad))
        cut, h = export(name, img, cap)
        meta[name] = {"w": W, "cap": cut, "h": h}
    # fruit salad from the AI cutout (already complete and upright)
    fs = Image.open("/home/claude/pre/cut-fruit-salad.png")
    a = fs.getchannel("A")
    rgb = relight(fs.convert("RGB").resize((W, int(fs.height * W / fs.width)), Image.LANCZOS))
    a = a.resize(rgb.size, Image.LANCZOS)
    rgba = rgb.convert("RGBA"); rgba.putalpha(a)
    h = rgba.height; cut = int(h * 0.105)
    rgba.crop((0, 0, W, cut)).save(OUT + "fruit-salad-cap.webp", "WEBP", quality=82, method=6)
    rgba.crop((0, cut, W, h)).save(OUT + "fruit-salad-body.webp", "WEBP", quality=80, method=6)
    rgba.save("/home/claude/pre/full-fruit-salad.png")
    meta["fruit-salad"] = {"w": W, "cap": cut, "h": h}
    print(json.dumps(meta))

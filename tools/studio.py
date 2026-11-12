"""Cut out a single tube from a shelf photo and relight it as a studio product shot."""
import sys, math
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageChops
from scipy import ndimage
from rembg import remove, new_session

SESSION = new_session("isnet-general-use")
SRC = "/home/claude/kingcallobookings-gif/smokey-dreamz/assets/photos/"

# name: (photo, crop box (l,t,r,b), target point inside crop, glow colour, expected tube width px in crop)
JOBS = {
    "white-wedding": ("prerolls.jpg", (796, 100, 884, 445), (40, 160), (255, 70, 70)),
    "fruit-salad":   ("prerolls.jpg", (975, 110, 1120, 530), (65, 230), (60, 120, 255)),
    "ethos-cookies": ("prerolls.jpg", (318, 112, 452, 404), (68, 150), (150, 90, 255)),
    "house-prerolls":("counter.jpg",  (1070, 240, 1180, 640), (50, 220), (255, 200, 60)),
}

def cutout(name):
    photo, box, (tx, ty), glow = JOBS[name]
    im = Image.open(SRC + photo).convert("RGB").crop(box)
    # upscale before matting for cleaner edges
    up = 3
    im = im.resize((im.width * up, im.height * up), Image.LANCZOS)
    rgba = remove(im, session=SESSION, alpha_matting=True, alpha_matting_foreground_threshold=235,
                  alpha_matting_background_threshold=15, alpha_matting_erode_size=8)
    a = np.array(rgba)[:, :, 3]
    lab, n = ndimage.label(a > 128)
    t = lab[ty * up, tx * up]
    if t == 0:  # nearest labelled component to the target
        d = ndimage.distance_transform_edt(lab == 0, return_indices=True)[1]
        t = lab[d[0][ty * up, tx * up], d[1][ty * up, tx * up]]
    keep = ndimage.binary_fill_holes(lab == t)
    keep = ndimage.binary_dilation(keep, iterations=2)
    alpha = np.where(keep, a, 0).astype(np.uint8)
    out = np.array(rgba); out[:, :, 3] = alpha
    obj = Image.fromarray(out)
    # straighten: principal axis of the mask
    ys, xs = np.nonzero(alpha > 128)
    cov = np.cov(np.vstack([xs - xs.mean(), ys - ys.mean()]))
    ev, evec = np.linalg.eigh(cov)
    vx, vy = evec[:, np.argmax(ev)]
    ang = math.degrees(math.atan2(vx, vy))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    obj = obj.rotate(-ang, resample=Image.BICUBIC, expand=True)
    obj = obj.crop(obj.getbbox())
    return obj, glow, ang

def enhance(obj):
    rgb, a = obj.convert("RGB"), obj.getchannel("A")
    rgb = rgb.filter(ImageFilter.MedianFilter(3))
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2.2, percent=140, threshold=2))
    rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
    rgb = ImageEnhance.Color(rgb).enhance(1.15)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.08)
    # studio key light: brighten left side, darker right edge (cylinder shading)
    w, h = rgb.size
    grad = np.linspace(1.18, 0.82, w)[None, :, None]
    # specular stripe at 28% width
    x = np.arange(w)
    spec = np.exp(-((x - w * 0.28) / (w * 0.06)) ** 2)[None, :, None] * 60
    arr = np.clip(np.array(rgb).astype(float) * grad + spec, 0, 255).astype(np.uint8)
    out = Image.fromarray(arr).convert("RGBA"); out.putalpha(a)
    return out

def stage(obj, glow, size=900):
    S = size
    bg = Image.new("RGB", (S, S), (14, 5, 26))
    # backdrop gradient + coloured glow
    yy, xx = np.mgrid[0:S, 0:S]
    r = np.sqrt((xx - S / 2) ** 2 + ((yy - S * 0.42) * 1.1) ** 2) / S
    base = np.stack([np.full((S, S), c) for c in (20, 8, 36)], -1).astype(float)
    g = np.clip(1 - r * 1.9, 0, 1)[..., None] ** 1.6
    base = base + g * np.array(glow) * 0.55 + g * np.array([90, 40, 160]) * 0.35
    # floor
    floor_y = int(S * 0.86)
    base[floor_y:] *= 0.55
    bg = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
    # scale product to 74% height
    th = int(S * 0.74)
    obj = obj.resize((max(1, int(obj.width * th / obj.height)), th), Image.LANCZOS)
    x0 = (S - obj.width) // 2
    y0 = floor_y - obj.height
    # contact shadow
    sh = Image.new("L", (S, S), 0)
    ImageDraw.Draw(sh).ellipse((x0 - 20, floor_y - 14, x0 + obj.width + 20, floor_y + 14), fill=200)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    bg.paste((0, 0, 0), (0, 0), sh)
    # reflection
    refl = obj.transpose(Image.FLIP_TOP_BOTTOM)
    ra = np.array(refl.getchannel("A")).astype(float)
    fade = np.linspace(0.35, 0, refl.height)[:, None]
    refl.putalpha(Image.fromarray((ra * fade).astype(np.uint8)))
    refl = refl.filter(ImageFilter.GaussianBlur(2))
    bg.paste(refl, (x0, floor_y), refl)
    # rim glow behind product
    glowimg = Image.new("RGB", (S, S), glow)
    gm = Image.new("L", (S, S), 0); gm.paste(obj.getchannel("A"), (x0, y0))
    gm = gm.filter(ImageFilter.GaussianBlur(22)).point(lambda v: int(v * 0.55))
    bg.paste(glowimg, (0, 0), gm)
    bg.paste(obj, (x0, y0), obj)
    # subtle vignette
    v = np.clip(1.15 - r * 0.9, 0.55, 1)[..., None]
    bg = Image.fromarray(np.clip(np.array(bg).astype(float) * v, 0, 255).astype(np.uint8))
    return bg

if __name__ == "__main__":
    for name in (sys.argv[1:] or JOBS):
        obj, glow, ang = cutout(name)
        obj.save(f"cut-{name}.png")
        shot = stage(enhance(obj), glow)
        shot.save(f"studio-{name}.png")
        print(name, "tilt", round(ang, 1), obj.size)

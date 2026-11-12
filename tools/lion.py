"""Smokey Dreamz lion v2 - darker gothic stoner style."""
import math, random, sys

INK = "#0b0312"

def catmull(pts):
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d

def strands(seed=11, cx=256):
    rnd = random.Random(seed)
    out = []
    n = 34
    for i in range(n):
        u = i / (n - 1) * 2 - 1
        side = -1 if u < 0 else 1
        x0 = cx + 78 * math.sin(math.radians(u * 90))
        y0 = 165 - 34 * math.cos(math.radians(u * 90)) + rnd.uniform(-6, 6)
        tx = cx + u * 220 + rnd.uniform(-14, 14)
        apex = (x0 + (tx - x0) * 0.42, y0 - 44 * math.cos(math.radians(u * 80)) - rnd.uniform(0, 16))
        shoulder = (x0 + (tx - x0) * 0.85, 190 + 44 * abs(u))
        end_y = 520 + rnd.uniform(-40, 50) - 40 * (1 - abs(u))
        pts = [(x0, y0), apex, shoulder]
        amp = rnd.uniform(4, 9); ph = rnd.uniform(0, math.pi)
        for k in range(1, 7):
            t = k / 6
            y = shoulder[1] + (end_y - shoulder[1]) * t
            x = shoulder[0] + (tx - shoulder[0]) * min(1, t * 1.6) + side * 22 * t + math.sin(ph + t * 7) * amp
            pts.append((x, y))
        out.append((catmull(pts), rnd.uniform(20, 26), i % 2))
    return out

DEFS = '''<defs>
  <linearGradient id="dread" x1="0" y1="80" x2="0" y2="600" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#e8283c"/><stop offset=".36" stop-color="#e8283c"/>
    <stop offset=".36" stop-color="#f7c331"/><stop offset=".64" stop-color="#f7c331"/>
    <stop offset=".64" stop-color="#2fbf4a"/><stop offset="1" stop-color="#2fbf4a"/></linearGradient>
  <linearGradient id="dreadDark" x1="0" y1="80" x2="0" y2="600" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#a3162a"/><stop offset=".36" stop-color="#a3162a"/>
    <stop offset=".36" stop-color="#c08a12"/><stop offset=".64" stop-color="#c08a12"/>
    <stop offset=".64" stop-color="#1b7d33"/><stop offset="1" stop-color="#1b7d33"/></linearGradient>
  <linearGradient id="dreadEdge" x1="0" y1="80" x2="0" y2="600" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ff5a6e"/><stop offset=".5" stop-color="#ffd84d"/>
    <stop offset="1" stop-color="#7dff8a"/></linearGradient>
  <radialGradient id="fur2" cx=".5" cy=".42" r=".62">
    <stop offset="0" stop-color="#f2b632"/><stop offset="1" stop-color="#f2b632"/></radialGradient>
  <linearGradient id="muzzle2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbe3a4"/><stop offset="1" stop-color="#fbe3a4"/></linearGradient>
  <linearGradient id="shade2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1a0b2e"/><stop offset=".6" stop-color="#05010a"/><stop offset="1" stop-color="#2d0b4a"/></linearGradient>
  <radialGradient id="ember" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff3b0"/><stop offset=".4" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ff1e1e" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>'''

def lion2(bg=False, smoke=True):
    o = []
    a = o.append
    a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 600">')
    a(DEFS)
    if bg:
        a('<rect width="512" height="600" fill="#12061f"/>')
    ss = strands()
    # back layer (odd), front layer (even)
    for layer in (1, 0):
        for d, w, l in ss:
            if l != layer: continue
            a(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w+8:.1f}" stroke-linecap="round"/>')
            a(f'<path d="{d}" fill="none" stroke="url(#{"dreadDark" if layer else "dread"})" stroke-width="{w:.1f}" stroke-linecap="round"/>')
            # ridges = dread texture
            a(f'<path d="{d}" fill="none" stroke="{INK}" stroke-opacity=".55" stroke-width="{w-2:.1f}" stroke-dasharray="2.5 10"/>')
    # face silhouette with fur tufts
    face = ("M256,150 C306,150 344,166 360,204 C368,226 372,246 380,262 "
            "L408,276 L382,292 L410,314 L378,322 L398,350 L362,352 "
            "C352,392 312,426 256,434 C200,426 160,392 150,352 L114,350 L134,322 "
            "L102,314 L130,292 L104,276 L132,262 C140,246 144,226 152,204 C168,166 206,150 256,150 Z")
    a(f'<path d="{face}" fill="url(#fur2)" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
    # forehead furrow + shadow under brows
    a(f'<path d="M232,176 q24,-10 48,0 M240,190 q16,-6 32,0" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    # nose bridge highlight
    a('<path d="M360,204 C368,226 372,246 380,262 L408,276 L382,292 L410,314 L378,322 L398,350 L362,352 C352,392 312,426 256,434 C300,410 330,380 336,330 C344,280 350,240 336,200 Z" fill="#c98426"/>')
    # eyes: big cartoon whites, tiny uneven pupils, heavy lids
    for sx, pr in ((-1, 3.2), (1, 4.6)):
        ex = 256 + sx * 46
        ey = 228
        a(f'<ellipse cx="{ex}" cy="{ey}" rx="34" ry="30" fill="#fff" stroke="{INK}" stroke-width="5"/>')
        for k in range(3):
            vx = ex + sx * 30
            a(f'<path d="M{vx},{ey+4+k*7} q{-sx*8},-3 {-sx*14},{2-k*2}" fill="none" stroke="#e8283c" stroke-width="2" stroke-linecap="round"/>')
        a(f'<circle cx="{ex - sx*6}" cy="{ey+10}" r="{pr}" fill="{INK}"/>')
        a(f'<path d="M{ex-36},{ey+2} C{ex-36},{ey-38} {ex+36},{ey-38} {ex+36},{ey+2} L{ex+36},{ey-2} C{ex+16},{ey+4} {ex-16},{ey+4} {ex-36},{ey+2} Z" fill="#e0a12c" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>')
        a(f'<path d="M{ex-26},{ey+30} C{ex-10},{ey+38} {ex+12},{ey+38} {ex+26},{ey+30}" fill="none" stroke="{INK}" stroke-width="3.5" stroke-linecap="round"/>')
        a(f'<path d="M{ex-22},{ey+38} C{ex-8},{ey+44} {ex+8},{ey+44} {ex+20},{ey+38}" fill="none" stroke="{INK}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>')
    # shades slipped down the nose, slightly crooked
    a('<g transform="translate(0,22) rotate(-6 256 270) scale(.92) translate(22,22)">')
    a(f'<path d="M150,258 C196,250 316,250 362,258" fill="none" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>')
    for sx in (-1, 1):
        lx = 256 + sx * 54
        lens = f"M{lx-42},256 L{lx+42},256 C{lx+44},282 {lx+30},298 {lx},298 C{lx-30},298 {lx-44},282 {lx-42},256 Z"
        a(f'<path d="{lens}" fill="url(#shade2)" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
        a(f'<path d="{lens}" fill="none" stroke="#e3a008" stroke-width="2.5" stroke-linejoin="round"/>')
        a(f'<path d="M{lx-30},262 L{lx-16},262 L{lx-30},284 Z" fill="#7dff8a" opacity=".45"/>')
        a(f'<path d="M{lx+2},262 L{lx+10},262 L{lx-6},286 L{lx-12},286 Z" fill="#ff5a6e" opacity=".35"/>')
    a('</g>')
    # muzzle
    for sx in (-1, 1):
        a(f'<ellipse cx="{256+sx*32}" cy="360" rx="42" ry="32" fill="url(#muzzle2)" stroke="{INK}" stroke-width="6"/>')
    a('<path d="M226,350 C234,330 278,330 286,350 L286,372 L226,372 Z" fill="url(#muzzle2)"/>')
    a(f'<path d="M234,384 C240,410 272,410 278,384 C270,394 242,394 234,384 Z" fill="#c9954a" stroke="{INK}" stroke-width="5"/>')
    # nose
    a(f'<path d="M222,312 C232,298 280,298 290,312 C296,326 272,346 256,348 C240,346 216,326 222,312 Z" fill="{INK}"/>')
    a('<ellipse cx="244" cy="312" rx="11" ry="5" fill="#fff" opacity=".35"/>')
    # lazy smirk
    a(f'<path d="M256,348 L256,370 C244,382 228,380 220,372 M256,370 C268,384 290,382 300,368" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>')
    for (x, y) in [(214, 350), (204, 362), (220, 366), (298, 350), (308, 362), (292, 366)]:
        a(f'<circle cx="{x}" cy="{y}" r="3.2" fill="{INK}"/>')
    a(f'<path d="M222,372 C218,384 216,400 220,410 a7,7 0 1 0 12,-2 C228,398 228,384 226,372 Z" fill="#7dff4f" stroke="{INK}" stroke-width="4"/>')
    a('<ellipse cx="222" cy="404" rx="2.2" ry="3.5" fill="#fff"/>')
    # joint in mouth corner
    a('<g transform="rotate(-14 298 368)">')
    a(f'<path d="M292,362 L372,356 L374,372 L292,376 Z" fill="#f4efe6" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>')
    a('<path d="M300,366 L366,361" stroke="#d6cfc2" stroke-width="3"/>')
    a(f'<rect x="370" y="354" width="10" height="20" rx="3" fill="#3b2410" stroke="{INK}" stroke-width="4"/>')
    a('<circle cx="380" cy="364" r="22" fill="url(#ember)" filter="url(#soft)"/>')
    a('<circle cx="378" cy="364" r="6" fill="#ffb347"/>')
    a('</g>')
    if smoke:
        a('<g fill="none" stroke-linecap="round">')
        a('<path d="M386,338 C376,312 404,300 394,272 C384,244 414,232 404,204 C396,180 420,168 414,140" stroke="#e9d5ff" stroke-width="10" opacity=".35" filter="url(#soft)"/>')
        a('<path d="M386,338 C376,312 404,300 394,272 C384,244 414,232 404,204 C396,180 420,168 414,140" stroke="#f5edff" stroke-width="3.5" opacity=".8"/>')
        a('<path d="M392,300 C412,288 404,262 424,250" stroke="#f5edff" stroke-width="2.5" opacity=".55"/>')
        a('</g>')
    # beard braid with beads
    for bx, ln, col in [(234, 70, "#e01e37"), (256, 92, "#e3a008"), (278, 70, "#15803d")]:
        y0 = 420
        d = f"M{bx},{y0}"
        for k in range(1, 6):
            d += f" q{(-1)**k*7},{ln/10} 0,{ln/5}"
        a(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="15" stroke-linecap="round"/>')
        a(f'<path d="{d}" fill="none" stroke="#c98426" stroke-width="9" stroke-linecap="round"/>')
        a(f'<rect x="{bx-8}" y="{y0+ln}" width="16" height="16" rx="3" fill="{col}" stroke="{INK}" stroke-width="4"/>')
    a('</svg>')
    return "\n".join(o)

if __name__ == "__main__":
    print(lion2(bg="--bg" in sys.argv))

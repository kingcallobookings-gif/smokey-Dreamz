"""'Smokey Dreamz' blackletter wordmark as outlined SVG paths with slime drips."""
import random, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

FONT = "/home/claude/fonts/UnifrakturMaguntia-Book.ttf"
INK = "#0b0312"

def text_paths(text, size=200):
    f = TTFont(FONT)
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
    s = size / upm
    x = 0; paths = []; boxes = []
    for ch in text:
        gname = cmap.get(ord(ch))
        if gname is None: continue
        g = gs[gname]
        pen = SVGPathPen(gs); g.draw(TransformPen(pen, (s, 0, 0, -s, x, 0)))
        bp = BoundsPen(gs); g.draw(bp)
        if pen.getCommands():
            paths.append(f'<path d="{pen.getCommands()}"/>')
            if bp.bounds and ch != " ":
                xmin, ymin, xmax, ymax = bp.bounds
                boxes.append((x + xmin * s, x + xmax * s, -ymin * s, ch))
        x += g.width * s
    return "".join(paths), x, boxes

def drips(boxes, seed=4, base=0):
    rnd = random.Random(seed)
    out = []
    for x0, x1, bottom, ch in boxes:
        if rnd.random() < 0.25: continue
        k = 1 if (x1 - x0) < 70 else rnd.choice([1, 2])
        for _ in range(k):
            cx = rnd.uniform(x0 + 0.2 * (x1 - x0), x0 + 0.8 * (x1 - x0))
            y0 = min(bottom, 12) - 16
            ln = rnd.uniform(26, 78)
            w = rnd.uniform(7, 12)
            d = (f"M{cx-w*1.9:.1f},{y0:.1f} C{cx-w*0.9:.1f},{y0+6:.1f} {cx-w:.1f},{y0+ln*0.4:.1f} {cx-w*0.8:.1f},{y0+ln:.1f} "
                 f"A{w*0.9:.1f},{w*0.9:.1f} 0 1 0 {cx+w*0.8:.1f},{y0+ln:.1f} "
                 f"C{cx+w:.1f},{y0+ln*0.4:.1f} {cx+w*0.9:.1f},{y0+6:.1f} {cx+w*1.9:.1f},{y0:.1f} Z")
            out.append((d, cx, y0 + ln, w))
            if rnd.random() < 0.35:  # falling droplet
                out.append((f"M{cx:.1f},{y0+ln+w*2.6:.1f} m-{w*0.55:.1f},0 a{w*0.55:.1f},{w*0.7:.1f} 0 1 0 {w*1.1:.1f},0 a{w*0.55:.1f},{w*0.7:.1f} 0 1 0 -{w*1.1:.1f},0", cx, 0, 0))
    return out

def wordmark(text="Smokey Dreamz", size=200, bg=False):
    g, width, boxes = text_paths(text, size)
    dr = drips(boxes)
    pad = 30
    top = -size * 0.95
    h = size * 0.95 + 120
    vb = f"{-pad} {top-pad:.0f} {width+2*pad:.0f} {h+2*pad:.0f}"
    dpaths = "".join(f'<path d="{d}"/>' for d, *_ in dr)
    shines = "".join(f'<ellipse cx="{cx-w*0.35:.1f}" cy="{yy-w*0.15:.1f}" rx="{w*0.22:.1f}" ry="{w*0.35:.1f}"/>' for d, cx, yy, w in dr if w)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">
<defs>
  <linearGradient id="wmFill" x1="0" y1="{-size*0.72:.0f}" x2="0" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ff3b4f"/><stop offset=".42" stop-color="#ff3b4f"/><stop offset=".42" stop-color="#ffcc33"/><stop offset=".7" stop-color="#ffcc33"/><stop offset=".7" stop-color="#39ff6a"/><stop offset="1" stop-color="#39ff6a"/></linearGradient>
  <linearGradient id="slime" x1="0" y1="-20" x2="0" y2="110" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#39ff6a"/><stop offset="1" stop-color="#0f9d3a"/></linearGradient>
  <filter id="wmGlow" x="-10%" y="-30%" width="120%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b"/>
    <feFlood flood-color="#39ff6a" flood-opacity=".45"/><feComposite in2="b" operator="in" result="g"/>
    <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
{f'<rect x="{-pad}" y="{top-pad:.0f}" width="{width+2*pad:.0f}" height="{h+2*pad:.0f}" fill="#12061f"/>' if bg else ''}
<g filter="url(#wmGlow)">
  <g fill="{INK}" stroke="{INK}" stroke-width="16" stroke-linejoin="round">{g}{dpaths}</g>
  <g fill="url(#slime)">{dpaths}</g>
  <g fill="url(#wmFill)">{g}</g>
  <g fill="#ffffff" opacity=".55">{shines}</g>
</g>
</svg>'''
    return svg

if __name__ == "__main__":
    print(wordmark(bg="--bg" in sys.argv))

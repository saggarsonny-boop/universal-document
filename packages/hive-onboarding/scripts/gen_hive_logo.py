"""Generate the canonical Hive logo + simplified mark assets.

Outputs (all under packages/hive-onboarding/assets/):
  hive-logo-full.png   — 512x512, transparent PNG, gold flat-top hex with "HIVE" centered
  hive-logo-full.webp  — same as above, WebP encoding (smaller payload)

The simplified mark (no text) ships as a hand-written SVG sibling
(`hive-mark.svg`) so it stays inlinable at any size with crisp edges.

Geometry mirrors the canonical flat-top hex used in apps/parkback/app/_lib/HexButton.tsx
(viewBox 100x86.6, vertices at 25,0  75,0  100,43.3  75,86.6  25,86.6  0,43.3).
The same depth treatment is applied (top highlight, mid gold, bottom shadow,
upper-edge catchlight) so the PNG asset and the SVG mark read as the same
object at any size.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "assets"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Canonical Hive palette (matches apps/parkback/app/_lib/HexButton.tsx).
GOLD_HI = (255, 230, 161, 255)   # top-edge highlight
GOLD = (212, 175, 55, 255)       # canonical Hive gold
GOLD_DARK = (160, 127, 21, 255)  # shaded gold
GOLD_DEEP = (94, 74, 13, 255)    # deep shadow on bottom edges
GOLD_DIM = (138, 111, 31, 255)   # mid gold-dim used elsewhere
INK = (10, 10, 10, 255)          # dark text on the gold face


def find_bold_font(size: int):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def hex_vertices(cx: float, cy: float, w: float, h: float):
    """Six vertices of a flat-top regular hex centred at (cx, cy)."""
    # Width:height ratio for a regular hex is 1 : sqrt(3)/2 ≈ 1 : 0.866.
    # Vertices match HexButton's HEX_OUTER (relative to a unit hex):
    #   (25,0) (75,0) (100,43.3) (75,86.6) (25,86.6) (0,43.3)
    # Rescale to the requested w x h.
    sx = w / 100.0
    sy = h / 86.6
    pts = [
        (25 * sx, 0),
        (75 * sx, 0),
        (100 * sx, 43.3 * sy),
        (75 * sx, 86.6 * sy),
        (25 * sx, 86.6 * sy),
        (0, 43.3 * sy),
    ]
    # Translate to centre at (cx, cy).
    return [(cx - w / 2 + x, cy - h / 2 + y) for (x, y) in pts]


def linear_gradient(width: int, height: int, top_rgba, bottom_rgba) -> Image.Image:
    """Vertical gradient from top_rgba at y=0 → bottom_rgba at y=height."""
    grad = Image.new("RGBA", (width, height), top_rgba)
    px = grad.load()
    for y in range(height):
        t = y / max(1, height - 1)
        r = int(top_rgba[0] + (bottom_rgba[0] - top_rgba[0]) * t)
        g = int(top_rgba[1] + (bottom_rgba[1] - top_rgba[1]) * t)
        b = int(top_rgba[2] + (bottom_rgba[2] - top_rgba[2]) * t)
        a = int(top_rgba[3] + (bottom_rgba[3] - top_rgba[3]) * t)
        for x in range(width):
            px[x, y] = (r, g, b, a)
    return grad


def make_hex_face(size: int, with_text: bool) -> Image.Image:
    """Render a single Hive hex glyph at the requested square canvas size.

    The hex fills ~85% of the canvas width centred on the canvas. Drop shadow
    sits in the remaining ~15% margin so the asset can be dropped onto any
    background without clipping.
    """
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Hex dimensions (15% margin reserved for shadow + glow).
    hex_w = int(size * 0.78)
    hex_h = int(hex_w * 86.6 / 100)
    cx = size // 2
    cy = size // 2

    # ─── Drop shadow (soft gold halo, suggests emissive glow on planet UI cells) ───
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon(hex_vertices(cx, cy + int(size * 0.012), hex_w, hex_h), fill=(212, 175, 55, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size * 0.04))
    canvas = Image.alpha_composite(canvas, shadow)

    # ─── Outer rim — vertical gradient from GOLD_HI to GOLD_DEEP ───
    rim_grad = linear_gradient(hex_w, hex_h, GOLD_HI, GOLD_DEEP)
    rim_mask = Image.new("L", (hex_w, hex_h), 0)
    rd = ImageDraw.Draw(rim_mask)
    rd.polygon(hex_vertices(hex_w / 2, hex_h / 2, hex_w, hex_h), fill=255)
    rim_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rim_layer.paste(rim_grad, (cx - hex_w // 2, cy - hex_h // 2), rim_mask)
    canvas = Image.alpha_composite(canvas, rim_layer)

    # ─── Inner face hex (~7% inset) — radial gradient with bright spot upper-left ───
    inner_w = int(hex_w * 0.86)
    inner_h = int(hex_h * 0.86)

    face_layer = Image.new("RGBA", (inner_w, inner_h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(face_layer)
    # Approximate radial gradient by stacking concentric solid hexes from
    # bright (centre upper-left) to dark (edges). Keeps the file tiny vs. a
    # per-pixel fill loop.
    light_cx = inner_w * 0.32
    light_cy = inner_h * 0.28
    # Base fill: GOLD_DARK
    fd.polygon(hex_vertices(inner_w / 2, inner_h / 2, inner_w, inner_h), fill=GOLD_DARK)
    # Mid layer: GOLD, slightly inset toward the light source
    mid_w = int(inner_w * 0.92)
    mid_h = int(inner_h * 0.92)
    fd.polygon(hex_vertices(light_cx + (inner_w / 2 - light_cx) * 0.85,
                            light_cy + (inner_h / 2 - light_cy) * 0.85,
                            mid_w, mid_h), fill=GOLD)
    # Highlight: bright (255, 217, 110) lifted toward upper-left
    bright_w = int(inner_w * 0.55)
    bright_h = int(inner_h * 0.55)
    fd.polygon(hex_vertices(light_cx, light_cy, bright_w, bright_h), fill=(255, 217, 110, 220))
    # Soften the stack so the boundaries blur into a smooth gradient
    face_layer = face_layer.filter(ImageFilter.GaussianBlur(radius=size * 0.018))

    # Mask the softened face to the inner hex shape
    face_mask = Image.new("L", (inner_w, inner_h), 0)
    fmd = ImageDraw.Draw(face_mask)
    fmd.polygon(hex_vertices(inner_w / 2, inner_h / 2, inner_w, inner_h), fill=255)
    face_paste = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    face_paste.paste(face_layer, (cx - inner_w // 2, cy - inner_h // 2), face_mask)
    canvas = Image.alpha_composite(canvas, face_paste)

    # ─── Upper-edge catchlight (translucent white tracing the top-three edges) ───
    catch = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(catch)
    inner_pts = hex_vertices(cx, cy, inner_w, inner_h)
    # Top three edges: 0,43.3 → 25,0 → 75,0 → 100,43.3 i.e. inner_pts[5] → 0 → 1 → 2
    catch_path = [inner_pts[5], inner_pts[0], inner_pts[1], inner_pts[2]]
    cd.line(catch_path, fill=(255, 255, 255, 180), width=max(2, size // 200), joint="curve")
    catch = catch.filter(ImageFilter.GaussianBlur(radius=max(1, size * 0.004)))
    canvas = Image.alpha_composite(canvas, catch)

    # ─── HIVE wordmark (only on the full logo, not on the bare mark) ───
    if with_text:
        font = find_bold_font(int(hex_h * 0.36))
        text = "HIVE"
        td = ImageDraw.Draw(canvas)
        bbox = td.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = cx - tw // 2 - bbox[0]
        ty = cy - th // 2 - bbox[1]
        # Subtle text shadow for emboss against the bright gold face
        td.text((tx + 1, ty + 1), text, font=font, fill=(255, 240, 200, 110))
        td.text((tx, ty), text, font=font, fill=INK)

    return canvas


def main():
    full = make_hex_face(512, with_text=True)
    full_png = OUT_DIR / "hive-logo-full.png"
    full.save(full_png, "PNG", optimize=True)
    print(f"wrote {full_png}")

    full_webp = OUT_DIR / "hive-logo-full.webp"
    full.save(full_webp, "WEBP", quality=90, method=6)
    print(f"wrote {full_webp}")


if __name__ == "__main__":
    main()

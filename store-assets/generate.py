"""Generate Chrome Web Store promotional images for BacktraceDesign."""

from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Fonts ────────────────────────────────────────────────────────────────────

def font(size, bold=False):
    try:
        path = "/System/Library/Fonts/Helvetica.ttc"
        return ImageFont.truetype(path, size, index=1 if bold else 0)
    except Exception:
        return ImageFont.load_default()

def font_mono(size):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", size)
    except Exception:
        return ImageFont.load_default()

# ── Colors ───────────────────────────────────────────────────────────────────

BG_DARK = (17, 24, 39)        # gray-900
BG_LIGHT = (249, 250, 251)    # gray-50
WHITE = (255, 255, 255)
CARD_BORDER = (229, 231, 235) # gray-200
TEXT_900 = (17, 24, 39)
TEXT_700 = (55, 65, 81)
TEXT_500 = (107, 114, 128)
TEXT_400 = (156, 163, 175)
INDIGO = (99, 102, 241)       # indigo-500
INDIGO_DARK = (79, 70, 229)   # indigo-600

# Sample palette
PALETTE = [
    ("#E8645A", "Coral"),
    ("#1E3A5F", "Navy"),
    ("#EBE7DD", "Sand"),
    ("#2A9D8F", "Teal"),
    ("#D4A843", "Gold"),
    ("#4A5568", "Slate"),
    ("#D1E8E2", "Mist"),
    ("#F7F4EF", "Cloud"),
]

def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# ── Drawing helpers ──────────────────────────────────────────────────────────

def rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def draw_card(draw, xy, radius=16):
    rounded_rect(draw, xy, radius, fill=WHITE, outline=CARD_BORDER, width=2)

def draw_section_header(draw, x, y, w, text):
    # Header bar
    rounded_rect(draw, (x, y, x+w, y+44), 0, fill=BG_LIGHT)
    draw.line([(x, y+44), (x+w, y+44)], fill=CARD_BORDER, width=2)
    draw.text((x+24, y+14), text.upper(), fill=TEXT_900, font=font(13, bold=True))

def draw_color_swatch(draw, x, y, size, color_hex, name=None, hex_label=True):
    rgb = hex_to_rgb(color_hex)
    rounded_rect(draw, (x, y, x+size, y+size), 8, fill=rgb, outline=(0,0,0,25), width=1)
    ty = y + size + 6
    if name:
        draw.text((x, ty), name, fill=TEXT_700, font=font(11, bold=True))
        ty += 16
    if hex_label:
        draw.text((x, ty), color_hex.upper(), fill=TEXT_500, font=font_mono(10))


# ── Screenshot 1: Hero / Cover Page ─────────────────────────────────────────

def screenshot_hero():
    img = Image.new("RGB", (1280, 800), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    # Card background
    draw_card(draw, (40, 30, 1240, 770), 20)

    # Dark top bar
    draw.rectangle((40, 30, 1240, 80), fill=BG_DARK)
    # Round top corners manually
    rounded_rect(draw, (40, 30, 1240, 90), 20, fill=BG_DARK)
    draw.rectangle((40, 50, 1240, 90), fill=BG_DARK)
    draw.text((64, 48), "BACKTRACEDESIGN", fill=WHITE, font=font(12, bold=True))
    draw.text((1090, 48), "Style Book", fill=TEXT_400, font=font(12))

    # Favicon placeholder
    rounded_rect(draw, (64, 110, 108, 154), 10, fill=INDIGO)
    draw.text((72, 120), "AC", fill=WHITE, font=font(18, bold=True))

    # Title
    draw.text((124, 108), "Acme Corp", fill=TEXT_900, font=font(44, bold=True))
    draw.text((124, 160), "https://www.acme-corp.example", fill=INDIGO, font=font(16))

    # Stats bar
    stats_y = 210
    rounded_rect(draw, (64, stats_y, 680, stats_y + 70), 12, fill=BG_LIGHT, outline=CARD_BORDER, width=1)
    stats = [("11", "Colors"), ("6", "Tokens"), ("3", "Fonts"), ("5", "Type Styles"), ("4", "Buttons"), ("2", "Shadows")]
    sx = 80
    for val, label in stats:
        draw.text((sx, stats_y + 10), val, fill=TEXT_900, font=font(28, bold=True))
        draw.text((sx, stats_y + 44), label.upper(), fill=TEXT_500, font=font(9, bold=True))
        sx += 100

    # Typefaces label
    draw.text((64, 310), "TYPEFACES", fill=TEXT_400, font=font(10, bold=True))

    # Font pills
    pill_x = 64
    for fname in ["Playfair Display", "DM Sans", "Lato"]:
        tw = len(fname) * 9 + 24
        rounded_rect(draw, (pill_x, 335, pill_x + tw, 363), 14, fill=BG_LIGHT, outline=CARD_BORDER, width=1)
        draw.text((pill_x + 12, 341), fname, fill=TEXT_700, font=font(13, bold=True))
        pill_x += tw + 10

    # Generated date
    draw.text((64, 720), "Generated on March 26, 2026", fill=TEXT_400, font=font(14))

    # Thumbnail placeholder (right side)
    thumb_x, thumb_y = 760, 100
    rounded_rect(draw, (thumb_x, thumb_y, 1200, 650), 16, fill=BG_LIGHT, outline=CARD_BORDER, width=2)
    # Fake page content
    draw.rectangle((thumb_x+20, thumb_y+20, 1180, thumb_y+80), fill=BG_DARK)
    for i in range(5):
        y = thumb_y + 100 + i * 50
        rounded_rect(draw, (thumb_x+20, y, 1180, y+35), 4, fill=(240, 240, 240))
    draw.text((thumb_x + 10, 660), "Page screenshot", fill=TEXT_400, font=font(10))

    img.save(os.path.join(OUT, "screenshot-1-hero.png"))
    print("  screenshot-1-hero.png")


# ── Screenshot 2: Color Palette + All Colors ────────────────────────────────

def screenshot_colors():
    img = Image.new("RGB", (1280, 800), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    # Brand Palette card
    draw_card(draw, (40, 30, 1240, 300), 20)
    draw_section_header(draw, 40, 30, 1200, "Brand Palette")

    sx = 64
    for hex_c, name in PALETTE[:6]:
        rgb = hex_to_rgb(hex_c)
        rounded_rect(draw, (sx, 90, sx + 170, 185), 12, fill=rgb)
        draw.text((sx, 195), name, fill=TEXT_900, font=font(14, bold=True))
        draw.text((sx, 215), hex_c.upper(), fill=TEXT_500, font=font_mono(12))
        hsl_text = f"hsl(...)"
        draw.text((sx, 233), f"rgb({rgb[0]}, {rgb[1]}, {rgb[2]})", fill=TEXT_500, font=font(10))
        # Var name
        draw.text((sx, 250), f"--color-{name.lower()}", fill=INDIGO, font=font_mono(9))
        sx += 195

    # All Colors card
    draw_card(draw, (40, 330, 1240, 770), 20)
    draw_section_header(draw, 40, 330, 1200, "All Colors")

    sx, sy = 64, 390
    for hex_c, name in PALETTE:
        rgb = hex_to_rgb(hex_c)
        size = 100
        rounded_rect(draw, (sx, sy, sx + size, sy + size), 8, fill=rgb, outline=CARD_BORDER, width=1)
        draw.text((sx, sy + size + 8), name, fill=TEXT_700, font=font(12, bold=True))
        draw.text((sx, sy + size + 26), hex_c.upper(), fill=TEXT_500, font=font_mono(10))
        sx += 140
        if sx > 1140:
            sx = 64
            sy += 160

    img.save(os.path.join(OUT, "screenshot-2-colors.png"))
    print("  screenshot-2-colors.png")


# ── Screenshot 3: Color Tokens ──────────────────────────────────────────────

def screenshot_tokens():
    img = Image.new("RGB", (1280, 800), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    draw_card(draw, (40, 30, 1240, 770), 20)
    draw_section_header(draw, 40, 30, 1200, "Color Tokens")

    tokens = [
        ("Heading", "Navy", "#1E3A5F"),
        ("Body Text", "Slate", "#4A5568"),
        ("Link", "Coral", "#E8645A"),
        ("Background Primary", "Cloud", "#F7F4EF"),
        ("Background Accent", "Sand", "#EBE7DD"),
        ("CTA Button", "Coral", "#E8645A"),
        ("Surface Card", "Cloud", "#F7F4EF"),
        ("Divider", "Mist", "#D1E8E2"),
        ("Hover", "Teal", "#2A9D8F"),
        ("Text Inverse", "Cloud", "#F7F4EF"),
        ("Focus Ring", "Teal", "#2A9D8F"),
        ("Warning", "Gold", "#D4A843"),
    ]

    col_w = 380
    for i, (token_name, ref_name, hex_c) in enumerate(tokens):
        col = i % 3
        row = i // 3
        x = 64 + col * col_w
        y = 95 + row * 80

        rgb = hex_to_rgb(hex_c)
        # Swatch
        rounded_rect(draw, (x, y + 6, x + 32, y + 38), 6, fill=rgb, outline=CARD_BORDER, width=1)
        # Token name
        draw.text((x + 44, y + 4), token_name, fill=TEXT_900, font=font(15, bold=True))
        # Uses line
        draw.text((x + 44, y + 26), f"uses ", fill=TEXT_500, font=font(12))
        draw.text((x + 80, y + 26), ref_name, fill=TEXT_700, font=font(12, bold=True))
        draw.text((x + 80 + len(ref_name) * 8 + 8, y + 26), hex_c.upper(), fill=TEXT_400, font=font_mono(10))

        # Pill
        pill_w = len(ref_name) * 8 + 20
        pill_x = x + col_w - pill_w - 30
        rounded_rect(draw, (pill_x, y + 8, pill_x + pill_w, y + 34), 12, fill=rgb)
        # Text on pill
        lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
        pill_text_color = WHITE if lum < 140 else TEXT_900
        draw.text((pill_x + 10, y + 12), ref_name, fill=pill_text_color, font=font(11, bold=True))

        # Divider line
        if row < 3:
            draw.line([(x, y + 65), (x + col_w - 40, y + 65)], fill=(243, 244, 246), width=1)

    img.save(os.path.join(OUT, "screenshot-3-tokens.png"))
    print("  screenshot-3-tokens.png")


# ── Screenshot 4: Typography ────────────────────────────────────────────────

def screenshot_typography():
    img = Image.new("RGB", (1280, 800), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    draw_card(draw, (40, 30, 1240, 770), 20)
    draw_section_header(draw, 40, 30, 1200, "Typography")

    entries = [
        ("Heading 1", "54px", "w700", "lh 60px", "Elevate the way you meet & work", 44, True, "Playfair Display"),
        ("Heading 2", "33.75px", "w700", "lh 45px", "The Convene-powered experience", 30, True, "Playfair Display"),
        ("Heading 3", "27px", "w700", "lh 37.8px", "Hospitality-driven", 24, True, "Playfair Display"),
        ("Body", "20.25px", "w400", "lh 31.5px", "Convene designs and operates premium meeting, event, and flexible office spaces.", 18, False, "DM Sans"),
        ("Label", "16.2px", "w400", "lh 24.3px", "Find a space near you", 15, False, "DM Sans"),
    ]

    y = 90
    for label, size_text, weight, lh, sample, draw_size, is_bold, font_name in entries:
        # Left metadata
        draw.text((64, y), label, fill=TEXT_500, font=font_mono(12))
        draw.text((64, y + 20), size_text, fill=TEXT_400, font=font(11))
        draw.text((64, y + 36), weight, fill=TEXT_400, font=font(11))
        draw.text((64, y + 52), lh, fill=TEXT_400, font=font(11))

        # Sample text
        sample_font = font(draw_size, bold=is_bold)
        draw.text((220, y + 8), sample, fill=TEXT_900, font=sample_font)

        # Font name (right)
        draw.text((1040, y + 8), font_name, fill=TEXT_500, font=font(12))

        # Divider
        y_div = y + max(70, draw_size + 40)
        draw.line([(64, y_div), (1200, y_div)], fill=(243, 244, 246), width=1)
        y = y_div + 20

    img.save(os.path.join(OUT, "screenshot-4-typography.png"))
    print("  screenshot-4-typography.png")


# ── Screenshot 5: Export Formats ────────────────────────────────────────────

def screenshot_export():
    img = Image.new("RGB", (1280, 800), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    # Background context: show a faded stylebook
    draw_card(draw, (40, 30, 1240, 770), 20)
    draw_section_header(draw, 40, 30, 1200, "Brand Palette")

    # Faded swatches
    sx = 64
    for hex_c, name in PALETTE[:6]:
        rgb = hex_to_rgb(hex_c)
        faded = tuple(min(255, c + 100) for c in rgb)
        rounded_rect(draw, (sx, 90, sx + 170, 180), 12, fill=faded)
        sx += 195

    # Semi-transparent overlay
    overlay = Image.new("RGBA", (1280, 800), (249, 250, 251, 180))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Export button (top right)
    btn_x, btn_y = 980, 50
    rounded_rect(draw, (btn_x, btn_y, btn_x + 120, btn_y + 40), 8, fill=BG_DARK)
    draw.text((btn_x + 16, btn_y + 10), "Export  \u25BE", fill=WHITE, font=font(14, bold=True))

    # Dropdown
    dd_x, dd_y = 860, 100
    dd_w, dd_h = 340, 320
    # Shadow
    rounded_rect(draw, (dd_x + 4, dd_y + 4, dd_x + dd_w + 4, dd_y + dd_h + 4), 16, fill=(0, 0, 0, 40))
    rounded_rect(draw, (dd_x, dd_y, dd_x + dd_w, dd_y + dd_h), 16, fill=WHITE, outline=CARD_BORDER, width=2)

    options = [
        ("PDF", "Print-ready landscape style book"),
        ("JSON Design Tokens", "W3C format for Style Dictionary & Figma"),
        ("CSS Variables", "Clean :root {} custom properties file"),
        ("Tailwind Config", "theme.extend snippet ready to use"),
    ]

    oy = dd_y + 16
    for i, (label, desc) in enumerate(options):
        # Hover highlight on first
        if i == 1:
            draw.rectangle((dd_x + 2, oy - 6, dd_x + dd_w - 2, oy + 52), fill=(249, 250, 251))

        draw.text((dd_x + 20, oy), label, fill=TEXT_900, font=font(16, bold=True))
        draw.text((dd_x + 20, oy + 24), desc, fill=TEXT_500, font=font(12))

        if i < len(options) - 1:
            draw.line([(dd_x + 16, oy + 56), (dd_x + dd_w - 16, oy + 56)], fill=(243, 244, 246), width=1)
        oy += 72

    # Center text
    draw.text((100, 500), "Export your style book in multiple formats", fill=TEXT_900, font=font(32, bold=True))
    draw.text((100, 545), "PDF  ·  JSON Design Tokens  ·  CSS Variables  ·  Tailwind Config", fill=TEXT_500, font=font(18))

    img = img.convert("RGB")
    img.save(os.path.join(OUT, "screenshot-5-export.png"))
    print("  screenshot-5-export.png")


# ── Small Promo Tile 440x280 ────────────────────────────────────────────────

def promo_small():
    img = Image.new("RGB", (440, 280), BG_DARK)
    draw = ImageDraw.Draw(img)

    # Subtle gradient glow
    for i in range(80):
        alpha = int(15 * (1 - i / 80))
        r, g, b = INDIGO
        color = (r // 4 + alpha, g // 4 + alpha, b // 3 + alpha)
        draw.ellipse((120 - i, 80 - i, 320 + i, 200 + i), fill=color)

    # Re-darken
    dark_overlay = Image.new("RGBA", (440, 280), (17, 24, 39, 160))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, dark_overlay)
    draw = ImageDraw.Draw(img)

    # Color swatches row
    swatches = ["#E8645A", "#1E3A5F", "#EBE7DD", "#2A9D8F", "#D4A843", "#4A5568"]
    sx = 90
    for hex_c in swatches:
        rgb = hex_to_rgb(hex_c)
        rounded_rect(draw, (sx, 45, sx + 36, 81), 6, fill=rgb)
        sx += 46

    # Title
    draw.text((80, 100), "BacktraceDesign", fill=WHITE, font=font(30, bold=True))

    # Tagline
    draw.text((80, 145), "Extract the design language", fill=TEXT_400, font=font(15))
    draw.text((80, 165), "of any website in one click", fill=TEXT_400, font=font(15))

    # Bottom badges
    badges = ["PDF", "JSON", "CSS", "Tailwind"]
    bx = 80
    for badge in badges:
        bw = len(badge) * 8 + 16
        rounded_rect(draw, (bx, 210, bx + bw, 234), 6, fill=(255, 255, 255, 25), outline=(255, 255, 255, 50), width=1)
        draw.text((bx + 8, 214), badge, fill=(200, 200, 210), font=font(11, bold=True))
        bx += bw + 8

    img = img.convert("RGB")
    img.save(os.path.join(OUT, "promo-small-440x280.png"))
    print("  promo-small-440x280.png")


# ── Marquee Promo Tile 1400x560 ─────────────────────────────────────────────

def promo_marquee():
    img = Image.new("RGB", (1400, 560), BG_DARK)
    draw = ImageDraw.Draw(img)

    # Subtle glow
    for i in range(120):
        alpha = int(12 * (1 - i / 120))
        r, g, b = INDIGO
        color = (r // 5 + alpha, g // 5 + alpha, b // 4 + alpha)
        draw.ellipse((400 - i, 100 - i, 1000 + i, 460 + i), fill=color)

    dark_overlay = Image.new("RGBA", (1400, 560), (17, 24, 39, 170))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, dark_overlay)
    draw = ImageDraw.Draw(img)

    # Left side: branding
    draw.text((80, 120), "BacktraceDesign", fill=WHITE, font=font(52, bold=True))
    draw.text((80, 190), "Extract the design language of any website.", fill=(200, 200, 210), font=font(22))
    draw.text((80, 225), "Generate a style book with one click.", fill=(200, 200, 210), font=font(22))

    # Export format badges
    badges = ["PDF", "JSON Tokens", "CSS Variables", "Tailwind Config"]
    bx = 80
    for badge in badges:
        bw = len(badge) * 10 + 24
        rounded_rect(draw, (bx, 290, bx + bw, 320), 8, fill=(255, 255, 255, 25), outline=(255, 255, 255, 50), width=1)
        draw.text((bx + 12, 296), badge, fill=(200, 200, 210), font=font(13, bold=True))
        bx += bw + 12

    # CTA button
    rounded_rect(draw, (80, 360, 310, 405), 10, fill=INDIGO)
    draw.text((108, 370), "Install for Chrome", fill=WHITE, font=font(18, bold=True))

    # Right side: mini stylebook mockup
    card_x = 780
    # Card shadow
    rounded_rect(draw, (card_x + 6, 66, card_x + 546, 496), 16, fill=(0, 0, 0, 50))
    # Card
    rounded_rect(draw, (card_x, 60, card_x + 540, 490), 16, fill=WHITE)

    # Mini palette header
    draw.rectangle((card_x, 60, card_x + 540, 100), fill=BG_LIGHT)
    rounded_rect(draw, (card_x, 60, card_x + 540, 80), 16, fill=BG_LIGHT)
    draw.rectangle((card_x, 75, card_x + 540, 100), fill=BG_LIGHT)
    draw.text((card_x + 20, 75), "BRAND PALETTE", fill=TEXT_700, font=font(10, bold=True))

    # Color swatches
    swatches = ["#E8645A", "#1E3A5F", "#EBE7DD", "#2A9D8F", "#D4A843", "#4A5568", "#D1E8E2", "#F7F4EF"]
    sx = card_x + 20
    for hex_c in swatches:
        rgb = hex_to_rgb(hex_c)
        rounded_rect(draw, (sx, 110, sx + 55, 170), 6, fill=rgb)
        sx += 63

    # Mini token rows
    draw.text((card_x + 20, 190), "COLOR TOKENS", fill=TEXT_700, font=font(10, bold=True))

    tokens_mini = [
        ("Heading", "#1E3A5F"), ("Link", "#E8645A"), ("Background", "#F7F4EF"),
        ("CTA", "#E8645A"), ("Divider", "#D1E8E2"), ("Focus", "#2A9D8F"),
    ]
    ty = 215
    for i, (name, hex_c) in enumerate(tokens_mini):
        col = i % 2
        tx = card_x + 20 + col * 260
        if col == 0 and i > 0:
            ty += 40
        rgb = hex_to_rgb(hex_c)
        rounded_rect(draw, (tx, ty, tx + 20, ty + 20), 4, fill=rgb)
        draw.text((tx + 28, ty + 2), name, fill=TEXT_700, font=font(12, bold=True))

    # Typography preview
    draw.text((card_x + 20, ty + 55), "TYPOGRAPHY", fill=TEXT_700, font=font(10, bold=True))
    draw.text((card_x + 20, ty + 80), "Heading Style", fill=TEXT_900, font=font(22, bold=True))
    draw.text((card_x + 20, ty + 110), "Body text sample with font metrics", fill=TEXT_500, font=font(13))

    img = img.convert("RGB")
    img.save(os.path.join(OUT, "promo-marquee-1400x560.png"))
    print("  promo-marquee-1400x560.png")


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Generating Chrome Web Store assets...")
    screenshot_hero()
    screenshot_colors()
    screenshot_tokens()
    screenshot_typography()
    screenshot_export()
    promo_small()
    promo_marquee()
    print("Done!")

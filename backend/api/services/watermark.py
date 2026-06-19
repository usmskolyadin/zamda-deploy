from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import os

FONT_PATHS = [
    "arialbd.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
]

LOGO_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "static",
    "zamda-white.png",
)


def _get_font(size):
    for path in FONT_PATHS:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _draw_tight_text(draw, x, y, text, font, fill, tracking):
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), ch, font=font)
        x += (bbox[2] - bbox[0]) + tracking


def add_watermark(image_file) -> tuple[BytesIO, BytesIO]:
    img = Image.open(image_file).convert("RGBA")

    base_size = max(img.width, img.height)

    logo_size = int(base_size * 0.04)
    font_size = int(base_size * 0.035)

    tracking = int(font_size * -0.08)

    WM_ALPHA = 80

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = _get_font(font_size)

    # ---------------- LOGO ----------------
    logo_img = None
    if os.path.exists(LOGO_PATH):
        logo_img = Image.open(LOGO_PATH).convert("RGBA")
        logo_img.thumbnail((logo_size, logo_size), Image.LANCZOS)

        r, g, b, a = logo_img.split()
        a = a.point(lambda x: WM_ALPHA if x > 10 else 0)
        white = Image.new("L", logo_img.size, 245)
        logo_img = Image.merge("RGBA", (white, white, white, a))

    # ---------------- TEXT ----------------
    text = "Zamda"

    total_text_w = 0
    text_bbox_t = 0
    text_bbox_b = 0

    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        total_text_w += (bbox[2] - bbox[0]) + tracking
        text_bbox_t = min(text_bbox_t, bbox[1])
        text_bbox_b = max(text_bbox_b, bbox[3])

    text_visual_h = text_bbox_b - text_bbox_t

    logo_w = logo_img.width if logo_img else 0
    logo_h = logo_img.height if logo_img else 0

    gap = int(logo_size * 0.15)

    total_w = logo_w + gap + total_text_w
    element_h = max(logo_h, text_visual_h)

    # ---------------- POSITION (BOTTOM RIGHT) ----------------
    padding = int(base_size * 0.03)

    start_x = img.width - total_w - padding
    start_y = img.height - element_h - padding

    # ---------------- ALIGN BASELINE ----------------
    logo_y = start_y + (element_h - logo_h) // 2 + 2
    text_y = start_y + (element_h - text_visual_h) // 2 - text_bbox_t

    # ---------------- DRAW LOGO ----------------
    if logo_img:
        overlay.paste(logo_img, (int(start_x), int(logo_y)))
        start_x += logo_w + gap

    # ---------------- DRAW TEXT ----------------
    _draw_tight_text(
        draw,
        int(start_x),
        int(text_y),
        text,
        font,
        (255, 255, 255, WM_ALPHA),
        tracking
    )

    # ---------------- COMPOSITE ----------------
    watermarked = Image.alpha_composite(img, overlay).convert("RGB")

    wm_buffer = BytesIO()
    watermarked.save(wm_buffer, format="JPEG", quality=95)
    wm_buffer.seek(0)

    rgb = img.convert("RGB")
    orig_buffer = BytesIO()
    rgb.save(orig_buffer, format="JPEG", quality=95)
    orig_buffer.seek(0)

    return wm_buffer, orig_buffer
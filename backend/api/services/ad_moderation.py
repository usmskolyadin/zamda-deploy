from google.cloud import vision
from difflib import SequenceMatcher
import re


class AdModerationService:
    def __init__(self):
        self.vision_client = vision.ImageAnnotatorClient()

        # -----------------------------
        # TOBACCO BRANDS (CRITICAL)
        # -----------------------------
        self.tobacco_brands = {
            "marlboro", "malboro", "camel", "parliament",
            "lucky strike", "chesterfield", "davidoff",
            "ld", "winston", "kent", "rothmans",
            "pall mall", "dunhill",
            "iqos", "glo", "heets", "veev",
            "juul", "elf bar", "lost mary", "vuse",
            "smok", "vaporesso", "geekvape", "voopoo"
        }

        # -----------------------------
        # KEYWORDS
        # -----------------------------
        self.rules = {
            "drugs": [
                "weed", "marijuana", "cocaine", "meth", "heroin",
                "fentanyl", "xanax", "oxy", "oxycodone",
                "adderall", "molly", "ecstasy", "crack",
                "drug", "drugs", "lsd", "shrooms", "cbd", "thc"
            ],
            "weapons": [
                "gun", "pistol", "rifle", "shotgun",
                "ammo", "ammunition", "firearm",
                "ar-15", "ak-47", "grenade", "bomb"
            ],
            "adult": [
                "escort", "onlyfans", "nude", "porn",
                "sex", "xxx", "prostitute", "hookup"
            ],
            "fraud": [
                "wire transfer", "western union",
                "bitcoin only", "crypto only",
                "guaranteed returns"
            ]
        }

        # -----------------------------
        # OCR BLACKLIST
        # -----------------------------
        self.ocr_blacklist = {
            "marlboro", "malboro", "elf bar", "lost mary",
            "juul", "vuse", "iqos", "glo",
            "nicotine", "thc", "cbd", "cocaine",
            "heroin", "xanax", "weed"
        }

        # -----------------------------
        # VISION LABEL BLOCKLIST
        # -----------------------------
        self.banned_labels = {
            "electronic cigarette",
            "vape",
            "cigarette",
            "tobacco product",
            "smoking",
            "firearm",
            "gun",
            "weapon",
            "rifle",
            "ammunition"
        }

    # -----------------------------
    # NORMALIZATION
    # -----------------------------
    def normalize(self, text: str) -> str:
        return text.lower().strip()

    # -----------------------------
    # FUZZY MATCH
    # -----------------------------
    def fuzzy_match(self, word, blacklist, threshold=0.86):
        for item in blacklist:
            if SequenceMatcher(None, word, item).ratio() >= threshold:
                return item
        return None

    # -----------------------------
    # TEXT CHECK
    # -----------------------------
    def check_keywords(self, text: str):
        text = self.normalize(text)
        reasons = set()

        words = re.findall(r"[a-zA-Z0-9']+", text)

        # keyword scan
        for category, keywords in self.rules.items():
            for kw in keywords:
                if kw in text:
                    if category == "tobacco":
                        reasons.add("TOBACCO_PRODUCT")
                    else:
                        reasons.add(f"{category.upper()}:{kw}")

        # brand detection
        for w in words:
            w = w.lower()

            if w in self.tobacco_brands:
                reasons.add("TOBACCO_PRODUCT")
                continue

            match = self.fuzzy_match(w, self.tobacco_brands)
            if match:
                reasons.add("TOBACCO_PRODUCT")

        return list(reasons), len(reasons) == 0

    # -----------------------------
    # IMAGE CHECK
    # -----------------------------
    def check_images(self, images):
        reasons = set()

        for img in images:
            try:
                with open(img.image.path, "rb") as f:
                    content = f.read()

                image = vision.Image(content=content)

                response = self.vision_client.annotate_image({
                    "image": image,
                    "features": [
                        {"type_": vision.Feature.Type.SAFE_SEARCH_DETECTION},
                        {"type_": vision.Feature.Type.LABEL_DETECTION},
                        {"type_": vision.Feature.Type.TEXT_DETECTION},
                    ],
                })

                # ---------------- SAFESEARCH ----------------
                safe = response.safe_search_annotation

                if safe.adult >= vision.Likelihood.POSSIBLE:
                    reasons.add("NSFW:ADULT")
                if safe.violence >= vision.Likelihood.POSSIBLE:
                    reasons.add("NSFW:VIOLENCE")

                # ---------------- LABELS ----------------
                labels = [
                    l.description.lower()
                    for l in response.label_annotations
                ]

                for l in labels:
                    if l in self.banned_labels:
                        reasons.add("VISUAL:PROHIBITED_OBJECT")

                # ---------------- OCR ----------------
                if response.text_annotations:
                    text = response.text_annotations[0].description.lower()

                    for bad in self.ocr_blacklist:
                        if bad in text:
                            reasons.add("TOBACCO_PRODUCT")

            except Exception:
                reasons.add("IMAGE_PROCESSING_ERROR")

            if len(reasons) > 5:
                break

        return list(reasons), len(reasons) == 0

    # -----------------------------
    # MAIN MODERATION
    # -----------------------------
    def moderate(self, ad):
        text = f"{ad.title} {ad.description}"

        text_reasons, text_ok = self.check_keywords(text)
        img_reasons, img_ok = self.check_images(ad.images.all())

        reasons = set(text_reasons + img_reasons)

        # final normalization (optional safety layer)
        final_reasons = []

        for r in reasons:
            if "tobacco" in r.lower():
                final_reasons.append("TOBACCO PRODUCT")
            else:
                final_reasons.append(r)

        final_reasons = list(set(final_reasons))

        return len(final_reasons) == 0, final_reasons
from google.cloud import vision, language_v1
from difflib import SequenceMatcher
import re


class AdModerationService:
    def __init__(self):
        self.vision = vision.ImageAnnotatorClient()
        self.nlp = language_v1.LanguageServiceClient()

        # =========================
        # HARD POLICY CATEGORIES
        # =========================

        self.illegal_entities = {
            "drugs": {
                "weed", "marijuana", "cocaine", "meth", "heroin",
                "fentanyl", "xanax", "oxy", "oxycodone",
                "adderall", "molly", "ecstasy", "crack",
                "lsd", "acid", "shrooms", "dope"
            },
            "weapons": {
                "gun", "pistol", "rifle", "shotgun",
                "ammo", "ammunition", "firearm",
                "ar-15", "ak-47", "grenade", "bomb",
                "explosives", "silencer", "suppressor"
            },
            "adult": {
                "porn", "xxx", "escort", "prostitute",
                "nude", "naked", "onlyfans", "hookup",
                "sugar daddy", "sugar baby"
            },
            "fraud": {
                "wire transfer", "western union",
                "bitcoin only", "crypto only",
                "guaranteed returns", "investment opportunity",
                "money order", "cash app only", "venmo only"
            },
            "stolen": {
                "stolen", "no receipt", "no title", "hot item", "lifted"
            },
            "tobacco": {
                "cigarette", "cigarettes", "tobacco",
                "vape", "e-cigarette", "nicotine",
                "juul", "elf bar", "disposable vape"
            }
        }

        # =========================
        # SAFE WORLD OBJECTS
        # =========================

        self.safe_objects = {
            "car", "vehicle", "automobile",
            "house", "home", "building",
            "apartment", "street", "road",
            "furniture", "phone", "computer",
            "food", "restaurant", "coffee"
        }

        # =========================
        # DRUG SCENE DETECTION
        # =========================

        self.drug_scene_objects = {
            "syringe", "needle", "pill", "tablet",
            "powder", "white powder", "bong", "pipe",
            "cannabis", "marijuana plant"
        }

        # =========================
        # WEIGHTS (BALANCED)
        # =========================

        self.weights = {
            "text_match": 0.7,
            "nlp_entity": 1.0,
            "vision_label": 1.0,
            "ocr_match": 0.9,
            "scene_match": 1.6,
            "safe_search": 1.2
        }

    # =========================
    # NORMALIZATION
    # =========================

    def normalize(self, text):
        return text.lower().strip()

    # =========================
    # TEXT SCAN (STRICT BUT SAFE)
    # =========================

    def analyze_text(self, text):
        text = self.normalize(text)
        score = 0
        reasons = []

        for cat, items in self.illegal_entities.items():
            for item in items:
                if item in text:
                    score += self.weights["text_match"]
                    reasons.append(f"TEXT:{cat}:{item}")

        return score, reasons

    # =========================
    # NLP (ONLY ENTITIES, NO FUZZY)
    # =========================

    def analyze_nlp(self, text):
        document = language_v1.Document(
            content=text,
            type_=language_v1.Document.Type.PLAIN_TEXT
        )

        response = self.nlp.analyze_entities(document=document)

        score = 0
        reasons = []

        for entity in response.entities:
            name = entity.name.lower()
            salience = entity.salience

            for cat, items in self.illegal_entities.items():
                if name in items:
                    score += self.weights["nlp_entity"] * salience
                    reasons.append(f"NLP:{cat}:{name}")

        return score, reasons

    # =========================
    # DRUG SCENE DETECTION
    # =========================

    def detect_drug_scene(self, labels):
        labels = [l.lower() for l in labels]

        score = 0
        reasons = []

        has_person = any("person" in l or "man" in l or "woman" in l for l in labels)
        has_drug_objects = any(l in self.drug_scene_objects for l in labels)
        has_injection = "syringe" in labels or "needle" in labels

        if has_person and has_injection:
            score += self.weights["scene_match"]
            reasons.append("SCENE:INJECTION")

        if has_person and has_drug_objects:
            score += self.weights["scene_match"]
            reasons.append("SCENE:DRUG_USE")

        return score, reasons

    # =========================
    # IMAGE ANALYSIS
    # =========================

    def analyze_images(self, images):
        score = 0
        reasons = []

        for img in images:
            try:
                with open(img.image.path, "rb") as f:
                    content = f.read()

                image = vision.Image(content=content)

                response = self.vision.annotate_image({
                    "image": image,
                    "features": [
                        {"type_": vision.Feature.Type.SAFE_SEARCH_DETECTION},
                        {"type_": vision.Feature.Type.LABEL_DETECTION},
                        {"type_": vision.Feature.Type.TEXT_DETECTION},
                    ],
                })

                safe = response.safe_search_annotation

                # SAFE SEARCH (ONLY HIGH CONFIDENCE)
                if safe.adult >= vision.Likelihood.LIKELY:
                    score += self.weights["safe_search"]
                    reasons.append("VISION:ADULT")

                if safe.violence >= vision.Likelihood.LIKELY:
                    score += self.weights["safe_search"]
                    reasons.append("VISION:VIOLENCE")

                # LABELS
                labels = [l.description.lower() for l in response.label_annotations]

                # scene detection
                scene_score, scene_reasons = self.detect_drug_scene(labels)
                score += scene_score
                reasons.extend(scene_reasons)

                # hard labels only
                for l in labels:
                    for cat, items in self.illegal_entities.items():
                        if l in items:
                            score += self.weights["vision_label"]
                            reasons.append(f"VISION:{cat}:{l}")

                # SAFE OBJECT FILTER (important anti-false-positive layer)
                labels = [l for l in labels if l not in self.safe_objects]

                # OCR (STRICT WORD MATCH ONLY)
                if response.text_annotations:
                    text = response.text_annotations[0].description.lower()
                    words = set(re.findall(r"\b[a-zA-Z0-9']+\b", text))

                    for cat, items in self.illegal_entities.items():
                        for item in items:
                            if item in words:
                                score += self.weights["ocr_match"]
                                reasons.append(f"OCR:{cat}:{item}")

            except Exception:
                score += 0.2
                reasons.append("VISION_ERROR")

        return score, reasons

    # =========================
    # MAIN DECISION ENGINE
    # =========================

    def moderate(self, ad):
        text = f"{ad.title} {ad.description}"

        text_score, text_reasons = self.analyze_text(text)
        nlp_score, nlp_reasons = self.analyze_nlp(text)
        img_score, img_reasons = self.analyze_images(ad.images.all())

        total = text_score + nlp_score + img_score
        reasons = text_reasons + nlp_reasons + img_reasons

        # =========================
        # THRESHOLDS (TUNED)
        # =========================

        BLOCK = 2.0
        REVIEW = 1.2

        # safety rule: never block on text alone
        if total >= BLOCK and (img_score > 0.8 or nlp_score > 0.8):
            return False, list(set(reasons))

        if total >= REVIEW:
            return None, list(set(reasons))

        return True, []
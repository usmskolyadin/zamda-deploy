import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from backend.storages import StaticStorage

LOCAL_STATIC_DIR = r"D:\freelance\zamda\backend\staticfiles"

print("Looking for static files in:", LOCAL_STATIC_DIR)
print("Exists:", os.path.exists(LOCAL_STATIC_DIR))

s3_storage = StaticStorage()

for root, dirs, files in os.walk(LOCAL_STATIC_DIR):
    for f in files:
        local_path = os.path.join(root, f)
        relative_path = os.path.relpath(local_path, LOCAL_STATIC_DIR).replace("\\", "/")
        with open(local_path, "rb") as file_obj:
            s3_storage.save(relative_path, ContentFile(file_obj.read()))
        print(f"Uploaded {relative_path} to S3")

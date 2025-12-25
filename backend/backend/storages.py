import os
from django.conf import settings

USE_S3 = os.getenv("USE_S3", "false").lower() == "true"

if USE_S3:
    from storages.backends.s3boto3 import S3Boto3Storage

    class StaticStorage(S3Boto3Storage):
        location = "static"
        default_acl = "public-read"
        file_overwrite = True

    class MediaStorage(S3Boto3Storage):
        location = "media"
        default_acl = "public-read"
        file_overwrite = False

else:
    from django.core.files.storage import FileSystemStorage

    class StaticStorage(FileSystemStorage):
        def __init__(self, *args, **kwargs):
            super().__init__(
                location=settings.STATIC_ROOT,
                base_url=settings.STATIC_URL,
            )

    class MediaStorage(FileSystemStorage):
        def __init__(self, *args, **kwargs):
            super().__init__(
                location=settings.MEDIA_ROOT,
                base_url=settings.MEDIA_URL,
            )

media_storage = MediaStorage()

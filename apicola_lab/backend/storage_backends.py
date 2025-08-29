"""
Storage backends personalizados para separar estáticos y media en S3
"""
from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    """
    Storage para archivos estáticos (CSS, JS, imágenes estáticas)
    """
    location = 'static'
    default_acl = 'public-read'
    file_overwrite = True


class MediaStorage(S3Boto3Storage):
    """
    Storage para archivos de media (uploads de usuarios)
    """
    location = 'media'
    default_acl = 'private'
    file_overwrite = False

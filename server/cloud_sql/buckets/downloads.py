from google.cloud import storage

def download_all_teacher_images():
    """
    Fetches all teacher images from the 'teacher_images/' folder in the bucket.
    Returns a list of image URLs.
    """
    bucket_name = "enkellaering_images"
    folder_prefix = "teacher_images/"

    # Initialize the client
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    # List all objects in the folder and collect image URLs
    blobs = bucket.list_blobs(prefix=folder_prefix)
    image_urls = [
        f"https://storage.googleapis.com/{bucket_name}/{blob.name}"
        for blob in blobs
    ]

    return image_urls
    
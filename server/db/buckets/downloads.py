from google.cloud import storage

def download_all_teacher_images():
    """
    Fetches all teacher images from the 'teacher_images/' folder in the bucket.
    Returns a list of image URLs.
    """
    bucket_name = "enkellaering-images"
    folder_prefix = "teacher_images/"
    project_ref = "clfgrepvidmzconiqqrt"

    # Initialize the client
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    # List all objects in the folder and collect image URLs
    blobs = bucket.list_blobs(prefix=folder_prefix)
    image_urls = [
      f"https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{filename}"

        for blob in blobs
        if not blob.name.endswith('/') and blob.size > 0  # Filter out directories and empty objects
    ]

    return image_urls
    
from google.cloud import storage

def upload_or_replace_image_in_bucket(bucket_name, file_object, destination_blob_name):
    """
    Uploads or replaces an image in a Google Cloud Storage bucket directly from a file object.

    Args:
        bucket_name: Name of the GCS bucket.
        file_object: File object to upload (from request.files).
        destination_blob_name: Destination path in the bucket (e.g., folder/image.jpg).
    """
    # Initialize the client
    storage_client = storage.Client()

    # Get the bucket
    bucket = storage_client.bucket(bucket_name)

    # Create or overwrite a blob in the bucket
    blob = bucket.blob(destination_blob_name)

    # Upload directly from the file object (overwrites if the blob already exists)
    blob.upload_from_file(file_object, content_type=file_object.content_type)

    print(f"File uploaded or replaced at {destination_blob_name}.")
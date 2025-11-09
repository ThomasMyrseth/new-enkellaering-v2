from supabase_client import supabase

def upload_or_replace_image_in_bucket(bucket_name, file_object, destination_blob_name):
    """
    Uploads or replaces an image in a Supabase Storage bucket directly from a file object.

    Args:
        bucket_name: Name of the Supabase Storage bucket.
        file_object: File object to upload (from request.files).
        destination_blob_name: Destination path in the bucket (e.g., folder/image.jpg).

    Returns:
        public_url: Public URL of the uploaded file.
    """
    try:
        # Read the file data
        file_data = file_object.read()

        # Reset file pointer in case it needs to be read again
        file_object.seek(0)

        # Upload to Supabase Storage (upsert=true replaces if blob already exists)
        supabase.storage.from_(bucket_name).upload(
            path=destination_blob_name,
            file=file_data,
            file_options={"content-type": file_object.content_type, "upsert": "true"}
        )

        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(destination_blob_name)

        print(f"File uploaded or replaced at {destination_blob_name}.")

        return public_url

    except Exception as e:
        raise Exception(f"Error uploading file to Supabase Storage: {e}")

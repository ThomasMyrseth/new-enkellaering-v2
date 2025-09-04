from flask import Blueprint, request, jsonify
import logging

from .config import token_required
from cloud_sql.buckets.uploads import upload_or_replace_image_in_bucket
from cloud_sql.inserts import upsert_about_me_text
from cloud_sql.buckets.downloads import download_all_teacher_images
from cloud_sql.gets import get_all_about_me_texts

teacher_images_bp = Blueprint('teacher_images', __name__)
import mimetypes

@teacher_images_bp.route("/upload-teacher-image", methods=["POST"])
@token_required
def upload_file(user_id):
    if "file" not in request.files:
        logging.error("No file found in teacher image upload")
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]  # File object from form
    about_me = request.form.get("about_me")  # about_me text from form data
    firstname = request.form.get("firstname")
    lastname = request.form.get("lastname")

    if not firstname:
        logging.error("Missing firstname")
        return jsonify({"error": "Missing firstname"}), 400
    
    if not lastname:
        logging.error("Missing lastname")
        return jsonify({"error": "Missing lastname"}), 400

    if not about_me:
        logging.error("Missing about_me_text")
        return jsonify({"error": "Missing about_me text"}), 400

    if file.filename == "":
        logging.error("No selected file")
        return jsonify({"error": "No selected file"}), 400



    mimetype = file.mimetype
    file_extension = mimetypes.guess_extension(mimetype)
    standardized_filename = f"{user_id}-profile_picture{file_extension}"

    # Define Google Cloud Storage bucket and path
    bucket_name = "enkellaering_images"
    destination_blob_name = f"teacher_images/{user_id}/{standardized_filename}"



    try:
        # Upload directly from file object
        upload_or_replace_image_in_bucket(bucket_name, file, destination_blob_name)

    except Exception as e:
        logging.error(f"Error uploading image, {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    try:
        # Insert about_me text into BigQuery
        upsert_about_me_text(user_id=user_id, text=about_me, firstname=firstname, lastname=lastname)

        return jsonify({"message": f"File uploaded successfully to {destination_blob_name}"}), 200
    except Exception as e:
        logging.error(f"Error uploading about me text {e}")
        return jsonify({"message": f"Error uploading about me texts {e}"})


@teacher_images_bp.route('/get-all-teacher-images-and-about-mes', methods=["GET"])
def get_all_images_and_about_mes():
    try:
        # Fetch about me texts
        about_mes = get_all_about_me_texts()

        # Fetch teacher images
        images = download_all_teacher_images()

        if not about_mes:
            return jsonify({"message": "Error getting about me texts"}), 500
        
        if not images:
            return jsonify({"message": "Error getting images"}), 500

        formatted_data = []

        for i in range(len(about_mes)):
            a = about_mes[i]

            about_me = a['about_me']
            firstname = a['firstname']
            lastname = a['lastname']
            user_id = a['user_id']
            image = ''
            #find the image
            for image_url in images:
                image_user_id = image_url.split("/")[-2]
                if image_user_id == user_id:
                    image = image_url
                    break #stop after the first match

            f = {}
            f['about_me'] = about_me
            f['firstname'] = firstname
            f['lastname'] = lastname
            f['user_id'] = user_id
            f['image'] = image

            formatted_data.append(f)

        return jsonify({"data": formatted_data}), 200
    
    except Exception as e:
        return jsonify({"message": str(e)}), 500

from flask import Blueprint, request, jsonify
import logging

from .config import token_required
from db.buckets.uploads import upload_or_replace_image_in_bucket
from db.inserts import upsert_about_me_text
from db.buckets.downloads import download_all_teacher_images
from db.gets import get_all_about_me_texts

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
    bucket_name = "enkellaering-images"
    destination_blob_name = f"teacher_images/{user_id}/{standardized_filename}"



    try:
        # Upload directly from file object
        url = upload_or_replace_image_in_bucket(bucket_name, file, destination_blob_name)

    except Exception as e:
        logging.error(f"Error uploading image, {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    try:
        # Insert about_me text into BigQuery
        upsert_about_me_text(user_id=user_id, text=about_me, firstname=firstname, lastname=lastname, image_url=url)

        return jsonify({"message": f"File uploaded successfully to {destination_blob_name}"}), 200
    except Exception as e:
        logging.error(f"Error uploading about me text {e}")
        return jsonify({"message": f"Error uploading about me texts {e}"})


@teacher_images_bp.route('/get-all-teacher-images-and-about-mes', methods=["GET"])
def get_all_images_and_about_mes():
    try:
        # Fetch about me texts
        about_mes = get_all_about_me_texts()

        if not about_mes:
            print("Error getting about me texts")
            return jsonify({"message": "Error getting about me texts"}), 500

        return jsonify({"data": about_mes}), 200
    
    except Exception as e:
        print(f"Error fetching teacher images and about me texts: {e}")
        return jsonify({"message": str(e)}), 500

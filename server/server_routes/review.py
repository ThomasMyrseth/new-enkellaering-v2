from flask import Blueprint, request, jsonify
import os

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


review_bp = Blueprint('review', __name__)



from big_query.inserts import insert_review
from big_query.deletes import delete_review

@review_bp.route('/upload-review', methods=["POST"])
@token_required
def upload_review_route(user_id):
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    rating = data.get('rating')
    comment = data.get('comment')
    name = data.get('name') or "Anonym"

    if not (teacher_user_id and rating and comment):
        return jsonify({"message": "Missing required fields"}), 403

    try:
        delete_review(user_id, teacher_user_id, bq_client)
    except Exception as e:
        raise Exception(f"Error deleting old review: {e}")
    
    try:
        insert_review(student_user_id=user_id, teacher_user_id=teacher_user_id, rating=rating, comment=comment, name=name, bq_client=bq_client)
        return jsonify({"message": "Inserted review succesfully"}), 200
    except Exception as e:
        return jsonify({"message": f"error inserting review {e}"}), 500


from big_query.gets import get_all_reviews
@review_bp.route('/get-all-reviews', methods=["GET"])
def get_all_reviews_route():
    try:
        data = get_all_reviews(client=bq_client)
        return jsonify({"reviews": data}), 200
    except Exception as e:
        return jsonify({"message": f"Error receiving all reviews {e}"}), 500


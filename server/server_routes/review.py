from flask import Blueprint, request, jsonify
from .config import token_required
from db.inserts import insert_review
from db.deletes import delete_review
from db.gets import get_all_reviews

review_bp = Blueprint('review', __name__)

@review_bp.route('/upload-review', methods=["POST"])
@token_required
def upload_review_route(user_id):
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    teacher_user_id = data.get('teacher_user_id')
    rating = data.get('rating')
    comment = data.get('comment')
    name = data.get('name') or "Anonym"

    if not (teacher_user_id and rating is not None and comment):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        delete_review(student_user_id=user_id, teacher_user_id=teacher_user_id)
    except Exception as e:
        return jsonify({"message": f"Error deleting old review: {e}"}), 500
    
    try:
        insert_review(student_user_id=user_id, teacher_user_id=teacher_user_id, rating=rating, comment=comment, name=name)
        return jsonify({"message": "Inserted review successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Error inserting review: {e}"}), 500


@review_bp.route('/get-all-reviews', methods=["GET"])
def get_all_reviews_route():
    try:
        reviews = get_all_reviews()
        return jsonify({"reviews": reviews}), 200
    except Exception as e:
        print(f"Error retrieving reviews: {e}")
        return jsonify({"message": f"Error retrieving reviews: {e}"}), 500


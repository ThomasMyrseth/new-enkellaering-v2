from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from .config import token_required
from db.gets import (
    get_all_quizzes,
    get_all_qualifications,
    get_quiz_meta_data,
    get_quiz,
    get_quiz_status,
    is_user_admin
)
from db.inserts import (
    insert_quiz_result,
    insert_quiz,
    upload_image,
    insert_quiz_questions
)
from db.deletes import delete_quizzes

import json
import tempfile
import os
from datetime import timezone
from uuid import uuid4

quiz_bp = Blueprint('quiz', __name__)


@quiz_bp.route('/get-all-quizzes', methods=["GET"])
def get_all_quizzes_route():
    try:
        quizzes = get_all_quizzes()
        return jsonify({"quizzes": quizzes}), 200
    except Exception as e:
        logging.error(f"Error retrieving quizzes: {e}")
        return jsonify({"message": str(e)}), 500

//

@quiz_bp.route('/get-all-qualifications', methods=["GET"])
def get_all_qualifications_route():
    try:
        q = get_all_qualifications()
        return jsonify({"qualifications": q}), 200
    except Exception as e:
        logging.error(f"Error retrieving qualifications: {e}")
        return jsonify({"message": str(e)}), 500



@quiz_bp.route('/get-quiz-meta-data', methods=["POST"])
def get_quiz_meta_data_route():
    quiz_id = request.json.get('quiz_id')
    try:
        data = get_quiz_meta_data(quiz_id)
        return jsonify({"quizzes": data[0]}), 200 #return the first and only quiz with quiz_id=xxx
    except Exception as e:
        logging.error(f"Error retrieving quiz metadata: {e}")
        return jsonify({"message": str(e)}), 500


@quiz_bp.route('/get-quiz', methods=["POST"])
def get_quiz_route():
    quiz_id = request.json.get('quiz_id')
    if not quiz_id:
        return jsonify({"message": "Missing quiz id"}), 400
    try:
        quiz = get_quiz(quiz_id)
        return jsonify({"quiz": quiz}), 200
    except Exception as e:
        logging.error(f"Error retrieving quiz: {e}")
        return jsonify({"message": str(e)}), 500


@quiz_bp.route('/submit-quiz', methods=["POST"])
@token_required
def submit_quiz_route(user_id):
    data = request.json or {}
    number_of_corrects = data.get('number_of_corrects', 0)
    number_of_questions = data.get('number_of_questions', 1)
    passed = data.get('passed_quiz')
    quiz_id = data.get('quiz_id')

    print(f"Quiz ID: {quiz_id}")
    print(f"Passed: {passed}")
    print(f"Number of Corrects: {number_of_corrects}")
    print(f"Number of Questions: {number_of_questions}")

    if None in (number_of_corrects, number_of_questions, quiz_id):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        insert_quiz_result(user_id, quiz_id, passed, number_of_corrects, number_of_questions)
        return jsonify({"message": "Quiz submitted successfully"}), 200
    except Exception as e:
        print(f"Error submitting quiz result: {e}")
        logging.error(f"Error submitting quiz result: {e}")
        return jsonify({"message": str(e)}), 500


@quiz_bp.route('/get-quiz-status', methods=["GET"])
@token_required
def get_quiz_status_route(user_id):
    try:
        status = get_quiz_status(user_id)
        return jsonify({"quiz_status": status}), 200
    except Exception as e:
        logging.error(f"Error getting quiz status: {e}")
        return jsonify({"message": str(e)}), 500


@quiz_bp.route('/upload-quiz', methods=["POST"])
@token_required
def upload_quiz_route(user_id):
    if not is_user_admin(user_id):
        return jsonify({"message": "User is not admin"}), 403

    file = request.files.get("image")
    if not file:
        return jsonify({"message": "No file uploaded"}), 400

    suffix = os.path.splitext(file.filename)[1] or ""
    title = request.form.get("title")
    content = request.form.get("content")
    pass_threshold = request.form.get("pass_treshold")
    number_of_questions = request.form.get('number_of_questions')

    if not all([title, content, pass_threshold, number_of_questions]):
        return jsonify({"error": "Missing fields"}), 400

    tmp = f"/tmp/{uuid4()}{suffix}"
    file.save(tmp)

    try:
        quiz_id = insert_quiz(title, content, tmp, suffix, pass_threshold, number_of_questions)
        return jsonify({"url": f"/quiz/make-quiz/{quiz_id}"}), 200
    except Exception as e:
        logging.error(f"Error inserting quiz: {e}")
        return jsonify({"message": str(e)}), 500


@quiz_bp.route('/upload-questions', methods=["POST"])
@token_required
def upload_questions_route(user_id):
    if not is_user_admin(user_id):
        return jsonify({"message": "User is not admin"}), 403

    questions = request.form.get('questions')
    if not questions:
        return jsonify({"error": "Missing questions data"}), 400

    try:
        questions_list = json.loads(questions)
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400

    # Handle files and upload
    uploaded = {}
    for key, file in request.files.items():
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]).name
        file.save(tmp)
        quiz_id, qid = key.split("-----")
        uploaded[qid] = upload_image(qid, quiz_id, tmp, os.path.splitext(file.filename)[1])
        os.remove(tmp)

    formatted = []
    for q in questions_list:
        formatted.append({
            "question_id": q["question_id"],
            "quiz_id": q["quiz_id"],
            "question": q["question"],
            "options": q["options"],
            "correct_option": q["correct_option"],
            "image": uploaded.get(q["question_id"], ""),
            "time_limit": q["time_limit"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    try:
        insert_quiz_questions(formatted)
        return jsonify({"message": "Questions uploaded successfully"}), 200
    except Exception as e:
        logging.error(f"Error uploading questions: {e}")
        return jsonify({"message": str(e)}), 500


@quiz_bp.route('/delete-quiz', methods=["POST"])
@token_required
def delete_quiz_route(user_id):
    if not is_user_admin(user_id):
        return jsonify({"message": "User is not admin"}), 403

    quiz_ids = request.json.get('quiz_ids', [])
    if not quiz_ids:
        return jsonify({"message": "Missing quiz_ids"}), 400

    try:
        delete_quizzes(user_id, quiz_ids)
        return jsonify({"message": "Quizzes deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting quizzes: {e}")
        return jsonify({"message": str(e)}), 500

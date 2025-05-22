from flask import Blueprint, request, jsonify
from datetime import datetime

from .config import token_required
from cloud_sql.gets import (
    get_classes_for_student,
    get_classes_for_teacher,
    get_all_classes
)
from cloud_sql.alters import (
    set_classes_to_invoiced,
    set_classes_to_paid
)
from cloud_sql.gets import get_classes_by_teacher as fetch_classes_for_teacher_fn
from cloud_sql.inserts import insert_classes
from cloud_sql.deletes import delete_class

classes_bp = Blueprint('classes', __name__)

from cloud_sql.sql_types import Classes
import uuid

@classes_bp.route('/get-classes-for-student', methods=["GET"])
@token_required
def get_classes_for_student_route(user_id):
    try:
        classes = get_classes_for_student(user_id)
        return jsonify({"classes": classes}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@classes_bp.route('/get-classes-for-teacher', methods=["GET"])
@token_required
def get_classes_for_teacher_route(user_id):
    try:
        classes = get_classes_for_teacher(user_id)
        return jsonify({"classes": classes}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@classes_bp.route('/get-all-classes', methods=["GET"])
@token_required
def get_all_classes_route(user_id):
    try:
        classes = get_all_classes(user_id)
        return jsonify({"classes": classes}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@classes_bp.route('/set-classes-to-invoiced', methods=["POST"])
@token_required
def set_classes_to_invoiced_route(user_id):
    data = request.get_json() or {}
    class_ids = data.get('class_ids', [])
    if not class_ids:
        return jsonify({"message": "Missing class_ids"}), 400
    try:
        set_classes_to_invoiced(class_ids, user_id)
        return jsonify({"message": "successfully set classes to invoiced"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@classes_bp.route('/set-classes-to-paid', methods=["POST"])
@token_required
def set_classes_to_paid_route(user_id):
    data = request.get_json() or {}
    class_ids = data.get('class_ids', [])
    if not class_ids:
        return jsonify({"message": "Missing class_ids"}), 400
    try:
        set_classes_to_paid(class_ids, user_id)
        return jsonify({"message": "successfully set classes to paid"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@classes_bp.route('/fetch-classes-for-teacher', methods=["GET"])
@token_required
def fetch_classes_for_teacher(user_id):
    try:
        classes = fetch_classes_for_teacher_fn(user_id)
        return jsonify({"classes": classes}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@classes_bp.route('/upload-new-class', methods=["POST"])
@token_required
def upload_new_class(user_id):
    data = request.get_json() or {}
    student_ids = data.get('student_user_ids', [])
    started_at = data.get("started_at")
    ended_at = data.get("ended_at")
    comment = data.get("comment")
    was_canselled = data.get("was_canselled", False)
    groupclass = data.get('groupclass', False)
    number_of_students = data.get('number_of_students')

    if not (student_ids and started_at and ended_at):
        return jsonify({"message": "Missing required fields"}), 400

    classes = []
    for sid in student_ids:
        classes.append(Classes(
            class_id=str(uuid.uuid4()),
            teacher_user_id=user_id,
            student_user_id=sid,
            created_at=datetime.now(),
            started_at=started_at,
            ended_at=ended_at,
            comment=comment,
            paid_teacher=False,
            invoiced_student=False,
            paid_teacher_at=None,
            invoiced_student_at=None,
            was_canselled=was_canselled,
            groupclass=groupclass,
            number_of_students=number_of_students
        ))
    try:
        insert_classes(classes)
        return jsonify({"message": "Class inserted successfully"}), 200
    except Exception as e:
        print(f"Error inserting class: {e}")
        return jsonify({"message": str(e)}), 500

@classes_bp.route('/delete-class', methods=["POST"])
@token_required
def delete_class_route(user_id):
    data = request.get_json() or {}
    class_id = data.get('class_id')
    if not class_id:
        return jsonify({"message": "Missing class_id"}), 400
    try:
        delete_class(user_id, class_id)
        return jsonify({"message": "Class successfully deleted"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
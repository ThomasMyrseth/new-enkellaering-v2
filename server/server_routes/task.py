from flask import Blueprint, jsonify, request

from .config import token_required
from db.gets import is_admin
from db.tasks import create_new_tasks, get_all_open_tasks, update_status_on_task, close_task

task_bp = Blueprint('task', __name__)

@task_bp.route('/inactive-students', methods=["POST"])
def create_inactive_student_tasks():
    """Create tasks for students who have been inactive for 3+ weeks (for cron job)"""
    try:
        create_new_tasks(cutoff_days=21)
        return jsonify({"message": "Tasks created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/all', methods=["GET"])
@token_required
def get_all_tasks_route(user_id):
    """Get all open tasks (admin only)"""
    try:
        # Verify admin rights
        if not is_admin(user_id):
            return jsonify({"error": "User is not an admin"}), 403

        tasks = get_all_open_tasks()
        return jsonify({"tasks": tasks}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/<int:task_id>/status', methods=["PATCH"])
@token_required
def update_task_status_route(user_id, task_id):
    """Update the status of a task (admin only)"""
    try:
        # Verify admin rights
        if not is_admin(user_id):
            return jsonify({"error": "User is not an admin"}), 403

        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"error": "Missing status in request body"}), 400

        new_status = data.get('status')
        update_status_on_task(task_id, new_status)
        return jsonify({"message": "Task status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/<int:task_id>/complete', methods=["POST"])
@token_required
def complete_task_route(user_id, task_id):
    """Mark a task as completed (admin only)"""
    try:
        # Verify admin rights
        if not is_admin(user_id):
            return jsonify({"error": "User is not an admin"}), 403

        close_task(task_id)
        return jsonify({"message": "Task marked as completed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

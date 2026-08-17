from flask import Blueprint, jsonify, request
import json
import os
import logging

from .config import token_required
from .tasks_client import enqueue_email_task
from db.gets import is_admin
from db.tasks import create_new_tasks, create_new_tasks_for_teachers, get_all_open_tasks, get_all_open_teacher_tasks, update_status_on_task, update_notes_on_task, close_task

task_bp = Blueprint('task', __name__)

@task_bp.route('/inactive-students', methods=["POST"])
def create_inactive_student_tasks():
    """Create tasks for students who have been inactive for 3+ weeks (for cron job)"""
    try:
        created_names = create_new_tasks(cutoff_days=21)

        if created_names:
            try:
                message = {
                    "task_type": "student",
                    "names": created_names
                }
                enqueue_email_task("/tasks/send-new-tasks-admin-email", message)
                logging.info(f"Enqueued new student tasks email for {len(created_names)} students")
            except Exception as e:
                logging.error(f"Failed to enqueue new tasks email: {e}")

        return jsonify({"message": "Tasks created successfully", "count": len(created_names)}), 200
    except Exception as e:
        print(f"Error creating inactive student tasks: {e}")
        return jsonify({"error": str(e)}), 500
    

@task_bp.route('/inactive-teachers', methods=["POST"])
def create_inactive_teacher_tasks():
    """Create tasks for teachers who have had few classes (for cron job)"""
    try:
        cutoff_days = request.args.get('cutoff_days', 14, type=int)
        min_hours = request.args.get('min_hours', 4.0, type=float)
        created_names = create_new_tasks_for_teachers(cutoff_days=cutoff_days, min_hours=min_hours)

        if created_names:
            try:
                message = {
                    "task_type": "teacher",
                    "names": created_names
                }
                enqueue_email_task("/tasks/send-new-tasks-admin-email", message)
                logging.info(f"Enqueued new teacher tasks email for {len(created_names)} teachers")
            except Exception as e:
                logging.error(f"Failed to enqueue new tasks email: {e}")

        return jsonify({"message": "Tasks created successfully", "count": len(created_names)}), 200
    except Exception as e:
        print(f"Error creating inactive teacher tasks: {e}")
        return jsonify({"error": str(e)}), 500


@task_bp.route('/teacher-tasks/all', methods=["GET"])
@token_required
def get_all_teacher_tasks_route(user_id):
    """Get all open teacher follow-up tasks (admin only)"""
    try:
        if not is_admin(user_id):
            return jsonify({"error": "User is not an admin"}), 403

        tasks = get_all_open_teacher_tasks()
        return jsonify({"tasks": tasks}), 200
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

@task_bp.route('/<int:task_id>/status', methods=["PUT"])
@token_required
def update_task_status_route(user_id, task_id):
    """Update the status of a task (admin only)"""
    try:
        # Verify admin rights
        if not is_admin(user_id):
            print("User is not an admin")
            return jsonify({"error": "User is not an admin"}), 403

        data = request.get_json()
        if not data or 'status' not in data:
            print("Missing status in request body")
            return jsonify({"error": "Missing status in request body"}), 400

        new_status = data.get('status')
        update_status_on_task(task_id, new_status)
        return jsonify({"message": "Task status updated successfully"}), 200
    except Exception as e:
        print(f"Error updating task status: {e}")
        return jsonify({"error": str(e)}), 500

@task_bp.route('/<int:task_id>/notes', methods=["PUT"])
@token_required
def update_task_notes_route(user_id, task_id):
    """Update the admin notes on a task (admin only)"""
    try:
        if not is_admin(user_id):
            return jsonify({"error": "User is not an admin"}), 403

        data = request.get_json()
        if not data or 'notes' not in data:
            return jsonify({"error": "Missing notes in request body"}), 400

        new_notes = data.get('notes')
        update_notes_on_task(task_id, new_notes)
        return jsonify({"message": "Task notes updated successfully"}), 200
    except Exception as e:
        print(f"Error updating task notes: {e}")
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

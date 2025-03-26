
from flask import Blueprint, jsonify
import os

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


admin_bp = Blueprint('admin', __name__)


from big_query.gets import is_user_admin

@admin_bp.route('/is-admin', methods=["GET"])
@token_required
def is_admin_route(user_id):
    res = is_user_admin(client=bq_client, user_id=user_id)
    return jsonify({"is_admin": res}), 200 # true or false


from flask import Blueprint, request, jsonify
from datetime import datetime
import os


from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


quiz_bp = Blueprint('quiz', __name__)



from big_query.gets import get_all_quizzes
@quiz_bp.route('/get-all-quizzes', methods=["GET"])
@token_required
def get_all_quizzes_route(user_id):
    quizzes = get_all_quizzes(client=bq_client)

    if not quizzes or len(quizzes)==0:
        return jsonify({"message": "Error retrieving quizzes"}), 500
    
    return jsonify({"quizzes": quizzes}), 200



from big_query.gets import get_all_qualifications
@quiz_bp.route('/get-all-qualifications', methods=["GET"])
def get_all_qualifications_route():

    try:
        q = get_all_qualifications(bq_client=bq_client)

        if not q or len(q)==0:
            logger.exception(f"Error getting qualifications {e}")
            return jsonify({"message": "Error retrieving qualifications"}), 500
    
        return jsonify({"qualifications": q}), 200
    
    except Exception as e:
        logger.exception(f"Error getting qualifications {e}")
        return jsonify({"message": f"Error retrieving qualifications {e}"}), 500


from big_query.gets import get_all_quizzes
@quiz_bp.route('/get-all-available-qualifications', methods=["GET"])
def get_all_available_qualifications_route():

    try:
        q = get_all_quizzes(client=bq_client)

        if not q or len(q)==0:
            logger.exception(f"Error getting quizzes {e}")
            return jsonify({"message": "Error retrieving quizzes"}), 500
    
        return jsonify({"quizzes": q}), 200
    
    except Exception as e:
        logger.exception(f"Error getting quizzes {e}")
        print(f"Error getting quizzes {e}")
        return jsonify({"message": f"Error retrieving quizzes {e}"}), 500




from big_query.gets import get_quiz_meta_data
@quiz_bp.route('/get-quiz-meta-data', methods=["POST"])
@token_required
def get_quiz_meta_data_route(user_id):
    data = request.get_json()
    quiz_id = data.get('quiz_id')

    quizzes = get_quiz_meta_data(quiz_id=quiz_id, client=bq_client)

    if not quizzes or len(quizzes)==0:
        return jsonify({"message": "Error retrieving quizzes"}), 500
    
    return jsonify({"quizzes": quizzes}), 200


from big_query.gets import get_quiz

@quiz_bp.route('/get-quiz', methods=["POST"])
@token_required
def get_quiz_route(user_id):
    data = request.get_json()
    quiz_id = data.get('quiz_id')

    if not quiz_id:
        return jsonify({"message": "Missing quiz id"}), 400
    
    quiz = get_quiz(client=bq_client, quiz_id=quiz_id)

    if not quiz or len(quiz)==0:
        return jsonify({"message": "Error retrieving quiz"}), 500
    
    return jsonify({"quiz": quiz}), 200




from big_query.inserts import insert_quiz_result

@quiz_bp.route('/submit-quiz', methods=["POST"])
@token_required
def submit_quiz_route(user_id):
    data = request.get_json()
    number_of_corrects :int = data.get('number_of_corrects') or 0
    number_of_questions :int = data.get('number_of_questions') or 1
    passed: int = data.get('passed_quiz') or False
    quiz_id :str = data.get('quiz_id') or None

    
    if passed==1:
        passed = False
    elif passed==2:
        passed = True
    else:
        passed = None


    if number_of_corrects is None or number_of_questions is None or passed is None or not quiz_id or not user_id:
        logger.exception(f"""Missing required fields. 
                         Got:  \n
                         number_of_corrects = {number_of_corrects} \n
                        number_of_questions = {number_of_questions} \n
                        passed = {passed} \n
                        quiz_id = {quiz_id} \n
                        user_id = {user_id}
        """)
        print(f"""Missing required fields. 
                         Got:  \n
                         number_of_corrects = {number_of_corrects} \n
                        number_of_questions = {number_of_questions} \n
                        passed = {passed} \n
                        quiz_id = {quiz_id} \n
                        user_id = {user_id}
        """)
        return jsonify({"message": "Missing required fields"}), 400


    try:
        insert_quiz_result(user_id=user_id, quiz_id=quiz_id, passed=passed, number_of_corrects=number_of_corrects, number_of_questions=number_of_questions, client=bq_client)
        return jsonify({"message": "Quiz submitted successfully"}), 200

    except Exception as e:
        logger.exception(f"Error submitting quiz result {e}")
        print(f"Error submitting quiz result {e}")
        return jsonify({"message": str(e)}), 500


from big_query.gets import get_quiz_status

@quiz_bp.route('/get-quiz-status', methods=["GET"])
@token_required
def get_quiz_status_route(user_id):
    if not user_id:
        return jsonify({"message": "User must authenticate"}), 401
    
    try: 
        res = get_quiz_status(client=bq_client, user_id=user_id)

        return jsonify({"quiz_status": res}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"message": f"Error getting quiz status {str(e)}"}), 500



from big_query.inserts import insert_quiz
from big_query.gets import is_user_admin
import mimetypes
import logging
import os
from uuid import uuid4

logging.basicConfig(
    level=logging.INFO,  # Change to DEBUG to capture more detailed output
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler()  # Outputs logs to the console (stderr)
    ]
)
logger = logging.getLogger(__name__)

@quiz_bp.route('/upload-quiz', methods=["POST"])
@token_required
def upload_quiz_route(user_id):

    if not user_id:
        return jsonify({"messsage": "User must authenticate"}), 401
    
    is_admin = is_user_admin(client=bq_client, user_id=user_id)
    if not is_admin:
        return jsonify({"message": "User is not admin"}), 401

    if "image" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["image"]
    mimetype = file.mimetype
    file_extension = mimetypes.guess_extension(mimetype)

    title = request.form.get("title")  
    content = request.form.get("content")
    pass_treshold = request.form.get("pass_treshold")
    number_of_questions = request.form.get('number_of_questions')

    if not title or not pass_treshold or not content or not number_of_questions:
        return jsonify({"error": "Missing fields"}), 400
    

    #temporary storing the image
    temp_filename = f"/tmp/{uuid4()}{file_extension}"
    file.save(temp_filename)


    #inserting the quiz
    try:
        quiz_id = insert_quiz(title=title, content=content, image_path=temp_filename, extension=file_extension, pass_treshold=pass_treshold, number_of_questions=number_of_questions, bq_client=bq_client)
        return jsonify({"url": f"/quiz/make-quiz/{quiz_id}"}), 200

    except Exception as e:
        print(f"Error inserting quiz {e}")
        logger.exception(f"Error inserting quiz {e}")
        return jsonify({"message": f"Error inserting quiz: {e}"}), 500



import json
from big_query.inserts import upload_image, insert_quiz_questions
import tempfile
from datetime import timezone
@quiz_bp.route('/upload-questions', methods=["POST"])
@token_required
def upload_questions_route(user_id):

    if not user_id:
        logger.exception("User is not authenticated")
        return jsonify({"messsage": "User must authenticate"}), 401
    
    is_admin = is_user_admin(client=bq_client, user_id=user_id)
    if not is_admin:
        logger.exception("user is not admin")
        return jsonify({"message": "User is not admin"}), 401


    # Retrieve the questions JSON from the form data.
    questions_json = request.form.get('questions')
    if not questions_json:
        return jsonify({"error": "Missing questions data"}), 400

    try:
        questions = json.loads(questions_json)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON for questions"}), 400

    # Retrieve uploaded images.
    # Since your front-end appends files with keys like "image_0", "image_1", etc.,
    # you can iterate through request.files to process each file.
    images = {}
    for key in request.files:
        file = request.files[key]
        images[key] = file  # You could also process and store the file as required.

    #match each image with its questionID
    matched_images = {}
    for i, question in enumerate(questions):
        image_key = f"image_{i}"
        if image_key in images:
            question_id = question["question_id"]
            quiz_id = question["quiz_id"]
            image_title = f"{quiz_id}-----{question_id}"
            matched_images[image_title] = images[image_key]
        else:
            # Optionally log that no image was uploaded for this question
            print(f"No image uploaded for question {question['question_id']}")



    #upload each image to the bucket, by first storing them locally
    try:
        uploaded_image_urls = {}
        for image_title, file in matched_images.items():
            question_id = image_title.split("-----")[1]
            quiz_id = image_title.split("-----")[0]

            suffix = os.path.splitext(file.filename)[1] if file.filename else ""
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                temp_path = tmp.name
                file.save(temp_path)
            # Pass the temporary file path to your upload function
            url = upload_image(image_title=question_id, quiz_id=quiz_id, image_path=temp_path, extension=suffix)
            uploaded_image_urls[question_id] = url
            os.remove(temp_path)
    except Exception as e:
        print(f"error uploading images {e}")
        logger.exception(f"Error uploading images {e}")
        return jsonify({"message": f"Error uploading images {e}"})

    #upload the questions to bigquery with the imageUrls above  
    formatted_questions = []
    for question in questions:
        image_url = uploaded_image_urls.get(question['question_id'], "no image")

        q = {
            "question_id": question['question_id'],
            "quiz_id": question['quiz_id'],
            "question": question['question'],
            "options": question['options'], #this is a list
            "correct_option": question['correct_option'],
            "image": image_url,
            "time_limit": question['time_limit'],
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        formatted_questions.append(q)
    
    try:
        insert_quiz_questions(questions=formatted_questions)
        return jsonify({"message": "Questions uploaded successfully"}), 200
    
    except Exception as e:
        logger.exception(f"Error uploading questions {e}")
        print(f"Error saving questions to big query {e}")
        return jsonify({"message": f"Error saving questions to big query {e}"}), 500


from big_query.deletes import delete_quizzes

@quiz_bp.route('/delete-quiz', methods=["POST"])
@token_required
def delete_quiz_route(user_id):
    admin = is_user_admin(client=bq_client, user_id=user_id)
    if not admin:
        return jsonify({"message": "User is not admin"}), 401
    
    data = request.get_json()
    quiz_ids = data.get('quiz_ids')

    if not data or not quiz_ids:
        return jsonify({"message": "Missing required fields"}), 400
    

    try:
        delete_quizzes(admin_user_id=user_id, quiz_ids=quiz_ids, bq_client=bq_client)
        return jsonify({"message": "Quizzes deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting quiz {e}")
        return jsonify({"message": f"Error deleting quizzes {e}"}), 500


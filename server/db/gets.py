from datetime import datetime, timedelta, timezone
from supabase_client import supabase

def get_all_teachers():
    """Get all active teachers (not resigned)"""
    response = supabase.table('teachers').select('*').eq('resigned', 'FALSE').execute()
    return response.data

def get_all_teachers_inc_resigned():
    """Get all teachers including resigned ones"""
    response = supabase.table('teachers').select('*').execute()
    return response.data

def get_all_students(admin_user_id: str):
    """Get all students (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    response = supabase.table('students').select('*').execute()
    return response.data

def get_teacher_by_user_id(user_id: str):
    """Get teacher by user_id"""
    response = supabase.table('teachers').select('*').eq('user_id', user_id).execute()
    return response.data

def get_student_by_user_id(user_id: str):
    """Get student by user_id"""
    response = supabase.table('students').select('*').eq('user_id', user_id).execute()
    return response.data

def get_all_referrals(admin_user_id: str):
    """Get all referrals (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    response = supabase.table('teacher_referrals').select('*').execute()
    return response.data

def get_referral_by_user_id(admin_user_id: str, target_referee_user_id: str):
    """Get referral by user_id (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    response = supabase.table('teacher_referrals').select('*').eq('referee_teacher_user_id', target_referee_user_id).execute()
    return response.data

def get_all_new_students(admin_user_id: str):
    """Get all new students (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    response = supabase.table('new_students').select('*').execute()
    return response.data

def get_all_students_without_teacher(admin_user_id: str):
    """Get all students without teacher (admin validated, uses RPC function)"""
    response = supabase.rpc('get_all_students_without_teacher', {'admin_id': admin_user_id}).execute()
    return response.data

def get_new_orders_for_teacher(teacher_user_id: str):
    """Get new orders for teacher (3-table JOIN, uses RPC function)"""
    response = supabase.rpc('get_new_orders_for_teacher', {'teacher_id': teacher_user_id}).execute()
    return response.data

def get_new_student_by_phone(phone: str):
    """Get new student by phone number"""
    response = supabase.table('new_students').select('*').eq('phone', phone).execute()
    return response.data

def get_all_classes(admin_user_id: str):
    """Get all classes (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    response = supabase.table('classes').select('*').execute()
    return response.data

def get_class_by_teacher_and_student_id(admin_user_id: str, teacher_user_id: str, student_user_id: str):
    """Get class by teacher and student ID (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    response = supabase.table('classes').select('*').eq('teacher_user_id', teacher_user_id).eq('student_user_id', student_user_id).execute()
    return response.data

def get_classes_by_teacher(user_id: str):
    """Get all classes for a teacher"""
    response = supabase.table('classes').select('*').eq('teacher_user_id', user_id).execute()
    return response.data

def get_student_for_teacher(teacher_user_id: str):
    """Get students for teacher (uses RPC function with JOIN)"""
    response = supabase.rpc('get_student_for_teacher', {'teacher_id': teacher_user_id}).execute()
    return response.data

def get_student_by_email(email: str):
    """Get student by email"""
    response = supabase.table('students').select('*').eq('email_parent', email).execute()
    return response.data

def get_teacher_by_email(email: str):
    """Get teacher by email"""
    response = supabase.table('teachers').select('*').eq('email', email).execute()
    return response.data

def get_teacher_for_student(student_user_id: str):
    """Get teachers for student (uses RPC function with JOIN)"""
    response = supabase.rpc('get_teacher_for_student', {'student_id': student_user_id}).execute()
    return response.data

def get_classes_for_student(student_user_id: str):
    """Get classes for student with teacher info"""
    # Using direct query with select for JOIN-like behavior
    response = supabase.table('classes').select('*, teachers(*)').eq('student_user_id', student_user_id).execute()
    return response.data

def get_classes_for_teacher(teacher_user_id: str):
    """Get all classes for a teacher"""
    response = supabase.table('classes').select('*').eq('teacher_user_id', teacher_user_id).execute()
    return response.data

def get_about_me_text(user_id: str):
    """Get about_me text for a user"""
    response = supabase.table('about_me_texts').select('about_me').eq('user_id', user_id).execute()
    return response.data

def get_all_about_me_texts():
    """Get all about_me texts"""
    response = supabase.table('about_me_texts').select('user_id, about_me, firstname, lastname, image_url').execute()
    return response.data

def get_all_quizzes():
    """Get all quizzes"""
    response = supabase.table('quizzes').select('*').execute()
    return response.data

def get_quiz_meta_data(quiz_id: str):
    """Get quiz metadata by quiz_id"""
    response = supabase.table('quizzes').select('*').eq('quiz_id', quiz_id).execute()
    return response.data

def get_quiz(quiz_id: str):
    """Get all questions for a quiz"""
    response = supabase.table('questions').select('*').eq('quiz_id', quiz_id).execute()
    return response.data

def get_quiz_status(user_id: str):
    """Get quiz status for a user (combines quizzes and results)"""
    quizzes_response = supabase.table('quizzes').select('*').execute()
    results_response = supabase.table('quiz_results').select('*').eq('user_id', user_id).execute()

    quizzes = quizzes_response.data
    results = results_response.data

    status = []
    for quiz in quizzes:
        match = next((r for r in results if r["quiz_id"] == quiz["quiz_id"]), {})
        status.append({"quiz": quiz, "result": match})
    return status

def get_all_reviews():
    """Get all reviews"""
    response = supabase.table('reviews').select('*').execute()
    return response.data

def is_user_admin(user_id: str):
    """Check if user is an admin"""
    response = supabase.table('teachers').select('admin').eq('user_id', user_id).execute()
    return bool(response.data and response.data[0].get("admin") == 'TRUE')

def get_all_qualifications():
    """Get all qualifications (quizzes with passed results)"""
    response = supabase.table('quiz_results').select('*, quizzes(*)').eq('passed', 'TRUE').execute()
    
    return response.data

def get_new_orders(student_user_id: str):
    """Get new orders for student (pending teacher acceptances) - returns TeacherOrderJoinTeacher[]"""
    response = supabase.rpc('get_new_orders_for_student', {'student_id': student_user_id}).execute()
    return response.data

def get_teacher_student():
    """Get all active teacher-student relationships"""
    response = supabase.table('teacher_student').select('*').or_('hidden.is.null,hidden.eq.FALSE').execute()
    return response.data

def get_students_with_few_classes(days: int):
    """Get students with few classes (uses RPC function with window function)"""
    response = supabase.rpc('get_students_with_few_classes', {'days': days}).execute()
    return response.data

def get_all_admins():
    """Get all admin teachers"""
    response = supabase.table('teachers').select('*').eq('admin', 'TRUE').execute()
    return response.data

def get_all_teachers_join_students():
    """Get all teachers joined with students (complex LEFT JOINs)"""
    # Using Supabase's query builder with nested selects
    response = supabase.table('students').select('*, teacher_student!inner(*, teachers(*))').or_('teachers.resigned.eq.FALSE,teachers.resigned.is.null', foreign_table='teacher_student.teachers').or_('teacher_student.teacher_accepted_student.eq.TRUE,teacher_student.teacher_accepted_student.is.null').or_('teacher_student.hidden.eq.FALSE,teacher_student.hidden.is.null').execute()
    return response.data

def get_students_without_teacher():
    """Get students without teacher (uses RPC function)"""
    response = supabase.rpc('get_students_without_teacher').execute()
    return response.data

def get_teachers_without_about_me():
    """Get teachers without about_me text"""
    # Get all teachers
    teachers_response = supabase.table('teachers').select('user_id, firstname, lastname, email').eq('resigned', 'FALSE').execute()
    # Get all teacher user_ids with about_me
    about_me_response = supabase.table('about_me_texts').select('user_id').execute()

    about_me_user_ids = {row['user_id'] for row in about_me_response.data}
    teachers_without_about_me = [
        teacher for teacher in teachers_response.data
        if teacher['user_id'] not in about_me_user_ids
    ]

    return teachers_without_about_me

def get_teachers_without_quizes():
    """Get teachers without quiz results"""
    # Get all teachers
    teachers_response = supabase.table('teachers').select('user_id, firstname, lastname, email').eq('resigned', 'FALSE').execute()
    # Get all teacher user_ids with quiz results
    quiz_results_response = supabase.table('quiz_results').select('user_id').execute()

    quiz_user_ids = {row['user_id'] for row in quiz_results_response.data}
    teachers_without_quizzes = [
        teacher for teacher in teachers_response.data
        if teacher['user_id'] not in quiz_user_ids
    ]

    return teachers_without_quizzes



def is_admin(user_id: str) -> bool:
    """Check if a user is an admin"""
    response = supabase.table('teachers').select('admin').eq('user_id', user_id).execute()
    return bool(response.data and response.data[0].get("admin"))
from db.gets import is_admin
from supabase_client import supabase
from db.gets import is_admin

def hide_new_student(row_id: str, admin_user_id: str):
    """Hide a new student order (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Set hidden to TRUE
    supabase.table('teacher_student').update({
        'hidden': 'TRUE'
    }).eq('row_id', row_id).execute()

def hide_new_order_from_new_students_table(new_student_id: str, admin_user_id: str):
    """Hide a new order from new_students table (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Set hidden to TRUE
    supabase.table('new_students').update({
        'hidden': 'TRUE'
    }).eq('new_student_id', new_student_id).execute()

def delete_class(teacher_user_id: str, class_id: str):

    #check if the user is admin
    admin_response = is_admin(teacher_user_id)

    #is the user is not admin, delete only if the class belongs to the teacher
    if not admin_response:
        print("not admin")
        """Delete a class by class_id and teacher_user_id"""
        supabase.table('classes').delete().eq('class_id', class_id).eq('teacher_user_id', teacher_user_id).execute()
    
    else:
        print("is admin")
        """Delete a class by class_id"""
        supabase.table('classes').delete().eq('class_id', class_id).execute()

def delete_review(student_user_id: str, teacher_user_id: str):
    """Delete a review by student_user_id and teacher_user_id"""
    supabase.table('reviews').delete().eq('student_user_id', student_user_id).eq('teacher_user_id', teacher_user_id).execute()

def remove_teacher_from_student(teacher_user_id: str, student_user_id: str, admin_user_id: str):
    """Remove teacher from student by setting hidden to TRUE (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)    
    if not admin_response:
        raise ValueError("User is not an admin")

    # Set hidden to TRUE
    supabase.table('teacher_student').update({
        'hidden': 'TRUE'
    }).eq('teacher_user_id', teacher_user_id).eq('student_user_id', student_user_id).execute()

def delete_folder_from_bucket(quiz_id: str, bucket_name: str = "quiz-images"):
    """
    Delete all files in a quiz folder from Supabase Storage

    Args:
        quiz_id: UUID of the quiz
        bucket_name: Name of the storage bucket (default: quiz-images)

    Returns:
        True if successful
    """
    try:
        # List all files in the quiz folder
        files_response = supabase.storage.from_(bucket_name).list(path=f"{quiz_id}/")

        if files_response:
            # Build list of file paths to delete
            file_paths = [f"{quiz_id}/{file['name']}" for file in files_response]

            # Delete all files
            if file_paths:
                supabase.storage.from_(bucket_name).remove(file_paths)

        return True
    except Exception as e:
        raise Exception(f"Error deleting folder from Supabase Storage: {e}")

def delete_quizzes(admin_user_id: str, quiz_ids: list[str]):
    """
    Delete quizzes with cascade (admin validated, uses RPC function)

    Args:
        admin_user_id: User ID of the admin
        quiz_ids: List of quiz UUIDs to delete

    Returns:
        True if successful
    """
    # Call RPC function for database deletion
    response = supabase.rpc('delete_quizzes_cascade', {
        'admin_id': admin_user_id,
        'quiz_ids': quiz_ids
    }).execute()

    # Delete storage files for each quiz
    for quiz_id in quiz_ids:
        try:
            delete_folder_from_bucket(quiz_id)
        except Exception as e:
            # Log error but don't fail the entire operation
            print(f"Warning: Could not delete storage for quiz {quiz_id}: {e}")

    return response.data

def hide_old_orders(days_old: int):
    """
    Hide old orders that are older than specified days and not accepted

    Args:
        days_old: Number of days threshold

    Returns:
        None
    """
    from datetime import datetime, timezone, timedelta

    # Calculate threshold date
    threshold_date = (datetime.now(timezone.utc) - timedelta(days=days_old)).isoformat()

    # Update old orders to hidden
    supabase.table('teacher_student').update({
        'hidden': 'TRUE'
    }).lt('created_at', threshold_date).or_('teacher_accepted_student.is.null,teacher_accepted_student.eq.FALSE').execute()


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) DELETE FUNCTIONS
# ============================================================================

def delete_help_session(session_id: str, user_id: str):
    """Soft delete help session (set is_active = false)"""
    # Check if user is admin or the session owner
    session = supabase.table('help_sessions').select('teacher_user_id').eq('session_id', session_id).execute()
    if not session.data:
        raise ValueError("Økten ble ikke funnet")

    if session.data[0]['teacher_user_id'] != user_id and not is_admin(user_id):
        raise ValueError("Du har ikke tillatelse til å slette denne økten")

    supabase.table('help_sessions').update({'is_active': False}).eq('session_id', session_id).execute()

from typing import Optional
from decimal import Decimal
from datetime import datetime, timezone
from db.gets import is_admin
from supabase_client import supabase

def alter_new_student(new_student_id: str, admin_user_id: str, updates: dict):
    """Update new_student with 16 dynamic fields (uses RPC function)"""
    response = supabase.rpc('alter_new_student', {
        'new_student_id_parameter':  new_student_id,
        'admin_id': admin_user_id,
        'updates_json': updates
    }).execute()
    return response.data

def set_your_teacher(phone: str, your_teacher: str):
    """Set your_teacher field for a student"""
    supabase.table('students').update({
        'your_teacher': your_teacher
    }).eq('phone_parent', phone).execute()

def change_teacher_by_user_id(
    student_user_id: str,
    new_teacher_user_id: str,
    admin_user_id: str,
    old_teacher_user_id: str
):
    """Change teacher for a student (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update teacher
    supabase.table('teacher_student').update({
        'teacher_user_id': new_teacher_user_id
    }).eq('student_user_id', student_user_id).eq('teacher_user_id', old_teacher_user_id).execute()

def remove_teacher_from_student(student_user_id: str, teacher_user_id: str, admin_user_id: str):
    """Remove teacher from student by setting hidden to TRUE (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update to hidden
    supabase.table('teacher_student').update({
        'hidden': 'TRUE'
    }).eq('student_user_id', student_user_id).eq('teacher_user_id', teacher_user_id).execute()

def set_classes_to_invoiced(class_ids: list, admin_user_id: str):
    """Set classes to invoiced status (uses RPC function for batch update)"""
    response = supabase.rpc('set_classes_invoiced_batch', {
        'class_ids': class_ids,
        'admin_id': admin_user_id
    }).execute()
    return response.data

def set_classes_to_paid(class_ids: list, admin_user_id: str):
    """Set classes to paid status (uses RPC function for batch update)"""
    response = supabase.rpc('set_classes_paid_batch', {
        'class_ids': class_ids,
        'admin_id': admin_user_id
    }).execute()
    return response.data

def set_student_to_inactive(student_user_id: str, admin_user_id: str):
    """Set student to inactive (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update student
    supabase.table('students').update({
        'is_active': 'FALSE'
    }).eq('user_id', student_user_id).execute()

def set_student_to_active(student_user_id: str, admin_user_id: str):
    """Set student to active (admin validated)"""
    print("student_user_id", student_user_id)
    print("admin_user_id", admin_user_id)

    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update student
    supabase.table('students').update({
        'is_active': 'TRUE'
    }).eq('user_id', student_user_id).execute()

def toggle_want_more_students(physical: bool, digital: bool, teacher_user_id: str):
    """Toggle teacher's preferences for accepting new students"""
    supabase.table('teachers').update({
        'digital_tutouring': str(digital),
        'physical_tutouring': str(physical)
    }).eq('user_id', teacher_user_id).execute()

def update_student_notes(admin_user_id: str, student_user_id: str, notes: str):
    """Update student notes (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update notes
    supabase.table('students').update({
        'notes': notes
    }).eq('user_id', student_user_id).execute()

def update_teacher_notes(admin_user_id: str, teacher_user_id: str, notes: str):
    """Update teacher notes (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update notes
    supabase.table('teachers').update({
        'notes': notes
    }).eq('user_id', teacher_user_id).execute()

def cancel_new_order(row_id: str):
    """Cancel a new order by setting hidden to TRUE"""
    supabase.table('teacher_student').update({
        'hidden': 'TRUE'
    }).eq('row_id', row_id).execute()

def update_new_order(
    row_id: str,
    teacher_accepted_student: Optional[bool] = None,
    physical_or_digital: Optional[bool] = None,
    preferred_location: Optional[str] = None,
    comments: Optional[str] = None
):
    """Update new order with dynamic fields (uses RPC function)"""
    # Build updates JSON
    updates = {}
    if teacher_accepted_student is not None:
        updates['teacher_accepted_student'] = str(teacher_accepted_student)
    if physical_or_digital is not None:
        updates['physical_or_digital'] = str(physical_or_digital)
    if preferred_location is not None:
        updates['preferred_location'] = preferred_location
    if comments is not None:
        updates['comments'] = comments

    if not updates:
        raise ValueError("No fields provided for update")

    # Call RPC function
    response = supabase.rpc('update_new_order_dynamic', {
        'order_row_id': row_id,
        'updates_json': updates
    }).execute()
    return response.data

def update_teacher_profile(
    teacher_user_id: str,
    firstname: str,
    lastname: str,
    phone: str,
    address: str,
    postal_code: str,
    additional_comments: Optional[str] = None,
    location: Optional[str] = None,
    physical: Optional[bool] = None,
    digital: Optional[bool] = None
):
    """Update teacher profile"""
    supabase.table('teachers').update({
        'firstname': firstname,
        'lastname': lastname,
        'phone': phone,
        'address': address,
        'postal_code': postal_code,
        'additional_comments': additional_comments,
        'location': location,
        'physical_tutouring': str(physical) if physical is not None else None,
        'digital_tutouring': str(digital) if digital is not None else None
    }).eq('user_id', teacher_user_id).execute()

def update_travel_payment(travel_payment: dict, admin_user_id: str):
    """Update travel payment for teacher-student relationship (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Update travel payment
    supabase.table('teacher_student').update({
        'travel_pay_to_teacher': str(Decimal(str(travel_payment["travel_pay_to_teacher"]))),
        'travel_pay_from_student': str(Decimal(str(travel_payment["travel_pay_from_student"])))
    }).eq('student_user_id', travel_payment["student_user_id"]).eq('teacher_user_id', travel_payment["teacher_user_id"]).execute()

def retireTeacher(teacherUserId: str, adminUserId: str):
    """Retire a teacher (admin validated)"""
    from datetime import datetime, timezone

    # Verify admin
    admin_response = is_admin(adminUserId)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Retire teacher
    supabase.table('teachers').update({
        'resigned': 'TRUE',
        'resigned_at': datetime.now(timezone.utc).isoformat()
    }).eq('user_id', teacherUserId).execute()

def reactivateTeacher(teacherUserId: str, adminUserId: str):
    """Reactivate a teacher (admin validated)"""
    # Verify admin
    admin_response = is_admin(adminUserId)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Reactivate teacher
    supabase.table('teachers').update({
        'resigned': 'FALSE'
    }).eq('user_id', teacherUserId).execute()


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) UPDATE FUNCTIONS
# ============================================================================

def update_teacher_help_config(teacher_user_id: str, zoom_link: Optional[str] = None,
                               available_for_help: Optional[bool] = None):
    """Upsert teacher help config"""
    data = {
        'teacher_user_id': teacher_user_id,
        'updated_at': datetime.now(timezone.utc).isoformat()
    }

    if zoom_link is not None:
        data['zoom_link'] = zoom_link
    if available_for_help is not None:
        data['available_for_help'] = available_for_help

    supabase.table('teacher_help_config').upsert(data).execute()


def update_queue_status(queue_id: str, status: str):
    """Update queue entry status (admit, complete, no-show)"""
    valid_statuses = ['admitted', 'completed', 'no_show']
    if status not in valid_statuses:
        raise ValueError(f"Invalid status: {status}")

    data = {'status': status}

    if status == 'admitted':
        data['admitted_at'] = datetime.now(timezone.utc).isoformat()
    elif status == 'completed':
        data['completed_at'] = datetime.now(timezone.utc).isoformat()

    supabase.table('help_queue').update(data).eq('queue_id', queue_id).execute()

    # Reorder remaining queue positions
    queue_entry = supabase.table('help_queue').select('assigned_session_id').eq('queue_id', queue_id).execute()
    if queue_entry.data:
        session_id = queue_entry.data[0]['assigned_session_id']
        # Use RPC to reorder positions
        supabase.rpc('reorder_queue_positions', {'session_id_param': session_id}).execute()

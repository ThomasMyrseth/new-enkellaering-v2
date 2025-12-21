from datetime import datetime, timedelta, timezone
from db.sql_types import Students
from supabase_client import supabase

def get_students_with_no_classes(number_of_days: int = 21) -> list[dict]:
    """
    Retrieve a list of student IDs who have not attended any classes in the past specified number of weeks.

    Args:
        number_of_weeks (int): The number of weeks to check
    Returns:
        list[str]: A list of student IDs
    """

    #call supabase RPC function
    response = supabase.rpc('get_students_with_few_classes', {'days': number_of_days}).execute()
    return response.data


def get_students_who_have_had_task(number_of_days: int = 21, task_type :str = 'followup_student') -> list[str]:
    """
    Retrieve a list of student IDs who have had tasks assigned in the past specified number of weeks.

    Args:
        number_of_weeks (int): The number of weeks to check
    Returns:
        list[str]: A list of student IDs
    """

    cutof_date = (datetime.now(timezone.utc) - timedelta(days=number_of_days)).isoformat()
    #query table directly, filtering by type='followup_student'
    response = supabase.table('tasks').select('student').gte('created_at', cutof_date).eq('type', task_type).execute()
    student_ids = list(set([task['student'] for task in response.data])) #get a list of unique IDs

    return student_ids


def create_new_tasks(cutoff_days: int = 21) -> None:
    """
    Create new tasks for students who have not attended classes in the past 3 weeks
    and have not had tasks assigned in the past 3 weeks.
    Creates one task per student with all their teachers.
    """

    students_with_no_classes :list[dict] = get_students_with_no_classes(cutoff_days)
    students_ids_with_tasks :list[str] = get_students_who_have_had_task(cutoff_days)

    #convert cutof days to number of weeks
    cutoff_weeks = cutoff_days // 7

    # Filter out students who already have tasks
    students_to_create_tasks_for = [student for student in students_with_no_classes if student['student']['user_id'] not in students_ids_with_tasks]

    # Group by student and collect all their UNIQUE teachers
    student_teachers_map = {}
    for student in students_to_create_tasks_for:
        student_id = student['student']['user_id']
        if student_id not in student_teachers_map:
            student_teachers_map[student_id] = {
                'student': student['student'],
                'teacher_ids': set()  # Use set to automatically deduplicate
            }
        student_teachers_map[student_id]['teacher_ids'].add(student['teacher']['user_id'])

    # Create one task per student with all their teachers
    for student_id, data in student_teachers_map.items():
        student_data = data['student']
        teacher_ids = list(data['teacher_ids'])  # Convert set to list for PostgreSQL array

        new_task = {
            'created_at': datetime.now(timezone.utc).isoformat(),
            'title': f"{student_data['firstname_student']} {student_data['lastname_student']} har ikke hatt timer på {cutoff_weeks} uker",
            'description': f"Studenten {student_data['firstname_student']} {student_data['lastname_student']} har ikke hatt noen timer på {cutoff_weeks} uker. Vennligst ta kontakt for å følge opp. Du vil ikke få flere påminnnelser om {student_data['firstname_student']} på tre uker. Dersom du setter {student_data['firstname_student']} til inaktiv vil du få ingen varslinger om hen.",
            'status': 'pending',
            'type': 'followup_student',
            'teacher_ids': teacher_ids,
            'student': student_id
        }
        supabase.table('tasks').insert(new_task).execute()


def update_status_on_task(task_id: int, new_status: str) -> None:
    """
    Update the status of a task.

    Args:
        task_id (int): The ID of the task to update
        new_status (str): The new status to set
    """

    supabase.table('tasks').update({'status': new_status}).eq('id', task_id).execute()

def get_all_open_tasks() -> list[dict]:
    """
    Retrieve all open tasks from the database with student and teacher information.
    Optimized to fetch all teachers in a single query.

    Returns:
        list[dict]: A list of open tasks with embedded student and teacher data
    """

    # Get all open tasks with student data
    response = supabase.table('tasks').select(
        '*, student_data:students!tasks_student_fkey(*)'
    ).eq('completed', False).execute()

    tasks = response.data

    # Collect all unique teacher IDs from all tasks
    all_teacher_ids = set()
    for task in tasks:
        teacher_ids = task.get('teacher_ids', [])
        if teacher_ids:
            all_teacher_ids.update(teacher_ids)

    # Fetch all teachers in a single query
    teachers_map = {}
    if all_teacher_ids:
        teachers_response = supabase.table('teachers').select('*').in_('user_id', list(all_teacher_ids)).execute()
        # Create a map of teacher_id -> teacher data for fast lookup
        for teacher in teachers_response.data:
            teachers_map[teacher['user_id']] = teacher

    # Map teachers back to each task
    for task in tasks:
        teacher_ids = task.get('teacher_ids', [])
        if teacher_ids:
            # Look up each teacher from the map
            task['teachers_data'] = [teachers_map[tid] for tid in teacher_ids if tid in teachers_map]
        else:
            task['teachers_data'] = []

    return tasks

def close_task(task_id: int) -> None:
    """
    Mark a task as completed.

    Args:
        task_id (int): The ID of the task to mark as completed
    """

    supabase.table('tasks').update({
        'completed': True,
        'status': 'completed',
        'completed_at': datetime.now(timezone.utc).isoformat()
    }).eq('id', task_id).execute()
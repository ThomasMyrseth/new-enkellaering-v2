from datetime import datetime, timedelta, timezone
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

def get_students_with_open_tasks() -> list[str]:
    """
    Retrieve a list of student IDs who have open tasks assigned.

    Returns:
        list[str]: A list of student IDs
    """

    #query table directly, filtering by status != 'completed'
    response = supabase.table('tasks').select('student').neq('status', 'completed').execute()
    student_ids = list(set([task['student'] for task in response.data])) #get a list of unique IDs
    return student_ids

def create_new_tasks(cutoff_days: int = 21) -> list[str]:
    """
    Create new tasks for students who have not attended classes in the past 3 weeks
    and have not had tasks assigned in the past 3 weeks.
    Creates one task per student with all their teachers.

    Returns:
        list[str]: Names of students for whom tasks were created
    """

    students_with_no_classes :list[dict] = get_students_with_no_classes(cutoff_days)
    students_ids_with_tasks :list[str] = get_students_who_have_had_task(cutoff_days)
    students_with_open_tasks :list[str] = get_students_with_open_tasks()

    #convert cutof days to number of weeks
    cutoff_weeks = cutoff_days // 7

    # Filter out students who already have tasks
    students_to_create_tasks_for = [
        student
        for student in students_with_no_classes
        if student['student']['user_id'] not in students_ids_with_tasks
        and student['student']['user_id'] not in students_with_open_tasks
    ]
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
    created_names = []
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
        created_names.append(f"{student_data['firstname_student']} {student_data['lastname_student']}")

    return created_names



def get_teachers_with_few_hours(cutoff_days: int = 14, min_hours: float = 4.0) -> list[dict]:
    """
    Retrieve teachers who have taught less than min_hours in the past cutoff_days days.

    Args:
        cutoff_days (int): Number of days to look back
        min_hours (float): Minimum hours threshold
    Returns:
        list[dict]: Each dict has 'teacher' (teacher object) and 'total_hours'
    """
    response = supabase.rpc('get_teachers_with_few_hours', {
        'days': cutoff_days,
        'min_hours': min_hours
    }).execute()
    return response.data


def get_teachers_who_have_had_task(number_of_days: int = 14) -> list[str]:
    """
    Retrieve teacher IDs who have had a followup_teacher task created in the past N days.

    Args:
        number_of_days (int): Number of days to look back
    Returns:
        list[str]: A list of unique teacher user IDs
    """
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=number_of_days)).isoformat()
    response = supabase.table('tasks').select('teacher').gte('created_at', cutoff_date).eq('type', 'followup_teacher').execute()
    teacher_ids = list(set([task['teacher'] for task in response.data if task.get('teacher')]))
    return teacher_ids


def get_teachers_with_open_tasks() -> list[str]:
    """
    Retrieve teacher IDs who have open followup_teacher tasks.

    Returns:
        list[str]: A list of unique teacher user IDs
    """
    response = supabase.table('tasks').select('teacher').neq('status', 'completed').eq('type', 'followup_teacher').execute()
    teacher_ids = list(set([task['teacher'] for task in response.data if task.get('teacher')]))
    return teacher_ids


def get_all_open_teacher_tasks() -> list[dict]:
    """
    Retrieve all open teacher follow-up tasks with teacher data.

    Returns:
        list[dict]: A list of open teacher tasks with embedded teacher data
    """
    response = supabase.rpc("get_all_open_teacher_tasks").execute()
    return response.data


def create_new_tasks_for_teachers(cutoff_days: int = 14, min_hours: float = 4.0) -> list[str]:
    """
    Create new tasks for teachers who have had few hours in the past cutoff_days
    and have not had tasks assigned recently.
    Creates one task per teacher.

    Args:
        cutoff_days (int): Number of days to look back for teaching hours and recent tasks
        min_hours (float): Minimum hours threshold — teachers below this get a task
    Returns:
        list[str]: Names of teachers for whom tasks were created
    """
    teachers_with_few_classes: list[dict] = get_teachers_with_few_hours(cutoff_days, min_hours)
    teacher_ids_with_tasks: list[str] = get_teachers_who_have_had_task(cutoff_days)
    teacher_ids_with_open_tasks: list[str] = get_teachers_with_open_tasks()

    cutoff_weeks = cutoff_days // 7

    # Filter out teachers who already have tasks or had recent tasks
    teachers_to_create_tasks_for = [
        entry
        for entry in teachers_with_few_classes
        if entry['teacher']['user_id'] not in teacher_ids_with_tasks
        and entry['teacher']['user_id'] not in teacher_ids_with_open_tasks
    ]

    created_names = []
    for entry in teachers_to_create_tasks_for:
        teacher = entry['teacher']
        total_hours = round(entry.get('total_hours', 0), 1)
        teacher_id = teacher['user_id']

        new_task = {
            'created_at': datetime.now(timezone.utc).isoformat(),
            'title': f"{teacher['firstname']} {teacher['lastname']} har hatt få timer de siste {cutoff_weeks} ukene",
            'description': f"Læreren {teacher['firstname']} {teacher['lastname']} har bare hatt {total_hours} timer de siste {cutoff_weeks} ukene. Vennligst ta kontakt for å følge opp.",
            'status': 'pending',
            'type': 'followup_teacher',
            'teacher_ids': [teacher_id],
            'teacher': teacher_id,
            'student': None
        }
        supabase.table('tasks').insert(new_task).execute()
        created_names.append(f"{teacher['firstname']} {teacher['lastname']}")

    return created_names


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
    response = supabase.rpc("get_all_open_tasks").execute()
    tasks = response.data
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
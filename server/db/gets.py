from datetime import datetime, timedelta, timezone
from supabase_client import supabase
import json
import re
import logging

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

def get_students_by_user_ids(user_ids: list):
    """Get multiple students by list of user_ids"""
    if not user_ids:
        return []

    # Defensive handling: ensure it's a proper list
    import logging
    import json

    logging.info(f"get_students_by_user_ids received: {user_ids}, type: {type(user_ids)}")

    # If it's a string, try to parse it
    if isinstance(user_ids, str):
        try:
            user_ids = json.loads(user_ids)
            logging.info(f"Parsed string to list: {user_ids}")
        except:
            logging.error(f"Failed to parse user_ids string: {user_ids}")
            return []

    # Ensure it's a list
    if not isinstance(user_ids, list):
        user_ids = list(user_ids)

    # Ensure all elements are strings (UUIDs should be strings)
    user_ids = [str(uid) for uid in user_ids]

    logging.info(f"Final user_ids before query: {user_ids}, type: {type(user_ids)}")
    logging.info(f"First user_id type: {type(user_ids[0]) if user_ids else 'empty'}")

    # Try using tuple instead of list - some libraries prefer this
    try:
        response = supabase.table('students').select('*').in_('user_id', tuple(user_ids)).execute()
    except Exception as e:
        logging.error(f"Error with tuple, trying list: {e}")
        # If tuple fails, try the original list approach
        response = supabase.table('students').select('*').in_('user_id', user_ids).execute()

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


def get_classes_by_ids(class_ids: list[str]):
    """Get multiple classes by list of class_ids"""
    if not class_ids:
        return []

    logging.info(f"Final class_ids before query: {class_ids}, type: {type(class_ids)}")
    logging.info(f"First class_id type: {type(class_ids[0]) if class_ids else 'empty'}")

    # Try using tuple instead of list - some libraries prefer this
    try:
        response = supabase.table('classes').select('*').in_('class_id', class_ids).execute()
    except Exception as e:
        logging.error(f"Error with tuple, trying list: {e}")
        # If tuple fails, try the original list approach
        response = supabase.table('classes').select('*').in_('class_id', class_ids).execute()

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
    questions = response.data

    # Parse answer_options if it's a string (PostgreSQL array format)
    for question in questions:
        if 'answer_options' in question and isinstance(question['answer_options'], str):
            try:
                answer_str = question['answer_options']

                # Convert PostgreSQL array format to JSON array format
                # Replace outer {} with []
                answer_str = answer_str.replace('{', '[', 1)
                answer_str = answer_str[::-1].replace('}', ']', 1)[::-1]

                # Replace escaped quotes \" with regular quotes "
                answer_str = answer_str.replace('\\"', '"')

                # Wrap unquoted items in quotes using regex
                # Match items that aren't already quoted
                answer_str = re.sub(r'(?<=[,\[])\s*([^",\[\]]+)\s*(?=[,\]])', r'"\1"', answer_str)

                # Parse as JSON
                question['answer_options'] = json.loads(answer_str)
            except (json.JSONDecodeError, TypeError, ValueError):
                # If parsing fails, keep the original value
                pass

    return questions

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

def get_all_qualifications():
    """Get all qualifications (quizzes with passed results)"""
    response = supabase.table('quiz_results').select('*, quizzes(*)').eq('passed', 'TRUE').execute()

    # Filter out any results where the quiz has been deleted (quizzes is null)
    valid_qualifications = [
        result for result in response.data
        if result.get('quizzes') is not None
    ]

    return valid_qualifications

def get_all_quiz_types():
    """Get all quiz types"""
    response = supabase.table('quizzes').select('*').execute()
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

def get_analytics_dashboard(admin_user_id: str):
    """Get comprehensive analytics dashboard data (admin validated)"""
    # Check if user is admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("User is not an admin")

    # Fetch all necessary data separately
    classes_response = supabase.table('classes').select('*, teachers(hourly_pay, firstname, lastname, location)').eq('was_canselled', 'FALSE').execute()
    students_response = supabase.table('students').select('user_id, is_active, created_at').execute()
    teachers_response = supabase.table('teachers').select('user_id, resigned').execute()
    teacher_student_response = supabase.table('teacher_student').select('teacher_user_id, student_user_id, travel_pay_to_teacher, order_comments').execute()

    classes = classes_response.data
    students = students_response.data
    teachers = teachers_response.data
    teacher_student_relations = teacher_student_response.data

    # Create a lookup dictionary for teacher_student relationships
    # Key: (teacher_user_id, student_user_id), Value: relationship data
    ts_lookup = {}
    for ts in teacher_student_relations:
        key = (ts.get('teacher_user_id'), ts.get('student_user_id'))
        ts_lookup[key] = ts

    # Calculate metrics
    from datetime import datetime, timedelta
    import re

    def parse_datetime(dt_string):
        """Parse datetime string handling various formats"""
        if not dt_string:
            return None
        try:
            # Normalize the datetime string
            dt_normalized = dt_string.replace('Z', '+00:00')

            # Handle fractional seconds with varying precision (e.g., .75 vs .750000)
            # Match ISO format with optional fractional seconds
            match = re.match(r'^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})\.?(\d*)([+-]\d{2}:\d{2})?$', dt_normalized)
            if match:
                base_dt, fraction, tz = match.groups()
                # Pad or truncate fraction to 6 digits (microseconds)
                if fraction:
                    fraction = fraction.ljust(6, '0')[:6]
                    dt_normalized = f"{base_dt}.{fraction}{tz or ''}"
                else:
                    dt_normalized = f"{base_dt}{tz or ''}"

            return datetime.fromisoformat(dt_normalized)
        except (ValueError, AttributeError) as e:
            print(f"Failed to parse datetime '{dt_string}': {e}")
            return None

    # Get current year start
    now = datetime.now(timezone.utc)
    year_start = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    one_eighty_days_ago = now - timedelta(days=180)
    ninety_days_ago = now - timedelta(days=90)

    # Initialize aggregations
    total_revenue_ytd = 0
    total_profit_ytd = 0
    total_teacher_cost_ytd = 0
    total_hours_ytd = 0

    monthly_revenue = {}
    teacher_revenue = {}
    location_revenue = {}
    student_ltv = {}
    student_last_class = {}

    # Track classes this week and one month ago
    classes_this_week = 0
    classes_one_month_ago_week = 0
    week_start = now - timedelta(days=now.weekday())  # Monday of current week
    week_end = week_start + timedelta(days=7)
    one_month_ago = now - timedelta(days=30)
    one_month_ago_week_start = one_month_ago - timedelta(days=one_month_ago.weekday())
    one_month_ago_week_end = one_month_ago_week_start + timedelta(days=7)

    # Process classes
    for cls in classes:
        started_at = parse_datetime(cls.get('started_at'))
        ended_at = parse_datetime(cls.get('ended_at'))

        if not started_at or not ended_at:
            continue

        # Track classes this week
        if week_start <= started_at < week_end:
            classes_this_week += 1

        # Track classes one month ago (same week)
        if one_month_ago_week_start <= started_at < one_month_ago_week_end:
            classes_one_month_ago_week += 1

        # Calculate duration in hours
        duration_hours = (ended_at - started_at).total_seconds() / 3600

        # Calculate revenue
        is_group = cls.get('groupclass', False)
        num_students = cls.get('number_of_students', 1) if is_group else 1
        hourly_rate = 350 if is_group else 540
        revenue = duration_hours * hourly_rate * num_students

        # Calculate teacher cost
        teacher_hourly_pay = float(cls.get('teachers', {}).get('hourly_pay', 0)) if cls.get('teachers') else 0
        teacher_cost = duration_hours * teacher_hourly_pay

        # Get teacher_student relationship for travel cost and subject
        teacher_id = cls.get('teacher_user_id')
        student_id = cls.get('student_user_id')
        ts_relation = ts_lookup.get((teacher_id, student_id), {})

        # Add travel compensation
        travel_cost = ts_relation.get('travel_pay_to_teacher', 0) or 0
        total_cost = teacher_cost + travel_cost

        profit = revenue - total_cost

        # YTD calculations
        if started_at >= year_start:
            total_revenue_ytd += revenue
            total_profit_ytd += profit
            total_teacher_cost_ytd += total_cost
            total_hours_ytd += duration_hours

        # Monthly revenue (last 12 months)
        month_key = started_at.strftime('%Y-%m')
        if month_key not in monthly_revenue:
            monthly_revenue[month_key] = {'revenue': 0, 'profit': 0}
        monthly_revenue[month_key]['revenue'] += revenue
        monthly_revenue[month_key]['profit'] += profit

        # Teacher revenue (YTD only)
        if started_at >= year_start:
            teacher_id = cls.get('teacher_user_id')
            if teacher_id:
                teacher_name = f"{cls.get('teachers', {}).get('firstname', '')} {cls.get('teachers', {}).get('lastname', '')}" if cls.get('teachers') else 'Unknown'
                if teacher_id not in teacher_revenue:
                    teacher_revenue[teacher_id] = {
                        'teacherName': teacher_name,
                        'revenue': 0,
                        'classCount': 0,
                        'totalHours': 0
                    }
                teacher_revenue[teacher_id]['revenue'] += revenue
                teacher_revenue[teacher_id]['classCount'] += 1
                teacher_revenue[teacher_id]['totalHours'] += duration_hours

        # Location revenue (YTD only)
        if started_at >= year_start:
            location = cls.get('teachers', {}).get('location', 'Unknown') if cls.get('teachers') else 'Unknown'
            if location:
                if location not in location_revenue:
                    location_revenue[location] = {'revenue': 0, 'classCount': 0}
                location_revenue[location]['revenue'] += revenue
                location_revenue[location]['classCount'] += 1

        # Student LTV tracking
        student_id = cls.get('student_user_id')
        if student_id:
            if student_id not in student_ltv:
                student_ltv[student_id] = 0
            student_ltv[student_id] += revenue

            # Track last class date
            if student_id not in student_last_class or started_at > student_last_class[student_id]:
                student_last_class[student_id] = started_at

    # Calculate active students and churn
    active_students = []
    churned_students = []  # For LTV distribution: is_active=false OR no classes in 90 days
    active_marked_students = 0  # Students marked as is_active=true
    inactive_among_active = 0   # Students marked active but no classes in 90 days (for churn rate)

    for student in students:
        student_id = student['user_id']
        is_active = student.get('is_active', True)
        last_class = student_last_class.get(student_id)

        # For LTV distribution: churned = is_active=false OR no classes in 90 days
        is_churned_for_ltv = not is_active or (not last_class or last_class < ninety_days_ago)

        if is_churned_for_ltv:
            churned_students.append(student_id)
        else:
            active_students.append(student_id)

        # For churn rate: count students marked as active in the system
        if is_active:
            active_marked_students += 1

            # Check if they've had a class in the last 90 days
            if not last_class or last_class < ninety_days_ago:
                inactive_among_active += 1

    active_students_count = len(active_students)

    # Churn rate: percentage of active students who haven't had classes in 90 days
    churn_rate = (inactive_among_active / active_marked_students * 100) if active_marked_students > 0 else 0

    # Calculate active teachers
    active_teachers_count = sum(1 for t in teachers if not t.get('resigned', False))

    # Calculate average hourly margin
    avg_hourly_margin = ((total_revenue_ytd - total_teacher_cost_ytd) / total_hours_ytd) if total_hours_ytd > 0 else 0

    # Calculate average LTV
    total_ltv = sum(student_ltv.values())
    avg_ltv = total_ltv / len(student_ltv) if student_ltv else 0

    # Calculate LTV distribution
    ltv_buckets = [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
    ltv_distribution = []

    for i in range(len(ltv_buckets) - 1):
        start = ltv_buckets[i]
        end = ltv_buckets[i + 1]
        active_count = sum(1 for sid in active_students if start <= student_ltv.get(sid, 0) < end)
        churned_count_bucket = sum(1 for sid in churned_students if start <= student_ltv.get(sid, 0) < end)

        ltv_distribution.append({
            'rangeLabel': f"{start}-{end}",
            'rangeStart': start,
            'rangeEnd': end,
            'activeCount': active_count,
            'churnedCount': churned_count_bucket
        })

    # Add final bucket for >100000
    active_count_final = sum(1 for sid in active_students if student_ltv.get(sid, 0) >= 100000)
    churned_count_final = sum(1 for sid in churned_students if student_ltv.get(sid, 0) >= 100000)
    ltv_distribution.append({
        'rangeLabel': '100000+',
        'rangeStart': 100000,
        'rangeEnd': None,  # Use None instead of float('inf') for JSON compatibility
        'activeCount': active_count_final,
        'churnedCount': churned_count_final
    })

    # Format monthly revenue (last 12 months)
    twelve_months_ago = now - timedelta(days=365)
    revenue_by_month = []
    for month_key in sorted(monthly_revenue.keys()):
        month_date = datetime.strptime(month_key, '%Y-%m')
        if month_date.replace(tzinfo=timezone.utc) >= twelve_months_ago:
            revenue_by_month.append({
                'month': month_key,
                'revenue': monthly_revenue[month_key]['revenue'],
                'profit': monthly_revenue[month_key]['profit']
            })

    # Format teacher revenue
    revenue_by_teacher = [
        {
            'teacherId': teacher_id,
            'teacherName': data['teacherName'],
            'revenue': data['revenue'],
            'classCount': data['classCount'],
            'totalHours': data['totalHours']
        }
        for teacher_id, data in sorted(teacher_revenue.items(), key=lambda x: x[1]['revenue'], reverse=True)
    ]

    # Format location revenue
    revenue_by_location = [
        {
            'location': location,
            'revenue': data['revenue'],
            'classCount': data['classCount']
        }
        for location, data in sorted(location_revenue.items(), key=lambda x: x[1]['revenue'], reverse=True)
    ]

    return {
        'totalRevenueYTD': round(total_revenue_ytd, 2),
        'totalProfitYTD': round(total_profit_ytd, 2),
        'activeStudentsCount': active_students_count,
        'activeTeachersCount': active_teachers_count,
        'averageHourlyMargin': round(avg_hourly_margin, 2),
        'averageLTVPerStudent': round(avg_ltv, 2),
        'churnRate': round(churn_rate, 2),
        'classesThisWeek': classes_this_week,
        'classesOneMonthAgoWeek': classes_one_month_ago_week,
        'ltvDistribution': ltv_distribution,
        'revenueByMonth': revenue_by_month,
        'revenueByTeacher': revenue_by_teacher,
        'revenueByLocation': revenue_by_location
    }


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) QUERY FUNCTIONS
# ============================================================================

def get_teacher_help_config(teacher_user_id: str):
    """Get help config for a specific teacher"""
    response = supabase.table('teacher_help_config').select('*').eq('teacher_user_id', teacher_user_id).execute()
    return response.data[0] if response.data else None


def get_all_available_teachers():
    """Get all teachers available for help with their config"""
    response = supabase.table('teacher_help_config').select('*, teachers(*)').eq('available_for_help', True).execute()
    return response.data


def get_active_help_sessions():
    """Get currently active help sessions (based on day/time)"""
    response = supabase.rpc('get_currently_active_help_sessions').execute()
    return response.data


def get_help_sessions_for_teacher(teacher_user_id: str):
    """Get all help sessions for a teacher, which are not completed yet"""
    now_utc = datetime.now(timezone.utc)
    response = (
        supabase
        .table("help_sessions")
        .select("*")
        .eq("teacher_user_id", teacher_user_id)
        .or_(f"end_time.gte.{now_utc.isoformat()},recurring.eq.true")
        .eq("is_active", True)
        .execute()
    )
    return response.data


def get_help_queue_for_session(session_id: str):
    """Get queue for a specific session, ordered by position"""
    response = supabase.table('help_queue').select('*').eq('assigned_session_id', session_id).eq('status', 'waiting').order('position').execute()
    return response.data


def get_queue_position(queue_id: str):
    """Get position and info for a queue entry"""
    response = supabase.table('help_queue').select('*, help_sessions(teacher_user_id)').eq('queue_id', queue_id).execute()
    return response.data[0] if response.data else None

def get_all_uncompleted_help_sessions():
    """Get all future help sessions (recurring + one-time sessions that haven't ended)"""
    now_utc = datetime.now(timezone.utc)
    response = (
        supabase
        .table("help_sessions")
        .select("*, teachers!fk_help_session_teacher(firstname, lastname, user_id)")
        .eq("is_active", True)
        .or_(f"end_time.gte.{now_utc.isoformat()},recurring.eq.true")
        .execute()
    )
    return response.data
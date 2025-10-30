-- ============================================================================
-- SUPABASE DATABASE SCHEMA
-- Enkel Læring Tutoring Platform
-- ============================================================================
-- Updated for Supabase migration with image_url columns
-- Last updated: 2024
-- ============================================================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS teacher_student CASCADE;
DROP TABLE IF EXISTS teacher_referrals CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS new_students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS about_me_texts CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Table: teachers (create first as it's referenced by others)
CREATE TABLE teachers (
    user_id TEXT PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    hourly_pay TEXT,
    additional_comments TEXT,
    created_at TIMESTAMPTZ,
    admin TEXT,
    resigned TEXT,
    resigned_at TIMESTAMPTZ,
    location TEXT,
    digital_tutouring TEXT,
    physical_tutouring TEXT,
    notes TEXT
);

COMMENT ON TABLE teachers IS 'Teacher profiles and account information';
COMMENT ON COLUMN teachers.admin IS 'TRUE/FALSE string - indicates admin privileges';
COMMENT ON COLUMN teachers.resigned IS 'TRUE/FALSE string - indicates if teacher has resigned';

-- Table: students (create early as it's referenced by others)
CREATE TABLE students (
    user_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ,
    firstname_parent TEXT,
    lastname_parent TEXT,
    email_parent TEXT,
    phone_parent TEXT,
    firstname_student TEXT,
    lastname_student TEXT,
    phone_student TEXT,
    address TEXT,
    postal_code TEXT,
    main_subjects TEXT,
    has_physical_tutoring TEXT,
    additional_comments TEXT,
    est_hours_per_week TEXT,
    is_active TEXT,
    notes TEXT
);

COMMENT ON TABLE students IS 'Student profiles with parent and student information';
COMMENT ON COLUMN students.is_active IS 'TRUE/FALSE string - indicates if student account is active';

-- ============================================================================
-- QUIZ SYSTEM TABLES
-- ============================================================================

-- Table: quizzes (create before questions and quiz_results)
CREATE TABLE quizzes (
    quiz_id UUID PRIMARY KEY,
    title TEXT,
    image_url TEXT,
    pass_threshold TEXT,
    created_at TIMESTAMPTZ,
    number_of_questions TEXT,
    content TEXT
);

COMMENT ON TABLE quizzes IS 'Quiz metadata and configuration';
COMMENT ON COLUMN quizzes.image_url IS 'Public URL to quiz cover image stored in Supabase Storage';
COMMENT ON COLUMN quizzes.pass_threshold IS 'Percentage required to pass (e.g., "80")';

-- Table: questions
CREATE TABLE questions (
    question_id UUID PRIMARY KEY,
    quiz_id UUID,
    question TEXT,
    answer_options TEXT,
    correct_option TEXT,
    image_url TEXT,
    time_limit TEXT,
    created_at TIMESTAMPTZ,
    CONSTRAINT fk_question_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(quiz_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE questions IS 'Individual questions belonging to quizzes';
COMMENT ON COLUMN questions.image_url IS 'Public URL to question image stored in Supabase Storage';
COMMENT ON COLUMN questions.answer_options IS 'JSON or delimited string of answer choices';

-- Table: quiz_results
CREATE TABLE quiz_results (
    attempt_id UUID PRIMARY KEY,
    user_id TEXT,
    quiz_id UUID,
    passed TEXT,
    number_of_corrects TEXT,
    number_of_questions TEXT,
    created_at TIMESTAMPTZ,
    CONSTRAINT fk_quiz_result_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(quiz_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_quiz_result_user
        FOREIGN KEY (user_id)
        REFERENCES teachers(user_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE quiz_results IS 'Quiz attempt results for teachers (qualifications)';
COMMENT ON COLUMN quiz_results.passed IS 'TRUE/FALSE string - indicates if quiz was passed';

-- ============================================================================
-- TEACHER-RELATED TABLES
-- ============================================================================

-- Table: about_me_texts
CREATE TABLE about_me_texts (
    user_id TEXT PRIMARY KEY,
    about_me TEXT,
    firstname TEXT,
    lastname TEXT,
    created_at TIMESTAMPTZ,
    image_url TEXT,
    CONSTRAINT fk_about_me_teacher
        FOREIGN KEY (user_id)
        REFERENCES teachers(user_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE about_me_texts IS 'Teacher profile descriptions and bios';
COMMENT ON COLUMN about_me_texts.image_url IS 'Public URL to teacher profile image stored in Supabase Storage';

-- Table: teacher_referrals
CREATE TABLE teacher_referrals (
    uid UUID PRIMARY KEY,
    created_at TIMESTAMPTZ,
    referee_teacher_user_id TEXT,
    referral_name TEXT,
    referral_phone TEXT,
    referral_email TEXT,
    CONSTRAINT fk_referral_teacher
        FOREIGN KEY (referee_teacher_user_id)
        REFERENCES teachers(user_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE teacher_referrals IS 'Teacher referral program tracking';
COMMENT ON COLUMN teacher_referrals.referee_teacher_user_id IS 'User ID of the teacher who made the referral';

-- ============================================================================
-- CLASS AND SESSION TRACKING
-- ============================================================================

-- Table: classes
CREATE TABLE classes (
    class_id UUID PRIMARY KEY,
    teacher_user_id TEXT,
    student_user_id TEXT,
    created_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    comment TEXT,
    paid_teacher TEXT,
    invoiced_student TEXT,
    was_canselled TEXT,
    invoiced_student_at TIMESTAMPTZ,
    paid_teacher_at TIMESTAMPTZ,
    groupclass TEXT,
    number_of_students TEXT,
    CONSTRAINT fk_class_teacher
        FOREIGN KEY (teacher_user_id)
        REFERENCES teachers(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_class_student
        FOREIGN KEY (student_user_id)
        REFERENCES students(user_id)
        ON DELETE SET NULL
);

COMMENT ON TABLE classes IS 'Individual tutoring sessions and their billing status';
COMMENT ON COLUMN classes.paid_teacher IS 'TRUE/FALSE string - has teacher been paid';
COMMENT ON COLUMN classes.invoiced_student IS 'TRUE/FALSE string - has student been invoiced';
COMMENT ON COLUMN classes.was_canselled IS 'TRUE/FALSE string - was session cancelled';
COMMENT ON COLUMN classes.groupclass IS 'TRUE/FALSE string - is this a group session';

-- ============================================================================
-- RELATIONSHIP TABLES
-- ============================================================================

-- Table: teacher_student
CREATE TABLE teacher_student (
    row_id UUID PRIMARY KEY,
    teacher_user_id TEXT,
    student_user_id TEXT,
    teacher_accepted_student TEXT,
    physical_or_digital TEXT,
    preferred_location TEXT,
    created_at TIMESTAMPTZ,
    hidden TEXT,
    order_comments TEXT,
    travel_pay_to_teacher TEXT,
    travel_pay_from_student TEXT,
    CONSTRAINT fk_teacher_student_teacher
        FOREIGN KEY (teacher_user_id)
        REFERENCES teachers(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_teacher_student_student
        FOREIGN KEY (student_user_id)
        REFERENCES students(user_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE teacher_student IS 'Teacher-student relationship assignments and orders';
COMMENT ON COLUMN teacher_student.teacher_accepted_student IS 'TRUE/FALSE/NULL - teacher acceptance status';
COMMENT ON COLUMN teacher_student.hidden IS 'TRUE/FALSE string - soft delete flag';
COMMENT ON COLUMN teacher_student.physical_or_digital IS 'TRUE=physical, FALSE=digital tutoring';

-- Table: reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    teacher_user_id TEXT,
    student_user_id TEXT,
    student_name TEXT,
    created_at TIMESTAMPTZ,
    rating TEXT,
    comment TEXT,
    CONSTRAINT fk_review_teacher
        FOREIGN KEY (teacher_user_id)
        REFERENCES teachers(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_student
        FOREIGN KEY (student_user_id)
        REFERENCES students(user_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE reviews IS 'Student reviews of teachers';
COMMENT ON COLUMN reviews.rating IS 'Numeric rating (typically 1-5)';

-- ============================================================================
-- LEAD TRACKING TABLES
-- ============================================================================

-- Table: new_students
CREATE TABLE new_students (
    new_student_id UUID PRIMARY KEY,
    phone TEXT,
    has_called TEXT,
    created_at TIMESTAMPTZ,
    called_at TEXT,
    has_answered TEXT,
    answered_at TEXT,
    has_signed_up TEXT,
    signed_up_at TIMESTAMPTZ,
    from_referal TEXT,
    referee_phone TEXT,
    has_assigned_teacher TEXT,
    assigned_teacher_at TEXT,
    assigned_teacher_user_id TEXT,
    has_finished_onboarding TEXT,
    finished_onboarding_at TEXT,
    comments TEXT,
    paid_referee TEXT,
    paid_referee_at TEXT,
    referee_name TEXT,
    hidden TEXT,
    preffered_teacher TEXT,
    referee_account_number TEXT,
    CONSTRAINT fk_new_student_teacher
        FOREIGN KEY (assigned_teacher_user_id)
        REFERENCES teachers(user_id)
        ON DELETE SET NULL
);

COMMENT ON TABLE new_students IS 'Lead tracking for potential new students';
COMMENT ON COLUMN new_students.has_called IS 'TRUE/FALSE string - tracking call attempts';
COMMENT ON COLUMN new_students.has_answered IS 'TRUE/FALSE string - tracking call success';
COMMENT ON COLUMN new_students.has_signed_up IS 'TRUE/FALSE string - converted to student';
COMMENT ON COLUMN new_students.hidden IS 'TRUE/FALSE string - soft delete flag';

-- ============================================================================
-- OTHER TABLES
-- ============================================================================

-- Table: job_applications (no foreign keys - standalone table)
CREATE TABLE job_applications (
    uuid UUID PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    resumelink TEXT,
    subject TEXT,
    created_at TIMESTAMPTZ,
    grades TEXT
);

COMMENT ON TABLE job_applications IS 'Teacher job applications';
COMMENT ON COLUMN job_applications.resumelink IS 'Public URL to resume stored in Supabase Storage';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Foreign key indexes (improves JOIN performance)
CREATE INDEX idx_classes_teacher ON classes(teacher_user_id);
CREATE INDEX idx_classes_student ON classes(student_user_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX idx_reviews_teacher ON reviews(teacher_user_id);
CREATE INDEX idx_reviews_student ON reviews(student_user_id);
CREATE INDEX idx_teacher_student_teacher ON teacher_student(teacher_user_id);
CREATE INDEX idx_teacher_student_student ON teacher_student(student_user_id);
CREATE INDEX idx_teacher_referrals_teacher ON teacher_referrals(referee_teacher_user_id);
CREATE INDEX idx_new_students_teacher ON new_students(assigned_teacher_user_id);

-- Additional performance indexes
CREATE INDEX idx_classes_started_at ON classes(started_at);
CREATE INDEX idx_classes_invoiced ON classes(invoiced_student) WHERE invoiced_student = 'FALSE';
CREATE INDEX idx_classes_paid ON classes(paid_teacher) WHERE paid_teacher = 'FALSE';
CREATE INDEX idx_students_active ON students(is_active) WHERE is_active = 'TRUE';
CREATE INDEX idx_teachers_resigned ON teachers(resigned) WHERE resigned = 'FALSE';
CREATE INDEX idx_teacher_student_hidden ON teacher_student(hidden) WHERE hidden IS NULL OR hidden = 'FALSE';
CREATE INDEX idx_teacher_student_accepted ON teacher_student(teacher_accepted_student);

COMMENT ON INDEX idx_classes_started_at IS 'Speeds up queries filtering by class date';
COMMENT ON INDEX idx_classes_invoiced IS 'Partial index for unpaid invoices';
COMMENT ON INDEX idx_classes_paid IS 'Partial index for unpaid teachers';
COMMENT ON INDEX idx_students_active IS 'Partial index for active students only';
COMMENT ON INDEX idx_teachers_resigned IS 'Partial index for active teachers only';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Schema version tracking
COMMENT ON SCHEMA public IS 'Enkel Læring Database Schema - Supabase Version 1.0';

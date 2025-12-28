-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.about_me_texts (
  user_id text NOT NULL,
  about_me text,
  firstname text,
  lastname text,
  created_at timestamp with time zone,
  image_url text,
  CONSTRAINT about_me_texts_pkey PRIMARY KEY (user_id),
  CONSTRAINT fk_about_me_teacher FOREIGN KEY (user_id) REFERENCES public.teachers(user_id)
);
CREATE TABLE public.classes (
  class_id uuid NOT NULL,
  teacher_user_id text,
  student_user_id text,
  created_at timestamp with time zone,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  comment text,
  paid_teacher boolean,
  invoiced_student boolean,
  was_canselled boolean,
  invoiced_student_at timestamp with time zone,
  paid_teacher_at timestamp with time zone,
  groupclass boolean,
  number_of_students integer,
  CONSTRAINT classes_pkey PRIMARY KEY (class_id),
  CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id),
  CONSTRAINT fk_class_student FOREIGN KEY (student_user_id) REFERENCES public.students(user_id)
);
CREATE TABLE public.job_applications (
  uuid uuid NOT NULL,
  firstname text,
  lastname text,
  email text,
  phone text,
  resumelink text,
  subject text,
  created_at timestamp with time zone,
  grades text,
  CONSTRAINT job_applications_pkey PRIMARY KEY (uuid)
);
CREATE TABLE public.new_students (
  new_student_id uuid NOT NULL,
  phone text,
  has_called boolean,
  created_at timestamp with time zone,
  called_at timestamp with time zone,
  has_answered boolean,
  answered_at timestamp with time zone,
  has_signed_up boolean,
  signed_up_at timestamp with time zone,
  from_referal boolean,
  referee_phone text,
  has_finished_onboarding boolean,
  finished_onboarding_at timestamp with time zone,
  comments text,
  paid_referee boolean,
  paid_referee_at timestamp with time zone,
  referee_name text,
  hidden boolean,
  preffered_teacher text,
  referee_account_number text,
  CONSTRAINT new_students_pkey PRIMARY KEY (new_student_id)
);
CREATE TABLE public.questions (
  question_id uuid NOT NULL,
  quiz_id uuid,
  question text,
  answer_options text,
  correct_option integer,
  image_url text,
  time_limit text,
  created_at timestamp with time zone,
  CONSTRAINT questions_pkey PRIMARY KEY (question_id),
  CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id)
);
CREATE TABLE public.quiz_results (
  attempt_id uuid NOT NULL,
  user_id text,
  quiz_id uuid,
  passed boolean,
  number_of_corrects integer,
  number_of_questions integer,
  created_at timestamp with time zone,
  CONSTRAINT quiz_results_pkey PRIMARY KEY (attempt_id),
  CONSTRAINT fk_quiz_result_quiz FOREIGN KEY (quiz_id) REFERENCES public.quizzes(quiz_id),
  CONSTRAINT fk_quiz_result_user FOREIGN KEY (user_id) REFERENCES public.teachers(user_id)
);
CREATE TABLE public.quizzes (
  quiz_id uuid NOT NULL,
  title text,
  image_url text,
  pass_threshold double precision,
  created_at timestamp with time zone,
  number_of_questions integer,
  content text,
  CONSTRAINT quizzes_pkey PRIMARY KEY (quiz_id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL,
  teacher_user_id text,
  student_user_id text,
  student_name text,
  created_at timestamp with time zone,
  rating integer,
  comment text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT fk_review_teacher FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id),
  CONSTRAINT fk_review_student FOREIGN KEY (student_user_id) REFERENCES public.students(user_id)
);
CREATE TABLE public.students (
  user_id text NOT NULL,
  created_at timestamp with time zone,
  firstname_parent text,
  lastname_parent text,
  email_parent text,
  phone_parent text,
  firstname_student text,
  lastname_student text,
  phone_student text,
  address text,
  postal_code text,
  main_subjects text,
  has_physical_tutoring boolean,
  additional_comments text,
  est_hours_per_week double precision,
  is_active boolean,
  notes text,
  CONSTRAINT students_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.tasks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  status text,
  type text,
  teacher_ids text[],
  student text DEFAULT 'NULL'::text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_student_fkey FOREIGN KEY (student) REFERENCES public.students(user_id)
);
CREATE TABLE public.teacher_referrals (
  uid uuid NOT NULL,
  created_at timestamp with time zone,
  referee_teacher_user_id text,
  referral_name text,
  referral_phone text,
  referral_email text,
  CONSTRAINT teacher_referrals_pkey PRIMARY KEY (uid),
  CONSTRAINT fk_referral_teacher FOREIGN KEY (referee_teacher_user_id) REFERENCES public.teachers(user_id)
);
CREATE TABLE public.teacher_student (
  row_id uuid NOT NULL,
  teacher_user_id text,
  student_user_id text,
  teacher_accepted_student boolean,
  physical_or_digital boolean,
  preferred_location text,
  created_at timestamp with time zone,
  hidden boolean,
  order_comments text,
  travel_pay_to_teacher integer,
  travel_pay_from_student integer,
  CONSTRAINT teacher_student_pkey PRIMARY KEY (row_id),
  CONSTRAINT fk_teacher_student_teacher FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id),
  CONSTRAINT fk_teacher_student_student FOREIGN KEY (student_user_id) REFERENCES public.students(user_id)
);
CREATE TABLE public.teachers (
  user_id text NOT NULL,
  firstname text,
  lastname text,
  email text,
  phone text,
  address text,
  postal_code text,
  hourly_pay text,
  additional_comments text,
  created_at timestamp with time zone,
  admin boolean,
  resigned boolean,
  resigned_at timestamp with time zone,
  location text,
  digital_tutouring boolean,
  physical_tutouring boolean,
  notes text,
  available_for_help boolean NOT NULL DEFAULT false,
  CONSTRAINT teachers_pkey PRIMARY KEY (user_id)
);





-- Gratis Leksehjelp (Free Homework Help) Database Schema
-- Execute this in Supabase SQL Editor

-- Table 1: teacher_help_config
-- Stores teacher Zoom configuration and availability status
CREATE TABLE public.teacher_help_config (
  teacher_user_id text NOT NULL,
  zoom_host_link text,
  zoom_join_link text,
  available_for_help boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT teacher_help_config_pkey PRIMARY KEY (teacher_user_id),
  CONSTRAINT fk_help_config_teacher FOREIGN KEY (teacher_user_id)
    REFERENCES public.teachers(user_id) ON DELETE CASCADE
);

-- Table 2: help_sessions
-- Defines recurring weekly time blocks when teachers offer help
CREATE TABLE public.help_sessions (
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_user_id text NOT NULL,
  day_of_week integer NOT NULL, -- 0=Monday, 6=Sunday (ISO standard)
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by_user_id text NOT NULL, -- Who created it (teacher or admin)

  CONSTRAINT help_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT fk_help_session_teacher FOREIGN KEY (teacher_user_id)
    REFERENCES public.teachers(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_help_session_creator FOREIGN KEY (created_by_user_id)
    REFERENCES public.teachers(user_id),
  CONSTRAINT check_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- Table 3: help_queue
-- Tracks students waiting for help
CREATE TABLE public.help_queue (
  queue_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_email text,
  student_phone text,
  subject text NOT NULL,
  description text,
  preferred_teacher_id text, -- NULL means "snarest" (any available)
  assigned_session_id uuid, -- Which session they're assigned to
  status text NOT NULL DEFAULT 'waiting', -- waiting, admitted, completed, no_show
  position integer, -- Position in queue (null = not yet assigned)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  admitted_at timestamp with time zone,
  completed_at timestamp with time zone,

  CONSTRAINT help_queue_pkey PRIMARY KEY (queue_id),
  CONSTRAINT fk_queue_teacher FOREIGN KEY (preferred_teacher_id)
    REFERENCES public.teachers(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_queue_session FOREIGN KEY (assigned_session_id)
    REFERENCES public.help_sessions(session_id) ON DELETE SET NULL,
  CONSTRAINT check_status CHECK (status IN ('waiting', 'admitted', 'completed', 'no_show'))
);




-- indexes for performance optimization
-- students table
DROP INDEX IF EXISTS idx_students_email;
CREATE INDEX idx_students_email ON public.students(email_parent);

DROP INDEX IF EXISTS idx_students_name;
CREATE INDEX idx_students_name ON public.students(firstname_student, lastname_student);

-- teachers table
DROP INDEX IF EXISTS idx_teachers_available;
CREATE INDEX idx_teachers_available ON public.teachers(available_for_help);

DROP INDEX IF EXISTS idx_teachers_name;
CREATE INDEX idx_teachers_name ON public.teachers(firstname, lastname);

-- classes table
DROP INDEX IF EXISTS idx_classes_teacher;
CREATE INDEX idx_classes_teacher ON public.classes(teacher_user_id);

DROP INDEX IF EXISTS idx_classes_student;
CREATE INDEX idx_classes_student ON public.classes(student_user_id);

DROP INDEX IF EXISTS idx_classes_started_at;
CREATE INDEX idx_classes_started_at ON public.classes(started_at);

DROP INDEX IF EXISTS idx_classes_ended_at;
CREATE INDEX idx_classes_ended_at ON public.classes(ended_at);

-- quiz_results
DROP INDEX IF EXISTS idx_quiz_results_user;
CREATE INDEX idx_quiz_results_user ON public.quiz_results(user_id);

DROP INDEX IF EXISTS idx_quiz_results_quiz;
CREATE INDEX idx_quiz_results_quiz ON public.quiz_results(quiz_id);

DROP INDEX IF EXISTS idx_quiz_results_created;
CREATE INDEX idx_quiz_results_created ON public.quiz_results(created_at);

-- questions
DROP INDEX IF EXISTS idx_questions_quiz;
CREATE INDEX idx_questions_quiz ON public.questions(quiz_id);

-- reviews
DROP INDEX IF EXISTS idx_reviews_teacher;
CREATE INDEX idx_reviews_teacher ON public.reviews(teacher_user_id);

DROP INDEX IF EXISTS idx_reviews_student;
CREATE INDEX idx_reviews_student ON public.reviews(student_user_id);

DROP INDEX IF EXISTS idx_reviews_created;
CREATE INDEX idx_reviews_created ON public.reviews(created_at);

-- tasks
DROP INDEX IF EXISTS idx_tasks_student;
CREATE INDEX idx_tasks_student ON public.tasks(student);

DROP INDEX IF EXISTS idx_tasks_teacher_ids;
CREATE INDEX idx_tasks_teacher_ids ON public.tasks USING GIN (teacher_ids);

DROP INDEX IF EXISTS idx_tasks_status;
CREATE INDEX idx_tasks_status ON public.tasks(status);

DROP INDEX IF EXISTS idx_tasks_completed;
CREATE INDEX idx_tasks_completed ON public.tasks(completed);

-- teacher_student
DROP INDEX IF EXISTS idx_teacher_student_teacher;
CREATE INDEX idx_teacher_student_teacher ON public.teacher_student(teacher_user_id);

DROP INDEX IF EXISTS idx_teacher_student_student;
CREATE INDEX idx_teacher_student_student ON public.teacher_student(student_user_id);

DROP INDEX IF EXISTS idx_teacher_student_created;
CREATE INDEX idx_teacher_student_created ON public.teacher_student(created_at);

-- teacher_referrals
DROP INDEX IF EXISTS idx_teacher_referrals_referee;
CREATE INDEX idx_teacher_referrals_referee ON public.teacher_referrals(referee_teacher_user_id);

DROP INDEX IF EXISTS idx_teacher_referrals_created;
CREATE INDEX idx_teacher_referrals_created ON public.teacher_referrals(created_at);

-- about_me_texts
DROP INDEX IF EXISTS idx_about_me_name;
CREATE INDEX idx_about_me_name ON public.about_me_texts(firstname, lastname);

-- new_students
DROP INDEX IF EXISTS idx_new_students_phone;
CREATE INDEX idx_new_students_phone ON public.new_students(phone);

DROP INDEX IF EXISTS idx_new_students_signed_up;
CREATE INDEX idx_new_students_signed_up ON public.new_students(has_signed_up);

DROP INDEX IF EXISTS idx_new_students_referal;
CREATE INDEX idx_new_students_referal ON public.new_students(from_referal);

DROP INDEX IF EXISTS idx_new_students_created_at;
CREATE INDEX idx_new_students_created_at ON public.new_students(created_at);

-- help_sessions
DROP INDEX IF EXISTS idx_help_sessions_teacher_day;
CREATE INDEX idx_help_sessions_teacher_day ON public.help_sessions(teacher_user_id, day_of_week);

-- help_queue
DROP INDEX IF EXISTS idx_help_queue_teacher_status;
CREATE INDEX idx_help_queue_teacher_status ON public.help_queue(preferred_teacher_id, status);
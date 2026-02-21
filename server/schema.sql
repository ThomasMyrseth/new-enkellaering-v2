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
CREATE TABLE public.available_subjects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  teacher_user_id text DEFAULT gen_random_uuid(),
  subject text,
  CONSTRAINT available_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT available_subjects_teacher_user_id_fkey FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id)
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
CREATE TABLE public.help_queue (
  queue_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_email text,
  student_phone text,
  subject text NOT NULL,
  description text,
  preferred_teacher_id text,
  assigned_session_id uuid,
  status text NOT NULL DEFAULT 'waiting'::text CHECK (status = ANY (ARRAY['waiting'::text, 'admitted'::text, 'completed'::text, 'no_show'::text])),
  position integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  admitted_at timestamp with time zone,
  completed_at timestamp with time zone,
  CONSTRAINT help_queue_pkey PRIMARY KEY (queue_id),
  CONSTRAINT fk_queue_teacher FOREIGN KEY (preferred_teacher_id) REFERENCES public.teachers(user_id),
  CONSTRAINT fk_queue_session FOREIGN KEY (assigned_session_id) REFERENCES public.help_sessions(session_id)
);
CREATE TABLE public.help_sessions (
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_user_id text NOT NULL,
  recurring boolean NOT NULL DEFAULT false,
  day_of_week integer CHECK (day_of_week IS NULL OR day_of_week >= 0 AND day_of_week <= 6),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by_user_id text NOT NULL,
  end_time timestamp with time zone,
  start_time timestamp with time zone,
  zoom_link text,
  CONSTRAINT help_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT fk_help_session_teacher FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id),
  CONSTRAINT fk_help_session_creator FOREIGN KEY (created_by_user_id) REFERENCES public.teachers(user_id)
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
  teacher_ids ARRAY,
  student text DEFAULT 'NULL'::text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_student_fkey FOREIGN KEY (student) REFERENCES public.students(user_id)
);
CREATE TABLE public.teacher_help_config (
  teacher_user_id text NOT NULL,
  available_for_help boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teacher_help_config_pkey PRIMARY KEY (teacher_user_id),
  CONSTRAINT fk_help_config_teacher FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id)
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
  physical_or_digital boolean DEFAULT false,
  preferred_location text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  hidden boolean DEFAULT false,
  order_comments text,
  travel_pay_to_teacher integer DEFAULT 0,
  travel_pay_from_student integer DEFAULT 0,
  CONSTRAINT teacher_student_pkey PRIMARY KEY (row_id),
  CONSTRAINT teacher_student_student_user_id_fkey FOREIGN KEY (student_user_id) REFERENCES public.students(user_id),
  CONSTRAINT teacher_student_teacher_user_id_fkey FOREIGN KEY (teacher_user_id) REFERENCES public.teachers(user_id)
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
  digital_tutouring boolean DEFAULT false,
  physical_tutouring boolean DEFAULT false,
  notes text,
  CONSTRAINT teachers_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notified boolean NOT NULL DEFAULT false,
  CONSTRAINT waitlist_pkey PRIMARY KEY (id),
  CONSTRAINT waitlist_email_key UNIQUE (email)
);
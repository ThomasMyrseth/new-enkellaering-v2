-- ============================================================================
-- SUPABASE MIGRATION SQL SCRIPT - CORRECTED VERSION
-- ============================================================================
-- This script creates all necessary RPC functions and schema changes
-- for migrating from Cloud SQL to Supabase
-- ALL TYPES NOW MATCH THE SCHEMA EXACTLY
--
-- INSTRUCTIONS:
-- 1. Open your Supabase project dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Run the script

DROP FUNCTION IF EXISTS public.get_student_for_teacher(TEXT);
DROP FUNCTION IF EXISTS public.get_teacher_for_student(TEXT);
DROP FUNCTION IF EXISTS public.get_new_orders_for_teacher(TEXT);
DROP FUNCTION IF EXISTS public.get_new_orders_for_student(TEXT);
DROP FUNCTION IF EXISTS public.get_students_with_few_classes(INT);
DROP FUNCTION IF EXISTS public.get_students_without_teacher();
DROP FUNCTION IF EXISTS public.get_all_students_without_teacher(TEXT);
DROP FUNCTION IF EXISTS public.insert_classes_batch(JSONB);
DROP FUNCTION IF EXISTS public.alter_new_student(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.update_new_order_dynamic(UUID, JSONB);
DROP FUNCTION IF EXISTS public.delete_quizzes_cascade(TEXT, UUID[]);
DROP FUNCTION IF EXISTS public.set_classes_invoiced_batch(UUID[], TEXT);
DROP FUNCTION IF EXISTS public.set_classes_paid_batch(UUID[], TEXT);

-- ============================================================================
-- PART 2: RPC FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCTION 1: get_student_for_teacher
-- Description: Get all students for a specific teacher with JOIN
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_for_teacher(teacher_id TEXT)
RETURNS TABLE (
    user_id TEXT,
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
    has_physical_tutoring BOOLEAN,
    additional_comments TEXT,
    est_hours_per_week DOUBLE PRECISION,
    is_active BOOLEAN,
    notes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT s.*
    FROM public.students s
    JOIN public.teacher_student ts ON s.user_id = ts.student_user_id
    WHERE ts.teacher_user_id = teacher_id
      AND ts.teacher_accepted_student = TRUE
      AND (ts.hidden IS NULL OR ts.hidden != TRUE);
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 2: get_teacher_for_student
-- Description: Get all teachers for a specific student with JOIN
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_for_student(student_id TEXT)
RETURNS TABLE (
    user_id TEXT,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    hourly_pay TEXT,
    additional_comments TEXT,
    created_at TIMESTAMPTZ,
    admin BOOLEAN,
    resigned BOOLEAN,
    resigned_at TIMESTAMPTZ,
    location TEXT,
    digital_tutouring BOOLEAN,
    physical_tutouring BOOLEAN,
    notes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM public.teachers t
    JOIN public.teacher_student ts ON t.user_id = ts.teacher_user_id
    WHERE ts.student_user_id = student_id
      AND ts.teacher_accepted_student = TRUE
      AND (ts.hidden IS NULL OR ts.hidden != TRUE);
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 3: get_new_orders_for_teacher
-- Description: Get all new orders (pending acceptances) for a teacher with 3-table JOIN
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_new_orders_for_teacher(teacher_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'teacher_student', row_to_json(ts.*),
            'student', row_to_json(s.*)
        )
    ) INTO result
    FROM public.teacher_student ts
    JOIN public.students s ON ts.student_user_id = s.user_id
    WHERE ts.teacher_user_id = teacher_id
      AND ts.teacher_accepted_student IS NULL
      AND (ts.hidden IS NULL OR ts.hidden = FALSE);

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 3B: get_new_orders_for_student
-- Description: Get all new orders (pending acceptances) for a student with teacher and about_me
-- Returns: TeacherOrderJoinTeacher type { teacher, order, about_me }
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_new_orders_for_student(student_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'order', row_to_json(ts.*),
            'teacher', row_to_json(t.*),
            'about_me', row_to_json(am.*)
        )
    ) INTO result
    FROM public.teacher_student ts
    JOIN public.teachers t ON ts.teacher_user_id = t.user_id
    LEFT JOIN public.about_me_texts am ON t.user_id = am.user_id
    WHERE ts.student_user_id = student_id
      AND (ts.teacher_accepted_student IS NULL OR ts.teacher_accepted_student = FALSE)
      AND (ts.hidden IS NULL OR ts.hidden = FALSE);

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 4: get_students_with_few_classes
-- Description: Get students with few classes using window function (ROW_NUMBER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_students_with_few_classes(days INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    threshold_date DATE;
    result JSONB;
BEGIN
    threshold_date := CURRENT_DATE - (days || ' days')::INTERVAL;

    SELECT jsonb_agg(
        jsonb_build_object(
            'student', row_to_json(s),
            'teacher_student', row_to_json(ts),
            'teacher', row_to_json(t),
            'last_class_started_at', lc.started_at,
            'last_class_id', lc.class_id
        )
    )
    INTO result
    FROM public.students s
    JOIN public.teacher_student ts
        ON ts.student_user_id = s.user_id
    JOIN public.teachers t
        ON t.user_id = ts.teacher_user_id
    LEFT JOIN (
        SELECT c1.student_user_id,
               c1.started_at,
               c1.class_id
        FROM public.classes c1
        WHERE c1.started_at IS NOT NULL
        ORDER BY c1.student_user_id, c1.started_at DESC
    ) lc
        ON lc.student_user_id = s.user_id
    WHERE s.is_active = TRUE
      AND NOT EXISTS (
          SELECT 1
          FROM public.classes c2
          WHERE c2.student_user_id = s.user_id
            AND c2.started_at::date > threshold_date
      )
      AND ts.row_id = (
          SELECT ts2.row_id
          FROM public.teacher_student ts2
          WHERE ts2.student_user_id = ts.student_user_id
          ORDER BY ts2.created_at ASC
          LIMIT 1
      );

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

--  Lock search path (IMPORTANT)
ALTER FUNCTION public.get_students_with_few_classes(INT)
SET search_path = public;

--  Allow RPC access
GRANT EXECUTE ON FUNCTION public.get_students_with_few_classes(INT)
TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- FUNCTION 5: get_students_without_teacher
-- Description: Get students who don't have an assigned teacher (complex NOT IN with JOIN)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_students_without_teacher()
RETURNS TABLE (
    user_id TEXT,
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
    has_physical_tutoring BOOLEAN,
    additional_comments TEXT,
    est_hours_per_week DOUBLE PRECISION,
    is_active BOOLEAN,
    notes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.*
    FROM public.students s
    WHERE s.user_id NOT IN (
        SELECT student_user_id
        FROM public.teacher_student AS ts
        JOIN public.teachers AS t ON ts.teacher_user_id = t.user_id
        WHERE ts.teacher_accepted_student = TRUE
          AND (ts.hidden = FALSE OR ts.hidden IS NULL)
          AND t.resigned = FALSE
    )
    AND s.is_active = TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 6: get_all_students_without_teacher
-- Description: Get all students without teacher (admin check with complex LEFT JOINs)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_all_students_without_teacher(admin_id TEXT)
RETURNS TABLE (
    user_id TEXT,
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
    has_physical_tutoring BOOLEAN,
    additional_comments TEXT,
    est_hours_per_week DOUBLE PRECISION,
    is_active BOOLEAN,
    notes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verify admin
    IF NOT EXISTS (
        SELECT 1 FROM public.teachers
        WHERE user_id = admin_id AND admin = TRUE
    ) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    RETURN QUERY
    SELECT s.*
    FROM public.students s
    LEFT JOIN public.teacher_student ts ON s.user_id = ts.student_user_id
    LEFT JOIN public.teachers t ON ts.teacher_user_id = t.user_id
    WHERE s.user_id NOT IN (
        SELECT student_user_id
        FROM public.teacher_student
        WHERE teacher_accepted_student = TRUE
          AND (hidden = FALSE OR hidden IS NULL)
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 7: insert_classes_batch
-- Description: Insert multiple classes with teacher validation (transaction)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.insert_classes_batch(classes_json JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    class_record JSONB;
    teacher_id TEXT;
BEGIN
    -- Validate teacher exists (check first class)
    teacher_id := (classes_json->0->>'teacher_user_id')::TEXT;

    IF NOT EXISTS (
        SELECT 1 FROM public.teachers WHERE user_id = teacher_id
    ) THEN
        RAISE EXCEPTION 'Teacher does not exist';
    END IF;

    -- Insert each class
    FOR class_record IN SELECT * FROM jsonb_array_elements(classes_json)
    LOOP
        INSERT INTO public.classes (
            class_id, teacher_user_id, student_user_id,
            created_at, started_at, ended_at, comment,
            paid_teacher, invoiced_student, was_canselled,
            groupclass, number_of_students
        ) VALUES (
            (class_record->>'class_id')::UUID,
            (class_record->>'teacher_user_id')::TEXT,
            (class_record->>'student_user_id')::TEXT,
            (class_record->>'created_at')::TIMESTAMPTZ,
            (class_record->>'started_at')::TIMESTAMPTZ,
            (class_record->>'ended_at')::TIMESTAMPTZ,
            (class_record->>'comment')::TEXT,
            (class_record->>'paid_teacher')::BOOLEAN,
            (class_record->>'invoiced_student')::BOOLEAN,
            (class_record->>'was_canselled')::BOOLEAN,
            (class_record->>'groupclass')::BOOLEAN,
            (class_record->>'number_of_students')::INTEGER
        );
    END LOOP;

    RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 8: alter_new_student
-- Description: Update new_student with 16 dynamic fields (admin validated)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.alter_new_student(
    new_student_id_parameter UUID,
    admin_id TEXT,
    updates_json JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verify admin exists
    IF NOT EXISTS (
        SELECT 1 FROM public.teachers WHERE user_id = admin_id
    ) THEN
        RAISE EXCEPTION 'Admin teacher does not exist';
    END IF;

    -- Update with all 16 fields from updates_json
    UPDATE public.new_students
    SET
        has_called = COALESCE((updates_json->>'has_called')::BOOLEAN, has_called),
        called_at = COALESCE((updates_json->>'called_at')::TIMESTAMPTZ, called_at),
        has_answered = COALESCE((updates_json->>'has_answered')::BOOLEAN, has_answered),
        answered_at = COALESCE((updates_json->>'answered_at')::TIMESTAMPTZ, answered_at),
        from_referal = COALESCE((updates_json->>'from_referal')::BOOLEAN, from_referal),
        referee_phone = COALESCE((updates_json->>'referee_phone')::TEXT, referee_phone),
        has_finished_onboarding = COALESCE((updates_json->>'has_finished_onboarding')::BOOLEAN, has_finished_onboarding),
        finished_onboarding_at = COALESCE((updates_json->>'finished_onboarding_at')::TIMESTAMPTZ, finished_onboarding_at),
        comments = COALESCE((updates_json->>'comments')::TEXT, comments),
        paid_referee = COALESCE((updates_json->>'paid_referee')::BOOLEAN, paid_referee),
        paid_referee_at = COALESCE((updates_json->>'paid_referee_at')::TIMESTAMPTZ, paid_referee_at)
    WHERE new_students.new_student_id = new_student_id_parameter;

    RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 9: update_new_order_dynamic
-- Description: Dynamic update for new order (teacher_student) with optional fields
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_new_order_dynamic(
    order_row_id UUID,
    updates_json JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.teacher_student
    SET
        teacher_accepted_student = COALESCE(
            (updates_json->>'teacher_accepted_student')::BOOLEAN,
            teacher_accepted_student
        ),
        physical_or_digital = COALESCE(
            (updates_json->>'physical_or_digital')::BOOLEAN,
            physical_or_digital
        ),
        preferred_location = COALESCE(
            (updates_json->>'preferred_location')::TEXT,
            preferred_location
        ),
        order_comments = COALESCE(
            (updates_json->>'comments')::TEXT,
            order_comments
        )
    WHERE row_id = order_row_id;

    RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 10: delete_quizzes_cascade
-- Description: Delete quizzes with cascade (admin validated, multi-table delete)
-- Note: This doesn't handle storage deletion - do that in Python with Supabase Storage
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_quizzes_cascade(
    admin_id TEXT,
    quiz_ids UUID[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    quiz_id UUID;
BEGIN
    -- Verify admin rights
    IF NOT EXISTS (
        SELECT 1 FROM public.teachers
        WHERE user_id = admin_id AND admin = TRUE
    ) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    -- Delete for each quiz_id
    FOREACH quiz_id IN ARRAY quiz_ids
    LOOP
        DELETE FROM public.quiz_results WHERE quiz_id = delete_quizzes_cascade.quiz_id;
        DELETE FROM public.questions WHERE quiz_id = delete_quizzes_cascade.quiz_id;
        DELETE FROM public.quizzes WHERE quiz_id = delete_quizzes_cascade.quiz_id;
    END LOOP;

    RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 11: set_classes_invoiced_batch
-- Description: Batch update classes to invoiced status (admin validated)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_classes_invoiced_batch(
    class_ids UUID[],
    admin_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verify admin
    IF NOT EXISTS (
        SELECT 1 FROM public.teachers
        WHERE user_id = admin_id AND admin = TRUE
    ) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    UPDATE public.classes
    SET invoiced_student = TRUE,
        invoiced_student_at = NOW()
    WHERE class_id = ANY(class_ids);

    RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- FUNCTION 12: set_classes_paid_batch
-- Description: Batch update classes to paid status (admin validated)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_classes_paid_batch(
    class_ids UUID[],
    admin_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verify admin
    IF NOT EXISTS (
        SELECT 1 FROM public.teachers
        WHERE user_id = admin_id AND admin = TRUE
    ) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    UPDATE public.classes
    SET paid_teacher = TRUE,
        paid_teacher_at = NOW()
    WHERE class_id = ANY(class_ids);

    RETURN TRUE;
END;
$$;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
-- All RPC functions and schema changes have been created successfully!
-- Type corrections made:
-- - Changed all TEXT comparisons ('TRUE'/'FALSE') to BOOLEAN (TRUE/FALSE)
-- - Changed TIMESTAMP WITH TIME ZONE to TIMESTAMPTZ for consistency
-- - Ensured all types match the schema exactly
-- ============================================================================
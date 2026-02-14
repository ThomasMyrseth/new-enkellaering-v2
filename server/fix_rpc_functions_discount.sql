-- ============================================================================
-- FIX: Update RPC functions to include the new 'discount' column
-- ============================================================================
-- The 'students' table now has a 'discount' column, so any function returning
-- s.* or a table structure mirroring 'students' must be updated.

-- 1. Update get_student_for_teacher
DROP FUNCTION IF EXISTS public.get_student_for_teacher(TEXT);

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
    notes TEXT,
    discount DOUBLE PRECISION  -- Added this field
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

-- 2. Update get_students_without_teacher
DROP FUNCTION IF EXISTS public.get_students_without_teacher();

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
    notes TEXT,
    discount DOUBLE PRECISION  -- Added this field
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

-- 3. Update get_all_students_without_teacher
DROP FUNCTION IF EXISTS public.get_all_students_without_teacher(TEXT);

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
    notes TEXT,
    discount DOUBLE PRECISION  -- Added this field
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

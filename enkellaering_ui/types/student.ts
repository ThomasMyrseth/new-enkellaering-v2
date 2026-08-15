// Mirrors server/db/models/student.py (Student) — the `students` table.
export type Student = {
    user_id: string;
    created_at: string | null;
    firstname_parent: string | null;
    lastname_parent: string | null;
    email_parent: string | null;
    phone_parent: string | null;
    firstname_student: string | null;
    lastname_student: string | null;
    phone_student: string | null;
    address: string | null;
    postal_code: string | null;
    main_subjects: string | null;
    has_physical_tutoring: boolean | null;
    additional_comments: string | null;
    est_hours_per_week: number | null;
    is_active: boolean | null;
    notes: string | null;
    discount: number | null;
};

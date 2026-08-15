// Mirrors server/db/models/teacher.py (Teacher) — the `teachers` table.
export type Teacher = {
    user_id: string;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    postal_code: string | null;
    hourly_pay: string | null;
    additional_comments: string | null;
    created_at: string | null;
    admin: boolean | null;
    resigned: boolean | null;
    resigned_at: string | null;
    location: string | null;
    digital_tutouring: boolean | null;
    physical_tutouring: boolean | null;
    notes: string | null;
};

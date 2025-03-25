

export type Student = {
    user_id: string,
    firstname_parent: string,
    lastname_parent: string,
    email_parent: string,
    phone_parent: string,

    firstname_student: string,
    lastname_student: string,
    phone_student: string,

    main_subjects: string,
    address: string,
    postal_code: string,
    has_physical_tutoring: boolean,
    created_at: string,
    additional_comments: string,
    your_teacher: string

    est_hours_per_week : number
    is_active : boolean
    notes :string
}

export type Teacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    location :string;
    hourly_pay: string;
    resgined: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
    wants_more_students :boolean;
    notes :string;
    digital_tutouring :boolean;
    physical_tutouring :boolean;
}

export type Review = {
    id :string; //id of the review
    teacher_user_id :string; //teacher user id
    student_user_id :string; //the one leaving the revie
    student_name :string //the name to be displayed
    created_at :string;
    rating :number //1-5
    comment :string;
}

export type Classes = {
    teacher_user_id :string;
    student_user_id :string;
    created_at: string;
    started_at: string;
    ended_at: string;
    comment: string;
    paid_teacher: boolean;
    invoiced_student: boolean;
    paid_teacher_at :string;
    invoiced_student_at :string;
    class_id :string;
    was_canselled :boolean;
};

export type ClassesJoinTeacher = {
    // Fields from the Classes table
    teacher_user_id: string;
    student_user_id: string;
    created_at: string; // e.g. when the class was created
    started_at: string;
    ended_at: string;
    comment: string;
    paid_teacher: boolean;
    invoiced_student: boolean;
    paid_teacher_at: string | null;
    invoiced_student_at: string | null;
    class_id: string;
    was_canselled: boolean;
    
    // Fields from the Teacher table
    // Note: In your join result, "user_id" is the teacher id (same as teacher_user_id)
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    location: string;
    hourly_pay: string;
    resigned: boolean;
    additional_comments: string | null;
    // Renamed teacher's creation date to avoid conflict with the class's created_at
    created_at_1: string;
    admin: boolean;
    resigned_at: string | null;
    wants_more_students: boolean;
    notes?: string;
    digital_tutouring: boolean | null;
    physical_tutouring: boolean;
  
    // Additional field from the join
    was_cancelles: boolean | null;
};

export type NewStudent = {
    phone :string;
    created_at: string;
    preffered_teacher :string;
    has_called :boolean;
    called_at :string;
    has_answered: boolean;
    answered_at: string;
    has_signed_up: boolean;
    signed_up_at: string;
    from_referal: boolean;
    referee_phone: string;
    has_assigned_teacher: boolean;
    assigned_teacher_user_id: string | null;
    assigned_teacher_at: string;
    has_finished_onboarding: boolean;
    finished_onboarding_at: string;
    comments: string;
    paid_referee: boolean;
    paid_referee_at: string;
    referee_name: string;
    new_student_id: string;
    has_physical_tutoring: boolean | null
    hidden : boolean | null
}

export type NewStudentWithPreferredTeacher = {
    new_student_id: string;
    phone: string;
    created_at: string;
    preferred_teacher: string;

    teacher_called: boolean;
    called_at: string;
    teacher_answered: boolean;
    answered_at: string | null;

    student_signed_up: boolean;
    signed_up_at: string | null;

    teacher_has_accepted: boolean;
    teacher_accepted_at: string | null;

    comments: string | null;
    physical_or_digital: boolean;
    hidden: boolean;
};

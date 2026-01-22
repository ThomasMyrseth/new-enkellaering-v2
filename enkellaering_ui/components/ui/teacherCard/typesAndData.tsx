import { Teacher, Review } from "@/app/admin/types";
import { Quiz } from "@/app/min-side-laerer/types";


export type CardType = {
    teacher: Teacher;
    reviews: Review[];
    availableSubjects: string[] //Matematikk 1T, Fysikk 1, Spansk I, etc.
    description: string; //Jeg heter Thomas og er ...
    src: string; //bilde av meg
}

export type ExpandedTeacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    location :string;
    hourly_pay: string;
    resigned: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
    wants_more_students :boolean;
    notes :string;
    about_me_text: string,
    image_url :string;
    digital_tutouring :boolean;
    physical_tutouring :boolean;
}

export type Qualification = {
    attempt_id :string;
    created_at :string;
    number_of_corrects :number;
    number_of_questions :number;
    passed :boolean;
    quiz_id :string;
    quizzes: Quiz;
    user_id :string;
}

export type AboutMe = {
    user_id :string;
    about_me :string;
    firstname :string;
    lastname :string;
    image_url :string;
}


export const cities :string[] = ['Oslo', 'Trondheim', 'Annen by']





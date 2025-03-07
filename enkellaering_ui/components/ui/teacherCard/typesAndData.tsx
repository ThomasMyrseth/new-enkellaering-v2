import { Teacher, Review } from "@/app/admin/types";


export type CardType = {
    teacher: Teacher;
    reviews: Review[];
    location :string;
    qualifications: string[] //R1, Ungdomskole, Spansk
    description: string; //Jeg heter Thomas og er ...
    src: string; //bilde av meg
    digitalTutouring: boolean; //true=Ja til digitalt, false=Nei til digitalt
    physicalTutouring: boolean //true=Ja til fysisk, false= Nei til fysisk
}

export type ExpandedTeacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    hourly_pay: string;
    resgined: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
    wants_more_students :boolean;
    notes :string;
    about_me_text: string,
    image_url :string;
}


export const cities :string[] = ['Oslo', 'Trondheim', 'Annet']
export const qualifications :string[] = ['1P', '1T', '2P', 'S1', 'S2', 'R1', 'R2', 'Matte ungdomskole', 'Annet']





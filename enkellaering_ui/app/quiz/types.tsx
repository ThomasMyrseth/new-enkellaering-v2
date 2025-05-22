
export type QuestionType = {
    quiz_id :string;
    question_id :string;
    question :string;
    answer_options: string[];
    correct_option: number;
    image :string;
    time_limit :number;
}


export type QuestionWithFileType = {
    quiz_id :string;
    question_id :string;
    question :string;
    options: string[];
    correct_option: number;
    image :File | null;
    time_limit :number;
}

export type FullQuizType = {
    quiz_id :string;
    title :string;
    pass_threshold :number;
    number_of_questions: number;
    questions :QuestionType[];
}

export type QuizType = {
    quiz_id :string;
    title :string;
    image :string | null;
    pass_threshold :number;
    created_at :string;
}

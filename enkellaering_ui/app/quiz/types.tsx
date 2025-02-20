
export type QuestionType = {
    question :string;
    options: string[];
    correctOption: number;
    image :string;
    timeLimit :number;
}

export type FullQuizType = {
    quizId :string;
    title :string;
    passTreshold :number;
    questions :QuestionType[];
}

export type QuizType = {
    quizId :string;
    title :string;
    passTreshold :number;
}
"use client"
import { useFetch } from "./use-fetch";

export type AboutMe = {
    user_id: string;
    about_me: string;
    firstname: string;
    lastname: string;
    image_url: string;
};

export function useTeacherAboutMes() {
    return useFetch<AboutMe[]>(
        "/get-all-teacher-images-and-about-mes",
        (json) => json.data ?? [],
        [],
        { auth: false }
    );
}

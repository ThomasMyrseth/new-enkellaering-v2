"use client"
import { useMemo } from "react";
import { CardType } from "@/components/ui/teacherCard/typesAndData";
import { useTeachers } from "./use-teachers";
import { useReviews } from "./use-reviews";
import { useTeacherAboutMes } from "./use-teacher-about-mes";
import { useAvailableSubjects } from "./use-subjects";

const FALLBACK_ABOUT_ME = {
    about_me: "Jeg har ikke skrevet noe enda",
    image_url: "/enkel_laering_transparent.png",
    user_id: "0",
    firstname: "Enkel",
    lastname: "Læring",
};

export function useTeacherCards(): [CardType[], boolean, string | null] {
    const [teachers, teachersLoading, teachersError] = useTeachers();
    const [reviews, reviewsLoading, reviewsError] = useReviews();
    const [aboutMes, aboutMesLoading, aboutMesError] = useTeacherAboutMes();
    const [availableSubjects, subjectsLoading, subjectsError] = useAvailableSubjects();

    const loading = teachersLoading || reviewsLoading || aboutMesLoading || subjectsLoading;
    const error = teachersError || reviewsError || aboutMesError || subjectsError;

    const cards = useMemo<CardType[]>(() => {
        return teachers.map((teacher) => {
            const teacherReviews = reviews.filter((review) => review.teacher_user_id === teacher.user_id);
            const aboutMe = aboutMes.find((a) => a.user_id === teacher.user_id) || FALLBACK_ABOUT_ME;
            const teacherAvailableSubjects = availableSubjects
                .filter((s) => s.teacher_user_id === teacher.user_id)
                .map((s) => s.subject);

            return {
                teacher,
                reviews: teacherReviews,
                description: aboutMe.about_me || "",
                src: aboutMe.image_url || FALLBACK_ABOUT_ME.image_url,
                availableSubjects: teacherAvailableSubjects,
            };
        });
    }, [teachers, reviews, aboutMes, availableSubjects]);

    return [cards, loading, error];
}

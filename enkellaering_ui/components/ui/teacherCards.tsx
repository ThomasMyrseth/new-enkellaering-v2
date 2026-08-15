
"use client"
import { FocusCards } from "@/components/ui/focus-cards";
import { Skeleton } from "./skeleton";
import { useTeacherAboutMes } from "@/hooks/use-teacher-about-mes";

export const TeacherFocusCards = () => {
    const [aboutMes, loading] = useTeacherAboutMes();
    const cards = aboutMes.map((aboutMe) => ({
        title: `${aboutMe.firstname} ${aboutMe.lastname}`,
        description: aboutMe.about_me,
        src: aboutMe.image_url || "",
        onClick: () => {},
    }));

    return (<>
    {loading ? <Skeleton className="h-[500px] w-[600px]" /> : <FocusCards cards={cards} />}
    </>)
}

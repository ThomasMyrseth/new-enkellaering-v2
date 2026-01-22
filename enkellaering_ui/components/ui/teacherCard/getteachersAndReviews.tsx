import { AvailableSubject, Review } from "@/app/admin/types";
import { CardType, ExpandedTeacher, AboutMe } from "./typesAndData";
import { TeacherOrderJoinTeacher } from "@/app/min-side/types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

const getAllTeachers = async (): Promise<ExpandedTeacher[]> => {
    try {
        const [teachersResponse] = await Promise.all([
            fetch(`${BASEURL}/get-all-teachers`),
        ]);

        if (!teachersResponse.ok) {
            throw new Error("Failed to fetch teachers");
        }

        const teachersData = await teachersResponse.json();

        const teachers = teachersData.teachers || [];

        return teachers
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return [];
    }
};

const getAllReviews = async (): Promise<Review[]> => {
    try {
        const response = await fetch(`${BASEURL}/get-all-reviews`);
        if (!response.ok) {
            throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        return data.reviews || [];
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
};

const getAllImagesAndAboutMes = async () => {
    try {
        const response = await fetch(`${BASEURL}/get-all-teacher-images-and-about-mes`);
        if (!response.ok) {
            throw new Error("Failed to fetch teacher images and about mes");
        }
        const data = await response.json();
        const aboutMes = data.data || [];

        return aboutMes || [];
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return []
    }
}

const getAllAvailableSubjects = async (): Promise<AvailableSubject[]> => {
    try {
        const response = await fetch(`${BASEURL}/get-all-available-subjects`);
        if (!response.ok) {
            throw new Error("Failed to fetch available subjects");
        }
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("Error fetching available subjects:", error);
        return [];
    }
}

const buildTeacherCards = (teachers: ExpandedTeacher[], reviews: Review[], imagesAndAboutMes: AboutMe[], availableSubjects: AvailableSubject[]): CardType[] => {
    const cards :CardType[] = [];


    const fallbackAboutMe: AboutMe = {
        about_me: "Jeg har ikke skrevet noe enda",
        image_url: "/enkel_laering_transparent.png",
        user_id: '0',
        firstname: 'Enkel',
        lastname: 'Læring'
      };

    teachers.map((teacher) => {
        const teacherReviews :Review[]= reviews.filter((review) => review.teacher_user_id === teacher.user_id);
        const imageAndAboutMe :AboutMe= imagesAndAboutMes.find((i) => i.user_id === teacher.user_id) || fallbackAboutMe;

        const teacherAvailableSubjects = availableSubjects
            .filter(as => as.teacher_user_id === teacher.user_id)
            .map(as => as.subject);

        const card :CardType = {
            teacher: teacher,
            reviews: teacherReviews,
            description: imageAndAboutMe.about_me || '',
            src: imageAndAboutMe.image_url || fallbackAboutMe.image_url,
            availableSubjects: teacherAvailableSubjects,
        }

        cards.push(card);
    });

    return cards
};

export const getTeacherCards = async (): Promise<CardType[]> => {
    const teachers = await getAllTeachers();
    const reviews = await getAllReviews();
    const imagesAndAboutMes = await getAllImagesAndAboutMes();
    const availableSubjects = await getAllAvailableSubjects();
    return buildTeacherCards(teachers, reviews, imagesAndAboutMes, availableSubjects);
};

export const getMyOrders = async () => {

    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No token found in localStorage");
        return [];
    }

    try {
        const response = await fetch(`${BASEURL}/get-new-orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch teacher images and about mes");
        }

        const data = await response.json();
        const teachers: TeacherOrderJoinTeacher[] = data.teachers || [];

        return teachers;
    } catch (error) {
        console.error("Error fetching previous orders:", error);
        return [];
    }
};


// Removed: getAllAvailableQualifications() - no longer needed for display
// Quiz system kept only for internal job application review
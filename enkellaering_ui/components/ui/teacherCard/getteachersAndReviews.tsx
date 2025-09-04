import { Review } from "@/app/admin/types";
import { CardType, ExpandedTeacher, AboutMe, Qualification } from "./typesAndData";
import { TeacherOrderJoinTeacher } from "@/app/min-side/types";
import { Quiz } from "@/app/min-side-laerer/types";

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

const getAllQualifications = async () => {
    try{
        const response = await fetch(`${BASEURL}/get-all-qualifications`);
        if (!response.ok) {
            throw new Error("Failed to fetch qualifications");
        }
        const data = await response.json();
        return data.qualifications || [];
    }

    catch(error) {
        console.error("Error fetching qualifications:", error);
        return [];
    }
}

const buildTeacherCards = (teachers: ExpandedTeacher[], reviews: Review[], imagesAndAboutMes: AboutMe[], qualifications: Qualification[]): CardType[] => {
    const cards :CardType[] = [];


    const fallbackAboutMe: AboutMe = {
        about_me: "Jeg har ikke skrevet noe enda",
        image: "/enkel_laering_transparent.png",
        user_id: '0',
        firstname: 'Enkel',
        lastname: 'Læring'
      };
      
    teachers.map((teacher) => {
        const teacherReviews :Review[]= reviews.filter((review) => review.teacher_user_id === teacher.user_id);
        const imageAndAboutMe :AboutMe= imagesAndAboutMes.find((i) => i.user_id === teacher.user_id) || fallbackAboutMe;
        const teacherQualifications :Qualification[]= qualifications.filter((qualification) => qualification.user_id === teacher.user_id && qualification.passed === true);
        const qualificationTitles :string[]= teacherQualifications.map((qualification) => qualification.title);
        
        const card :CardType = {
            teacher: teacher,
            reviews: teacherReviews,
            description: imageAndAboutMe.about_me || '',
            src: imageAndAboutMe.image || fallbackAboutMe.image,
            qualifications: qualificationTitles,
        }

        cards.push(card);
    });

    return cards
};

export const getTeacherCards = async (): Promise<CardType[]> => {
    const teachers = await getAllTeachers();
    const reviews = await getAllReviews();
    const imagesAndAboutMes = await getAllImagesAndAboutMes();
    const qualifications = await getAllQualifications();
    return buildTeacherCards(teachers, reviews, imagesAndAboutMes, qualifications);
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


export const getAllAvailableQualifications = async (): Promise<string[]> => {
    try {
        const [qualifications] = await Promise.all([
            fetch(`${BASEURL}/get-all-qualifications`),
        ]);

        if (!qualifications.ok) {
            throw new Error("Failed to fetch qualifications");
        }

        const qualificationsData = await qualifications.json();
        const qs :Quiz[]= qualificationsData.qualifications || [];

        const qualificationsList = qs.map( (q) => {
            return q.title
        })

        //avoid duplicates
        return Array.from(new Set(qualificationsList));

    } catch (error) {
        console.error("Error fetching qualificationsData:", error);
        return [];
    }
};
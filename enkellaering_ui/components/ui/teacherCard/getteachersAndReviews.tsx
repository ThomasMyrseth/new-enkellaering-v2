import { Review } from "@/app/admin/types";
import { CardType, ExpandedTeacher } from "./typesAndData";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

const getAllTeachers = async (): Promise<ExpandedTeacher[]> => {
    try {
        const [teachersResponse, extraDataResponse] = await Promise.all([
            fetch(`${BASEURL}/get-all-teachers`),
            fetch(`${BASEURL}/get-all-teacher-images-and-about-mes`)
        ]);

        if (!teachersResponse.ok || !extraDataResponse.ok) {
            throw new Error("Failed to fetch teachers or extra data");
        }

        const teachersData = await teachersResponse.json();
        const extraData = await extraDataResponse.json();

        const teachers = teachersData.teachers || [];
        const aboutMes = extraData.about_mes || [];
        const images = extraData.images || [];

        console.log(aboutMes)

        // Merge the about me text and image URL with the teacher data
        return teachers.map((teacher: ExpandedTeacher) => {
            const aboutMeEntry = aboutMes.find((entry: any) => entry.user_id === teacher.user_id);
            const imageEntry = images.find((img: any) => img.user_id === teacher.user_id);

            return {
                ...teacher,
                aboutMeText: aboutMeEntry ? aboutMeEntry.text : "",
                imageUrl: imageEntry ? imageEntry.url : "https://assets.aceternity.com/default-avatar.jpg"
            };
        });
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

const getAllQualifications = async () => {

}

const getAllImagesAndAboutMes = asunc () => {
    
}

const buildTeacherCards = (teachers: ExpandedTeacher[], reviews: Review[]): CardType[] => {
    return teachers.map((teacher) => {
        const teacherReviews = reviews.filter((review) => review.teacher_user_id === teacher.user_id);
        return {
            teacher,
            reviews: teacherReviews,
            location: teacher.address || "Ukjent",
            qualifications: ["R1", "Ungdomsskole", "Spansk"], // Replace with actual logic if available
            description: teacher.about_me_text || `Jeg heter ${teacher.firstname} og er en erfaren privatlærer.`,
            src: teacher.image_url, // Use the image from the API
            digitalTutouring: true, // Replace with actual data if available
            physicalTutouring: true, // Replace with actual data if available
        };
    });
};

export const getTeacherCards = async (): Promise<CardType[]> => {
    const teachers = await getAllTeachers();
    const reviews = await getAllReviews();
    return buildTeacherCards(teachers, reviews);
};
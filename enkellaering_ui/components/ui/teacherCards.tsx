
"use client"
import { Card, FocusCards } from "@/components/ui/focus-cards";
import { useEffect, useState } from "react";
import { Skeleton } from "./skeleton";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

  
type Card = {
    title: string,
    description: string,
    src: string
}

type AbouMe = {
    user_id :string,
    about_me :string,
    firstname :string,
    lastname: string
}

export const TeacherFocusCards= () => {
    const [cardItems, setCardItems] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
    async function getAllAboutMes() {
        try {
        const response = await fetch(`${BASEURL}/get-all-teacher-images-and-about-mes`, {
            method: "GET",
        });

        if (!response.ok) {
            console.error("Failed to fetch data.");
            return;
        }

        const data = await response.json();

        if (!data.about_mes || !data.images) {
            console.error("Invalid response format.");
            return;
        }

        // Combine about_mes with images
        const combinedData: Card[] = data.about_mes.map((aboutMe: AbouMe) => {
            // Find the corresponding image
            const imageUrl = data.images.find((image: string) =>
            image.includes(aboutMe.user_id)
            );

            return {
            title: `${aboutMe.firstname} ${aboutMe.lastname}`,
            description: aboutMe.about_me,
            src: imageUrl || "", // Use empty string if no image is found
            };
        });

        setCardItems(combinedData);
        setLoading(false)
        } catch (error) {
        console.error("Error fetching data:", error);
        }
    }

    getAllAboutMes();
    }, []);

    return (<>
    {loading===true ? <Skeleton className="h-[500px] w-[600px]" /> : <FocusCards cards={cardItems} />}
    </>)
}

"use client"
import Image from "next/image";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { Card, FocusCards } from "@/components/ui/focus-cards";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  return (<>       
  <TracingBeam className="px-6">  
    <FocusCardsHomePage/>
    <Image
      className="dark:invert"
      src="/vercel.svg"
      alt="Vercel logomark"
      width={20}
      height={20}
    />

    </TracingBeam>
  </>)
}

type AboutMe = {
  user_id :string,
  about_me :string,
  image_url :string,
  firstname: string,
  lastname: string
}

type Card = {
  title: string,
  description: string,
  src: string
}

const FocusCardsHomePage = () => {
  const [cardItems, setCardItems] = useState<Card[]>([]);

  useEffect(() => {
    async function getAllAboutMes() {
      try {
        const response = await fetch(`${BASEURL}/get-all-teacher-images-and-about-mes`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch data.");
          return;
        }

        const data = await response.json();
        console.log(data);

        if (!data.about_mes || !data.images) {
          console.error("Invalid response format.");
          return;
        }

        // Combine about_mes with images
        const combinedData: Card[] = data.about_mes.map((aboutMe: any) => {
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getAllAboutMes();
  }, []);

  return <FocusCards cards={cardItems} />;
};

"use client"

import { Teacher } from "../admin/types";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image  from "next/image";
import { Carousel } from "@/components/ui/apple-cards-carousel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MyTeachers( {teachers} : {teachers :Teacher[]}) {
    if (teachers.length===0) {
        return <p>Dere hat ingen lærer</p>
    }

    const cards = teachers.map((t: Teacher, index: number) => (
        <TeacherCard teacher={t} key={index} />
    ));

    return (<>
    {cards.length===1 &&       <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Din lærer</h2>}
    {cards.length!==1 &&       <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Dine lærere</h2>}
        <Carousel items={cards}/>
    </>)


    
}

const handleRemoveTeacher = async (teacherUserId: string) => {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    try {
        const res = await fetch(`${BASEURL}/assign-teacher-for-student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                student_user_id: localStorage.getItem("user_id"),
                old_teacher_user_id: teacherUserId
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to remove teacher:", data.message);
        } else {
            console.log("Teacher removed successfully");
            toast("Du har fjernet læreren din")
        }
    } catch (error) {
        console.error("Error removing teacher:", error);
    }
};

const TeacherCard = ({teacher} : {teacher :Teacher}) => {
    const hasTeacher :boolean = teacher !==null

    return(<div className="w-full overflow-hidden">
        <CardContainer className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                {hasTeacher ? (
                    <>
                        {teacher?.firstname} {teacher?.lastname}
                        <Button onClick={() => handleRemoveTeacher(teacher.user_id)}>Fjern lærer</Button>
                    </>
                ) : (
                    <span>Dere har ingen lærere enda.</span>
                )}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                    { hasTeacher?
                    <span>
                        <span className="font-light">Telefon: </span><span className="font-bold">{teacher?.phone}  </span>
                        <br />
                        <span className="font-light">Epost: </span><span className="font-bold">{teacher?.email}  </span>
                        <br />
                        <span className="font-light">Adresse: </span><span className="font-bold">{teacher?.address}</span>
                        <br />
                        <span className="font-light">Postnummer: </span><span className="font-bold">{teacher?.postal_code}</span>
                    </span>
                    :
                    <span>Dersom dette vedvarer mer enn noen dager kan dere kontakte: 
                        <br/>
                        <span className="font-bold">Thomas Myrseth tlf: <span className="text-underline">47184744</span></span>
                    </span>
                    }
                </CardItem>
                <CardItem
                translateZ="100"
                rotateX={20}
                rotateZ={-10}
                className="w-full mt-4"
                >
                <Image
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                />
                </CardItem>
            </CardBody>
    </CardContainer>
  </div>);
}
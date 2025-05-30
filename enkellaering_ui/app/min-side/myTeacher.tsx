"use client"

import { Teacher } from "../admin/types";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image  from "next/image";
import { Carousel } from "@/components/ui/apple-cards-carousel";
import Link from "next/link";
//import { Button } from "@/components/ui/button";
//import { toast } from "sonner";

export function MyTeachers( {teachers} : {teachers :Teacher[]}) {

    const cards = teachers.map((t: Teacher, index: number) => { 
        if (t.resigned===true) {
            return <></>
        }
        return <TeacherCard teacher={t} key={index} />
    })

    return (<>
    {cards.length===1 &&      
        <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Din lærer</h2>
    }
    {cards.length>1 &&       
        <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Dine lærere</h2>
    }
    {cards.length===0 &&
        <>
        <h2 className="text-center mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Du har ingen lærer</h2>
        <br/>
        <p className="w-2/3 text-center">Gå til <Link href="/bestill" className="underline">bestill</Link> for å bestille en lærer, eller kontakt oss for å få hjelp.
            <br/>
            <span className="font-bold">Thomas Myrseth telefon: <span className="text-underline">47 18 47 44</span></span>
        </p>
        </>
    }
        <Carousel items={cards}/>
    </>)


    
}

const TeacherCard = ({teacher} : {teacher :Teacher}) => {
    const hasTeacher :boolean = teacher !==null

    return(<div className="w-full overflow-hidden">
        <CardContainer className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                <CardItem
                    translateZ="50"
                    className="text-xl w-full font-bold text-neutral-600 dark:text-white"
                >
                {hasTeacher ? (
                    <div className="flex justify-between w-full">
                        <p>{teacher?.firstname} {teacher?.lastname}</p>
                        {/* <Button onClick={() => handleRemoveTeacher(teacher.user_id)}>Fjern lærer</Button> */} 
                    </div>
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
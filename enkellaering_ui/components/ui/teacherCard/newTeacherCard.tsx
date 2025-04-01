"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Label } from "@/components/ui/label"
import { Laptop, Users, Star } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
  } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";


import { Button } from "../button";

import { CardType } from "./typesAndData";

import { ToggleFilterCards, filterCards } from "./filter";
import { getMyOrders, getTeacherCards } from "./getteachersAndReviews";
import { Textarea } from "../textarea";
import { TeacherOrderJoinTeacher } from "@/app/min-side/types";
import { toast } from "sonner";
  

export function TeacherFocusCards() {
    const [hasToken, setHasToken] = useState<string | null>(null)
    const [isTeacher, setIsTeacher] = useState<boolean>(false)

    useEffect(() => {
    const token = localStorage.getItem('token')
    const teacher = localStorage.getItem('isTeacher') === 'true'
    setHasToken(token)
    setIsTeacher(teacher)
    }, [])

    const isLoggedInStudent = hasToken && !isTeacher

    const [active, setActive] = useState<(CardType) | boolean | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
    const [disableButton, setDisableButton] = useState<boolean>(false)

    const id = useId();
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter()
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

    const [showOrderPopover, setShowOrderPopover] = useState<boolean>(false)
    const [orderedTeacher, setOrderedTeacher] = useState<CardType>()
    const [wantPhysicalOrDigital, setWantPhysicalOrDigital] = useState<boolean | null>(null)
    const [address, setAddress] = useState<string>('')
    const [comments, setComments] = useState<string>()

    // Filter states
    const [filterLocation, setFilterLocation] = useState<string | null>(null);
    const [filterQualification, setFilterQualification] = useState<string | null>(null);
    const [filterDigital, setFilterDigital] = useState<boolean>(false);
    const [filterPhysical, setFilterPhysical] = useState<boolean>(false);
    const [filteredCards, setFilteredCards] = useState<CardType[]>([]); //default to cards, which os unfiltered

    const [cards, setCards] = useState<CardType[]>([])
    const [previousOrders, setPreviousOrders] = useState<TeacherOrderJoinTeacher[]>([])

    //fetch the cards from database
    useEffect( () => {
        async function fetchCards() {
            const cards = await getTeacherCards()
            if (!cards) {
                return
            }
            else {
                setFilteredCards(cards)
                setCards(cards)
            }
        }

        async function fetchPreviousOrders() {
            const orders = await getMyOrders();
            console.log("previous orders: ", orders)
            if (!orders) {
                return;
            } else {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                
                //keep all the orders that are less than seven days old, or orders that are already accepted
                //the student should not be able to reorder these
                const filteredOrders = orders.filter((o) => {
                    return new Date(o.order.created_at) < sevenDaysAgo || o.order.teacher_user_id;
                });
                
                console.log("filered orders: ", filteredOrders)
                setPreviousOrders(filteredOrders);
            }
        }
        fetchCards()
        fetchPreviousOrders()
    },[])


    // Apply filtering function
    useEffect(() => {
        const c :CardType[] = filterCards(cards, filterLocation, filterQualification, filterDigital, filterPhysical);
        setFilteredCards(c);
    },[filterLocation, filterQualification, filterDigital, filterPhysical, cards])


    const handleOrderClick = (card :CardType) => {

        const token :string|null= localStorage.getItem('token') || null;
        const isTeacher = localStorage.getItem('isTeacher')
        if (!token || !isTeacher) {
            return;
        }

        if (card.teacher.digital_tutouring && !card.teacher.physical_tutouring) {
            setWantPhysicalOrDigital(false) //digital
        }
        if (card.teacher.physical_tutouring && !card.teacher.digital_tutouring) {
            setWantPhysicalOrDigital(true) //physical
        }

        setOrderedTeacher(card)
        setShowOrderPopover(true)
    }

    //submit new student
    const handleSubmit = () => {
        const token :string|null= localStorage.getItem('token') || null;
        const isTeacher = localStorage.getItem('isTeacher')
        setDisableButton(true)
        if (!token || !isTeacher) {
            return;
        }
        
        if (!orderedTeacher) {
            alert('Klarte ikke å bestille lærer. Prøv igjen')
            setDisableButton(false)
            return;
        }

        if(!comments) {
            toast('Skriv om hva og hvilke fag du trenger hjelp med.')
            return
        }

        if (wantPhysicalOrDigital===null) {
            alert("Velg om dere ønsker digital eller fysisk undervisning")
            return;
        }
        try {
            submitNewRequest(BASEURL, token, orderedTeacher.teacher.user_id, wantPhysicalOrDigital, address, comments, router)
            setDisableButton(false)
        }
        catch {
            setDisableButton(false)
            alert("Klarte ikke å bestille, prøv igjen.")
        }
    }


    //switch the radio
    const handleSetWantsPhysicalOrDigital = (value :string) => {
        if (value==='Fysisk') {
            setWantPhysicalOrDigital(true)
        }
        else {
            setWantPhysicalOrDigital(false)
        }
    }

    
    //togle main modal
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            setActive(false);
        }
        }

        if (active && typeof active === "object") {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <>

        {/* Order popover */}
        <AlertDialog open={showOrderPopover}>

            <AlertDialogContent>
                {orderedTeacher?.teacher.digital_tutouring && orderedTeacher.teacher.physical_tutouring &&
                    <RadioGroup onValueChange={handleSetWantsPhysicalOrDigital}>
                        <Label>Ønsker dere fysisk eller digital undervisning?</Label>
                        <div className="flex space-x-2">
                            <RadioGroupItem value="Fysisk" checked={wantPhysicalOrDigital===true}/>
                            <Label>Fysisk</Label>
                        </div>
                        <div className="flex space-x-2">
                            <RadioGroupItem value="Digitalt" checked={wantPhysicalOrDigital===false}/>
                            <Label>Digital</Label>
                        </div>
                    </RadioGroup>
                }
                <p>Jeg ønsker {orderedTeacher?.teacher.physical_tutouring? 'fysisk' : 'digital'} undervisning med {orderedTeacher?.teacher.firstname}</p>
                <div>
                    <Label>Hvor ønsker du å møte {orderedTeacher?.teacher.firstname}?</Label>
                    <Textarea rows={2} value={address} placeholder="Helst hjemme hos meg i Hjemmeveien 3, eller i sentrum som Deichman Bjørvika." onChange={(e) => setAddress(e.target.value)}/>
                </div>
                <div>
                    <Label>Beskriv til {orderedTeacher?.teacher.firstname} hva du trenger hjelp med og hvilke fag.</Label>
                    <Textarea 
                        rows={4} 
                        value={comments} onChange={(e) => setComments(e.target.value)}
                        placeholder='Jeg heter Thomas og trenger hjelp i matte 1t. Jeg ønsker hjelo én gang i uken, men har en prøve i trigonometri om to uker. Håper vi kan øve litt ekstra til den!'
                    />
                </div>
                <Button onClick={handleSubmit}>Bestill</Button>
                <AlertDialogCancel onClick={() => setShowOrderPopover(false)}>Angre</AlertDialogCancel>
            </AlertDialogContent>
        </AlertDialog>

        {/*Filtering */}
        <div className="bg-wgite w-3/4 md:w-1/2 dark:bg-black p-4 rounded-xl">
          <ToggleFilterCards
              passFilterDigital={setFilterDigital}
              passFilterPhysical={setFilterPhysical}
              passFilterLocation={setFilterLocation}
              passFilterQualification={setFilterQualification}
              viewMode={viewMode}
              setViewMode={setViewMode}
          />   
        </div>

        {/* Modal for Expanded Card */}
        <AnimatePresence>
            {active && typeof active === "object" && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 h-full w-full z-10"
            />
            )}
        </AnimatePresence>



        <AnimatePresence>
            {active && typeof active === "object" ? (
            <div className="fixed inset-0 grid place-items-center z-10">
                <motion.button
                key={`button-${active.teacher.firstname}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-8 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                onClick={() => setActive(null)}
                >
                <CloseIcon />
                </motion.button>
                <motion.div
                layoutId={`card-${active.teacher.firstname}-${id}`}
                ref={ref}
                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-black-900 sm:rounded-3xl overflow-y-scroll"
                >
                <motion.div layoutId={`image-${active.teacher.firstname}-${id}`}>
                    <Image
                    priority
                    width={200}
                    height={200}
                    src={active.src}
                    alt={active.teacher.firstname}
                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                    />
                </motion.div>
                <div className="">
                    <div className="m-4">
                    <div className="overflow-y-scroll flex flex-row items-center justify-between p-4">
                        <motion.h3
                        layoutId={`title-${active.teacher.firstname}-${id}`}
                        className="font-bold text-neutral-700 dark:text-neutral-200"
                        >
                        {active.teacher.firstname} {active.teacher.location}
                        </motion.h3>
                        <motion.p
                            layoutId={`description-${active.teacher.firstname}-${id}`}
                            className="flex flex-row w-60 text-neutral-600 dark:text-neutral-400 text-center md:text-left overflow-x-scroll scrollbar-hide"
                        >
                            {active.qualifications.map((qualification :string, index :number) => {
                                //order the qualifications alfabetically
                                active.qualifications.sort();
                                return(<div className="m-2" key={index}>
                                    <span key={index} className="rounded-lg bg-neutral-100 mx-1 p-2 text-xs">{qualification}</span>
                                </div>)
                            })}
                        </motion.p>
                        
                    
                    </div>
                    <div className="">
                        <motion.p
                        layoutId={`description-${active.description}-${id}`}
                        className="h-56 overflow-y-scroll scrollbar-hide text-neutral-600 dark:text-neutral-400 mb-10"
                        >
                        {active.description}
                        </motion.p>

                        <div className="h-56 overflow-y-scroll "> {/* Wrapping div for scrolling */}
                            {active.reviews.length === 0 ? (
                                <span>{active.teacher.firstname} har ingen omtaler enda</span>
                            ) : (
                                <div className="space-y-4 "> {/* Added spacing between reviews */}
                                    {active.reviews.map((review) => (
                                        <div key={review.id} className="flex flex-col bg-neutral-100 p-4 rounded-xl">
                                            <div className="flex flex-row items-center mb-4">
                                                <span className="text-lg mr-4">{review.student_name!==""? review.student_name : "Anonym"}</span>
                                                <RenderStars rating={review.rating}/>
                                            </div>
                                            <p className="text-neutral-800">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
                </motion.div>
            </div>
            ) : null}
        </AnimatePresence>

        <div className="bg-white p-4 dark:bg-black rounded-xl">
        {/* Card List */}
        {viewMode === "list" ? (
            <ul className="max-w-2xl mx-auto w-full gap-4">
            {filteredCards.length === 0 && <h3 className="text-black w-full text-center dark:text-white">Vi har desverre ingen lærere som møter filtrene dine.</h3>}
            {filteredCards.map((card :CardType, index) => {
                let avgRating :number =0
                //avoid divinding by zero is card.reviews===0
                if (card.reviews.length!==0) {
                    card.reviews.map( (review) => {
                        avgRating += review.rating
                    })
                    avgRating = Math.round(avgRating/card.reviews.length)
                }

                return(<div className="flex flex-row items-center w-full justify-between" key={index}>
                <motion.div
                    layoutId={`card-${card.teacher.user_id}-${id}`}
                    key={`card-${card.teacher.firstname}-${id}`}
                    onClick={() => setActive(card)}
                    className="p-4 flex flex-col justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                    <div className="flex gap-4 flex-col md:flex-row">
                        <motion.div layoutId={`image-${card.teacher.firstname}-${id}`}>
                        <Image
                            width={100}
                            height={100}
                            src={card.src}
                            alt={card.teacher.firstname}
                            className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                        />
                        </motion.div>
                        <div className="flex flex-row items-center ">
                        <motion.h3
                            layoutId={`title-${card.teacher.firstname}-${id}`}
                            className="flex flex-col w-28 font-bold text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                        >
                            {card.teacher.firstname}
                            <span className="text-xs font-light">{card.teacher.location}</span>
                            <span>
                                <RenderStars rating = {avgRating}/>
                            </span>
                        </motion.h3>
                        <motion.p
                            layoutId={`description-${card.teacher.firstname}-${id}`}
                            className="w-60 text-neutral-600 dark:text-neutral-400 text-center md:text-left overflow-x-scroll scrollbar-hide"
                            key = {card.teacher.firstname}
                        >
                            {card.qualifications.map((qualification :string, index :number) => {
                                
                                //order the qualifications alfabetically
                                card.qualifications.sort();

                                return(<>
                                    <span key={index} className="rounded-lg bg-neutral-100 mx-1 p-2 text-xs">{qualification}</span>
                                </>)
                            })}
                        </motion.p>
                        <motion.p className={`font-light text-xs rounded-lg m-2 p-1 ${card.teacher.digital_tutouring? 'text-emerald-400': 'text-rose-400'}`}>
                        <Laptop/> digital
                        </motion.p>
                        <motion.p className={`font-light text-xs rounded-lg p-1 m-1 ${card.teacher.physical_tutouring? 'text-emerald-400': 'text-rose-400'}`}>
                            <Users/> fysisk
                        </motion.p>
                        </div>
                    </div>
                </motion.div>
                <Button 
                    onClick={() => handleOrderClick(card)}
                    disabled={
                        (!card.teacher.physical_tutouring && !card.teacher.digital_tutouring) ||
                        !!previousOrders.find((p) => p.order.teacher_user_id === card.teacher.user_id)
                        || !isLoggedInStudent
                        || disableButton
                    }
                    className={`py-2min-w-32 w-fit min-h-14 ${   (!card.teacher.physical_tutouring && !card.teacher.digital_tutouring) ||
                        !!previousOrders.find((p) => p.order.teacher_user_id === card.teacher.user_id) || !isLoggedInStudent ? 'bg-neutral-400 text-neutral-100':''}`}
                >
                    {
                    previousOrders.find((p) => p.order.teacher_user_id === card.teacher.user_id)
                        ? <p className="text-xs whitespace-normal">Du har allerede bestilt {card.teacher.firstname} uken, eller så er {card.teacher.firstname} læreren din</p>
                        : isLoggedInStudent ? <p>Bestill {card.teacher.firstname}</p> : <p className="text-xs">Logg inn for å bestille</p>
                    }
                                            
                </Button>
            </div>)})}
            </ul>
        ) : 
        
        
        (
            <ul className="md:max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
            {filteredCards.map((card, index) => {
    

                let avgRating :number =0
                //avoid divinding by zero is card.reviews===0
                if (card.reviews.length!==0) {
                    card.reviews.map( (review) => {
                        avgRating += review.rating
                    })
                    avgRating = Math.round(avgRating/card.reviews.length)
                }

                const RenderStars = ({rating} : {rating :number}) => {

                    return (
                    <div className="flex flex-row">
                        {Array.from({ length: 5 }, (_, index) => (
                            <Star
                                key={index}
                                fill={index < rating ? "currentColor" : "none"} // Fill only up to avgRating
                                stroke="none"
                                className="text-black w-3 h-3"
                            />))}

                    </div>)
                };

                return(<div className=" flex flex-col" key={index}>
                <motion.div
                layoutId={`card-${card.teacher.firstname}-${id}`}
                key={card.teacher.firstname}
                onClick={() => setActive(card)}
                className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                <div className="flex flex-col w-full">
                    <motion.div layoutId={`image-${card.teacher.firstname}-${id}`}>
                    <Image
                        width={100}
                        height={100}
                        src={card.src}
                        alt={card.teacher.firstname}
                        className="h-60 w-full rounded-lg object-cover object-top"
                    />
                    </motion.div>
                    <div className="flex justify-center items-center flex-col ">
                        <motion.h3
                            layoutId={`title-${card.teacher.firstname}-${id}`}
                            className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                        >
                            {card.teacher.firstname} <br/>
                            <span className="flex flex-row items-center text-xs font-light"> <span className="mr-2">{card.teacher.location}</span> <RenderStars rating={avgRating}/></span>
                        </motion.h3>
                        <motion.p
                            layoutId={`description-${card.teacher.firstname}-${id}`}
                            className="w-40 text-neutral-600 dark:text-neutral-400 text-center md:text-left overflow-x-scroll scrollbar-hide"
                        >
                            {card.qualifications.map((qualification :string, index :number) => {
                                
                                //order the qualifications alfabetically
                                card.qualifications.sort();

                                return(<>
                                    <span key={index} className="rounded-lg bg-neutral-100 mx-1 p-2 text-xs">{qualification}</span>
                                </>)
                            })}
                        </motion.p>
                        <div className="flex flex-row">
                            <motion.p className={`rounded-lg m-2 p-1 ${card.teacher.digital_tutouring? 'text-emerald-400': 'text-rose-400'}`}>
                                <Laptop/> digital
                            </motion.p>
                            <motion.p className={`rounded-lg m-2 p-1 ${card.teacher.physical_tutouring? 'text-emerald-400': 'text-rose-400'}`}>
                               <Users/> fysisk
                            </motion.p>
                        </div>
                    </div>
                </div>
                </motion.div>
                <Button 
                    onClick={() => handleOrderClick(card)}
                    disabled={
                        (!card.teacher.physical_tutouring && !card.teacher.digital_tutouring) ||
                        !!previousOrders.find((p) => p.order.teacher_user_id === card.teacher.user_id)
                        || !isLoggedInStudent
                    }
                    className={`py-2 w-full min-h-14 ${   (!card.teacher.physical_tutouring && !card.teacher.digital_tutouring) ||
                        !!previousOrders.find((p) => p.order.teacher_user_id === card.teacher.user_id) || !isLoggedInStudent ? 'bg-neutral-400 text-neutral-100':''}`}
                    >
                    {
                    previousOrders.find((p) => p.order.teacher_user_id === card.teacher.user_id)
                        ? <p className="text-xs whitespace-normal">Du har allerede bestilt {card.teacher.firstname} uken, eller så er {card.teacher.firstname} læreren din</p>
                        : isLoggedInStudent ? <p>Bestill {card.teacher.firstname}</p> : <p className="text-xs">Logg inn for å bestille</p>
                    }
                                            
                </Button>

            </div>)})}
            </ul>
        )}
        </div>

        </>
    );
}



const RenderStars = ({rating} : {rating :number}) => {

    return (
    <div className="flex flex-row">
        {Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                fill={index < rating ? "currentColor" : "none"} // Fill only up to avgRating
                stroke="none"
                className="text-black w-3 h-3"
            />))}

    </div>)
};


const CloseIcon = () => {
    return (
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.05 } }}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-black"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
      </motion.svg>
    );
};
  


const submitNewRequest = async (BASEURL: string, token: string, teacher_user_id: string, physical_or_digital :boolean, address :string, comments :string, router : ReturnType<typeof useRouter>) => {

    try {
        const res = await fetch(`${BASEURL}/request-new-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                teacher_user_id: teacher_user_id,
                physical_or_digital: physical_or_digital,
                address: address,
                comments: comments
            })
        });

        if (!res.ok) {
            console.log(`request failed: ${res.status} - ${res.statusText}`)
            throw new Error(`Error fetching: ${res.status} - ${res.statusText}`);
        }

        router.push('/min-side')
    } catch (error) {
        console.error("Request failed:", error);
        throw new Error("Failed to submit new teacher request");
    }
};



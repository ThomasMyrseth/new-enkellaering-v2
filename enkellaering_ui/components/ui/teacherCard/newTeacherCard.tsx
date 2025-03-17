"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Laptop, Terminal, Users, Star } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "../button";

import { CardType } from "./typesAndData";

import { ToggleFilterCards, filterCards } from "./filter";
import { getTeacherCards } from "./getteachersAndReviews";
import Link from "next/link";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover";
import { Teacher } from "@/app/admin/types";
import { Textarea } from "../textarea";
  

export function TeacherFocusCards() {
    const [active, setActive] = useState<(CardType) | boolean | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const id = useId();
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter()

    const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false)
    const [showOrderPopover, setShowOrderPopover] = useState<boolean>(false)
    const [orderedTeacher, setOrderedTeacher] = useState<CardType>()
    const [wantPhysicalOrDigital, setWantPhysicalOrDigital] = useState<boolean | null>(null)
    const [address, setAddress] = useState<string>('')
    const [comments, setComments] = useState<string>('')

    // Filter states
    const [filterLocation, setFilterLocation] = useState<string | null>(null);
    const [filterQualification, setFilterQualification] = useState<string | null>(null);
    const [filterDigital, setFilterDigital] = useState<boolean>(false);
    const [filterPhysical, setFilterPhysical] = useState<boolean>(false);
    const [filteredCards, setFilteredCards] = useState<CardType[]>([]); //default to cards, which os unfiltered
    const [cards, setCards] = useState<CardType[]>([])

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
        fetchCards()
    },[])


    // Apply filtering function
    useEffect(() => {
        const c :CardType[] = filterCards(cards, filterLocation, filterQualification, filterDigital, filterPhysical);
        setFilteredCards(c);
    },[filterLocation, filterQualification, filterDigital, filterPhysical])


    const handleOrderClick = (card :CardType) => {

        const token :string|null= localStorage.getItem('token') || null;
        const isTeacher = localStorage.getItem('isTeacher')
        if (!token || !isTeacher) {
            setShowLoginAlert(true)
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
        if (!token || !isTeacher) {
            setShowLoginAlert(true)
            return;
        }
        
        if (!orderedTeacher) {
            alert('Klarte ikke å bestille lærer. Prøv igjen')
        }
        router.push(`/bestill-laerer?teacher_user_id=${orderedTeacher?.teacher.user_id}&physical_or_digital=${wantPhysicalOrDigital}&address=${address}&comments=${comments}`)
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
        {/*Login alert dialog*/}
        <AlertDialog open={showLoginAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Logg inn før du bestiller!</AlertDialogTitle>
            <AlertDialogDescription>
                Før du kan bestille er du nødt til å <Link href="/login" className="underline">logge inn</Link> eller <Link href="/signup" className="underline">opprette en konto</Link>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginAlert(false)}>Gå tilbake</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>

        {/*Order popover*/}
        <AlertDialog open={showOrderPopover}>
        <AlertDialogTitle>Bestill {orderedTeacher?.teacher.firstname}</AlertDialogTitle>
            <AlertDialogContent>
                {orderedTeacher?.teacher.digital_tutouring && orderedTeacher.teacher.physical_tutouring &&
                    <RadioGroup>
                        <Label>Ønsker dere fysisk eller digital undervisning?</Label>
                        <RadioGroupItem value="Fysisk" checked={wantPhysicalOrDigital===true}/>
                        <RadioGroupItem value="Digitalt" checked={wantPhysicalOrDigital===false}/>
                    </RadioGroup>
                }
                <p>Jeg ønsker {orderedTeacher?.teacher.physical_tutouring? 'fysisk' : 'digital'} undervisning med {orderedTeacher?.teacher.firstname}</p>
                <div>
                    <Label>Hvor ønsker du å møte {orderedTeacher?.teacher.firstname}?</Label>
                    <Input value={address} defaultValue="Hjemmeveien 3 eller Deichman Bjørvika" onChange={(e) => setAddress(e.target.value)}/>
                </div>
                <div>
                    <Label>Har du noe du vil si til {orderedTeacher?.teacher.firstname}?</Label>
                    <Textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)}/>
                </div>
                <Button onClick={handleSubmit}>Bestill</Button>
                <AlertDialogCancel onClick={() => setShowOrderPopover(false)}>Angre</AlertDialogCancel>
            </AlertDialogContent>
        </AlertDialog>

        {/*Filtering */}
        <div className="bg-neutral-100 dark:bg-black p-4 rounded-xl">
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
                className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                onClick={() => setActive(null)}
                >
                <CloseIcon />
                </motion.button>
                <motion.div
                layoutId={`card-${active.teacher.firstname}-${id}`}
                ref={ref}
                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-y-scroll"
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
                    <div className="flex flex-row items-center justify-between pb-4">
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
                        className="h-56 text-neutral-600 dark:text-neutral-400"
                        >
                        {active.description}
                        </motion.p>

                        <div className=""> {/* Wrapping div for scrolling */}
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

        <div className="bg-neutral-100 p-4 dark:bg-black rounded-xl">
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
                    disabled={!card.teacher.physical_tutouring && !card.teacher.digital_tutouring}
                    className={`min-w-32 ${(!card.teacher.physical_tutouring && !card.teacher.digital_tutouring)? 'bg-neutral-400 text-neutral-100':''}`}
                >
                    Bestill {card.teacher.firstname}
                </Button>
            </div>)})}
            </ul>
        ) : 
        
        
        (
            <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
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
                    disabled={!card.teacher.physical_tutouring && !card.teacher.digital_tutouring}
                    className={`${(!card.teacher.physical_tutouring && !card.teacher.digital_tutouring)? 'bg-neutral-400 text-neutral-100':''}`}
                >
                    Bestill {card.teacher.firstname}
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
  
const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
return <div className="mb-4">{children}</div>;
};




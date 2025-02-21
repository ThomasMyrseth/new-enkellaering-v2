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
import { Laptop, Terminal, Users } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { cn } from "@/lib/utils";

import { Button } from "./button";

  


export function TeacherFocusCards({baseUrl} : {baseUrl :string}) {
  const [active, setActive] = useState<(CardType) | boolean | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    const [validPhone, setValidPhone] = useState<boolean | null>(null)
    const [phone, setPhone] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>()
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);




    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        setErrorMessage(null);

        //stop user from spamming button
        setIsDisabled(true)
        setTimeout(() => {
            setIsDisabled(false)
        }, 5000); //5 seconds

        if (phone.length!=8) {
            setValidPhone(false)
            return
        }
        else {
            setValidPhone(true)
        }

        if (!selectedCard) {
            return;
        }

        const response = await fetch(`${baseUrl}/submit-new-student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "phone": phone,
                "prefered_teacher": selectedCard.user_id
            })
        })

        if (!response.ok) {
            setErrorMessage(true)
            alert("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setPhone('')
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
        {/* Toggle Button */}
        <div className="mb-4 flex justify-end">
            <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            >
            Switch to {viewMode === "list" ? "Grid" : "List"} view
            </button>
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
                key={`button-${active.firstname}-${id}`}
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
                layoutId={`card-${active.firstname}-${id}`}
                ref={ref}
                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
                >
                <motion.div layoutId={`image-${active.firstname}-${id}`}>
                    <Image
                    priority
                    width={200}
                    height={200}
                    src={active.src}
                    alt={active.firstname}
                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                    />
                </motion.div>
                <div className="">
                    <div className="m-4">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <motion.h3
                        layoutId={`title-${active.firstname}-${id}`}
                        className="font-bold text-neutral-700 dark:text-neutral-200"
                        >
                        {active.firstname}
                        </motion.h3>
                        <motion.p
                            layoutId={`description-${active.firstname}-${id}`}
                            className="w-60 text-neutral-600 dark:text-neutral-400 text-center md:text-left overflow-x-scroll scrollbar-hide"
                        >
                            {active.qualifications.map((qualification :string, index :number) => {
                                //order the qualifications alfabetically
                                active.qualifications.sort();
                                return(<>
                                    <span key={index} className="rounded-lg bg-neutral-100 mx-1 p-2 text-xs">{qualification}</span>
                                </>)
                            })}
                        </motion.p>
                        
                    
                    </div>
                        <motion.p
                        layoutId={`description-${active.description}-${id}`}
                        className="overflow-y-scroll h-56 scrollbar-hide text-neutral-600 dark:text-neutral-400"
                        >
                        {active.description}
                        </motion.p>
                    </div>
                </div>
                </motion.div>
            </div>
            ) : null}
        </AnimatePresence>

 
        {/* Card List */}
        {viewMode === "list" ? (
            <ul className="max-w-2xl mx-auto w-full gap-4">
            {cards.map((card) => (<div className="flex flex-row items-center w-full justify-between">
                <motion.div
                    layoutId={`card-${card.firstname}-${id}`}
                    key={`card-${card.firstname}-${id}`}
                    onClick={() => setActive(card)}
                    className="p-4 flex flex-col justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                    <div className="flex gap-4 flex-col md:flex-row">
                        <motion.div layoutId={`image-${card.firstname}-${id}`}>
                        <Image
                            width={100}
                            height={100}
                            src={card.src}
                            alt={card.firstname}
                            className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                        />
                        </motion.div>
                        <div className="flex flex-row items-center ">
                        <motion.h3
                            layoutId={`title-${card.firstname}-${id}`}
                            className="flex flex-col w-28 font-bold text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                        >
                            {card.firstname}
                            <span className="text-xs font-light">{card.location}</span>
                        </motion.h3>
                        <motion.p
                            layoutId={`description-${card.firstname}-${id}`}
                            className="w-60 text-neutral-600 dark:text-neutral-400 text-center md:text-left overflow-x-scroll scrollbar-hide"
                        >
                            {card.qualifications.map((qualification :string, index :number) => {
                                
                                //order the qualifications alfabetically
                                card.qualifications.sort();

                                return(<>
                                    <span key={index} className="rounded-lg bg-neutral-100 mx-1 p-2 text-xs">{qualification}</span>
                                </>)
                            })}
                        </motion.p>
                        <motion.p className={`font-light text-xs rounded-lg m-2 p-1 ${card.digitalTutouring? 'text-emerald-400': 'text-rose-400'}`}>
                        <Laptop/> digital
                        </motion.p>
                        <motion.p className={`font-light text-xs rounded-lg p-1 m-1 ${card.physicalTutouring? 'text-emerald-400': 'text-rose-400'}`}>
                            <Users/> fysisk
                        </motion.p>
                        </div>
                    </div>
                </motion.div>
                <Button 
                    onClick={() =>setSelectedCard(card)}
                    disabled={!card.physicalTutouring && !card.digitalTutouring}
                    className={`${(!card.physicalTutouring && !card.digitalTutouring)? 'bg-neutral-400 text-neutral-100':''}`}
                >
                    Bestill {card.firstname}
                </Button>
            </div>))}
            </ul>
        ) : 
        
        
        (
            <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
            {cards.map((card) => (<div className=" flex flex-col">
                <motion.div
                layoutId={`card-${card.firstname}-${id}`}
                key={card.firstname}
                onClick={() => setActive(card)}
                className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                <div className="flex flex-col w-full">
                    <motion.div layoutId={`image-${card.firstname}-${id}`}>
                    <Image
                        width={100}
                        height={100}
                        src={card.src}
                        alt={card.firstname}
                        className="h-60 w-full rounded-lg object-cover object-top"
                    />
                    </motion.div>
                    <div className="flex justify-center items-center flex-col ">
                        <motion.h3
                            layoutId={`title-${card.firstname}-${id}`}
                            className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                        >
                            {card.firstname}
                        </motion.h3>
                        <motion.p>
                            {card.location}
                        </motion.p>
                        <motion.p
                            layoutId={`description-${card.firstname}-${id}`}
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
                            <motion.p className={`rounded-lg m-2 p-1 text-white ${card.digitalTutouring? 'text-emerald-400': 'text-rose-400'}`}>
                                <Laptop/> digital
                            </motion.p>
                            <motion.p className={`rounded-lg m-2 p-1 text-white ${card.physicalTutouring? 'text-emerald-400': 'text-rose-400'}`}>
                               <Users/> fysisk
                            </motion.p>
                        </div>
                    </div>
                </div>
                </motion.div>
                <Button 
                    onClick={() =>setSelectedCard(card)}
                    disabled={!card.physicalTutouring && !card.digitalTutouring}
                    className={`${(!card.physicalTutouring && !card.digitalTutouring)? 'bg-neutral-400 text-neutral-100':''}`}
                >
                    Bestill {card.firstname}
                </Button>

            </div>))}
            </ul>
        )}



        {selectedCard && (
        <Dialog open={selectedCard?true:false} onOpenChange={() => setSelectedCard(null)}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Bestill {selectedCard.firstname}</DialogTitle>
                    <DialogDescription>
                    Vi ringer dere tilbake innen kort tid, normalt 24 timer, med informasjon om oppstart
                    </DialogDescription>
                </DialogHeader>

                {errorMessage === false && (
                    <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="text-green-400">Tusen takk!</AlertTitle>
                    <AlertDescription>
                        Vi har mottatt telefonnummeret ditt. Vi ringer deg innen kort tid
                    </AlertDescription>
                    </Alert>
                )}

                {validPhone === false && (
                    <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="text-red-400">Skrev du noe feil?</AlertTitle>
                    <AlertDescription>
                        Sjekk at nummeret er på 8 siffer, uten mellomrom, uten landskode
                    </AlertDescription>
                    </Alert>
                )}

                <form
                    className="my-8 flex flex-col"
                    onSubmit={(e) => {
                    e.preventDefault();
                    // Stop propagation so the click isn’t interpreted as outside the modal
                    e.stopPropagation();
                    handleSubmit(e);
                    }}
                >
                    <LabelInputContainer>
                    <Label htmlFor="phone">Ditt telefonnummer</Label>
                    <Input
                        id="phone"
                        placeholder="12345678"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={cn(errorMessage ? "border-red-500" : "")}
                    />
                    </LabelInputContainer>
                    <button
                    type="submit"
                    disabled={isDisabled}
                    className="relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span
                        className={`${
                        isDisabled
                            ? "bg-slate-400"
                            : "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl"
                        }`}
                    >
                        Send inn
                    </span>
                    </button>
                </form>
                </DialogContent>
        </Dialog>
        )}

        </>
    );
}

export const CloseIcon = () => {
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

type CardType = {
    user_id :string //uuidV4
    firstname: string; //Thomas
    lastname: string; //Myrseth
    location: string; //OSLO, TRONDHEIM, BERGEN, etc
    qualifications: string[] //R1, Ungdomskole, Spansk
    description: string; //Jeg heter Thomas og er ...
    src: string; //bilde av meg
    digitalTutouring: boolean; //true=Ja til digitalt, false=Nei til digitalt
    physicalTutouring: boolean //true=Ja til fysisk, false= Nei til fysisk
    available: boolean //true=Wants more students, false = Doesnt want more students
}

const cards: CardType[] = [
    {
        user_id: '1',
      firstname: "Thomas",
      lastname: "Myrseth",
      location: "Oslo",
      qualifications: ["R1", "Ungdomsskole", "Spansk"],
      description: 
        "Jeg heter Thomas og er en erfaren privatlærer med en dyp lidenskap for undervisning. Med mange års erfaring innen matematikk, ungdomsskolefag og språk, hjelper jeg studenter med å forstå komplekse konsepter på en enkel og engasjerende måte. \n\n" +
        "Jeg har jobbet med elever på ulike nivåer, og jeg tilpasser undervisningen for å sikre at hver enkelt får den hjelpen de trenger for å lykkes. Enten det er forberedelser til eksamen, leksehjelp eller dybdelæring i spesifikke fag, er jeg her for å veilede og motivere elevene mine til å oppnå sitt fulle potensial.",
      src: "https://assets.aceternity.com/demos/thomas.jpeg",
      digitalTutouring: true,
      physicalTutouring: true,
      available: true,
    },
    {
        user_id: '2',
      firstname: "Lana",
      lastname: "Del Rey",
      location: "Los Angeles",
      qualifications: ["Musikk", "Lyrikk", "Sangskriving"],
      description: 
        "Jeg heter Lana Del Rey, en amerikansk sanger og låtskriver kjent for min unike musikalske stil som kombinerer melankoli, vintage glamour og poetisk historiefortelling. Med en stemme som fanger lytteren, har jeg skapt en rekke ikoniske låter som reflekterer både mørke og drømmende følelser. \n\n" +
        "Min musikk er sterkt påvirket av både klassiske Hollywood-ikoner og moderne popkultur, og gjennom årene har jeg bygget opp en dedikert fanskare verden over. Jeg elsker å formidle dype følelser gjennom lyrikk og melodi, og jeg finner inspirasjon i alt fra 50-tallets filmstjerner til den moderne livsstilen i Los Angeles.",
      src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
      digitalTutouring: true,
      physicalTutouring: false,
      available: false,
    },
    {
        user_id: '3',
      firstname: "Babbu",
      lastname: "Maan",
      location: "Punjab",
      qualifications: ["Musikk", "Sangskriving", "Poet"],
      description: 
        "Jeg heter Babbu Maan, en legendarisk Punjabi-sanger, låtskriver og skuespiller med en dyp lidenskap for å bevare og formidle den rike kulturen og arven fra Punjab. Gjennom min musikk forteller jeg historier om kjærlighet, livets utfordringer og samfunnets realiteter. \n\n" +
        "Med en karriere som strekker seg over flere tiår, har jeg oppnådd en enorm popularitet både i India og blant Punjabi-samfunn over hele verden. Min musikk er kjent for sin ærlighet og evne til å berøre folks hjerter. Jeg bruker mine tekster til å gi stemme til de som ofte ikke blir hørt, og jeg brenner for å bringe Punjabi-kulturen til nye generasjoner. \n\n" +
        "Jeg heter James Hetfield, grunnlegger, vokalist og rytmegitarist i Metallica, et av verdens mest innflytelsesrike heavy metal-band. Gjennom min musikk har jeg vært med på å definere og utvikle sjangeren, og Metallica har i over fire tiår vært en av de ledende aktørene innen rock og metal. \n\n" +
        "Mine tekster og musikk utforsker temaer som kamp, indre demoner og samfunnets utfordringer, og jeg er kjent for min kraftige vokal og aggressive gitarspill. Metallica har solgt millioner av album og turnert verden over, og vår musikk fortsetter å inspirere nye generasjoner av rocke- og metalfans.",
      src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
      digitalTutouring: true,
      physicalTutouring: true,
      available: true,
    },
    {
        user_id: '4',
      firstname: "James",
      lastname: "Hetfield",
      location: "San Francisco",
      qualifications: ["Gitar", "Sang", "Låtskriving"],
      description: 
        "Jeg heter James Hetfield, grunnlegger, vokalist og rytmegitarist i Metallica, et av verdens mest innflytelsesrike heavy metal-band. Gjennom min musikk har jeg vært med på å definere og utvikle sjangeren, og Metallica har i over fire tiår vært en av de ledende aktørene innen rock og metal. \n\n" +
        "Mine tekster og musikk utforsker temaer som kamp, indre demoner og samfunnets utfordringer, og jeg er kjent for min kraftige vokal og aggressive gitarspill. Metallica har solgt millioner av album og turnert verden over, og vår musikk fortsetter å inspirere nye generasjoner av rocke- og metalfans.",
      src: "https://assets.aceternity.com/demos/metallica.jpeg",
      digitalTutouring: false,
      physicalTutouring: true,
      available: false,
    },
    {
        user_id: '5',
      firstname: "Himesh",
      lastname: "Reshammiya",
      location: "Mumbai",
      qualifications: ["Musikkproduksjon", "Komponist", "Sanger", "bananavasking", "engelsk", "norsk"],
      description: 
        "Jeg heter Himesh Reshammiya, en av Indias mest anerkjente musikkomponister, sangere og skuespillere. Med en unik stil og en særegen stemme har jeg satt mitt preg på Bollywood-musikken, og mange av mine sanger har blitt store hits som folk fortsatt synger med på i dag. \n\n" +
        "Min musikk kombinerer moderne og tradisjonelle elementer, og jeg har eksperimentert med ulike sjangere for å skape en frisk og innovativ lyd. Gjennom årene har jeg oppnådd suksess både som soloartist og som komponist for store Bollywood-filmer, og min evne til å skape fengende melodier har gitt meg en lojal fanskare både i India og internasjonalt.",
      src: "https://assets.aceternity.com/demos/aap-ka-suroor.jpeg",
      digitalTutouring: false,
      physicalTutouring: false,
      available: true,
    },
];


const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
    
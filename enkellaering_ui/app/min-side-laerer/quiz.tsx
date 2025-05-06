"use client"
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { ExpandableCardType, Quiz, QuizResult, QuizStatus } from "./types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

export default function QuizStatusPage( {token, baseUrl} : {token :string, baseUrl :string}) {

    return(<>
    <Card className="flex flex-col items-center w-full">
      <CardHeader>
        <CardTitle>Bli sertifisert lærer ved å fullføre quizzene under</CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <QuizStatusCards token={token} baseUrl={baseUrl}/>
      </CardContent>    
    </Card>
    </>)
}




function QuizStatusCards({token, baseUrl} : {token :string, baseUrl :string}) {
    const [cards, setCards] = useState<ExpandableCardType[]>([]);

    //fetch the cards
    useEffect(() => {
        async function fetchCardsFunc() {
            const cards = await fetchCards(token, baseUrl);
            if (cards) {
                setCards(cards);
            }
        }
        fetchCardsFunc()
    },[token, baseUrl])


  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

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
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    <ReactMarkdown>
                      {active.content}
                    </ReactMarkdown>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full gap-4">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col md:flex-row ">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <Image
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="flex items-center">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.title}
                </motion.h3>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.title}-${id}`}
              className={`px-4 py-2 w-28 text-sm rounded-full font-bold mt-4 md:mt-0 
                ${card.status === "Bestått" ? "bg-emerald-400 text-white" : 
                  card.status === "Feilet" ? "bg-rose-400 text-white" : 
                  "bg-sky-400 text-white"
                }`}
              disabled={card.status==="Bestått"}
            >
              {card.ctaText}
            </motion.button>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
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

const fetchCards = async (token :string, baseUrl :string) => {
    const response = await fetch(`${baseUrl}/get-quiz-status`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return null;
    }

    const data = await response.json()
    const quizStatus = await data.quiz_status;

    //format the data into expandableCardType
    const cards :ExpandableCardType[] = []

    quizStatus.map( (q :QuizStatus) => {
        const quiz :Quiz = q.quiz
        const result :QuizResult | null = q.result

        let status :string = "Ikke startet"
        let ctaText :string = "Start quiz"

        if (result && result.passed==true) {
            status = "Bestått"
            ctaText = "Bestått"
        } 
        else if (result && result.passed==false) {
            status = "Feilet"
            ctaText = "Prøv igjen"
        }

        const card :ExpandableCardType = {
                title: quiz.title,
                description: "beskrivelse av quizen",
                status: status,
                src: quiz.image,
                ctaText: ctaText,
                ctaLink: `/quiz/${quiz.quiz_id}`,
                content: quiz.content
        }

        cards.push(card)
    })

    return cards;
}
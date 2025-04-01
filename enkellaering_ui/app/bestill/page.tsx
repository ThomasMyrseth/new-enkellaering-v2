import NewStudentForm from "@/components/newStudentForm";
import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";
import { TeacherFocusCards } from "@/components/ui/teacherCard/newTeacherCard";

export default function BestillPage() {
    
    return (<div className="text-center w-full h-full bg-slate-200 dark:bg-slate-950 space-y-10 p-10">

            <NewStudentForm/>
            <Prices/>
            <div className="space-y-10 flex flex-col items-center justify-center w-full">
              <TeacherFocusCards/>
            </div>

    </div>)
}



function Prices() {
  return (<>
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
        <CardItem
          translateZ="50"
          className="flex flex-col w-full items-center justify-center font-bold text-neutral-600 dark:text-white"
        >
        <p className="w-full text-center text-3xl relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">540 kroner per time<br/><span className="font-light">- uansett hva</span></p>
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
        >
          Uavhengig av om dere øsnker fysisk eller digital undervisning, en innspurt til eksamen eller et maraton ut skoleåret tar vi den samme prisen.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <Image
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-5">
          <CardItem
            translateZ={20}
            as={Link}
            href="https://twitter.com/mannupaaji"
            target="__blank"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
          >
            <p className="text-neutral-500 text-sm dark:text-neutral-300">Vi fakturerer dere etterskuddvis på slutten av hver måned, der dere betaler kun for de timene dere har hatt. 
            <br/> Det betyr ingen bindingstid og fullstendig fleksibilitet.
            </p>
            <br/>
            <p className="text-neutral-500 text-sm dark:text-neutral-300">
              * Alle timer må avbestilles minst én virkedag (24 timer) før. 
              Dersom avbestillingen skjer etter dette vil dere bli fakturert for hele den planlagte tiden. Avbestillinger skjer ved å kontakte deres lærer per SMS.</p>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  </>);
}
//
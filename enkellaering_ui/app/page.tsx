"use client"
import Image from "next/image";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { TeacherFocusCards } from "@/components/ui/teacherCards";
import NewStudentForm from "@/components/newStudentForm"
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { motion } from "framer-motion";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { WavyBackground } from "@/components/ui/wavy-background";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  return (<>       
    <div className="flex flex-col w-full space-y-10 items-center justify-center bg-slate-200 dark:bg-slate-950 py-10 px-10">

      <BackgroundBeamsWithCollision className="rounded-lg">
        <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
          Enkel Læring <br/>{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
              <span className="">Slik det alltid skulle ha vært</span>
            </div>
          </div>
        </h2>
      </BackgroundBeamsWithCollision>

      <div className="w-full bg-white dark:bg-black rounded-lg">
      <NewStudentForm/>
      </div>

      <div className="bg-white dark:bg-black rounded-lg w-full p-4 space-y-6 flex flex-col items-center justify-center">
      <h1 className="text-5xl ">Møt våre <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">helter</span></h1>
      <TeacherFocusCards/>
      </div>

    </div>
  </>)
}

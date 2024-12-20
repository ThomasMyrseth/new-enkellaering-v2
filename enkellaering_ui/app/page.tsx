"use client"
import { TeacherFocusCards } from "@/components/ui/teacherCards";
import NewStudentForm from "@/components/newStudentForm"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";


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

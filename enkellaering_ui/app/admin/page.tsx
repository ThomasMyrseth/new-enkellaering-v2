"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
  
import { DailyRevenueChart } from "./dailyRevenue";
import { TeacherName } from "./teacherName";
import { NewStudentsWorkflow } from "./newStudentsWorkflow";
import { PreviousClassesForEachTeacher } from "./previousClassesForEachTeacher";
import { PreviousClassesForEachStudent } from "./previousClassesForEachStudent";
import { NewStudentsWithoutTeacher } from "./newStudentWithPrefferedteacher";
import Quiz from "./quiz/main";

import { Teacher } from "./types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;




export default function AdminPage() {
    const token = localStorage.getItem('token')
    const router = useRouter()
    const [teacher, setTeacher] = useState<Teacher>()


    //fetch the current logged in teacher, and redirect if he is not admin
    useEffect(() => {

      async function fetchTeacher() {
        try {
          const response = await fetch(`${BASEURL}/get-teacher`, {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
    
          if (!response.ok) {
            alert("Failed to fetch teacher: " + response.statusText);
            
            return false
          }
    
          const data = await response.json();
          const teacher = data.teacher;

          if (!teacher) {
            console.log("error fetching teacher!")
            router.push("/error")
          }
          if (!teacher.admin) {
            console.log(`${teacher.firstname} er ikke admin!`)
            router.push("/login-laerer")
          }

          setTeacher(teacher)

        } 
        catch (error) {
          console.error("Error fetching teacher:", error);
          router.push("/error")
        }
      }
      fetchTeacher()
    },[router, token])

    //this user is an admin
    if (!teacher) {
        return <p>Loading...</p>
    }

    return (<div className="flex flex-col items-center justify-center w-full space-y-10 min-h-screen">
        <TeacherName teacher={teacher}/>
        <div className="flex flex-col items-center justify-center w-full md:w-3/4 max-w-screen-lg space-y-10 mx-auto px-4">
          <NewStudentsWithoutTeacher />
          <Quiz/>
          <DailyRevenueChart />
          <PreviousClassesForEachTeacher />
          <PreviousClassesForEachStudent />
          <NewStudentsWorkflow />
          {/* <NewStudentsWithoutTeacherPage /> */}

        </div>
        <div className="h-10"> </div>

    </div>)
}





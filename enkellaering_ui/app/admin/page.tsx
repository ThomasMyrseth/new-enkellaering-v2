"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
  
import { DailyRevenueChart } from "./dailyRevenue";
import { TeacherName } from "./teacherName";
import { NewStudentsWorkflow } from "./newStudentsWorkflow";
import { PreviousClassesForEachTeacher } from "./previousClassesForEachTeacher copy";
import { PreviousClassesForEachStudent } from "./previousClassesForEachStudent";

import { Teacher } from "./types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;




export default function AdminPage() {
    const router = useRouter()
    const [teacher, setTeacher] = useState<Teacher>()

    function handleSetTeacher(teacher: Teacher) {
        setTeacher(teacher)
    }

    useProtectAdmin({handleSetTeacher})

    //this user is an admin
    if (!teacher) {
        return <p>Loading...</p>
    }

    if(!teacher.admin) {
        console.log("Du er ikk en admin")
        router.push("/login-teacher")
    }

    return (<div className="flex flex-col items-center justify-center w-full space-y-10 min-h-screen">
        {/* <TeacherName teacher={teacher}/> */}
        <div className="flex flex-col items-center justify-center w-3/4 max-w-screen-lg space-y-10 mx-auto px-4">
          {/* <DailyRevenueChart />
          <PreviousClassesForEachTeacher />
          <PreviousClassesForEachStudent /> */}
          <NewStudentsWorkflow />
        </div>
        <div className="h-10"> </div>

    </div>)
}


import { useEffect } from "react";

const useProtectAdmin = ({ handleSetTeacher }: { handleSetTeacher: (teacher: Teacher) => void }) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
    useEffect(() => {
      const fetchTeacher = async () => {
        try {
          const response = await fetch(`${BASEURL}/get-teacher`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            alert("Failed to fetch teacher: " + response.statusText);
            setIsAdmin(false);
            return;
          }
  
          const data = await response.json();
          const teacher = data.teacher;
  
          handleSetTeacher(teacher);
  
          if (teacher.admin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching teacher:", error);
          setIsAdmin(false);
        }
      };
  
      fetchTeacher();
    }, []);
  
    return isAdmin;
};







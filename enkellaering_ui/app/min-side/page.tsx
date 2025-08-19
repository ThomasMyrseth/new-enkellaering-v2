"use client"
import { useEffect, useState } from "react";

import LeaveReview from "./review";
import { Student, Teacher } from "../admin/types";

import { StudentName } from "./studentName";
import { MyTeachers } from "./myTeacher";
import { PreviousClasses } from "./previousClasses";
import OrderCardsCarouselDemo from "./newStudents/orderCards";
import { useRouter } from "next/navigation";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/server";


export default function MinSideStudentPage() {
    const router = useRouter()
    const token = localStorage.getItem('token') || ''
    const isTeacher = localStorage.getItem('isTeacher')
    const [student, setStudent] = useState<Student>()
    const [teachers, setTeachers] = useState<Teacher[]>()


    //fetch data
    useEffect( () => {

        if (!token || isTeacher === "true") {
            router.push('/login')
        }

        async function fetchData() {
            const s = await fetchStudent(token)
            const t = await fetchTeacher(token)
    
            if (t) {
                setTeachers(t)
            }
            else {
                setTeachers([])
            }
            if (s) {
                setStudent(s)
            }
        }
        fetchData()
    },[])

    if (!student || !teachers) {
        return (<>
            <p>Loading...</p>
        </>)
    }

    if (!student.is_active) {
        return (
            <div className="min-h-screen bg-gradient-to-br w-full from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Konto inaktiv
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Din tilgang til Enkel Læring er satt til inaktiv
                        </p>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kontoen er satt til inaktiv fordi dere ikke har hatt timer på en god stund. 
                            Læreren deres får dere ikke lenger opp på sin min-side.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Kontaktinformasjon
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Thomas Myrseth</p>
                                    <p className="text-blue-600 dark:text-blue-400">471 84 744</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Karoline Aasheim</p>
                                    <p className="text-blue-600 dark:text-blue-400">906 56 969</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">E-post</p>
                                    <p className="text-blue-600 dark:text-blue-400">kontakt@enkellaering.no</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Ta kontakt dersom</span> dette er en feil 
                                eller dere ønsker å starte opp med privatundervisning igjen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center  w-full min-h-screen bg-slate-200 dark:bg-slate-900">
            <StudentName student={student} />
            <div className="flex flex-col items-center justify-center m-4">
                <OrderCardsCarouselDemo/>
                <MyTeachers teachers={teachers} />
                <PreviousClasses student={student} />
                <LeaveReview baseUrl={BASEURL} token={token} teachers={teachers} student={student} />
            </div>

        </div>
    );
}




async function fetchTeacher(token :string) {
    const response = await fetch(`${BASEURL}/get-teacher-for-student`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    const teachers : Teacher[]= data.teachers
    
    if (!teachers || Object.keys(teachers).length === 0) {
        return false;
    } else {
        return teachers
    }
}

async function fetchStudent(token :string) {
    const response = await fetch(`${BASEURL}/get-student`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        return false;
    }


    const data = await response.json()
    return data.student
}


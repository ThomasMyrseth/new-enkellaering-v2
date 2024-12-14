"use client"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

type Student = {
    user_id: string,
    firstname_parent: string,
    lastname_parent: string,
    email_parent: string,
    phone_parent: string,

    firstname_student: string,
    lastname_student: string,
    phone_student: string,

    main_subjects: string,
    address: string,
    postal_code: string,
    has_physical_tutoring: boolean,
    created_at: string,
    additional_comments: string,
    your_teacher: string
}

export default function MinSideStudentPage() {
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname.split('/'); // Split the pathname into segments
    const userId :string= segments[2].toString(); // Extract the 'user_id' from the correct position
    const [student, setStudent] = useState<Student>()

    return(<>

    </>)
}
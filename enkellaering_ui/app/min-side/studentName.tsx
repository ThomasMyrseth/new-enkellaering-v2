import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { Student } from "../admin/types";

export function StudentName({student} : {student: Student}) {
    const firstname_parent :string = student.firstname_parent
    const lastname_parent :string = student.lastname_parent
    const firstname_student :string = student.firstname_student
    const lastname_student :string = student.lastname_student


    return (<>
        <LampContainer>
            <motion.h1
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
                }}
                className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
                {firstname_parent} {lastname_parent}
                <br />
                & {firstname_student} {lastname_student}
            </motion.h1>
        </LampContainer>
    </>)
}

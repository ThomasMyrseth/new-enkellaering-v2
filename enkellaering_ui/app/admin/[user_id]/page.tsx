"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart";
  
  import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "path";
  

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

type Teacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    hourly_pay: string;
    resgined: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
}

type Classes = {
    teacher_user_id :string;
    student_user_id :string;
    created_at: string;
    started_at: string;
    ended_at: string;
    comment: string;
    paid_teacher: boolean;
    invoiced_student: boolean;
    paid_teacher_at :string;
    invoiced_student_at :string;
    class_id :string;
};


export default function AdminPage() {
    const router = useRouter()
    const [teacher, setTeacher] = useState<Teacher>()
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname.split('/'); // Split the pathname into segments
    const userId :string= segments[2].toString(); // Extract the 'user_id' from the correct position

    function handleSetTeacher(teacher: Teacher) {
        setTeacher(teacher)
    }

    protectAdmin({user_id: userId, handleSetTeacher})

    //this user is an admin
    if (!teacher) {
        return <p>Loading...</p>
    }

    if(!teacher.admin) {
        console.log("Du er ikk en admin")
        router.push("/login-teacher")
    }

    return(<div>
        <TeacherName teacher={teacher}/>
        <DailyRevenueChart admin_user_id={userId}/>
        <PreviousClassesForEachStudent user_id={userId}/>
        <br/>
        <NewStudentsWorkflow user_id={userId}/>

    </div>)
}

function protectAdmin( {user_id, handleSetTeacher} :{user_id: string, handleSetTeacher: (teacher: Teacher) => void}) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    
    useEffect( () => {

        async function fetchTeacher(user_id :string) {
            const response = await fetch(`${BASEURL}/get-teacher`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "user_id": user_id
                })
            })
    
            if (!response.ok) {
                alert("failed to fetch teacher: " + response.statusText)
                setIsAdmin(false)
            }

            const data = await response.json()
            const teacher = data.teacher
            handleSetTeacher(teacher)

            if (teacher.admin) {
                setIsAdmin(true)
            }
            else {
                setIsAdmin(false)
            }
        }
        fetchTeacher(user_id)

    },[BASEURL, user_id])

    return isAdmin
}


function TeacherName({teacher} : {teacher: Teacher}) {
    const teacherFirstname = teacher.firstname;
    const teacherLastname = teacher.lastname;



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
                <span className="text-light-">Velkommen til admin</span>
                <br/>
                {teacherFirstname} {teacherLastname}
            </motion.h1>
        </LampContainer>
    </>)
}



function calculatePayment(classSession: Classes, hourlyCharge: number): number {
    const start = new Date(classSession.started_at);
    const end = new Date(classSession.ended_at);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = end.getTime() - start.getTime();
  
    // Convert milliseconds to hours
    const durationInHours = differenceInMilliseconds / (1000 * 60 * 60);
  
    // Calculate the payment
    const payment = durationInHours * hourlyCharge;
  
    return Math.round(payment); // Optional: Round to the nearest integer
}

type FormattedClass = {
    started_at: string;
    payment: number;
}
function getDaysInMonth(year :number, month :number) {
    // Create a date object for the first day of the next month
    let date = new Date(year, month, 0);
    // Get the day, which represents the number of days in the month
    return date.getDate();
}

function DailyRevenueChart({ admin_user_id }: { admin_user_id :string }) {
    const [chartData, setChartData] = useState<Classes[]>()
    const [formattedChartData, setFormattedChartdata] = useState<FormattedClass[]>([])
    const [totalPayment, setTotalPayment] = useState<number>(0); // Use state for totalPayment


    const chartConfig = {
        desktop: {
        label: "Desktop",
        color: "#2563eb",
        },
        mobile: {
        label: "Mobile",
        color: "#60a5fa",
        },
    } satisfies ChartConfig

    useEffect( () => {
        async function fetchRevenue() {
            try {
                const response = await fetch(`${BASEURL}/get-all-classes`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "admin_user_id": admin_user_id
                    })
                })

                if (!response.ok) {
                    alert("An error happened while fetching revenue")
                }

                const data = await response.json()
                const classes = data.classes

                setChartData(classes)

            }
            catch {
                alert("An error happened while fetching revenue")
            }
        }
        fetchRevenue()
    },[BASEURL, admin_user_id])

    //aggregate payments
    useEffect(() => {
        //go thrugh each day of the month
        const currentDate = new Date(); // Get the current date and time
        const currentMonth = currentDate.getMonth(); // Get the current month (0-11)
        const numberOfDays = getDaysInMonth(currentDate.getFullYear(), currentMonth + 1); // Get the number of days in the current month
        let totalPayment :number =0;

        //go through classses and populate chartdata by each day
        for (let day = 1; day <= numberOfDays; day++) {
            const thisDate :Date= new Date(currentDate.getFullYear(), currentMonth, day);
            const thisDateString: string = thisDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

            let totalPaymentToday :number = 0
            chartData?.forEach( c => {
                const startedAtDate = new Date(c.started_at);
                const startedAtString = startedAtDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

                if (startedAtString === thisDateString) {
                    totalPaymentToday += calculatePayment(c, 540);
                }
            })

            const formattedClass = {
                started_at: thisDateString,
                payment: totalPaymentToday
            }

            setFormattedChartdata(prevData => [...prevData, formattedClass])
            totalPayment += totalPaymentToday
        }

        setTotalPayment(totalPayment)

      }, [chartData, admin_user_id]);
    
    
    if (formattedChartData?.length === 0) {
        return <p>Loading...</p>;
    }


    return(<div className="w-3/4 h-full p-4">
        <Card>
        <CardHeader>
            <CardTitle>Ufakturerte timer for alle lærere</CardTitle>
            <CardDescription>
                {new Date().toLocaleString("en-US", { month: "long" }).toUpperCase()}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={formattedChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="dag"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="payment" fill="#FF5733" radius={4} />
            </BarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter>
            <h4>Totalt ufakturert denne måneded: <span className="font-bold">{totalPayment}</span>kr.</h4>

        </CardFooter>

        </Card>
    </div>)
}




import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { setegid } from "process";

type classesJoinTeacher = {
    classes: Classes[];
    teacher: Teacher;
}

function PreviousClassesForEachStudent({user_id}: {user_id: string}) {      

    const [classes, setClasses] = useState<Classes[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classesByTeacher, setClassesByTeacher] = useState<classesJoinTeacher[]>([]);

    const [loading, setLoading] = useState<boolean>(true)
    let totalAmount :number = 0

    //get classes for everyone
    useEffect( () => {
        async function fetchClasses() {
            const response = await fetch(`${BASEURL}/get-all-classes`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "admin_user_id": user_id
                })
            })

            if(!response.ok) {
                alert("En feil har skjedd, prøv igjen")
                return null;
            }

            const data = await response.json()
            const classes = data.classes

            if (classes.length === 0) {
                setClasses([])
                setLoading(false)
            }
            else {
                setClasses(classes)
                setLoading(false)
            }
        }
        fetchClasses()
    
    },[user_id])

    //get all the teachers
    useEffect( () => {
        async function getAllTeachers() {

            const response = await fetch(`${BASEURL}/get-all-teachers`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "admin_user_id": user_id
                })
            })

            if (!response.ok) {
                alert("Error fetching teachers " + response.statusText)
                setTeachers([])
                return null
            }

            const data = await response.json()
            const teachers :Teacher[] = data.teachers

            if (teachers.length===0) {
                alert("No teachers found")
                console.log("No teachers found")
                setTeachers([])
                return null
            }

            else {
                setTeachers(teachers)
            }
        }

        getAllTeachers()
    },[BASEURL, user_id])


    //map each teacher to his classes
    useEffect( () => {
        
        if (!classes || !teachers) {
            alert("Teachers or classes not found")
        }

        const classesByTeacher :classesJoinTeacher[] = []
        //for each teacher go through every class
        teachers.forEach(t => {
            const classesForTeacher :Classes[] = []
            classes.forEach(c => {
                if (c.teacher_user_id === t.user_id) {
                    classesForTeacher.push(c)
                }
            })
            classesByTeacher.push({
                classes: classesForTeacher,
                teacher: t
            })
        })

        setClassesByTeacher(classesByTeacher)

    },[classes, teachers])

    if (loading) {
        return <p>Loading...</p>
    }

      
    return (<div className="flex flex-col justify-center items-center w-3/4">
        <h2>En oversikt over tidligere timer</h2>

        {classesByTeacher.map((ct :classesJoinTeacher, index) => {
            const classes :Classes[] = ct.classes

            //sortng classes by startedAt
            classes.sort((a, b) => {
                const dateA = new Date(a.started_at);
                const dateB = new Date(b.started_at);
                return dateA.getTime() - dateB.getTime();
            });


            const teacherHourlyPay :number = parseInt(ct.teacher.hourly_pay)
            let totalUnpaidToTeacher :number = 0
            let totalUnpaidHoursToTeacher :number = 0
            let totalPaidToTeacher :number = 0
            let totalPaidHoursToTeacher :number = 0

            let totalUninvoicedByTeacher :number =0
            let totalUninvoicedHoursByTeacher :number =0
            let totalInvoicedByTeacher :number =0
            let totalInvoicedHoursByTeacher :number =0


        return (<div key={index}>
            <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="remaining-classes">
                <AccordionTrigger>{ct.teacher.firstname} {ct.teacher.lastname}</AccordionTrigger>
                <AccordionContent>
                <Table>
                    <TableCaption>Kronologisk oversikt over alle timer til {ct.teacher.firstname}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Dato</TableHead>
                            <TableHead>Varighet</TableHead>
                            <TableHead>Fakturert elev</TableHead>
                            <TableHead className="text-right">Fakturert beløp</TableHead>
                            <TableHead>Betalt lærer</TableHead>
                            <TableHead>Beløp til lærer</TableHead>
                            <TableHead>Kommentar fra timen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {classes.map( (c :Classes, index) => {
                        const startedAt: Date = new Date(c.started_at);
                        const endedAt: Date = new Date(c.ended_at);
                        const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                        const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                        const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                        const invoiceAmount: number = durationHours * 540 + (durationMinutes / 60) * 540;
                        const toTeacherAmmount :number = durationHours * teacherHourlyPay + (durationMinutes / 60) * teacherHourlyPay;

                        if (!c.invoiced_student) {
                            totalUninvoicedHoursByTeacher += durationHours + Math.round(durationMinutes/60)
                            totalUninvoicedByTeacher += invoiceAmount
                        }
                        else {
                            totalInvoicedHoursByTeacher += durationHours + Math.round(durationMinutes/60)
                            totalInvoicedByTeacher += invoiceAmount
                        }

                        if (!c.paid_teacher) {
                            totalUnpaidToTeacher += toTeacherAmmount
                            totalUnpaidHoursToTeacher += durationHours + Math.round(durationMinutes/60)
                        }
                        else {
                            totalPaidHoursToTeacher += durationHours + Math.round(durationMinutes/60)
                            totalPaidToTeacher += toTeacherAmmount
                        }
                        
                        return (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{c.started_at}</TableCell>
                            <TableCell>{`${durationHours}t ${durationMinutes}min`}</TableCell>
                            <TableCell>
                            {c.invoiced_student ? (
                                <p className="text-green-400">Fakturert</p>
                            ) : (
                                <p className="text-red-400">Ufakturert</p>
                            )}
                            </TableCell>
                            <TableCell className="text-right">{invoiceAmount}kr</TableCell>

                            <TableCell>
                            {c.paid_teacher ? (
                                <p className="text-green-400">Betalt</p>
                            ) : (
                                <p className="text-red-400">Ikke betalt</p>
                            )}
                            </TableCell>
                            <TableCell className="text-right">{toTeacherAmmount}kr</TableCell>
                            <TableCell>{c.comment}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                <br/>
                <p>Totalt ufakturerte timer fra {ct.teacher.firstname}: <span className="text-red-400">{totalUninvoicedHoursByTeacher}h, {totalUninvoicedByTeacher}kr.</span></p>
                <p>Totalt ikke betalt til {ct.teacher.firstname}: <span className="text-red-400">{totalUnpaidHoursToTeacher}h, {totalUnpaidToTeacher}kr.</span></p>
                <br/>
                <p>Total fakturerte timer fra {ct.teacher.firstname}: <span className="text-green-400">{totalInvoicedHoursByTeacher}h, {totalInvoicedByTeacher}kr.</span></p>
                <p>Totalt betalt til {ct.teacher.firstname}: <span className="text-green-400">{totalPaidHoursToTeacher}h, {totalPaidToTeacher}kr.</span></p>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        </div>)
        })}
    </div>
  );
}

type NewStudent = {
    phone :string;
    created_at: string
    has_called :boolean;
    called_at :string;
    has_answered: boolean;
    answered_at: string;
    has_signed_up: boolean;
    signed_up_at: string;
    from_referal: boolean;
    referee_phone: string;
    has_assigned_teacher: boolean;
    assigned_teacher_user_id: string | null;
    assigned_teacher_at: string;
    has_finished_onboarding: boolean;
    finished_onboarding_at: string;
    comments: string;
    paid_referee: boolean;
    paid_referee_at: string;
    new_student_id: string;
}

function NewStudentsWorkflow({user_id}: {user_id: string}) {
    const [loading, setLoading] = useState<boolean>(true)
    const [newStudents, setNewStudents] = useState<NewStudent[]>()

    //get all new students
    useEffect( () => {
        async function getNewStudents() {
            const response = await fetch(`${BASEURL}/get-new-students`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "admin_user_id": user_id
                })
            })

            if (!response.ok) {
                alert("Error fetching new students " + response.statusText)
                return null
            }

            const data = await response.json()
            const newStudents :NewStudent[] = data.new_students

            if (newStudents.length===0) {
                console.log("No new students found")
                setLoading(false)
                setNewStudents([])
                return null
            }

            else {
                setNewStudents(newStudents)
                setLoading(false)
            }
        }

        getNewStudents()
    },[user_id, BASEURL])

    if (loading ) {
        return <p>Loading...</p>
    }

    if (!newStudents) {
        return <p>No new students found</p>
    }


    return NewStudentTable(newStudents, user_id)
    

}

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"


function NewStudentTable(newStudents :NewStudent[], user_id :string) {

    return (<>
        <Table>
                <TableCaption>Arbeidsoversikt for ny elev</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Telefonnummer</TableHead>
                            <TableHead>Jeg har ringt</TableHead>
                            <TableHead>Ny elev har svart</TableHead>
                            <TableHead>Ny elev har opprettet konto</TableHead>
                            <TableHead>Ny elev har fått lærer</TableHead>
                            <TableHead>Ny elev er en referanse</TableHead>
                            <TableHead>Referansen er betalt</TableHead>
                            <TableHead>Ny elev har fullført oppstart</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {newStudents.map( ns => {
                            return <NewStudentRow key={ns.new_student_id} ns={ns} admin_user_id={user_id}/>
                        })}
                    </TableBody>
                </Table>   
    </>)
}


function NewStudentRow({ ns, admin_user_id }: { ns: NewStudent; admin_user_id: string }) {
    const [teachers, setTeachers] = useState<Teacher[]>([])

    const [hasCalled, setHasCalled] = useState<boolean>(ns.has_called)
    const [calledAt, setCalledAt] = useState<Date>(new Date(ns.called_at))
    const [hasAnswered, setHasAnswered] = useState<boolean>(ns.has_answered)
    const [answeredAt, setAnsweredAt] = useState<Date>(new Date(ns.answered_at))
    const [hasSignedUp, setHasSignedUp] = useState<boolean>(ns.has_signed_up)
    const [signedUpAt, setSignedUpAt] = useState<Date>(new Date(ns.signed_up_at))
    
    const [fromReferal, setFromReferal] = useState<boolean>(ns.from_referal)
    const [refereePhone, setRefereePhone] = useState<string>(ns.referee_phone)
   
    const [hasAssignedTeacher, setHasAssignedTeacher] = useState<boolean>(ns.has_assigned_teacher)
    const [assignedTeacherAt, setAssignedTeacherAt] = useState<Date>(new Date(ns.assigned_teacher_at))
    const [assingedTeacherUserId, setAssignedTeacherUserId] = useState<string | null> (ns.assigned_teacher_user_id || null)
    
    const [paidReferee, setPaidReferee] = useState<boolean>(ns.paid_referee)
    const [paidRefereeAt, setPaidRefereeAt] = useState<Date>(new Date(ns.paid_referee_at))
    
    const [hasFinishedOnboarding, setHasFinishedOnboarding] = useState<boolean>(ns.has_finished_onboarding)
    const [finishedOnboardingAt, setFinishedOnboardingAt] = useState<Date>(new Date(ns.finished_onboarding_at))
    const [comments, setComments] = useState<string>(ns.comments)


    console.log("NS teacher", assingedTeacherUserId)
    //get all the teachers
    useEffect( () => {
        async function getAllTeachers() {

            const response = await fetch(`${BASEURL}/get-all-teachers`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "admin_user_id": admin_user_id
                })
            })

            if (!response.ok) {
                alert("Error fetching teachers " + response.statusText)
                setTeachers([])
                return null
            }

            const data = await response.json()
            const teachers :Teacher[] = data.teachers

            if (teachers.length===0) {
                alert("No teachers found")
                console.log("No teachers found")
                setTeachers([])
                return null
            }

            else {
                setTeachers(teachers)
            }
        }

        getAllTeachers()
    },[BASEURL, admin_user_id])




    const handleSetCalled = (value :string) => {
        const isCalled = value === "Ja"; // Convert value to boolean
        setHasCalled(isCalled)
        setCalledAt(new Date())
    }

    const handleSetAnswered = (value :string) => {
        const isAnswered = value === "Ja"; // Convert value to boolean
        setHasAnswered(isAnswered)
        setAnsweredAt(new Date())
    }

    const handleAssignTeacher = (teacherUserId :string) => {
        setHasAssignedTeacher(true)
        setAssignedTeacherAt(new Date())
        setAssignedTeacherUserId(teacherUserId)
        console.log("assigning", teacherUserId)
    }

    const handleSetFinishedOnboarding = (value :string) => {
        const isFinishedOnboarding = value === "Ja"; // Convert value to boolean
        setHasFinishedOnboarding(isFinishedOnboarding)
        setFinishedOnboardingAt(new Date())
    }

    const handleSetPaidReferee = (value :string) => {
        const isPaidReferee = value === "Ja"; // Convert value to boolean
        setPaidReferee(isPaidReferee)
        setPaidRefereeAt(new Date())
    }

    const handleSaveClick = async () => {
        console.log("saving teacher ", assingedTeacherUserId)

        const response = await fetch(`${BASEURL}/update-new-student`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "new_student_id": ns.new_student_id,
                "has_called": hasCalled,
                "called_at": calledAt || null,
                "has_answered": hasAnswered,
                "answered_at": answeredAt || null,
                "has_signed_up": hasSignedUp,
                "signed_up_at": signedUpAt || null,
                "from_referal": fromReferal,
                "referee_phone": refereePhone || null,
                "has_assigned_teacher": hasAssignedTeacher,
                "teacher_user_id":  assingedTeacherUserId || null,
                "assigned_teacher_at": assignedTeacherAt || null,
                "has_finished_onboarding": hasFinishedOnboarding,
                "finished_onboarding_at": finishedOnboardingAt || null,
                "comments": comments || null,
                "paid_referee": paidReferee,
                "paid_referee_at": paidRefereeAt || null,
                "admin_user_id": admin_user_id
            })
        })

        if (!response.ok) {
            alert("Error while saving updates to new student")
            return null;
        }
        else {
            alert("Oppdateringer lagret")
        }
        
    }

    return(
    <TableRow>
        <TableCell className="font-medium">tlf: {ns.phone} <br/> Opprettet: {ns.created_at}</TableCell>

        <TableCell>
            <RadioGroup onValueChange={handleSetCalled} defaultValue={ns.has_called? "Ja" : "Nei"} value={hasCalled? "Ja" : "Nei"}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>

        <TableCell>
            <RadioGroup defaultValue={ns.has_answered? "Ja" : "Nei"} value={hasAnswered? "Ja" : "Nei"} onValueChange={handleSetAnswered}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>

        <TableCell>
            {hasSignedUp ? (
                <span className="text-green-400">Ja</span>
            ) : (
                <span className="text-red-400">Nei</span>
            )}
        </TableCell>

        <TableCell>
            {fromReferal ? (
                <span className="text-gray-400">Ja, fra {refereePhone}</span>
            ) : (
                <span className="text-gray-400">Nei</span>

            )}
        </TableCell>

        <TableCell>
            <RadioGroup defaultValue={ns.paid_referee? "Ja" : "Nei"} value={paidReferee? "Ja" : "Nei"} onValueChange={handleSetPaidReferee}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroup value="Nei" className="text-red-400"></RadioGroup>
            </RadioGroup>
        </TableCell>

        <TableCell>
            <SetTeacherCombobox teachers={teachers} passSelectedTeacher={handleAssignTeacher} ns={ns}/>
        </TableCell>

        <TableCell>
        <RadioGroup defaultValue={ns.has_finished_onboarding? "Ja" : "Nei"} value={hasFinishedOnboarding? "Ja" : "Nei"} onValueChange={handleSetFinishedOnboarding}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroup value="Nei" className="text-red-400"></RadioGroup>
            </RadioGroup>
        </TableCell>

        <TableCell>
            <Textarea placeholder="Noter ned viktig info om eleven" value={comments} onChange={(e) => setComments(e.target.value)} rows={6}/>
        </TableCell>

        <TableCell>
            <Button onClick={handleSaveClick}>Lagre endringer i raden</Button>
        </TableCell>
    </TableRow>
    )
}


import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Newspaper } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const SetTeacherCombobox = ({ ns, teachers, passSelectedTeacher } : { ns :NewStudent, teachers : Teacher[], passSelectedTeacher : (userId :string) => void }) => {
    const [teacherUserId, setTeacherUserId] = useState<string | null>(ns.assigned_teacher_user_id ||null)
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [open, setOpen] = useState<boolean>(false)

    // Function to find the teacher by userId
    const findTeacherById = (userId: string | null) => {
        return teachers.find((teacher) => teacher.user_id === userId);
    };

    const handleSelectTeacher = (userId: string) => {
        console.log("selected: ", userId)
        setTeacherUserId(userId);
        const selectedTeacher = findTeacherById(userId) || null;
        setSelectedTeacher(selectedTeacher)
        passSelectedTeacher(userId)
    };

    useEffect( () => {
        const selectedTeacher = findTeacherById(teacherUserId) || null;
        setSelectedTeacher(selectedTeacher)
        console.log(selectedTeacher?.firstname)
    }, [teacherUserId, teachers])

    return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {teacherUserId
                ? selectedTeacher?.firstname + " " + selectedTeacher?.lastname
                : "Velg lærer"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandList>
                <CommandEmpty>Ingen lærere funnet</CommandEmpty>
                <CommandGroup>
                  {teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.user_id}
                      value={teacher.user_id}
                      onSelect={(currentValue) => {
                        handleSelectTeacher(currentValue)
                        setOpen(false)
                      }}
                    >
                      {teacher.firstname + " " + teacher.lastname}
                      <Check
                        className={cn(
                          "ml-auto",
                          teacherUserId === teacher.user_id
                            ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )
}
    

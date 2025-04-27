"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AlertDialog, AlertDialogDescription,AlertDialogCancel, AlertDialogAction, AlertDialogFooter,AlertDialogContent,  AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SessionDateTimePicker } from "@/components/ui/session-date-time-picker";

type Class = {
    class_id :string;
    comment: string; // Optional comment for the session
    created_at: string; // Timestamp when the record was created (ISO format)
    started_at: string; // Timestamp for when the session started (ISO format)
    ended_at: string; // Timestamp for when the session ended (ISO format)
    invoiced_student: boolean; // Indicates if the student was invoiced
    paid_teacher: boolean; // Indicates if the teacher was paid
    teacher_user_id :string;
    student_user_id :string;
    was_canselled :boolean;
};

type FormattedClass = {
    started_at: string;
    payment: number;
}

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

    est_hours_per_week : number
    is_active : boolean
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
    wants_more_students : boolean;
}

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


import { FileUploadForm } from "@/components/uploadTeacherImageForm";

export default function LaererPage() {
    const [teacher, setTeacher] = useState<Teacher>()
    const [classes, setClasses] = useState<Class[]>([])
    const [students, setStudents] = useState<Student[]>([])

    const token = localStorage.getItem('token'); // Or any secure storage method

    useEffect(() => {
        async function fetchTeacherName() {
            const response = await fetch(`${BASEURL}/get-teacher`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTeacher(data.teacher)
            }

            else {
                alert(response.statusText)
            }
        }

        //get classes for teacher
        async function fetchClasses() {
            const response = await fetch(`${BASEURL}/get-classes-for-teacher`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })

            if(!response.ok) {
                alert("En feil har skjedd, prøv igjen")
                return null;
            }

            const data = await response.json()
            const classes = data.classes

            setClasses(classes)
        }


        async function fetchStudents() {
            const response = await fetch(`${BASEURL}/get-students`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const r = await response.json()

            let students = r.students

            //order the students alfabetically
            students = students.sort( (a :Student, b :Student) => {
                const nameA = a.firstname_parent.toUpperCase()
                const nameB = b.firstname_parent.toUpperCase()
                if (nameA < nameB) {
                    return -1
                }
                if (nameA > nameB) {
                    return 1
                }
                return 0
            })
            setStudents(students)
        }

        fetchStudents()
        fetchClasses()
        fetchTeacherName()
    
    },[])

    if (!teacher) {
        return (<p>Loading...</p>)
    }

    return (<div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900">
            <TeacherName teacher={teacher}/>
            <WantMoreStudents teacher={teacher}/>

            <DailyRevenueChart teacher={teacher}/>
            <br />
            <AddNewClass teacher={teacher}/>
            <br/>
            <YourStudent teacher={teacher} classes={classes} students={students}/>
            <br/>
            <FileUploadForm firstname={teacher.firstname} lastname={teacher.lastname}/>

        <div className="p-4 m-4">
        </div>

    </div>)

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
                {teacherFirstname} {teacherLastname}
            </motion.h1>
        </LampContainer>
    </>)
}




function calculatePayment(classSession: Class, hourlyPay: number): number {
    const start = new Date(classSession.started_at);
    const end = new Date(classSession.ended_at);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = end.getTime() - start.getTime();
  
    // Convert milliseconds to hours
    const durationInHours = differenceInMilliseconds / (1000 * 60 * 60);
  
    // Calculate the payment
    const payment = durationInHours * hourlyPay;
  
    return Math.round(payment); // Optional: Round to the nearest integer
}

function DailyRevenueChart({ teacher }: { teacher: Teacher }) {
    const token = localStorage.getItem('token')

    const [chartData, setChartData] = useState<Class[]>()
    const [formattedChartData, setFormattedChartdata] = useState<FormattedClass[]>()
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
                const response = await fetch(`${BASEURL}/fetch-classes-for-teacher`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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
    },[])


    useEffect(() => {
        if (chartData) {
          // Aggregate payments by date
          const aggregatedData = chartData.reduce<FormattedClass[]>((acc, c: Class) => {

            //skip the class if it is already paid out
            if (c.paid_teacher) {
                return acc;
            }

            // Format the date
            const date = new Date(c.started_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
      
            // Calculate the payment for this class
            const payment = calculatePayment(c, parseInt(teacher?.hourly_pay));

      
            // Check if the date already exists in the accumulator
            const existingEntry = acc.find((entry: FormattedClass) => entry.started_at === date);
            if (existingEntry) {
              // If the date exists, add the payment to the existing total
              existingEntry.payment += payment;
            } else {
              // If the date doesn't exist, add a new entry
              acc.push({ started_at: date, payment });
            }
      
            return acc;
          }, []);
      
          // Sort the aggregated data chronologically
          const sortedData = aggregatedData.sort((a, b) => {
            const dateA = new Date(a.started_at).getTime();
            const dateB = new Date(b.started_at).getTime();
            return dateA - dateB; // Ascending order
          });
      
          setFormattedChartdata(sortedData);

          const total = aggregatedData.reduce(
            (sum, current) => sum + current.payment,
            0
          );
          setTotalPayment(total);
        
        }
      }, [chartData, teacher]);
    
    
    // if (formattedChartData?.length === 0) {
    // return <p>Loading...</p>;
    // }
    

    return(<div className="w-3/4 p-4">
        <Card>
        <CardHeader>
            <CardTitle>Timer du ikke har fått betalt for</CardTitle>
            <CardDescription>
                {new Date().toLocaleString("en-US", { month: "long" }).toUpperCase()}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={formattedChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="started_at"
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
            <h4>Totalt: <span className="font-bold">{totalPayment}</span>kr.</h4>

        </CardFooter>

        </Card>
    </div>)
}






function AddNewClass({teacher}: {teacher: Teacher}) {
    const [selectedStudentUserId, setSelectedStudentUserId] = useState<string>()
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [comment, setComment] = useState<string>()
    const [success, setSuccess] = useState<boolean>()
    const [wasCanselled, setWasCanselled] = useState<boolean>(false)

    const handleStudentSelect = (userId: string) => {
        console.log("setting user id", userId)
        setSelectedStudentUserId(userId);
    };

    const handleStartDateSelect = (startDate :Date) => {
        setStartDate(startDate)
    }
    const handleEndDateSelect = (endDate :Date) => {
        setEndDate(endDate)
    }

    const handleSetComment = (comment :string) => {
        setComment(comment)
    }

    const handleSetCanselled = (canselled :boolean) => {
        setWasCanselled(canselled)
    }

    const handleSetSucces = (s :boolean) => {
        setSuccess(s)
        setSelectedStudentUserId('')
        setStartDate(undefined)
        setEndDate(undefined)
        setComment(undefined)
    }


    if (!teacher) {
        return (<p>Loading...</p>)
    }
    
    
    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Legg til ny time</CardTitle>
                <CardDescription>Legg til en ny time med en elev</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    <SelectStudent onStudentSelect={handleStudentSelect}/>
                    <br />
                    <SessionDateTimePicker 
                        onStartTimeSelected={handleStartDateSelect}
                        onEndTimeSelected={handleEndDateSelect}
                    />
                    <br />
                    <AddComment onAddComment={handleSetComment}/>
                    <WasCanselled onWasCanselled={handleSetCanselled}/>
                </div>
            </CardContent>
            <CardFooter>
                <SendButton 
                    teacher={teacher}
                    started_at={startDate}
                    ended_at={endDate}
                    comment={comment}
                    selectedStudentUserId={selectedStudentUserId}
                    wasCanselled={wasCanselled}
                    setUploadSuccessfull={handleSetSucces}
                />
            </CardFooter>
        </Card>
    )
}


function SelectStudent({ onStudentSelect} : {onStudentSelect: (user_id:string)=> void}) {
    const token = localStorage.getItem('token')
    const [students, setStudents] = useState<Student[]>([])
    const [selectedStudentUserId, setSelectedStudentUserId] = useState<string | undefined>();


    useEffect( () => {
        async function fetchStudents() {
            const response = await fetch(`${BASEURL}/get-students`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()

                const students :Student[]= data.students.sort( (a :Student, b :Student) => {
                    const nameA = a.firstname_parent.toUpperCase()
                    const nameB = b.firstname_parent.toUpperCase()
                    if (nameA < nameB) {
                        return -1
                    }
                    if (nameA > nameB) {
                        return 1
                    }
                    return 0
                })
                setStudents(students)

                // Automatically select the first student only once
                if (data.students.length > 0) {
                    const firstStudentId = data.students[0].user_id;
                    setSelectedStudentUserId(firstStudentId);
                    onStudentSelect(firstStudentId);
                }
            }
            else {
                alert(response.statusText)
            }
        }
        fetchStudents()

    },[token])



    const handleValueChange = (user_id: string) => {
        setSelectedStudentUserId(user_id); // Update state with selected user_id
        onStudentSelect(user_id); // Notify parent
    };

    
    return (
        <div className="w-full h-full flex flex-col items-center">
            <h3 className="pb-4">Hvem hadde du i dag?</h3>
            <RadioGroup 
                value={selectedStudentUserId} // Controlled by state
                onValueChange={handleValueChange} // Update state on change
            >
                {students.map((student: Student, index: number) => {
                    if (student.is_active===false) {
                        return null;
                    }

                    const optionValue = student.user_id;
                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionValue} id={optionValue} />
                            <Label htmlFor={optionValue}>
                                <p>{student.firstname_parent} {student.lastname_parent}</p>
                                <p className="text-sm text-neutral-600">& {student.firstname_student} {student.lastname_student}</p>
                            </Label>
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className="mb-4">{children}</div>;
};


function AddComment({onAddComment} : {onAddComment: (comment: string) => void   }) {

    const [comment, setComment] = useState<string>('')

    const handleAddComment = (comment: string) => {
        setComment(comment)
        onAddComment(comment)
    }


    return(<>
        <div className=" w-full mx-auto m-4 p-4 shadow-input flex flex-col justify-center text-center">
            <h3>Hvordan var timen?</h3>
            <LabelInputContainer >
              <Textarea  
                rows={10} 
                className="w-full" 
                value={comment} 
                onChange={(e) => handleAddComment(e.target.value)} 
                id="comment" 
                placeholder="I dag jobbet vi med trigonometri!
                Vi startet med å se på sinussetningen og arealsetningen før vi gikk videre på noen eksamensoppgaver.
                Dette fikk Andreas svært bra til, etter litt hjelp. Gleder meg masse til neste uke!"/>
            </LabelInputContainer>

        </div>
    
    </>)
}

function WasCanselled({onWasCanselled} : {onWasCanselled: (wasCanselled: boolean) => void}) {
    const [wasCanselled, setWasCanselled] = useState<boolean>(false)

    const handleToggle = () => {
        setWasCanselled(!wasCanselled)
        onWasCanselled(!wasCanselled)
    }
    
    return(<>
        <div className="w-full flex flex-col items-center space-x-2">
            <div className="flex items-center space-x-2">
                <Switch id="more-students" checked={wasCanselled} onCheckedChange={handleToggle}/>
                <Label htmlFor="more-students" className={`${wasCanselled ? '' : 'text-neutral-400'}`}>Timen var avbestilt mindre enn 24h før</Label>
            </div>
    </div>
  </>)
}



 



import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


type FullStudent = {
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
    your_teacher: string,

    is_active :boolean,
    est_hours_per_week :number
}

function YourStudent( {teacher, classes, students} : {teacher: Teacher, classes :Class[], students :Student[]}) {
    
    if (!teacher || !students) {
        return (<p>Loading...</p>)
    }

    

    return(<div className="w-3/4 bg-white dark:bg-black rounded-lg p-4 flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Dine elever</h2>
        <Accordion type="single" collapsible className="w-full">
            {students.map( (student, index) => {

                let totalDurationMillisLastFourWeeks :number = 0
                const fourWeeksAgo = new Date()
                fourWeeksAgo.setDate(fourWeeksAgo.getDate()-28)

                if (student.is_active===false) {
                    return null;
                }

                classes.map( (c :Class) => {
                    if (c.student_user_id===student.user_id && new Date(c.started_at).getTime() > fourWeeksAgo.getTime()) {
                        const durationMillis :number = new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()
                        totalDurationMillisLastFourWeeks += durationMillis
                    }
                })

                const totalDurationHours = Math.round(totalDurationMillisLastFourWeeks/(1000*60*60)*10)/10

                return (
                <AccordionItem value={index.toString()} key={index}>
                    <AccordionTrigger>
                        <div className="flex flex-row justify-between w-full mr-4">
                            <p className="text-left md:text-center w-3/4 md:w-1/2">{student.firstname_parent} {student.lastname_parent}
                                <br/>
                                & {student.firstname_student} {student.lastname_student}
                            </p>
                            <p className={`w-1/4 md:w-full text-right ${totalDurationHours < student.est_hours_per_week*4 ? "text-red-400" : "text-neutral-400"}`}>{totalDurationHours}/{student.est_hours_per_week*4}h de siste fire ukene</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p>
                            <h4 className="mb-1 font-semibold">Forelder</h4>
                            {student.firstname_parent} {student.lastname_parent}
                            <br/>
                            Tlf: {student.phone_parent}
                            <br/>
                            Epost: {student.email_parent}
                        </p>
                        <br/>
                        <p>
                            <h4 className="mb-1 font-semibold">Elev</h4>
                            {student.firstname_student} {student.lastname_student}
                            <br/>
                            Tlf: {student.phone_student}
                        </p>
                        <br/>
                        <p>
                            <h4 className="mb-1 font-semibold">Info</h4>
                            Hovedfag: {student.main_subjects}
                            <br/>
                            Spesielle forhold: {student.additional_comments}
                            <br/>
                            Hjemmeadresse: {student.address}
                            <br/>
                            Postnummer: {student.postal_code}
                            <br/>
                            {`${student.has_physical_tutoring? 'fysisk undervisning' : 'digital undervisning'}`}
                        </p>

                        <PreviousClasses student={student} teacher={teacher} allClasses={classes} />
                    </AccordionContent>
                </AccordionItem>
                )
                })}
        </Accordion>


    </div>)

}




import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"


import { DeleteClass } from "./deleteClass";

const PreviousClasses =  ({student, teacher, allClasses}  : {student :FullStudent, teacher :Teacher, allClasses :Class[]})  => {     

    const classes :Class[] = []
    const [firstTenClasses, setFirstTenclasses] = useState<Class[]>()
    const [remainingClasses, setRemainingClasses] = useState<Class[]>()
    const [loading, setLoading] = useState<boolean>(true)

    //sort classes cronologically by started at
    if (allClasses) {
        allClasses.sort((a, b) => {
            const dateA = new Date(a.started_at);
            const dateB = new Date(b.started_at);
            return dateB.getTime() - dateA.getTime();
        });
    }

    //filter out the classes for this student and sum them up
    allClasses.forEach( (c :Class) => {
        if (c.student_user_id === student.user_id) {
            classes.push(c)
        }
    })

    //split classes
    useEffect(() => {
        if (classes) {
            setFirstTenclasses(classes.slice(0, 10));
            setRemainingClasses(classes.slice(10));
        }
        
        setLoading(false)
    }, [classes]); // Only run when `classes` changes


    if (loading) {
        return <p>Loading...</p>
    }

      
    return (<div className="flex flex-col justify-center items-center w-full bg-white dark:bg-black rounded-lg p-4">
        <Table>
        <TableCaption>Tidligre timer med {student.firstname_student}</TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">Dato</TableHead>
                <TableHead>Varighet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Beløp</TableHead>
                <TableHead>Kommentar</TableHead>
                <TableHead>Slett time</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {firstTenClasses && firstTenClasses.map((c, index) => {
                const startedAt :Date = new Date(c.started_at); // Convert started_at to a Date object
                const endedAt :Date = new Date(c.ended_at);     // Convert ended_at to a Date object
                
                const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60)); // Whole hours
                const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes
                const amount: number = durationHours * parseInt(teacher.hourly_pay) + (durationMinutes / 60) * parseInt(teacher.hourly_pay); // Adding fractional hours

                return(
                    <TableRow key={index} className={`${c.was_canselled===true ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                        <TableCell className="font-medium">{c.started_at}</TableCell>
                        <TableCell>{`${durationHours}t ${Math.round(durationMinutes % 60)}min`}</TableCell>
                        <TableCell>{c.paid_teacher ? <p className="text-green-400">Betalt</p> : <p className="text-red-400">Ubetalt</p>}</TableCell>
                        <TableCell className="text-right">{amount}</TableCell>
                        <TableCell>{c.comment}</TableCell>
                        <TableCell><DeleteClass classId={c.class_id} hasPaid={c.paid_teacher} hasInvoiced={c.invoiced_student}/></TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
        </Table>

        {remainingClasses && (
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="remaining-classes">
            <AccordionTrigger>Vis flere timer</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableBody>
                  {remainingClasses.map((c, index) => {
                    const startedAt: Date = new Date(c.started_at);
                    const endedAt: Date = new Date(c.ended_at);
                    const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                    const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                    const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                    const amount: number = durationHours * parseInt(teacher.hourly_pay) + (durationMinutes / 60) * parseInt(teacher.hourly_pay);

                    return (
                      <TableRow key={index} className={`${c.was_canselled ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                        <TableCell className="font-medium">{c.started_at}</TableCell>
                        <TableCell>{`${durationHours}t ${durationMinutes}min`}</TableCell>
                        <TableCell>
                          {c.invoiced_student ? (
                            <p className="text-green-400">Betalt</p>
                          ) : (
                            <p className="text-red-400">Ubetalt</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{amount}kr</TableCell>
                        <TableCell>{c.comment}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

import { Switch } from "@/components/ui/switch"

  
const WantMoreStudents = ({teacher} : {teacher :Teacher}) => {
    const [wantMore, setWantMore] = useState<boolean>(teacher.wants_more_students);

    const handleToggle = async () => {
        const newState = !wantMore;
        setWantMore(newState);
        await setWantMoreStudents(newState); // Update on the backend
    };

    return(<>

    <Card className="flex flex-col items-center w-3/4 m-4">
      <CardHeader>
        <CardTitle>Ønsker du flere elever?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
            <Switch id="more-students" checked={wantMore} onCheckedChange={handleToggle}/>
            <Label htmlFor="more-students" className={`${wantMore ? '' : 'text-neutral-400'}`}>Jeg ønsker meg flere elever</Label>
        </div>
      </CardContent>
    
    </Card>
    </>)
}

const setWantMoreStudents = async (yesOrNo: boolean) => {
    const token = localStorage.getItem('token')

    const response = await fetch(`${BASEURL}/toggle-wants-more-students`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`, // Correct Authorization header format
            "Content-Type": "application/json"  // Ensure the server knows it's JSON
        },
        body: JSON.stringify({ 'wants_more_students': yesOrNo }) // Use body instead of data
    });

    if (!response.ok) {
        alert("Error toggling wether you want more students");
    }

    return true;
};

function SendButton( {teacher, started_at, ended_at, comment, selectedStudentUserId, wasCanselled, setUploadSuccessfull} : {teacher: Teacher; started_at?: Date; ended_at?: Date; comment?: string, selectedStudentUserId?: string, wasCanselled :boolean, setUploadSuccessfull: (success: boolean) => void}) {
    const token = localStorage.getItem('token')
    const [durationInHours, setDurationInHours] = useState<number | undefined>()
    const [allValid, setAllValid] = useState<boolean>(false)
    const [isAlertDialog, setIsAlertDialog] = useState<boolean>(false)
    const [negativeTimeAlert, setNegativeTimeAlert] = useState<boolean>(false)
    const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);

    useEffect( () => {
        if (teacher && started_at && ended_at && comment && selectedStudentUserId) {
            setAllValid(true)
        }
        else {
            setAllValid(false)
        }
    },[teacher, started_at, ended_at, comment, selectedStudentUserId])

    const handleSendClick = async () => {
        //avoid spamming
        setIsSendButtonDisabled(true); // Prevent multiple clicks right away

        if (!teacher || !started_at || !ended_at || !comment || !selectedStudentUserId) {
            alert("All fields must be filled in.");
            setUploadSuccessfull(false);
            setIsSendButtonDisabled(false);
            return;
        }

        const duration = ended_at.getTime() - started_at.getTime();
        const hours :number= Math.floor(duration / (1000 * 60 * 60));
        setDurationInHours(hours)

        if (hours >= 4) {
            setIsAlertDialog(true)
            setIsSendButtonDisabled(false); // Prevent multiple clicks right away
            return;
        }

        if (hours<0) {
            setNegativeTimeAlert(true)
            setIsSendButtonDisabled(false); // Prevent multiple clicks right away
            return
        }

        const response = await uploadClass()

        if (response) {
            setIsSendButtonDisabled(false)
        }
    };

    const uploadClass = async() => {
        if (!teacher || !started_at || !ended_at || !comment || !selectedStudentUserId) {
            alert("All fields must be filled in.");
            setUploadSuccessfull(false);
            return true;
        }

        try {
            const response = await fetch(`${BASEURL}/upload-new-class`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teacher_user_id: teacher.user_id,
                student_user_id: selectedStudentUserId,
                started_at: started_at.toISOString(),
                ended_at: ended_at.toISOString(),
                comment: comment,
                was_canselled: wasCanselled
            }),
            });
    
            if (!response.ok) {
                alert("An error occurred. Please try again.");
                setUploadSuccessfull(false);
                return true;
            } else {
                setUploadSuccessfull(true);
                return true;
            }
        } catch (error) {
            console.error("Error uploading class:", error);
            alert("An error occurred. Please try again.");
            setUploadSuccessfull(false);
            setIsSendButtonDisabled(false);
            return true;
        }
    }

    
    return (<>
        <Button
        onClick={handleSendClick}
        variant="outline"
        disabled={!allValid || isSendButtonDisabled}
        >
        Last opp ny time
        </Button>

        <AlertDialog open={isAlertDialog} onOpenChange={setIsAlertDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Dette var en veldig lang time</AlertDialogTitle>
                <AlertDialogDescription>
                    Du har prøver å legge inn en time som varer i {durationInHours} timer. Er dette riktig?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {setIsAlertDialog(false)} } className="">Nei det er feil</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    setIsAlertDialog(false);
                    uploadClass();
                }}
                className="bg-red-400 dark:bg-red-800 dark:text-white">
                    Ja det er riktig
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={negativeTimeAlert} onOpenChange={setNegativeTimeAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Slutttid kan ikke være før starttid</AlertDialogTitle>
                <AlertDialogDescription>
                    Du prøver å legge inn en time der timen slutter før den starter. Dobbelsjekk klokkeslettene og prøv igjen.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {setNegativeTimeAlert(false)} } className="">Jeg ønsker å sette inn ny dato</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </>);
}
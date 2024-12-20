"use client"
import { usePathname } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter,AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BackgroundLines } from "@/components/ui/background-lines";

type Class = {
    comment: string; // Optional comment for the session
    created_at: string; // Timestamp when the record was created (ISO format)
    started_at: string; // Timestamp for when the session started (ISO format)
    ended_at: string; // Timestamp for when the session ended (ISO format)
    invoiced_student: boolean; // Indicates if the student was invoiced
    paid_teacher: boolean; // Indicates if the teacher was paid
};

type FormattedClass = {
    started_at: string;
    payment: number;
}

type Student = {
    firstname_parent: string;
    lastname_parent: string;
    firstname_student: string;
    lastname_student: string;
    user_id: string;
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

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


import { FileUploadForm } from "@/components/uploadTeacherImageForm";

export default function LaererPage() {
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname.split('/'); // Split the pathname into segments
    const userId :string= segments[2].toString(); // Extract the 'user_id' from the correct position
    const [teacher, setTeacher] = useState<Teacher>()

    useEffect(() => {
        async function fetchTeacherName() {

            const response = await fetch(`${BASEURL}/get-teacher`, {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "user_id": userId
                })
            })

            if (response.ok) {
                const data = await response.json()
                setTeacher(data.teacher)
            }

            else {
                alert(response.statusText)
            }
        }
        fetchTeacherName()
    },[BASEURL])

    if (!teacher) {
        return (<p>Loading...</p>)
    }

    return (<div className="flex flex-col width-full h-full items-center justify-center">
            <TeacherName teacher={teacher}/>

            <DailyRevenueChart teacher={teacher} userId={userId}/>
            <br />
            <AddNewClass teacher={teacher}/>
            <br/>
            <YourStudent teacher={teacher}/>
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

function DailyRevenueChart({ teacher, userId }: { teacher: Teacher, userId: string }) {
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
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "user_id": userId
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
    },[BASEURL, userId])


    useEffect(() => {
        if (chartData) {
          // Aggregate payments by date
          const aggregatedData = chartData.reduce<FormattedClass[]>((acc, c: Class) => {
            // Format the date
            const date = new Date(c.started_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
      
            // Calculate the payment for this class
            const payment = calculatePayment(c, parseInt(teacher?.hourly_pay));
            setTotalPayment(prevTotal => prevTotal + payment); // Update totalPayment
      
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
        }
      }, [chartData, teacher]);
    
    
    if (formattedChartData?.length === 0) {
    return <p>Loading...</p>;
    }
    

    return(<div className="w-3/4 h-full p-4">
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
    const [date, setDate] = useState<Date>()
    const [selectedStudentUserId, setSelectedStudentUserId] = useState<string>()
    const [startedAt, setStartedAt] = useState<Date>()
    const [endedAt, setEndedAt] = useState<Date>()
    const [comment, setComment] = useState<string>()
    const [success, setSuccess] = useState<boolean>()
    const [enableButton, setEnableButton] = useState<boolean>(false)

    const handleStudentSelect = (userId: string) => {
        setSelectedStudentUserId(userId);
    };

    const handleStartDateSelect = (startDate :Date) => {
        setStartedAt(startDate)
    }
    const handleEndDateSelect = (endDate :Date) => {
        setEndedAt(endDate)
    }

    const handleSetComment = (comment :string) => {
        setComment(comment)
    }

    const handleSetSucces = (s :boolean) => {
        setSuccess(s)
        setSelectedStudentUserId('')
        setStartedAt(undefined)
        setEndedAt(undefined)
        setComment(undefined)
        setEnableButton(false)
    }

    //enable succesbutton once all fields are full
    useEffect( () => {
        if (selectedStudentUserId && startedAt && endedAt && comment) {
            setEnableButton(true)
        }
        else {
            setEnableButton(false)
        }
    },[selectedStudentUserId, startedAt, endedAt, comment])

    if (!teacher) {
        return (<p>Loading...</p>)
    }
    
    
    return (<div className="w-3/4 h-full p-4 bg-white dark:bg-black rounded-lg">
         {success && (
            <AlertDialog open={success}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Timen er lastet opp!</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction 
                            onClick={() => handleSetSucces(false)} // Close the dialog
                        >
                            Lukk
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
        <div className="flex flex-col space-y-4 items-strech">
            <SelectStudent teacher={teacher} onStudentSelect={handleStudentSelect} />
            <br />
            <DateTimePicker onStartDateSelected={handleStartDateSelect} onEndDateSelected={handleEndDateSelect}/>
            <br />
            <AddComment onAddComment={handleSetComment}/>
            <br />
            <SendButton 
                teacher={teacher}
                started_at={startedAt}
                ended_at={endedAt}
                comment={comment}
                selectedStudentUserId={selectedStudentUserId}
                setUploadSuccessfull={handleSetSucces}
            />
        </div>
    </div>)

}


function SelectStudent({teacher, onStudentSelect} : {teacher: Teacher; onStudentSelect: (user_id:string)=> void}) {
    const userId :string = teacher.user_id
    const [students, setStudents] = useState<Student[]>([])

    useEffect( () => {
        async function fetchStudents() {
            const response = await fetch(`${BASEURL}/get-students`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "user_id": userId
                })
            })

            if (response.ok) {
                const data = await response.json()
                console.log("students: ", data.students)
                setStudents(data.students)

                // Automatically select the first student
                if (data.students.length > 0) {
                    onStudentSelect(data.students[0].user_id);
                }
            }
            else {
                alert(response.statusText)
            }
        }
        fetchStudents()

    },[BASEURL, userId])


    const handleValueChange = (value: string) => {
        const index: number = parseInt(value.split("-")[1]);
        if (!isNaN(index) && students[index]) {
          onStudentSelect(students[index].user_id); // Pass the selected student ID upwards
        }
      };
    
    return (<div className="w-full h-full flex flex-col  items-center">
    <h3 className="pb-4">Hvem hadde du i dag?</h3>
    <RadioGroup defaultValue="option-0" onValueChange={handleValueChange}>
        {students.map( (student :Student, index :number) => {
            return( 
                <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={`option-${index}`} id={`option-${index}`} />
                    <Label htmlFor="option-two">
                        <p>{student.firstname_parent} {student.lastname_parent}</p>
                        <p className="text-sm text-neutral-600"> & {student.firstname_student} {student.lastname_student}</p>
                    </Label>
                </div>);
        })}
    </RadioGroup>
    </div>);
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
                rows={6} 
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

 
function DateTimePicker({onStartDateSelected, onEndDateSelected} : {onStartDateSelected: (date: Date) => void; onEndDateSelected: (date: Date) => void}) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDateSelect = (selectedDate: Date | undefined, type: "start" | "end") => {
    if (selectedDate) {
      if (type === "start") {
        setStartDate(selectedDate)
        setEndDate(selectedDate)
        onStartDateSelected(selectedDate)
        onEndDateSelected(selectedDate)
      }
      else{
        setEndDate(endDate)
        onEndDateSelected(selectedDate)
      } 
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute",
    value: string,
    picker: "start" | "end"
  ) => {
    const targetDate = picker === "start" ? startDate : endDate;

    if (targetDate) {
      const newDate = new Date(targetDate);
      if (type === "hour") {
        newDate.setHours(parseInt(value));
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      }
      picker === "start" ? setStartDate(newDate) : setEndDate(newDate);
    }
  };

  const MyCalendar = (picker: "start" | "end") => (
    <Popover
      open={picker === "start" ? isOpen : isEndTimePickerOpen}
      onOpenChange={picker === "start" ? setIsOpen : setIsEndTimePickerOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !(picker === "start" ? startDate : endDate) && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {picker === "start" && startDate ? (
            format(startDate, "MM/dd/yyyy HH:mm")
          ) : picker === "end" && endDate ? (
            format(endDate, "MM/dd/yyyy HH:mm")
          ) : (
            <span>MM/DD/YYYY HH:mm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={picker === "start" ? startDate : endDate}
            onSelect={(date :Date) => handleDateSelect(date, picker)}
            required={true}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      (picker === "start" ? startDate : endDate)?.getHours() === hour
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString(), picker)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      (picker === "start" ? startDate : endDate)?.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute.toString(), picker)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 items-center">
        <h3>Når startet dere?</h3>
        {MyCalendar("start")}
      </div>
      <div className="flex flex-col space-y-2 items-center">
        <h3>Når avsluttet dere?</h3>
        {MyCalendar("end")}
      </div>
    </div>
  );
}


function SendButton( {teacher, started_at, ended_at, comment, selectedStudentUserId, setUploadSuccessfull} : {teacher: Teacher; started_at?: Date; ended_at?: Date; comment?: string, selectedStudentUserId?: string, setUploadSuccessfull: (success: boolean) => void}) {
    const [allValid, setAllValid] = useState<boolean>(false)

    useEffect( () => {
        if (teacher && started_at && ended_at && comment && selectedStudentUserId) {
            setAllValid(true)
        }
        else {
            setAllValid(false)
        }
    },[teacher, started_at, ended_at, comment, selectedStudentUserId])

    const handleSendClick = async () => {
        if (!teacher || !started_at || !ended_at || !comment || !selectedStudentUserId) {
            alert("All fields must be filled in.");
            setUploadSuccessfull(false);
            return;
        }
    
        try {
            const response = await fetch(`${BASEURL}/upload-new-class`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teacher_user_id: teacher.user_id,
                student_user_id: selectedStudentUserId,
                started_at: started_at.toISOString(),
                ended_at: ended_at.toISOString(),
                comment: comment,
            }),
            });
    
            if (!response.ok) {
                alert("An error occurred. Please try again.");
                setUploadSuccessfull(false);
            } else {
                setUploadSuccessfull(true);
            }
        } catch (error) {
            console.error("Error uploading class:", error);
            alert("An error occurred. Please try again.");
            setUploadSuccessfull(false);
        }
    };

    
    return(<>
        <Button 
            onClick={handleSendClick} 
            variant={"outline"}
            disabled={!allValid}
        >
        Last opp ny time</Button>
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
    your_teacher: string
}

function YourStudent( {teacher} : {teacher: Teacher}) {
    const [students, setStudents] = useState<FullStudent[]>([])
    const [currentStudent, setCurrentStudent] = useState<FullStudent>()
    const [openAccordion, setOpenAccordion] = useState<boolean>(false)

    useEffect( () => {
        async function fetchStudents() {
            const response = await fetch(`${BASEURL}/get-students`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "user_id": teacher.user_id
                })
            })

            const r = await response.json()
            console.log(r)

            const students = r.students
            console.log(students)
            setCurrentStudent(students[0])
            setStudents(students)
        }
        fetchStudents()
        },[])

    if (!teacher || !students || !currentStudent) {
        return (<p>Loading...</p>)
    }

    return(<div className="w-3/4 bg-white dark:bg-black rounded-lg p-4 flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Dine elever</h2>
        <Accordion type="single" collapsible className="w-full">
            {students.map( (student, index) => (
                <AccordionItem value={index.toString()} key={index}>
                    <AccordionTrigger>
                        <p>{student.firstname_parent} {student.lastname_parent}
                            <br/>
                            & {student.firstname_student} {student.lastname_student}
                        </p>
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
                            {currentStudent.firstname_student} {currentStudent.lastname_student}
                            <br/>
                            Tlf: {currentStudent.phone_student}
                        </p>
                        <br/>
                        <p>
                            <h4 className="mb-1 font-semibold">Info</h4>
                            Hovedfag: {currentStudent.main_subjects}
                            <br/>
                            Spesielle forhold: {currentStudent.additional_comments}
                            <br/>
                            Hjemmeadresse: {currentStudent.address}
                            <br/>
                            Postnummer: {currentStudent.postal_code}
                            <br/>
                            {`${currentStudent.has_physical_tutoring? 'fysisk undervisning' : 'digital undervisning'}`}
                        </p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>


    </div>)

}
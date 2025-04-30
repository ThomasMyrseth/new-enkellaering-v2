"use client"
import { useState, useEffect } from "react";
import { Teacher, Student } from "../admin/types";
import { AlertDialog, AlertDialogDescription,AlertDialogCancel, AlertDialogAction, AlertDialogFooter,AlertDialogContent,  AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

export function AddNewClass({teacher, students}: {teacher: Teacher, students :Student[]}) {
    const [selectedStudentUserIds, setSelectedStudentUserIds] = useState<string[]>([])
    const [startedAt, setStartedAt] = useState<Date>()
    const [endedAt, setEndedAt] = useState<Date>()
    const [comment, setComment] = useState<string>()
    const [success, setSuccess] = useState<boolean>()
    const [wasCanselled, setWasCanselled] = useState<boolean>(false)
    const [groupClass, setGroupClass] = useState<boolean>(false)
    const [numberOfStudents, setNumberOfStudents] = useState<number>(1)


    const handleStudentSelect = (userId: string) => {
        setSelectedStudentUserIds([userId]);
    };

    const handleStudentSelects = (userIds: string[]) => {
        setSelectedStudentUserIds(userIds)
        setNumberOfStudents(userIds.length)
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

    const handleSetCanselled = (canselled :boolean) => {
        setWasCanselled(canselled)
    }

    const handleSetGroupClass = (canselled :boolean) => {
        setGroupClass(canselled)
    }

    const handleSetSucces = (s :boolean) => {
        setSuccess(s)
        // setSelectedStudentUserId('')
        // setStartedAt(undefined)
        // setEndedAt(undefined)
        // setComment(undefined)
    }


    if (!teacher) {
        return (<p>Loading...</p>)
    }
    
    
    return (<div className="w-full p-4 bg-white dark:bg-black rounded-lg">
         {success && (
            <AlertDialog open={success}>
                <AlertDialogDescription>Timen er lastet opp!</AlertDialogDescription>
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
            <GroupClass onGroupClass={handleSetGroupClass}/>
            <br/>
            {
                groupClass? 
                <SelectStudents onStudentSelect={handleStudentSelects} students={students}/>
                :<SelectStudent onStudentSelect={handleStudentSelect} students={students}/>
            }
            <br />
            <DateTimePicker onStartDateSelected={handleStartDateSelect} onEndDateSelected={handleEndDateSelect}/>
            <br />
            <WasCanselled onWasCanselled={handleSetCanselled}/>
            <br />
            <AddComment onAddComment={handleSetComment}/>
            <br />
            <SendButton 
                teacher={teacher}
                started_at={startedAt}
                ended_at={endedAt}
                comment={comment}
                selectedStudentUserIds={selectedStudentUserIds}
                wasCanselled={wasCanselled}
                groupClass={groupClass}
                setUploadSuccessfull={handleSetSucces}
                numberOfStudents={numberOfStudents}
            />
        </div>
    </div>)

}


function SelectStudent({ onStudentSelect, students} : {onStudentSelect: (user_id:string)=> void, students :Student[]}) {
    const [selectedStudentUserId, setSelectedStudentUserId] = useState<string | undefined>();


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

function SelectStudents({ onStudentSelect, students} : {onStudentSelect: (user_id :string[])=> void, students :Student[]}) {
    const [selectedStudentUserIds, setSelectedStudentUserIds] = useState<string[]>([]);


    const toggleCheckbox = (userId: string, checked: boolean) => {
        const updatedSelection = checked
            ? [...selectedStudentUserIds, userId]
            : selectedStudentUserIds.filter(id => id !== userId);

        setSelectedStudentUserIds(updatedSelection);
        onStudentSelect(updatedSelection);
    };

    
    return (
        <div className="w-full h-full flex flex-col items-center">
            <h3 className="pb-4">Hvem hadde du i dag?</h3>
            <div className="w-2/3 md:w-1/3 justify-start space-y-2">
            {students.map((student: Student, index: number) => {
                if (!student.is_active) return null;

                const userId = student.user_id;
                const isChecked = selectedStudentUserIds.includes(userId);

                return (
                    <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                            id={userId}
                            checked={isChecked}
                            onCheckedChange={(checked: boolean) => toggleCheckbox(userId, checked)}
                        />
                        <Label htmlFor={userId}>
                            <p>{student.firstname_parent} {student.lastname_parent}</p>
                            <p className="text-sm text-neutral-600">& {student.firstname_student} {student.lastname_student}</p>
                        </Label>
                    </div>
                );
            })}
            </div>
        </div>
    );
}



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

function GroupClass({onGroupClass} : {onGroupClass: (onGroupClass: boolean) => void}) {
    const [groupClass, setGroupClass] = useState<boolean>(false)

    const handleToggle = () => {
        setGroupClass(!groupClass)
        onGroupClass(!groupClass)
    }
    
    return(<>
        <div className="w-full flex flex-col items-center space-x-2">
            <div className="flex items-center space-x-2">
                <Switch id="more-students" checked={groupClass} onCheckedChange={handleToggle}/>
                <Label htmlFor="more-students" className={`${groupClass ? '' : 'text-neutral-400'}`}>Dette var en gruppetime</Label>
            </div>
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
        const currentTime = type === "start" ? startDate : endDate;

        const newDate = new Date(selectedDate);
        if (currentTime) {
            // Preserve the current time when selecting a date
            newDate.setHours(currentTime.getHours());
            newDate.setMinutes(currentTime.getMinutes());
        }

        if (type === "start") {
            setStartDate(newDate);
            onStartDateSelected(newDate);
        } else {
            setEndDate(newDate);
            onEndDateSelected(newDate);
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
        if (picker === "start") {
            setStartDate(newDate);
            onStartDateSelected(newDate); // Propagate the correct date
        } else {
            setEndDate(newDate);
            onEndDateSelected(newDate); // Propagate the correct date
        }
    }
  };

  const MyCalendar = ({ picker }: { picker: "start" | "end" }) => (
    <Popover
      open={picker === "start" && isOpen || picker === "end" && isEndTimePickerOpen }
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
            format(startDate, "dd/MM/yyyy HH:mm")
          ) : picker === "end" && endDate ? (
            format(endDate, "dd/MM/yyyy HH:mm")
          ) : (
            <span>DD/MM/YYYY HH:mm</span>
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
        <MyCalendar picker="start"/>
      </div>
      <div className="flex flex-col space-y-2 items-center">
        <h3>Når avsluttet dere?</h3>
        <MyCalendar picker="end"/>
      </div>
    </div>
  );
}


function SendButton( {teacher, started_at, ended_at, comment, selectedStudentUserIds, wasCanselled, groupClass, numberOfStudents, setUploadSuccessfull} : {teacher: Teacher; started_at?: Date; ended_at?: Date; comment?: string, selectedStudentUserIds: string[], wasCanselled :boolean, groupClass :boolean, numberOfStudents :number, setUploadSuccessfull: (success: boolean) => void}) {
    const token = localStorage.getItem('token')
    const [durationInHours, setDurationInHours] = useState<number | undefined>()
    const [allValid, setAllValid] = useState<boolean>(false)
    const [isAlertDialog, setIsAlertDialog] = useState<boolean>(false)
    const [negativeTimeAlert, setNegativeTimeAlert] = useState<boolean>(false)
    const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);

    useEffect( () => {
        if (teacher && started_at && ended_at && comment && selectedStudentUserIds) {
            setAllValid(true)
        }
        else {
            setAllValid(false)
        }
    },[teacher, started_at, ended_at, comment, selectedStudentUserIds])

    const handleSendClick = async () => {
        //avoid spamming
        setIsSendButtonDisabled(true); // Prevent multiple clicks right away

        if (!teacher || !started_at || !ended_at || !comment || !selectedStudentUserIds) {
            alert("Fyll ut alle felter");
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
        if (!teacher || !started_at || !ended_at || !comment || !selectedStudentUserIds) {
            alert("Alle felter må være utfylt");
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
                student_user_ids: selectedStudentUserIds,
                started_at: started_at.toISOString(),
                ended_at: ended_at.toISOString(),
                comment: comment,
                was_canselled: wasCanselled,
                groupclass : groupClass,
                number_of_students: numberOfStudents,
            }),
            });
    
            if (!response.ok) {
                alert("En feil skjedde prøv igjen");
                setUploadSuccessfull(false);
                setIsSendButtonDisabled(false)
                return true;
            } else {
                setUploadSuccessfull(true);
                setIsSendButtonDisabled(false);
                toast("Ny time lastet opp");
                return true;
            }
        } catch (error) {
            console.error("Error uploading class:", error);
            alert("En feil skjedde prøv igjen");
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

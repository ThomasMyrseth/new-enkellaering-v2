"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Teacher } from "../admin/types";
import { NewTeacherOrder } from "./types";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export function NewStudentsWithPreferredTeacherWorkflowActions( {teacher} : {teacher :Teacher}) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState<boolean>(true);
  const [newStudents, setNewStudents] = useState<NewTeacherOrder[]>([]);

  // Fetch new students with preferred teacher data.
  useEffect(() => {
    async function getNewStudents() {
      const response = await fetch(
        `${BASEURL}/get-new-students-with-preferred-teacher`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        alert("Error fetching new students " + response.statusText);
        setLoading(false);
        return;
      }
      const data = await response.json();
      const students :NewTeacherOrder[] = data.new_students || [];

      //filter to remove the students that is not this teachers
      const filteredStudents :NewTeacherOrder[] = students.filter( (student) => {
            return student.order.teacher_user_id === teacher.user_id;
      })

      setNewStudents(filteredStudents);
      setLoading(false);
    }
    getNewStudents();
  }, [token]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (!newStudents) {
    return <p>No new students found</p>;
  }

  return <NewStudentWithPreferredTeacherActionsTable newStudents={newStudents} />;
}

const NewStudentWithPreferredTeacherActionsTable = ({
  newStudents,
}: {
  newStudents: NewTeacherOrder[];
}) => {
  // Order new students by created_at (most recent first)
  newStudents.sort((a, b) => new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime());
  const filteredNewStudents = newStudents.filter(  (a) => a.order.teacher_accepted_student === null && a.order.hidden !== true)


  return (
    <div className="w-full sm:w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center">
      <Table>
        <TableCaption>
          Nye elever som ønsker deg som lærer
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Dato</TableHead>
            <TableHead>Kontaktinfo (forelder)</TableHead>
            <TableHead>Undervisningsform</TableHead>
            <TableHead>Foretrukket møtested</TableHead>
            <TableHead>Jeg takker ja/nei</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredNewStudents.map((ns) => {
            return (
              <NewStudentWithPreferredTeacherActionsRow
                key={ns.order.row_id}
                ns={ns}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

function NewStudentWithPreferredTeacherActionsRow({ns,}: {ns: NewTeacherOrder;}) {
  const token = localStorage.getItem("token");

  // Set up state for actions. Adjust the defaults based on your data.
  //const [hasCalled, setHasCalled] = useState<boolean>(ns.teacher_called);
  //const [hasAnswered, setHasAnswered] = useState<boolean>(ns.teacher_answered);
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(ns.order.teacher_accepted_student);

  const handleAcceptClick = (value: boolean) => {
    setHasAccepted(value);
    handleSaveClick(value);
  };


  // Save changes to the new student record.
  const handleSaveClick = async (accept :boolean) => {
    const response = await fetch(`${BASEURL}/update-order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        row_id: ns.order.row_id,
        teacher_accepted_student: accept,
      }),
    });

    if (!response.ok) {
      alert("Error saving updates to new student");
      return;
    }
    if (accept) {
      toast(`Du takker ja til ${ns.student.firstname_parent}`)
    }
    if(!accept) {
      toast(`Du takker nei til ${ns.student.firstname_parent}`)
    }
  };


  return (
    <TableRow>
      <TableCell>
        {new Intl.DateTimeFormat("nb-NO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(ns.order.created_at))}
      </TableCell>

      <TableCell>
        {ns.student.firstname_parent} {ns.student.lastname_parent}<br/>
        {ns.student.phone_parent}
      </TableCell>

      <TableCell>
        {ns.order.physical_or_digital===true &&"Fysisk"}
        {ns.order.physical_or_digital===false &&"Digital"}
        {ns.order.physical_or_digital===null && "Vet ikke"}
      </TableCell>

      <TableCell>
        {ns.order.physical_or_digital===false && "Digital undervisning"}
        {ns.order.physical_or_digital===true && ns.order.preferred_location}
        {ns.order.physical_or_digital===true && !ns.order.preferred_location && "Ikke noe foretrukket oppmøtested"}
        {ns.order.physical_or_digital===null && ""}
      </TableCell>


      <TableCell>
        <RadioGroup
          onValueChange={(value) => handleAcceptClick(value === "Ja")}
          value={hasAccepted === true ? "Ja" : hasAccepted === false ? "Nei" : undefined}
        >
          <div className="flex flex-row items-center space-x-1">
            <RadioGroupItem value="Ja" className="text-green-400" />
            <Label>Ja</Label>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <RadioGroupItem value="Nei" className="text-red-400" />
            <Label>Nei</Label>
          </div>
        </RadioGroup>
      </TableCell>

      {/* <TableCell>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button className="bg-red-400">Slett</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
              <AlertDialogDescription>Dette kan ikke angres.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Kanseler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Slett</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell> */}
    </TableRow>
  );
}

















export function UnacceptedStudentsTable ( {teacher}: {teacher :Teacher}) {
    const [orders, setOrders] = useState<NewTeacherOrder[]>([]);
    const token = localStorage.getItem("token");

    // Fetch new students with preferred teacher data.
    useEffect(() => {
      async function getNewStudents() {
        const response = await fetch(
          `${BASEURL}/get-new-students-with-preferred-teacher`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          alert("Error fetching new students " + response.statusText);
          return;
        }
        const data = await response.json();
        const students :NewTeacherOrder[] = data.new_students || [];
  
        //filter to remove the students that is not this teachers
        const filteredStudents :NewTeacherOrder[] = students.filter( (student) => {
              return student.order.teacher_user_id === teacher.user_id;
        })
  
        setOrders(filteredStudents);
      }
      getNewStudents();
    }, [token]);



  orders.sort((a, b) => new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime());

  return (
    <div className="w-full sm:w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center">
      <Table>
        <TableCaption>
          Nye elever du har takket nei til
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Dato</TableHead>
            <TableHead>Kontaktinfo (forelder)</TableHead>
            <TableHead>Undervisningsform</TableHead>
            <TableHead>Foretrukket møtested</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((ns) => {

            //remove student that belong in another table
            if (ns.order.teacher_accepted_student===true || ns.order.teacher_accepted_student===null || ns.order.hidden) return null;

            return (
              <UnaccpetedStudentsRow
                key={ns.order.row_id}
                ns={ns}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}



function UnaccpetedStudentsRow({ns,}: {ns: NewTeacherOrder;}) {

  return (
    <TableRow>
      <TableCell>
        {new Intl.DateTimeFormat("nb-NO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(ns.order.created_at))}
      </TableCell>

      <TableCell>
        {ns.student.firstname_parent} {ns.student.lastname_parent}<br/>
        {ns.student.phone_parent}
      </TableCell>

      <TableCell>
        {ns.order.physical_or_digital===true &&"Fysisk"}
        {ns.order.physical_or_digital===false &&"Digital"}
        {ns.order.physical_or_digital===null && "Vet ikke"}
      </TableCell>

      <TableCell>
        {ns.order.physical_or_digital===false && "Digital undervisning"}
        {ns.order.physical_or_digital===true && ns.order.preferred_location}
        {ns.order.physical_or_digital===true && !ns.order.preferred_location && "Ikke noe foretrukket oppmøtested"}
        {ns.order.physical_or_digital===null && ""}
      </TableCell>
    </TableRow>
  );
}


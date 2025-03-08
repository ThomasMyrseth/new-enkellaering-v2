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
import { NewStudentWithPreferredTeacher, Teacher } from "../admin/types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export function NewStudentsWithPreferredTeacherWorkflowActions( {teacher} : {teacher :Teacher}) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState<boolean>(true);
  const [newStudents, setNewStudents] = useState<NewStudentWithPreferredTeacher[]>([]);

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
      const students :NewStudentWithPreferredTeacher[] = data.new_students || [];

      //filter to remove the students that is not this teachers
      const filteredStudents :NewStudentWithPreferredTeacher[] = students.filter( (student) => {
            return student.preferred_teacher === teacher.user_id;
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

  return <NewStudentWithPreferredTeacherActionsTable newStudents={newStudents} teacher={teacher} />;
}

const NewStudentWithPreferredTeacherActionsTable = ({
  newStudents,
  teacher,
}: {
  newStudents: NewStudentWithPreferredTeacher[];
  teacher: Teacher;
}) => {
  // Order new students by created_at (most recent first)
  newStudents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="w-full sm:w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center">
      <Table>
        <TableCaption>
          Arbeidsoversikt for ny elev med preferert lærer og handlinger
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Telefon & Dato</TableHead>
            <TableHead>Jeg har ringt</TableHead>
            <TableHead>Elev har svart</TableHead>
            <TableHead>Jeg takker ja/nei</TableHead>
            <TableHead>Elev opprettet konto</TableHead>
            <TableHead>Kommentarer</TableHead>
            <TableHead>Lagre</TableHead>
            <TableHead>Slett</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newStudents.map((ns) => {
            if (ns.hidden) return null;
            return (
              <NewStudentWithPreferredTeacherActionsRow
                key={ns.new_student_id}
                ns={ns}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

function NewStudentWithPreferredTeacherActionsRow({ns,}: {ns: NewStudentWithPreferredTeacher;}) {
  const token = localStorage.getItem("token");

  // Set up state for actions. Adjust the defaults based on your data.
  const [hasCalled, setHasCalled] = useState<boolean>(ns.teacher_called);
  const [hasAnswered, setHasAnswered] = useState<boolean>(ns.teacher_answered);
  const [hasAccepted, setHasAccepted] = useState<boolean>(ns.teacher_has_accepted);
  const [studentSignedUp] = useState<boolean>(ns.student_signed_up);
  const [comments, setComments] = useState<string>(ns.comments || "");

  // Save changes to the new student record.
  const handleSaveClick = async () => {
    const response = await fetch(`${BASEURL}/update-new-student-with-preferred-teacher`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_student_id: ns.new_student_id,
        teacher_called: hasCalled,
        student_answered: hasAnswered,
        teacher_has_accepted: hasAccepted,
        comments: comments || null,
      }),
    });

    if (!response.ok) {
      alert("Error saving updates to new student");
      return;
    }
    alert("Oppdateringer lagret");
  };

  // Delete/hide the new student record.
  const handleDelete = async () => {
    const response = await fetch(`${BASEURL}/hide-new-student-with-preferred-teacher`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_student_id: ns.new_student_id }),
    });
    if (!response.ok) {
      alert("Error deleting new student");
      return;
    }
    alert("Eleven er slettet");
  };

  return (
    <TableRow>
      <TableCell>
        {ns.phone}
        <br />
        {new Intl.DateTimeFormat("nb-NO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(ns.created_at))}
      </TableCell>
      <TableCell>
        <RadioGroup
          onValueChange={(value) => setHasCalled(value === "Ja")}
          defaultValue={hasCalled ? "Ja" : "Nei"}
          value={hasCalled ? "Ja" : "Nei"}
        >
          <RadioGroupItem value="Ja" className="text-green-400" />
          <RadioGroupItem value="Nei" className="text-red-400" />
        </RadioGroup>
      </TableCell>
      <TableCell>
        <RadioGroup
          onValueChange={(value) => setHasAnswered(value === "Ja")}
          defaultValue={hasAnswered ? "Ja" : "Nei"}
          value={hasAnswered ? "Ja" : "Nei"}
        >
          <RadioGroupItem value="Ja" className="text-green-400" />
          <RadioGroupItem value="Nei" className="text-red-400" />
        </RadioGroup>
      </TableCell>
      <TableCell>
        <RadioGroup
          onValueChange={(value) => setHasAccepted(value === "Ja")}
          defaultValue={hasAccepted ? "Ja" : "Nei"}
          value={hasAccepted ? "Ja" : "Nei"}
        >
          <RadioGroupItem value="Ja" className="text-green-400" />
          <RadioGroupItem value="Nei" className="text-red-400" />
        </RadioGroup>
      </TableCell>
      <TableCell>
        <span className={studentSignedUp ? "text-green-400" : "text-red-400"}>
          {studentSignedUp ? "Ja" : "Nei"}
        </span>
      </TableCell>

      
      <TableCell>
        <Textarea
          placeholder="Noter ned viktig info"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
        />
      </TableCell>
      <TableCell>
        <Button onClick={handleSaveClick}>Lagre</Button>
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
}

export default NewStudentsWithPreferredTeacherWorkflowActions;
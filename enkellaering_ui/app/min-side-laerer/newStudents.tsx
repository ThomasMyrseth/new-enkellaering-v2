"use client";

import { useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { NewStudent, Teacher } from "../admin/types";
import { NewTeacherOrder } from "./types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export function NewStudentsWithPreferredTeacherWorkflowActions() {
  const token = localStorage.getItem("token") || '';
  const [loading, setLoading] = useState<boolean>(true);
  const [newStudents, setNewStudents] = useState<NewTeacherOrder[]>([]);



  // Fetch new students with preferred teacher data.
  useEffect(() => {
      async function fetchData() {
        const students = await getNewStudents(token)
        setNewStudents(students);
        setLoading(false);
      }
      fetchData();
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
  newStudents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


  return (
    <div className="w-full bg-white dark:bg-black m-4 p-4 rounded-lg flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Nye elever som ønkser deg som lærer</h1>
          {newStudents.map((ns) => {
            return (
              <NewStudentWithPreferredTeacherActionsCard
                key={ns.row_id}
                ns={ns}
              />
            );
          })}
    </div>
  );
};


import Image from "next/image";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



export default function NewStudentWithPreferredTeacherActionsCard({ ns }: { ns :NewTeacherOrder}) {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(ns.teacher_accepted_student);
  const token = localStorage.getItem('token') || ''
  const formattedDate = new Date(ns.created_at).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const teachingMethod =
    ns.physical_or_digital === true
      ? "Fysisk"
      : ns.physical_or_digital === false
      ? "Digital"
      : "Vet ikke";


  const handleAcceptClick = (value: boolean, order :NewTeacherOrder) => {
    handleSaveClick(value, token, order)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="cursor-pointer relative bg-neutral-100 dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden w-80 m-4 min-h-96">
          <div className="w-full h-40 relative">
              <Image
                src='https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                alt="Student image"
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
              />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold">
              {ns.firstname_parent} {ns.lastname_parent}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{formattedDate}</p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Contact:</span> {ns.phone_parent}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Method:</span> {teachingMethod}
            </p>
            {ns.physical_or_digital === true && ns.preferred_location && (
              <p className="mt-2 text-sm">
                <span className="font-semibold">Location:</span> {ns.preferred_location}
              </p>
            )}
            <p className="mt-2 text-sm">
              <span className="font-semibold">Comments:</span> {ns.order_comments}
            </p>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Oppdater aksept</AlertDialogTitle>
          <AlertDialogDescription>
            Velg om du aksepterer eller avslår studentens forespørsel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4">
          <RadioGroup
            onValueChange={(value) => handleAcceptClick(value === "Ja", ns)}
            value={hasAccepted === true ? "Ja" : hasAccepted === false ? "Nei" : undefined}
            className="w-full flex flex-col items-start space-y-2 mt-1"
          >
            <div className="w-full flex items-center space-x-1">
              <RadioGroupItem value="Ja" />
              <Label>Jeg godtar eleven</Label>
            </div>
            <div className="w-full flex items-center space-x-1">
              <RadioGroupItem value="Nei" />
              <Label>Jeg ønkser ikke denne eleven</Label>
            </div>
          </RadioGroup>
        </div>
        <AlertDialogFooter className="mt-4 flex justify-between">
          <AlertDialogCancel>Ferdig</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}




async function getNewStudents(token :string) {
  const response = await fetch(
    `${BASEURL}/get-new-students-for-teacher`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    alert("Error fetching new students " + response.statusText);
    return [];
  }
  const data = await response.json();
  const students :NewTeacherOrder[] = data.new_orders || [];
  return students
}


const handleSaveClick = async (accept :boolean, token :string, ns :NewTeacherOrder) => {
  const response = await fetch(`${BASEURL}/teacher-accepts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      row_id: ns.row_id,
      student_user_id :ns.student_user_id,
      firstname_student : ns.firstname_parent,
      mail_student: ns.email_parent,
      firstname_teacher: ns.firstname,
      lastname_teacher: ns.lastname,
      accept: accept,
    }),
  });

  if (!response.ok) {
    alert("Error saving updates to new student");
    return;
  }
  if (accept) {
    toast(`Du takker ja til ${ns.firstname_parent}`)
  }
  if(!accept) {
    toast(`Du takker nei til ${ns.firstname_parent}`)
  }
};
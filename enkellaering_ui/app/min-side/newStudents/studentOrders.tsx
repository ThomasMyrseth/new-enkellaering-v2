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
import { NewStudentWithPreferredTeacher, Teacher, Student } from "../../admin/types";
import { TeacherOrder, TeacherOrderJoinTeacher } from "../types";
import { getNewTeachers, canselNewOrder } from "./getPushData";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export function StudentOrderActions( {student} : {student :Student}) {
    const router = useRouter()
    const token = localStorage.getItem("token") ;
    const [loading, setLoading] = useState<boolean>(true);
    const [orders, setOrders] = useState<TeacherOrderJoinTeacher[]>([]);

    //get the new students and teacher upon initial loading
    useEffect(() => {
      async function getOrders() {
        if (!token) {
          router.push("/login");
          return;
        }
        try {
          const o :TeacherOrderJoinTeacher[] = await getNewTeachers(BASEURL, token)
          setOrders(o)
          setLoading(false)
        }
        catch (error) {
          console.log(error)
          return;
        }
      }
      getOrders();
    },[])



    if (loading) {
        return <p>Loading...</p>;
    }


  return <StudentOrderActionsTable orders={orders}/>;
}

const StudentOrderActionsTable = ({
  orders,
}: {
    orders: TeacherOrderJoinTeacher[];
}) => {
  // Order new students by created_at (most recent first)
  orders.sort((a, b) => new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime());


  return (
    <div className="w-full sm:w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center">
      <Table>
        <TableCaption>
          Her er din(e) lærer(e)
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Bestillingsdato</TableHead>
            <TableHead>Kontaktinfo</TableHead>
            <TableHead>Fysisk eller digital undervisning</TableHead>
            <TableHead>Foretrukket oppmøtested</TableHead>
            <TableHead>Læreren har akseptert deg</TableHead>
            <TableHead>Lagre</TableHead>
            <TableHead>Kanseller bestilling</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => {
            if (o.order.hidden) {
              return;
            }

            return (
              <StudentOrderActionsTableRow
                key={o.order.row_id}
                order={o}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

function StudentOrderActionsTableRow({order}: {order: TeacherOrderJoinTeacher;}) {
  const token = localStorage.getItem("token");

  // Set up state for actions. Adjust the defaults based on your data.
    const [physicalOrDigital, setPhysicalOrDigital] = useState<boolean>(order.order.physical_or_digital)
    const [meetingLocation, setMeetingLocation] = useState<string>(order.order.preferred_location)

  // Save changes to the new student record.
  const handleSaveClick = async () => {
    const response = await fetch(`${BASEURL}/update-order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        row_id: order.order.row_id,
        physical_or_digital: physicalOrDigital,
        meeting_location: meetingLocation,
      }),
    });

    if (!response.ok) {
      alert("Error saving updates to new student");
      return;
    }
    toast("Oppdateringer lagret");
  };

  // Delete/hide the new student record.
  const handleDelete = async () => {
    const response = await fetch(`${BASEURL}/cansel-order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ row_id: order.order.row_id }),
    });
    if (!response.ok) {
      alert("Error deleting new student");
      return;
    }
    toast("Eleven er slettet");
  };

  return (
    <TableRow>
      <TableCell>
        {new Intl.DateTimeFormat("nb-NO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(order.order.created_at))}
      </TableCell>

      <TableCell>
        {order.teacher.firstname} {order.teacher.lastname} <br/>
        {order.teacher.phone}
      </TableCell>

      <TableCell>
        <RadioGroup
          onValueChange={(value) => setPhysicalOrDigital(value === "Fysisk")}
          defaultValue={physicalOrDigital ? "Fysisk" : "Digitalt"}
          value={physicalOrDigital? "Fysisk" : "Digitalt"}
        >
          <div className="flex flex-row space-x-1">
            <RadioGroupItem value="Fysisk" className="" />
            <Label>Fysisk</Label>
          </div>
          <div className="flex flex-row space-x-1">
          <RadioGroupItem value="Digitalt" className="" />
          <Label>Digitalt</Label>
          </div>
        </RadioGroup>
      </TableCell>

      <TableCell>
        <Textarea
          placeholder="Hvor vil dere helst møtes"
          disabled={physicalOrDigital===false} //do not show with digital
          value={meetingLocation}
          onChange={(e) => setMeetingLocation(e.target.value)}
          rows={4}
        />
      </TableCell>


      <TableCell>
        {order.order.teacher_accepted_student===true && "Ja"}
        {order.order.teacher_accepted_student===false && "Nei"}
        {order.order.teacher_accepted_student===null && "Ikke besvart"}
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

export default StudentOrderActionsTable;
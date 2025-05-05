"use client";

import Image from "next/image";
import React, { useState } from "react";
import { TeacherOrderJoinTeacher } from "../types";
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Order {
  teacherOrder: TeacherOrderJoinTeacher;
  imageURL: string;
}



const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export default function OrderCard({ order, handleUIDelete }: {order: Order, handleUIDelete :(rowId :string) => void}) {
  const router = useRouter();
  // State for the editable fields
  const [physicalOrDigital, setPhysicalOrDigital] = useState<boolean>(
    order.teacherOrder.order.physical_or_digital
  );
  const [comments, setComments] = useState<string>(
    order.teacherOrder.order.order_comments
  );
  const [meetingLocation, setMeetingLocation] = useState<string>(
    order.teacherOrder.order.preferred_location
  );

  const formattedDate = new Date(
    order.teacherOrder.order.created_at
  ).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const teachingMethod = physicalOrDigital ? "Fysisk" : "Digitalt";

  // Determine teacher acceptance status.
  const teacherAccepted = order.teacherOrder.order.teacher_accepted_student;
  const acceptanceText =
    teacherAccepted === true
      ? "Ja"
      : teacherAccepted === false
      ? "Nei"
      : "Ikke besvart";

  // Save updates to the order.
  const handleSaveClick = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${BASEURL}/update-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          row_id: order.teacherOrder.order.row_id,
          physical_or_digital: physicalOrDigital,
          meeting_location: meetingLocation,
          comments: comments,
        }),
      });
      if (!response.ok) {
        alert("Error saving updates to order");
        return;
      }
      toast("Oppdateringer lagret");
    } catch (error) {
      console.error("Error saving updates:", error);
      alert("Error saving updates");
    }
  };

  // Delete/hide the order.
  const handleDelete = async () => {

    //update the UI
    handleUIDelete(order.teacherOrder.order.row_id)

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${BASEURL}/cansel-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ row_id: order.teacherOrder.order.row_id }),
      });
      if (!response.ok) {
        alert("Error deleting order");
        return;
      }
      toast("Bestillingen er slettet");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error deleting order");
    }
  };

  return (
    <AlertDialog>
      {/* Wrap the entire card as the trigger */}
      <AlertDialogTrigger asChild>
        <div className="cursor-pointer relative bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden w-80 m-4 min-h-96">
          {/* Rejected badge if teacher has rejected */}
          {teacherAccepted === false && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Rejected
            </div>
          )}
          <div className="w-full h-40 relative">
            <Image
              src={order.imageURL}
              alt="Order image"
              layout="fill"
              objectFit="cover"
              className="w-full h-full"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold">
              {order.teacherOrder.teacher.firstname}{" "}
              {order.teacherOrder.teacher.lastname}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {formattedDate}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Tlf:</span>{" "}
              {order.teacherOrder.teacher.phone}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Hvordan:</span> {teachingMethod}
            </p>
            {physicalOrDigital && meetingLocation && (
              <p className="mt-2 text-sm">
                <span className="font-semibold">Hvor:</span>{" "}
                {meetingLocation}
              </p>
            )}
            <p className="mt-2 text-sm">
              <span className="font-semibold">Kommentarer:</span> {comments}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Svar fra lærer:</span>{" "}
              {acceptanceText}
            </p>
          </div>
        </div>
      </AlertDialogTrigger>

      {/* Alert dialog for editing */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Endre forespørselen din</AlertDialogTitle>
          <AlertDialogDescription>
            Oppdater undervisningsform, kommentarer og mer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4">
            <p className="text-sm font-medium">Ønsker du digital eller fysisk undervisning? <br/> 
            <span className="text-xs">Merk at det ikke er sikkert læreren din er tiljengelig i begge undervisningsformer</span></p>
            <RadioGroup
              onValueChange={(value) => setPhysicalOrDigital(value === "Fysisk")}
              value={physicalOrDigital ? "Fysisk" : "Digitalt"}
              className="flex space-x-4 mt-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Fysisk" id="physical" />
                <Label htmlFor="physical">Fysisk</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Digitalt" id="digital" />
                <Label htmlFor="digital">Digitalt</Label>
              </div>
            </RadioGroup>
          </div>
          {physicalOrDigital && (
            <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4">
              <p className="text-sm font-medium">Hvor ønkser du å møtes? <br/>
              <span className="text-xs">Skriv gjerne at du er fleksibel, ettersom læreren kan bo/studere langt unna</span></p>
              <Textarea
                placeholder="Hvor vil dere helst møtes"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                rows={2}
              />
            </div>
          )}
          <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4">
            <p className="text-sm font-medium">Har du noe læreren din burde vite</p>
            <Textarea
              placeholder="Jeg er allergisk mot pels"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter className="mt-4 flex justify-between">
          <AlertDialogCancel>Tilbake</AlertDialogCancel>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleDelete}>
              Slett forespørselen
            </Button>
            <AlertDialogAction onClick={handleSaveClick}>
              Lagre endringer
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
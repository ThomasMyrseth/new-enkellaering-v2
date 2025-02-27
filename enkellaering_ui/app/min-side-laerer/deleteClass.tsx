"use client"
import { Button } from "@/components/ui/button";
import React from "react"; 

const deleteClass = async (classId: string) => {
    const token = localStorage.getItem('token'); // Or use a more secure storage method
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!BASEURL) {
        console.error("BASEURL is not defined");
        return false;
    }

    const response = await fetch(`${BASEURL}/delete-class`, {
        method: 'POST', // Change to 'DELETE' if the backend supports it
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ class_id: classId })
    });

    return response.ok;
};


export const DeleteClass = ({hasPaid, hasInvoiced, classId} : {hasPaid :boolean, hasInvoiced :boolean, classId :string}) => {

    const handleButtonClick = async () => {
        const res = await deleteClass(classId)

        if (!res) {
            alert("Error deleting class")
        }
        if (res) {
            alert("timen er slettet")
        }
    }
    return (<>
        <Button
            className={`${(hasPaid || hasInvoiced)? '' :'bg-red-400 dark:bg-red-800 dark:text-neutral-200'} m-0`}
            disabled={hasPaid || hasInvoiced}
            onClick={handleButtonClick}
        >
            Slett
        </Button>
    </>)
}
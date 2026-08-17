"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Student } from "../types"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL

export const DiscountPopover = ({ student, onDiscountUpdated }: { student: Student, onDiscountUpdated: (studentUserId: string, discount: number) => void }) => {
    const token = localStorage.getItem('token')
    const [discount, setDiscount] = useState<number>(student.discount || 0)
    const [open, setOpen] = useState(false)

    const handleUpdateDiscount = async () => {
        try {
            const response = await fetch(`${BASEURL}/update-student-discount`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "student_user_id": student.user_id,
                    "discount": discount / 100
                })
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            toast.success(`Rabatt oppdatert for ${student.firstname_parent}`)
            setOpen(false)
            onDiscountUpdated(student.user_id, discount / 100)
        } catch (error) {
            toast.error(`Oppdatering feilet: ${error}`)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">{Math.round((student.discount || 0) * 100)}% Rabatt</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Sett rabatt</h4>
                        <p className="text-sm text-muted-foreground">
                            Sett rabatt som heltall (f.eks. 10 for 10%)
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="discount">Rabatt</Label>
                            <Input
                                id="discount"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={discount}
                                onChange={(e) => setDiscount(parseFloat(e.target.value))}
                                className="col-span-2 h-8"
                            />
                        </div>
                        <Button onClick={handleUpdateDiscount} variant="secondary">Oppdater</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

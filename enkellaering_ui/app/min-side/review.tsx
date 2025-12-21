"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Student, Teacher } from "../admin/types";

const LeaveReview = ({
  token,
  baseUrl,
  teachers,
  student,
}: {
  token: string;
  baseUrl: string;
  teachers: Teacher[];
  student: Student;
}) => {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState<string>("");
  const [name, setName] = useState<string>(student.firstname_parent);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(teachers[0]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${baseUrl}/upload-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacher_user_id: selectedTeacher.user_id,
          rating: rating,
          comment: comment,
          name: name,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast('Takk for din omtale!')
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
    setIsSending(false);
  };

  const handleRatingChange = (value: string) => {
    setRating(parseInt(value) as 1 | 2 | 3 | 4 | 5);
  };

  return (
    <div className="my-4 w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Legg igjen en omtale av din(e) lærer(e)
      </h2>

      {success && (
        <p className="text-green-500 text-sm mt-2">Tusen takk!</p>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Name Input */}
        <LabelInputContainer>
          <Label htmlFor="name">Ditt navn (valgfritt)</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt navn"
          />
        </LabelInputContainer>

        {/* Rating Input */}
        <LabelInputContainer>
          <Label>Vurdering</Label>
          <RadioGroup
            defaultValue="5"
            value={String(rating)}
            onValueChange={handleRatingChange}
          >
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem value="1" id="rating-1" />
              <Label htmlFor="rating-1">1</Label>
              <RadioGroupItem value="2" id="rating-2" />
              <Label htmlFor="rating-2">2</Label>
              <RadioGroupItem value="3" id="rating-3" />
              <Label htmlFor="rating-3">3</Label>
              <RadioGroupItem value="4" id="rating-4" />
              <Label htmlFor="rating-4">4</Label>
              <RadioGroupItem value="5" id="rating-5" />
              <Label htmlFor="rating-5">5</Label>
            </div>
          </RadioGroup>
        </LabelInputContainer>

        {/* Teacher Combobox */}
        <LabelInputContainer>
          <Label>Velg lærer</Label>
          <ReviewTeacherCombobox
            teachers={teachers}
            selectedTeacher={selectedTeacher}
            onSelectTeacher={(teacher) => setSelectedTeacher(teacher)}
          />
        </LabelInputContainer>

        {/* Comment Input */}
        <LabelInputContainer>
          <Label htmlFor="comment">Kommentar</Label>
          <Textarea
            id="comment"
            rows={10}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Vi synes..."
          />
        </LabelInputContainer>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-8"
          variant="default"
          disabled={isSending}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default LeaveReview;

const LabelInputContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="mb-4">{children}</div>;
};


import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ReviewTeacherComboboxProps {
  teachers: Teacher[];
  selectedTeacher: Teacher;
  onSelectTeacher: (teacher: Teacher) => void;
}

const ReviewTeacherCombobox: React.FC<ReviewTeacherComboboxProps> = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const getTeacherName = (teacher: Teacher) =>
    `${teacher.firstname} ${teacher.lastname}`;

  if (teachers.length === 0) {
    return null;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className="w-[200px] flex items-center justify-between border rounded px-2 py-1 cursor-pointer"
        >
          <span>{getTeacherName(selectedTeacher)}</span>
          <ChevronsUpDown className="opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Søk etter lærer..." />
          <CommandList>
            <CommandEmpty>Ingen lærer funnet</CommandEmpty>
            <CommandGroup>
              {teachers.map((teacher) => (
                <CommandItem
                  key={teacher.user_id}
                  value={teacher.user_id}
                  onSelect={() => {
                    onSelectTeacher(teacher);
                    setOpen(false);
                  }}
                >
                  {getTeacherName(teacher)}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedTeacher.user_id === teacher.user_id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


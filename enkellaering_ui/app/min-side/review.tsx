"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const LeaveReview = ({token, baseUrl, teacherUserId, teacherName, firstnameParent,}: { token: string; baseUrl: string; teacherUserId: string; teacherName :string; firstnameParent: string;}) => {

    const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
    const [comment, setComment] = useState<string>("");
    const [name, setName] = useState<string>(firstnameParent);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSending(true);
        setError("");
        setSuccess(false);

        try {
        const response = await fetch(`${baseUrl}/reviews`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            teacherUserId,
            rating,
            comment,
            name,
            }),
        });

        if (response.ok) {
            setSuccess(true);
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
        <div className=" my-4 w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
            Legg igjen en omtale av {teacherName}
        </h2>

        {success && (
            <p className="text-green-500 text-sm mt-2">
            Tusen takk!
            </p>
        )}
        {error && (
            <p className="text-red-500 text-sm mt-2">
            {error}
            </p>
        )}

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
            <button
            type="submit"
            disabled={isSending}
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span
                className={cn(
                isSending
                    ? "bg-slate-400"
                    : "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl"
                )}
            >
                {isSending ? "Submitting..." : "Submit Review"}
            </span>
            </button>
        </form>
        </div>
    );
};

export default LeaveReview;

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
"use client"

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { nb } from 'date-fns/locale';

interface SessionDateTimePickerProps {
    onStartTimeSelected: (date: Date) => void;
    onEndTimeSelected: (date: Date) => void;
}

export function SessionDateTimePicker({ onStartTimeSelected, onEndTimeSelected }: SessionDateTimePickerProps) {
    const [startDateTime, setStartDateTime] = useState<Date | null>(null);
    const [endDateTime, setEndDateTime] = useState<Date | null>(null);

    const handleStartDateTimeChange = (date: Date | null) => {
        if (date) {
            setStartDateTime(date);
            onStartTimeSelected(date);

            // If end date is null, set it to the same date but keep time at default
            if (!endDateTime) {
                const newEndDate = new Date(date);
                newEndDate.setHours(0, 0, 0, 0); // Reset time to midnight
                setEndDateTime(newEndDate);
                onEndTimeSelected(newEndDate);
            }
        }
    };

    const handleEndDateTimeChange = (date: Date | null) => {
        if (date) {
            setEndDateTime(date);
            onEndTimeSelected(date);

            // If start date is null, set it to the same date but keep time at default
            if (!startDateTime) {
                const newStartDate = new Date(date);
                newStartDate.setHours(0, 0, 0, 0); // Reset time to midnight
                setStartDateTime(newStartDate);
                onStartTimeSelected(newStartDate);
            }
        }
    };

    const baseInputStyles = cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium",
        "border border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900",
        "dark:border-stone-800 dark:bg-stone-950 dark:hover:bg-stone-800 dark:hover:text-stone-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2",
        "h-12 py-2 text-center w-full px-4",
        "disabled:pointer-events-none disabled:opacity-50"
    );

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-medium text-center">Når startet dere?</h3>
                <DatePicker
                    selected={startDateTime}
                    onChange={handleStartDateTimeChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale={nb}
                    className={baseInputStyles}
                    placeholderText="Velg dato og tid"
                    customInput={
                        <Button variant="outline" className="w-full justify-center text-center font-normal text-base">
                            {startDateTime ? startDateTime.toLocaleString('nb-NO', { 
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }) : "Velg dato og tid"}
                        </Button>
                    }
                />
            </div>
            <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-medium text-center">Når avsluttet dere?</h3>
                <DatePicker
                    selected={endDateTime}
                    onChange={handleEndDateTimeChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale={nb}
                    className={baseInputStyles}
                    placeholderText="Velg dato og tid"
                    customInput={
                        <Button variant="outline" className="w-full justify-center text-center font-normal text-base">
                            {endDateTime ? endDateTime.toLocaleString('nb-NO', { 
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }) : "Velg dato og tid"}
                        </Button>
                    }
                />
            </div>
        </div>
    );
} 
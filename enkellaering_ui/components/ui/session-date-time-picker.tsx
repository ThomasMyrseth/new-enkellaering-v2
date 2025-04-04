"use client"

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { nb } from 'date-fns/locale';

interface SessionDateTimePickerProps {
    onStartTimeSelected: (date: Date) => void;
    onEndTimeSelected: (date: Date) => void;
}

export function SessionDateTimePicker({ onStartTimeSelected, onEndTimeSelected }: SessionDateTimePickerProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [startTime, setStartTime] = useState<Date | null>(new Date());
    const [endTime, setEndTime] = useState<Date | null>(new Date());

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
            // Update start and end times with new date
            if (startTime) {
                const newStartTime = new Date(date);
                newStartTime.setHours(startTime.getHours());
                newStartTime.setMinutes(startTime.getMinutes());
                setStartTime(newStartTime);
                onStartTimeSelected(newStartTime);
            }
            if (endTime) {
                const newEndTime = new Date(date);
                newEndTime.setHours(endTime.getHours());
                newEndTime.setMinutes(endTime.getMinutes());
                setEndTime(newEndTime);
                onEndTimeSelected(newEndTime);
            }
        }
    };

    const handleStartTimeChange = (time: Date | null) => {
        if (time && selectedDate) {
            const newTime = new Date(selectedDate);
            newTime.setHours(time.getHours());
            newTime.setMinutes(time.getMinutes());
            setStartTime(newTime);
            onStartTimeSelected(newTime);
        }
    };

    const handleEndTimeChange = (time: Date | null) => {
        if (time && selectedDate) {
            const newTime = new Date(selectedDate);
            newTime.setHours(time.getHours());
            newTime.setMinutes(time.getMinutes());
            setEndTime(newTime);
            onEndTimeSelected(newTime);
        }
    };

    const baseInputStyles = cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium",
        "border border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900",
        "dark:border-stone-800 dark:bg-stone-950 dark:hover:bg-stone-800 dark:hover:text-stone-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2",
        "h-12 py-2 text-center",
        "disabled:pointer-events-none disabled:opacity-50"
    );

    const dateInputStyles = cn(baseInputStyles, "w-full px-4");
    const timeInputStyles = cn(baseInputStyles, "w-32 md:w-28 px-2");

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col space-y-2 items-center w-full">
                <h3 className="text-lg font-medium">Dato</h3>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    locale={nb}
                    className={dateInputStyles}
                    customInput={
                        <Button variant="outline" className="w-full justify-start text-left font-normal text-base">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? selectedDate.toLocaleDateString('nb-NO') : "Velg dato"}
                        </Button>
                    }
                />
            </div>
            <div className="flex flex-row space-x-4 justify-center w-full">
                <div className="flex flex-col space-y-2 items-center w-full md:w-auto">
                    <h3 className="text-lg font-medium">Start</h3>
                    <DatePicker
                        selected={startTime}
                        onChange={handleStartTimeChange}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        timeFormat="HH:mm"
                        locale={nb}
                        className={timeInputStyles}
                    />
                </div>
                <div className="flex flex-col space-y-2 items-center w-full md:w-auto">
                    <h3 className="text-lg font-medium">Slutt</h3>
                    <DatePicker
                        selected={endTime}
                        onChange={handleEndTimeChange}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        timeFormat="HH:mm"
                        locale={nb}
                        className={timeInputStyles}
                    />
                </div>
            </div>
        </div>
    );
} 
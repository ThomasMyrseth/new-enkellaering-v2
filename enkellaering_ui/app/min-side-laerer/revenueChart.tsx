
"use client"
import { useState, useEffect } from "react";
import { Classes, Teacher } from "../admin/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
type FormattedClass = {
    started_at: string;
    payment: number;
}

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/server";

function calculatePayment(classSession: Classes, hourlyPay: number): number {
    const start = new Date(classSession.started_at);
    const end = new Date(classSession.ended_at);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = end.getTime() - start.getTime();
  
    // Convert milliseconds to hours
    const durationInHours = differenceInMilliseconds / (1000 * 60 * 60);
  
    // Calculate the payment
    const payment = durationInHours * hourlyPay;
  
    return Math.round(payment); // Optional: Round to the nearest integer
}

export function DailyRevenueChart({ teacher }: { teacher: Teacher }) {
    const token = localStorage.getItem('token')

    const [chartData, setChartData] = useState<Classes[]>()
    const [formattedChartData, setFormattedChartdata] = useState<FormattedClass[]>()
    const [totalPayment, setTotalPayment] = useState<number>(0); // Use state for totalPayment


    const chartConfig = {
        desktop: {
        label: "Desktop",
        color: "#2563eb",
        },
        mobile: {
        label: "Mobile",
        color: "#60a5fa",
        },
    } satisfies ChartConfig

    useEffect( () => {
        async function fetchRevenue() {
            try {
                const response = await fetch(`${BASEURL}/fetch-classes-for-teacher`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                }

                const data = await response.json()
                const classes = data.classes

                setChartData(classes)

            }
            catch {
            }
        }
        fetchRevenue()
    },[])


    useEffect(() => {
        if (chartData) {
          // Aggregate payments by date
          const aggregatedData = chartData.reduce<FormattedClass[]>((acc, c: Classes) => {

            //skip the class if it is already paid out
            if (c.paid_teacher) {
                return acc;
            }

            // Format the date
            const date = new Date(c.started_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
      
            // Calculate the payment for this class
            const payment = calculatePayment(c, parseInt(teacher?.hourly_pay));

      
            // Check if the date already exists in the accumulator
            const existingEntry = acc.find((entry: FormattedClass) => entry.started_at === date);
            if (existingEntry) {
              // If the date exists, add the payment to the existing total
              existingEntry.payment += payment;
            } else {
              // If the date doesn't exist, add a new entry
              acc.push({ started_at: date, payment });
            }
      
            return acc;
          }, []);
      
          // Sort the aggregated data chronologically
          const sortedData = aggregatedData.sort((a, b) => {
            const dateA = new Date(a.started_at).getTime();
            const dateB = new Date(b.started_at).getTime();
            return dateA - dateB; // Ascending order
          });
      
          setFormattedChartdata(sortedData);

          const total = aggregatedData.reduce(
            (sum, current) => sum + current.payment,
            0
          );
          setTotalPayment(total);
        
        }
      }, [chartData, teacher]);
    
    
    // if (formattedChartData?.length === 0) {
    // return <p>Loading...</p>;
    // }
    

    return(<div className="w-3/4 p-4">
        <Card>
        <CardHeader>
            <CardTitle>Timer du ikke har fått betalt for</CardTitle>
            <CardDescription>
                {new Date().toLocaleString("en-US", { month: "long" }).toUpperCase()}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={formattedChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="started_at"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="payment" fill="#FF5733" radius={4} />
            </BarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter>
            <h4>Totalt: <span className="font-bold">{totalPayment}</span>kr.</h4>

        </CardFooter>

        </Card>
    </div>)
}



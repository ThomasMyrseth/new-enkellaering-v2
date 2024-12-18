"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart";
  
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Classes } from "./types";
  

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

function calculatePayment(classSession: Classes, hourlyCharge: number): number {
    const start = new Date(classSession.started_at);
    const end = new Date(classSession.ended_at);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = end.getTime() - start.getTime();
  
    // Convert milliseconds to hours
    const durationInHours = differenceInMilliseconds / (1000 * 60 * 60);
  
    // Calculate the payment
    const payment = durationInHours * hourlyCharge;
  
    return Math.round(payment); // Optional: Round to the nearest integer
}

type FormattedClass = {
    started_at: string;
    payment: number;
}
function getDaysInMonth(year :number, month :number) {
    // Create a date object for the first day of the next month
    let date = new Date(year, month, 0);
    // Get the day, which represents the number of days in the month
    return date.getDate();
}

export function DailyRevenueChart({ admin_user_id }: { admin_user_id :string }) {
    const [chartData, setChartData] = useState<Classes[]>()
    const [formattedChartData, setFormattedChartdata] = useState<FormattedClass[]>([])
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
                const response = await fetch(`${BASEURL}/get-all-classes`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "admin_user_id": admin_user_id
                    })
                })

                if (!response.ok) {
                    alert("An error happened while fetching revenue")
                }

                const data = await response.json()
                const classes = data.classes

                setChartData(classes)

            }
            catch {
                alert("An error happened while fetching revenue")
            }
        }
        fetchRevenue()
    },[BASEURL, admin_user_id])

    //aggregate payments
    useEffect(() => {
        //go thrugh each day of the month
        const currentDate = new Date(); // Get the current date and time
        const currentMonth = currentDate.getMonth(); // Get the current month (0-11)
        const numberOfDays = getDaysInMonth(currentDate.getFullYear(), currentMonth + 1); // Get the number of days in the current month
        let totalPayment :number =0;

        //go through classses and populate chartdata by each day
        for (let day = 1; day <= numberOfDays; day++) {
            const thisDate :Date= new Date(currentDate.getFullYear(), currentMonth, day);
            const thisDateString: string = thisDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

            let totalPaymentToday :number = 0
            chartData?.forEach( c => {
                const startedAtDate = new Date(c.started_at);
                const startedAtString = startedAtDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

                if (startedAtString === thisDateString) {
                    totalPaymentToday += calculatePayment(c, 540);
                }
            })

            const formattedClass = {
                started_at: thisDateString,
                payment: totalPaymentToday
            }

            setFormattedChartdata(prevData => [...prevData, formattedClass])
            totalPayment += totalPaymentToday
        }

        setTotalPayment(totalPayment)

      }, [chartData, admin_user_id]);
    
    
    if (formattedChartData?.length === 0) {
        return <p>Loading...</p>;
    }


    return(<div className="w-full h-full">
        <Card>
        <CardHeader>
            <CardTitle>Ufakturerte timer for alle lærere</CardTitle>
            <CardDescription>
                {new Date().toLocaleString("en-US", { month: "long" }).toUpperCase()}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={formattedChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="dag"
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
            <h4>Totalt ufakturert denne måneded: <span className="font-bold">{totalPayment}</span>kr.</h4>

        </CardFooter>

        </Card>
    </div>)
}


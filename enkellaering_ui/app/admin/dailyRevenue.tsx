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
import { toast } from "sonner";
  

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

function calculatePayment(classSession: Classes, hourlyCharge: number, discount?: number): number {
    const start = new Date(classSession.started_at);
    const end = new Date(classSession.ended_at);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = end.getTime() - start.getTime();
  
    // Convert milliseconds to hours
    const durationInHours = differenceInMilliseconds / (1000 * 60 * 60);
  
    // Calculate the payment
    const payment = durationInHours * hourlyCharge;

    if (discount) {
        return Math.round(payment * (1 - discount));
    }
  
    return Math.round(payment); // Optional: Round to the nearest integer
}

type FormattedClass = {
    started_at: string;
    payment: number;
}
function getDaysInMonth(year :number, month :number) {
    // Create a date object for the first day of the next month
    const date = new Date(year, month, 0);
    // Get the day, which represents the number of days in the month
    return date.getDate();
}

export function DailyRevenueChart() {
    const token = localStorage.getItem('token')
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
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                      }
                })

                if (!response.ok) {
                    toast.error("An error happened while fetching revenue")
                }

                const data = await response.json()
                const classes = data.classes

                setChartData(classes)

            }
            catch {
                toast.error("An error happened while fetching revenue")
            }
        }
        fetchRevenue()
    },[token])

    //fetching chartData
    useEffect(() => {
        if (!chartData) return; // or if (chartData.length === 0) return;
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const numberOfDays = getDaysInMonth(currentDate.getFullYear(), currentMonth + 1);
      
        let totalPayment = 0;
        const tempFormattedData: FormattedClass[] = [];
      
        for (let day = 1; day <= numberOfDays; day++) {
          const thisDate = new Date(currentDate.getFullYear(), currentMonth, day);
          const thisDateString = thisDate.toISOString().split("T")[0];
      
          let totalPaymentToday = 0;
      
          chartData.forEach((c) => {
            const startedAtDate = new Date(c.started_at);
            const startedAtString = startedAtDate.toISOString().split("T")[0]; 
            if (startedAtString === thisDateString) {
                const discount = c.students?.discount || 0
                if (c.groupclass) {
                    totalPaymentToday += calculatePayment(c, 350, discount)
                }
                else {
                    totalPaymentToday += calculatePayment(c, 540, discount);
                }
            }
          });
      
          tempFormattedData.push({
            started_at: thisDateString,
            payment: totalPaymentToday,
          });
      
          totalPayment += totalPaymentToday;
        }
      
        // Now do just one update
        setFormattedChartdata(tempFormattedData);
        setTotalPayment(totalPayment);
      }, [chartData]);
    
    
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


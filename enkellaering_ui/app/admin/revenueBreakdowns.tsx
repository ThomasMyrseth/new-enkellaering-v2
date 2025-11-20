import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { MonthlyRevenue, TeacherRevenue, LocationRevenue } from "./types";

interface RevenueBreakdownsProps {
    revenueByMonth: MonthlyRevenue[];
    revenueByTeacher: TeacherRevenue[];
    revenueByLocation: LocationRevenue[];
}

export default function RevenueBreakdowns({
    revenueByMonth,
    revenueByTeacher,
    revenueByLocation
}: RevenueBreakdownsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('nb-NO', { month: 'short', year: '2-digit' });
    };

    // Prepare data for charts
    const monthlyData = revenueByMonth.map(m => ({
        month: formatMonth(m.month),
        Revenue: m.revenue,
        Profit: m.profit
    }));

    const topTeachers = revenueByTeacher.slice(0, 10);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-sm">
                                <span className="font-medium" style={{ color: entry.color }}>
                                    {entry.name}:
                                </span>{' '}
                                {formatCurrency(entry.value)}
                            </p>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Revenue Trend */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Revenue by Month</CardTitle>
                    <CardDescription>Monthly revenue and profit trend (last 12 months)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="month"
                                className="text-xs"
                            />
                            <YAxis
                                className="text-xs"
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue by Location */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Location (YTD)</CardTitle>
                    <CardDescription>Year-to-date revenue distribution across locations</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueByLocation} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                type="number"
                                className="text-xs"
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <YAxis
                                type="category"
                                dataKey="location"
                                className="text-xs"
                                width={100}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue by Teacher */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Revenue by Teacher (YTD)</CardTitle>
                    <CardDescription>Top 10 teachers by year-to-date revenue generated</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={topTeachers}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="teacherName"
                                className="text-xs"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis
                                className="text-xs"
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

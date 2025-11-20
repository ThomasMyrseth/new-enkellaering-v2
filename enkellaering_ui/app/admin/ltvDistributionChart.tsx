import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LTVDistributionBucket } from "./types";

interface LTVDistributionChartProps {
    data: LTVDistributionBucket[];
}

interface TooltipPayload {
    value?: number;
    payload?: {
        rangeStart?: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

export default function LTVDistributionChart({ data }: LTVDistributionChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Format data for the chart
    const chartData = data.map(bucket => ({
        range: bucket.rangeLabel,
        Active: bucket.activeCount,
        Churned: bucket.churnedCount,
        rangeStart: bucket.rangeStart
    }));

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const rangeStart = payload[0]?.payload?.rangeStart || 0;
            const totalStudents = (payload[0]?.value || 0) + (payload[1]?.value || 0);

            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    {rangeStart !== Infinity && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            LTV Range: {formatCurrency(rangeStart)}
                        </p>
                    )}
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="font-medium text-green-600">Active:</span> {payload[0]?.value || 0} students
                        </p>
                        <p className="text-sm">
                            <span className="font-medium text-red-600">Churned:</span> {payload[1]?.value || 0} students
                        </p>
                        <p className="text-sm font-semibold pt-1 border-t border-gray-200 dark:border-gray-700">
                            Total: {totalStudents} students
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Customer Lifetime Value Distribution</CardTitle>
                <CardDescription>
                    LTV distribution across active and churned students
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorChurned" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis
                            dataKey="range"
                            className="text-xs"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
                            className="text-xs"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Area
                            type="monotone"
                            dataKey="Active"
                            stackId="1"
                            stroke="#10b981"
                            fill="url(#colorActive)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="Churned"
                            stackId="1"
                            stroke="#ef4444"
                            fill="url(#colorChurned)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

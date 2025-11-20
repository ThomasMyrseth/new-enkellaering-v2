import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, UserCheck, TrendingDown, Calendar } from "lucide-react";

interface MetricsProps {
    totalRevenueYTD: number;
    totalProfitYTD: number;
    activeStudentsCount: number;
    activeTeachersCount: number;
    averageHourlyMargin: number;
    averageLTVPerStudent: number;
    churnRate: number;
    classesThisWeek: number;
    classesOneMonthAgoWeek: number;
}

export default function MetricsBentoGrid({
    totalRevenueYTD,
    totalProfitYTD,
    activeStudentsCount,
    activeTeachersCount,
    averageHourlyMargin,
    averageLTVPerStudent,
    churnRate,
    classesThisWeek,
    classesOneMonthAgoWeek
}: MetricsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Revenue YTD */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue YTD
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenueYTD)}</div>
                    <p className="text-xs text-muted-foreground">
                        Year to date revenue
                    </p>
                </CardContent>
            </Card>

            {/* Profit YTD */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Profit YTD
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalProfitYTD)}</div>
                    <p className="text-xs text-muted-foreground">
                        After teacher costs & travel
                    </p>
                </CardContent>
            </Card>

            {/* Active Students */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeStudentsCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Currently enrolled
                    </p>
                </CardContent>
            </Card>

            {/* Active Teachers */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Teachers
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeTeachersCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Not resigned
                    </p>
                </CardContent>
            </Card>

            {/* Average Hourly Margin */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg Hourly Margin
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(averageHourlyMargin)}</div>
                    <p className="text-xs text-muted-foreground">
                        Per teaching hour
                    </p>
                </CardContent>
            </Card>

            {/* Average LTV */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Avg LTV per Student
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(averageLTVPerStudent)}</div>
                    <p className="text-xs text-muted-foreground">
                        Lifetime value
                    </p>
                </CardContent>
            </Card>

            {/* Churn Rate */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Churn Rate
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(churnRate)}</div>
                    <p className="text-xs text-muted-foreground">
                        Inactive or no class in 60d
                    </p>
                </CardContent>
            </Card>

            {/* Classes This Week */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Classes This Week
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{classesThisWeek}</div>
                    <p className="text-xs text-muted-foreground">
                        {classesOneMonthAgoWeek} classes same week last month
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

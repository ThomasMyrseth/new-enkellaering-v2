"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MetricsBentoGrid from "./metricsBentoGrid";
import LTVDistributionChart from "./ltvDistributionChart";
import RevenueBreakdowns from "./revenueBreakdowns";
import { AnalyticsDashboard } from "./types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function AnalyticsOverview() {
    const router = useRouter();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch(`${BASEURL}/analytics-dashboard`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        alert('You are not authorized to view analytics');
                        router.push('/');
                        return;
                    }
                    throw new Error('Failed to fetch analytics data');
                }

                const data = await response.json();
                setAnalyticsData(data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [router]);

    if (loading) {
        return (
            <div className="w-full py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full py-12">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">Error loading analytics: {error}</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return null;
    }

    return (
        <div className="w-full space-y-8">
            {/* Page Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Comprehensive business metrics and performance indicators
                </p>
            </div>

            {/* Metrics Grid */}
            <MetricsBentoGrid
                totalRevenueYTD={analyticsData.totalRevenueYTD}
                totalProfitYTD={analyticsData.totalProfitYTD}
                activeStudentsCount={analyticsData.activeStudentsCount}
                activeTeachersCount={analyticsData.activeTeachersCount}
                averageHourlyMargin={analyticsData.averageHourlyMargin}
                averageLTVPerStudent={analyticsData.averageLTVPerStudent}
                churnRate={analyticsData.churnRate}
                classesThisWeek={analyticsData.classesThisWeek}
                classesOneMonthAgoWeek={analyticsData.classesOneMonthAgoWeek}
            />

            {/* LTV Distribution */}
            <LTVDistributionChart data={analyticsData.ltvDistribution} />

            {/* Revenue Breakdowns */}
            <RevenueBreakdowns
                revenueByMonth={analyticsData.revenueByMonth}
                revenueByTeacher={analyticsData.revenueByTeacher}
                revenueByLocation={analyticsData.revenueByLocation}
            />
        </div>
    );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Package, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsData {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overdueItems: number;
  dailyMovements: { date: string; checkIn: number; checkOut: number }[];
  mostActiveItems: { itemName: string; _sum: { quantity: number | null } }[];
  mostActiveUsers: { handledBy: string; _count: { movementId: number } }[];
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics?days=${timeRange}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const COLORS = ['#2b4198', '#FFBB28', '#FF8042', '#FF0000'];

  const itemStatusData = useMemo(() => {
    if (!analyticsData) return [];
    const inStock = analyticsData.totalItems - analyticsData.lowStockItems - analyticsData.outOfStockItems;
    return [
      { name: t("inStock"), value: inStock > 0 ? inStock : 0 },
      { name: t("lowStock"), value: analyticsData.lowStockItems },
      { name: t("outOfStock"), value: analyticsData.outOfStockItems },
      { name: t("overdue"), value: analyticsData.overdueItems },
    ];
  }, [analyticsData, t]);

  if (isLoading) {
    return (
      <Layout title={t("systemAnalytics")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return <Layout title={t("systemAnalytics")}><div className="text-center text-red-500">{t("error")}: {error}</div></Layout>;
  }

  if (!analyticsData) {
    return <Layout title={t("systemAnalytics")}><div className="text-center">{t("noDataAvailable")}</div></Layout>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout title={t("systemAnalytics")}>
        <div className="flex justify-end mb-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectTimeRange")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("last7Days")}</SelectItem>
              <SelectItem value="30">{t("last30Days")}</SelectItem>
              <SelectItem value="90">{t("last90Days")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">{t("totalInventory")}</CardTitle><Package className="h-4 w-4 text-[#2b4198]" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.totalItems}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">{t("lowStockItems")}</CardTitle><AlertTriangle className="h-4 w-4 text-amber-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.lowStockItems}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">{t("outOfStockItems")}</CardTitle><AlertCircle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.outOfStockItems}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">{t("overdueItems")}</CardTitle><AlertCircle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.overdueItems}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">{t("totalMovements")}</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.dailyMovements.reduce((sum, day) => sum + day.checkIn + day.checkOut, 0)}</div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader><CardTitle>{t("dailyMovements")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.dailyMovements}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                  <Line type="monotone" dataKey="checkIn" stroke="#2b4198" name={t("checkIn")} />
                  <Line type="monotone" dataKey="checkOut" stroke="#82ca9d" name={t("checkOut")} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("itemStatusDistribution")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={itemStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                    {itemStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader><CardTitle>{t("mostActiveItems")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.mostActiveItems}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="itemName" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="_sum.quantity" fill="#2b4198" name={t("quantityMoved")} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("mostActiveUsers")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.mostActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="handledBy" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="_count.movementId" fill="#82ca9d" name={t("movements")} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

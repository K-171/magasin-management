"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { Layout } from "@/components/layout"; // Import Layout component

export default function AdminPage() {
  const { t } = useLanguage();
  return (
    <Layout title={t("adminPanel")}> {/* Add Layout and title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/user-management">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{t("userManagement")}</CardTitle>
              <Users className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t("viewAndManageUsers")}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/invitations">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{t("invitations")}</CardTitle>
              <UserPlus className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t("inviteNewUsers")}</p>
            </CardContent>
          </Card>
        </Link>
        {/* System Analytics - Coming Soon */}
        <Link href="/admin/analytics">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{t("systemAnalytics")}</CardTitle>
              <BarChart2 className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t("viewDetailedAnalytics")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </Layout>
  );
}
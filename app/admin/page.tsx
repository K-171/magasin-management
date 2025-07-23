"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, BarChart2 } from "lucide-react";
import Link from "next/link";

import { Layout } from "@/components/layout"; // Import Layout component

export default function AdminPage() {
  return (
    <Layout title="Admin Panel"> {/* Add Layout and title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/user-management">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View and manage all users</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/invitations">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Invitations</CardTitle>
              <UserPlus className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Invite new users to the system</p>
            </CardContent>
          </Card>
        </Link>
        {/* System Analytics - Coming Soon */}
        <Link href="/admin/analytics">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">System Analytics</CardTitle>
              <BarChart2 className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View detailed system analytics</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </Layout>
  );
}
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Shield, Bell, FileText } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"

// Update the component to use actual user data
export default function Settings() {
  const { user, updateProfile } = useAuth()

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: false,
    lowStockAlerts: false,
    systemUpdates: false,
    activitySummary: false,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "15",
  })

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        verifySession();
        alert("Avatar updated successfully!");
      } else {
        alert(result.error || "Failed to update avatar");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert("An unexpected error occurred during avatar upload.");
    }
  };

  // Update the handleProfileUpdate function
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await updateProfile({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      username: profileForm.username,
      email: profileForm.email,
    })

    if (result.success) {
      alert("Profile updated successfully!")
    } else {
      alert(result.error || "Failed to update profile")
    }
  }

  const handleNotificationUpdate = (setting: string, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [setting]: value })
  }

  // Wrap the return statement with ProtectedRoute
  return (
    <ProtectedRoute>
      <Layout title="Settings" showSearch={false}>
        <div className="grid gap-6">
          <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6">
            <TabsList className="flex flex-col items-stretch justify-start h-full gap-2 w-full md:w-1/5">
              <TabsTrigger value="profile" className="flex items-center justify-start gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-start gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-start gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center justify-start gap-2">
                <FileText className="h-4 w-4" />
                Data Management
              </TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account information and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                            alt={user?.username || "User"}
                          />
                          <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left">
                          <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                          <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                            Change Avatar
                          </Button>
                          <p className="text-sm text-muted-foreground mt-1">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={profileForm.role}
                            onValueChange={(value) => setProfileForm({ ...profileForm, role: value })}
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="administrator">Administrator</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-center sm:justify-end">
                        <Button type="submit" className="w-full sm:w-auto bg-[#2b4198] hover:bg-opacity-90">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure how you receive notifications and alerts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailAlerts}
                          onCheckedChange={(checked) => handleNotificationUpdate("emailAlerts", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">Low Stock Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
                        </div>
                        <Switch
                          checked={notificationSettings.lowStockAlerts}
                          onCheckedChange={(checked) => handleNotificationUpdate("lowStockAlerts", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">System Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about system updates and maintenance
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.systemUpdates}
                          onCheckedChange={(checked) => handleNotificationUpdate("systemUpdates", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">Weekly Activity Summary</Label>
                          <p className="text-sm text-muted-foreground">
                            Get a weekly summary of inventory changes and activities
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.activitySummary}
                          onCheckedChange={(checked) => handleNotificationUpdate("activitySummary", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security and authentication options.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div></div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <Label className="text-base">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Select
                          value={securitySettings.sessionTimeout}
                          onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}
                        >
                          <SelectTrigger id="session-timeout" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select timeout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-center sm:justify-end">
                        <Button className="w-full sm:w-auto bg-[#2b4198] hover:bg-opacity-90">Save Security Settings</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Guidelines and information for importing and exporting inventory data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 text-lg">Importing Data</h4>
                      <div className="space-y-4 text-sm">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-semibold text-blue-900 mb-1">Supported File Formats</p>
                          <p className="text-blue-800">
                            You can import data using Microsoft Excel (<strong>.xlsx</strong>) or Comma-Separated Values (<strong>.csv</strong>) files.
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="font-semibold text-green-900 mb-1">Required Columns</p>
                          <p className="text-green-800 mb-2">
                            Your file must contain the following columns (the header names must match exactly):
                          </p>
                          <ul className="text-green-800 space-y-1 font-mono text-xs">
                            <li>• id</li>
                            <li>• name</li>
                            <li>• category</li>
                            <li>• quantity</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="font-semibold text-amber-900 mb-1">Importing Tips</p>
                          <ul className="text-amber-800 space-y-1 list-disc list-inside">
                            <li>Ensure all required columns are present and correctly named.</li>
                            <li>The <strong>id</strong> for each item must be unique. If an ID already exists, the import for that row will fail.</li>
                            <li>The <strong>quantity</strong> must be a whole number.</li>
                            <li>If a <strong>category</strong> does not exist, it will be automatically created.</li>
                            <li>The system automatically sets the date added and initial status based on the quantity.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 text-lg">Exporting Data</h4>
                      <p className="text-sm text-muted-foreground">
                        You can export your inventory data from the "All Stock" or "Reports" pages. The export tool allows you to download the current view as an Excel (.xlsx) file. You can select which columns to include in the final report.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

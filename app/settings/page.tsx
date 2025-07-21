"use client"

import type React from "react"

import { useState } from "react"
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
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "user",
  })

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
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt="John Doe"
                          />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left">
                          <Button variant="outline" size="sm">
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
                    <CardTitle>Data Import & Export</CardTitle>
                    <CardDescription>Manage your inventory data import and export settings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Import Guidelines</h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="font-medium text-blue-900 mb-1">Supported File Formats</p>
                            <p className="text-blue-700">CSV (.csv) and Text (.txt) files with comma-separated values</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="font-medium text-green-900 mb-1">Required Columns</p>
                            <ul className="text-green-700 space-y-1">
                              <li>
                                • <strong>name</strong> - Item name or title
                              </li>
                              <li>
                                • <strong>category</strong> - Electronics, Furniture, Accessories, or Office Supplies
                              </li>
                              <li>
                                • <strong>quantity</strong> - Number of items in stock (must be a positive number)
                              </li>
                            </ul>
                          </div>
                          <div className="p-3 bg-amber-50 rounded-lg">
                            <p className="font-medium text-amber-900 mb-1">Import Tips</p>
                            <ul className="text-amber-700 space-y-1">
                              <li>• Use the template download for correct formatting</li>
                              <li>• Ensure all required fields are filled</li>
                              <li>• Categories will be created automatically if they don't exist</li>
                              <li>• Items are automatically assigned IDs and current date</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-3">Data Validation</h4>
                        <div className="text-sm space-y-2">
                          <p>The system will validate your data and show:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>
                              <strong>Errors</strong> - Issues that prevent import (missing required fields, invalid data)
                            </li>
                            <li>
                              <strong>Warnings</strong> - Non-critical issues (new categories, formatting suggestions)
                            </li>
                            <li>
                              <strong>Preview</strong> - Shows exactly what will be imported
                            </li>
                          </ul>
                        </div>
                      </div>
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

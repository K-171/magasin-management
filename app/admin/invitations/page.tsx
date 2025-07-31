"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useSearchParams } from "next/navigation"
import { Layout } from "@/components/layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus, Mail, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import type { Invitation } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

export default function AdminPanel() {
  const { user, createInvitation, getInvitations, revokeInvitation } = useAuth()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const highlightedId = searchParams.get("highlight")
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    role: "user" as "admin" | "manager" | "user",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchInvitations = async () => {
    const fetchedInvitations = await getInvitations();
    setInvitations(fetchedInvitations);
  }

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await createInvitation(newInvitation.email, newInvitation.role)
      if (result.success) {
        setMessage({ type: "success", text: t("invitationSentSuccess") })
        setNewInvitation({ email: "", role: "user" })
        fetchInvitations();
        setIsCreateDialogOpen(false)
      } else {
        setMessage({ type: "error", text: result.error || t("failedToCreateInvitation") })
      }
    } catch (error) {
      setMessage({ type: "error", text: t("unexpectedError") })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm(t("confirmRevokeInvitation"))) return

    try {
      const result = await revokeInvitation(invitationId)
      if (result.success) {
        setMessage({ type: "success", text: t("invitationRevokedSuccess") })
        fetchInvitations();
      } else {
        setMessage({ type: "error", text: result.error || t("failedToRevokeInvitation") })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    }
  }

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.used) {
      return <Badge className="bg-green-100 text-green-800">{t("used")}</Badge>
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <Badge variant="destructive">{t("expired")}</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800">{t("pending")}</Badge>
  }

  const getStatusIcon = (invitation: Invitation) => {
    if (invitation.used) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
    return <Clock className="h-4 w-4 text-blue-600" />
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout title={t("adminPanel")} showSearch={false}>
        <div className="space-y-6">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{t("totalInvitations")}</CardTitle>
                <Mail className="h-4 w-4 text-[#2b4198]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invitations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{t("pending")}</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitations.filter((inv) => !inv.used && new Date(inv.expiresAt) > new Date()).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{t("used")}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invitations.filter((inv) => inv.used).length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("userInvitations")}</CardTitle>
                <CardDescription>{t("manageUserAccess")}</CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2b4198] hover:bg-opacity-90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("createInvitation")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateInvitation} className="space-y-4">
                    <div>
                      <Label htmlFor="email">{t("emailAddress")}</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={newInvitation.email}
                        onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                        placeholder={t("emailPlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">{t("role")}</Label>
                      <Select
                        value={newInvitation.role}
                        onValueChange={(value: "admin" | "manager" | "user") =>
                          setNewInvitation({ ...newInvitation, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectRole")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t("userRole")}</SelectItem>
                          <SelectItem value="manager">{t("managerRole")}</SelectItem>
                          <SelectItem value="admin">{t("adminRole")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#2b4198] hover:bg-opacity-90">
                      {isSubmitting ? t("sending") : t("sendInvitation")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("email")}</TableHead>
                      <TableHead>{t("role")}</TableHead>
                      <TableHead>{t("created")}</TableHead>
                      <TableHead>{t("expires")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("noInvitationsYet")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      invitations
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((invitation) => (
                          <TableRow key={invitation.id} className={`${highlightedId === invitation.id ? 'bg-blue-100' : ''}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(invitation)}
                                {getStatusBadge(invitation)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{invitation.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {invitation.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                            <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                            <TableCell>
                              {!invitation.used && new Date(invitation.expiresAt) > new Date() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRevokeInvitation(invitation.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {t("revoke")}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("noInvitationsYet")}
                  </div>
                ) : (
                  invitations
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((invitation) => (
                      <Card key={invitation.id} className={`bg-white shadow-sm rounded-lg ${highlightedId === invitation.id ? 'border-2 border-blue-400' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <p className="font-bold text-gray-800 truncate">{invitation.email}</p>
                              <Badge variant="outline" className="capitalize mt-1">{invitation.role}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invitation)}
                              {getStatusBadge(invitation)}
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">{t("created")}</p>
                              <p className="font-medium">{formatDate(invitation.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">{t("expires")}</p>
                              <p className="font-medium">{formatDate(invitation.expiresAt)}</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                            {!invitation.used && new Date(invitation.expiresAt) > new Date() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

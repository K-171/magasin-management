"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

export default function UserManagementPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        toast.error(`${t("failedToFetchUsers")} ${errorData.error || ''}`);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(t("unexpectedErrorFetchingUsers"));
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: editingUser.role }),
        }
      );

      if (response.ok) {
        await fetchUsers();
        setIsEditDialogOpen(false);
        toast.success(t("userRoleUpdatedSuccess"));
      } else {
        toast.error(t("failedToUpdateUserRole"));
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error(t("unexpectedErrorUpdatingUserRole"));
    }
  };

  if (user?.role !== "admin") {
    return (
      <Layout title={t("forbidden")}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("forbidden")}</h1>
          <p>{t("permissionDenied")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("userManagement")}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-[#3d414a] mb-6">{t("allUsers")}</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-600">Username</TableHead>
                <TableHead className="font-semibold text-gray-600">Email</TableHead>
                <TableHead className="font-semibold text-gray-600">Role</TableHead>
                <TableHead className="font-semibold text-gray-600 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="text-[#2b4198] hover:text-[#2b4198] hover:bg-blue-50 mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateUser} className="w-full bg-[#2b4198] hover:bg-opacity-90">
                Update Role
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

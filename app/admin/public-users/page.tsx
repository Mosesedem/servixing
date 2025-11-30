"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Mail, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
  activity: {
    workOrders: number;
    supportTickets: number;
    devices: number;
    payments: number;
  };
  lastActivity?: string;
  engagementScore: number;
}

export default function AdminPublicUsers() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/public-users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching public users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/public-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [userId] }),
      });
      if (response.ok) {
        alert("Invitation sent successfully");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this public user?")) return;
    try {
      const response = await fetch(`/api/admin/public-users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Public Users Management</h1>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchUsers}>Search</Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading public users...
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No public users found</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Phone</th>
                <th className="text-center p-3 font-semibold">Orders</th>
                <th className="text-center p-3 font-semibold">Tickets</th>
                <th className="text-center p-3 font-semibold">Engagement</th>
                <th className="text-left p-3 font-semibold">Joined</th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-3">{user.name || "N/A"}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone || "N/A"}</td>
                  <td className="p-3 text-center font-semibold">
                    {user.activity.workOrders}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {user.activity.supportTickets}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                      {user.engagementScore}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/public-users/${user.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvitation(user.id)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

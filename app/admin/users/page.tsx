"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  deviceCount: number;
  orderCount: number;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error(" Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      {loading ? (
        <div className="text-center text-muted-foreground">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-center p-3 font-semibold">Devices</th>
                <th className="text-center p-3 font-semibold">Orders</th>
                <th className="text-left p-3 font-semibold">Joined</th>
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
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {user.deviceCount}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {user.orderCount}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
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

import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

export default function UserPermissions({ user }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUsers = () => fetchUsers().then(setUsers).catch((e) => setError(e.message));

    useEffect(() => {
        loadUsers().finally(() => setLoading(false));
    }, []);

    const deleteUser = async (aUser) => {
        if (!confirm("Do you wish to Delete Account?")) return;
        try {
            const res = await fetch(`http://localhost:8080/api/auth/user/${aUser.userId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) return alert(await res.text());
            alert("Account Deleted");
            loadUsers();
        } catch {
            alert("Something went wrong. Please try again.");
        }
    };

    const updateRole = async (userId, role) => {
        if (!confirm(`Make this user ${role === "admin" ? "Admin" : "User"}?`)) return;
        try {
            const res = await fetch(`http://localhost:8080/api/auth/admin/users/${userId}/role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (!res.ok) return alert(await res.text());
            alert("Role updated successfully");
            loadUsers();
        } catch {
            alert("Something went wrong. Please try again.");
        }
    };

    const fetchUsers = async () => {
        const res = await fetch("http://localhost:8080/api/auth/admin/users", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        return Array.isArray(json) ? json : json.users ?? json.data ?? [];
    };

    return (
        <Card className="p-3">
            <Card.Header><Card.Subtitle>User Permissions</Card.Subtitle></Card.Header>
            <Card.Body style={{ overflowX: "auto" }}>
                {loading && <Spinner animation="border" />}
                {error && <p>Error: {error}</p>}
                {!loading && !error && (
                    <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created</th>
                                <th>Delete</th>
                                <th>Toggle Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u._id || u.id || i}>
                                    <td>{i + 1}</td>
                                    <td>{u.name || u.username || "—"}</td>
                                    <td>{u.email || "—"}</td>
                                    <td>{u.role || "—"}</td>
                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => deleteUser(u)}>
                                            Delete
                                        </Button>
                                    </td>
                                    <td>
                                        <Button variant="warning" size="sm"
                                            onClick={() => updateRole(u.userId, u.role === "admin" ? "user" : "admin")}>
                                            Make {u.role === "admin" ? "User" : "Admin"}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card.Body>
        </Card>
    );
}

import { Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { useForm } from "react-hook-form";
import { UserContext } from './User';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

const isLogin = (aUser) => {
    return (aUser === null || aUser === undefined || Object.keys(aUser).length === 0);
};

export default function Settings() {
    const { user, setUser } = useContext(UserContext);
    const [selectedGenres, setSelectedGenres] = useState(user?.favGeneres || []);
    const [accountStatus, setAccountStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [prefsStatus, setPrefsStatus] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset: resetAccount } = useForm();
    const { register: registerPw, handleSubmit: handleSubmitPw, formState: { errors: pwErrors }, watch, reset: resetPw } = useForm();
    const navigate = useNavigate();

    if (isLogin(user)) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Card className="p-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>
                        <Card.Body>
                            <PersonCircle size={64} color="#C9A84C" className="mb-3" />
                            <Card.Title>Not Logged In</Card.Title>
                            <p className="card-text mb-4">You need to be logged in to view your settings.</p>
                            <Button className="w-100" onClick={() => navigate("/login")}>Go to Login</Button>
                        </Card.Body>
                    </Card>
                </div>
            </Layout>
        );
    }

    const deleteUser = async () => {
        if (window.confirm("Do you wish to Delete Account?")) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${user.userId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    setDeleteStatus({ message: "Failed to delete account.", type: "danger" });
                    return;
                }
                setUser(null);
                navigate("/");
            } catch {
                setDeleteStatus({ message: "Something went wrong. Please try again.", type: "danger" });
            }
        }
    };

    const changeAccountInfo = async (data) => {
        const updates = {};
        if (data.username) updates.username = data.username;
        if (data.email) updates.email = data.email;
        if (Object.keys(updates).length === 0) {
            setAccountStatus({ message: "No changes made.", type: "warning" });
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${user.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                setAccountStatus({ message: "Failed to update account info.", type: "danger" });
            } else {
                setUser(prev => ({ ...prev, ...updates }));
                setAccountStatus({ message: "Account updated successfully!", type: "success" });
                resetAccount();
            }
        } catch {
            setAccountStatus({ message: "Something went wrong. Please try again.", type: "danger" });
        }
    };

    const changePassword = async (data) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${user.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: data.password }),
            });
            if (!response.ok) {
                setPasswordStatus({ message: "Failed to update password.", type: "danger" });
            } else {
                setPasswordStatus({ message: "Password updated successfully!", type: "success" });
                resetPw();
            }
        } catch {
            setPasswordStatus({ message: "Something went wrong. Please try again.", type: "danger" });
        }
    };

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const updatePreferences = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${user.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favGeneres: selectedGenres }),
            });
            if (!response.ok) {
                setPrefsStatus({ message: "Failed to update preferences.", type: "danger" });
            } else {
                setUser(prev => ({ ...prev, favGeneres: selectedGenres }));
                setPrefsStatus({ message: "Preferences saved!", type: "success" });
            }
        } catch {
            setPrefsStatus({ message: "Something went wrong. Please try again.", type: "danger" });
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Card className="p-3" style={{ width: "100%", maxWidth: "800px" }}>
                    <Card.Header className="text-center border-0 bg-transparent pt-3">
                        <PersonCircle size={64} color="#C9A84C" />
                        <Card.Title className="mt-2">User Settings</Card.Title>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column gap-3">

                        {/* Account Info */}
                        <Card>
                            <Card.Header><Card.Subtitle>Account Info</Card.Subtitle></Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit(changeAccountInfo)}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Change Username</Form.Label>
                                        <Form.Control
                                            {...register("username", {
                                                minLength: { value: 3, message: "Username must be at least 3 characters" },
                                                maxLength: { value: 20, message: "Username must be under 20 characters" },
                                                pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" }
                                            })}
                                            type="text"
                                            placeholder={user.username}
                                        />
                                        {errors.username && <p className="text-danger small mt-1">{errors.username.message}</p>}
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Change Email address</Form.Label>
                                        <Form.Control
                                            {...register("email", {
                                                pattern: { value: /^\S+@\S+$/i, message: "A valid email is required" }
                                            })}
                                            type="email"
                                            placeholder={user.email}
                                        />
                                        {errors.email && <p className="text-danger small mt-1">{errors.email.message}</p>}
                                    </Form.Group>
                                    {accountStatus && (
                                        <Form.Label className={`text-${accountStatus.type} w-100 text-center mb-2`}>
                                            {accountStatus.message}
                                        </Form.Label>
                                    )}
                                    <Button type="submit" className="w-100 mb-3">Update Account Info</Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Password */}
                        <Card>
                            <Card.Header><Card.Subtitle>Password</Card.Subtitle></Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmitPw(changePassword)}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Enter New Password</Form.Label>
                                        <Form.Control
                                            {...registerPw("password", {
                                                required: "Password is required",
                                                minLength: { value: 8, message: "Password must be at least 8 characters" },
                                                pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)/, message: "Password must contain at least one letter and one number" }
                                            })}
                                            type="password"
                                            placeholder="New Password"
                                        />
                                        {pwErrors.password && <p className="text-danger small mt-1">{pwErrors.password.message}</p>}
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirm New Password</Form.Label>
                                        <Form.Control
                                            {...registerPw("confirmPassword", {
                                                required: "Please confirm your password",
                                                validate: val => val === watch("password") || "Passwords do not match"
                                            })}
                                            type="password"
                                            placeholder="Confirm New Password"
                                        />
                                        {pwErrors.confirmPassword && <p className="text-danger small mt-1">{pwErrors.confirmPassword.message}</p>}
                                    </Form.Group>
                                    {passwordStatus && (
                                        <Form.Label className={`text-${passwordStatus.type} w-100 text-center mb-2`}>
                                            {passwordStatus.message}
                                        </Form.Label>
                                    )}
                                    <Button type="submit" className="w-100 mb-3">Update Password</Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Preferences */}
                        <Card>
                            <Card.Header><Card.Subtitle>Preferences</Card.Subtitle></Card.Header>
                            <Card.Body>
                                <Form.Label>Favourite Genres</Form.Label>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {["Action","Comedy","Drama","Horror","Romance","Sci-Fi","Thriller","Animation","Documentary","Fantasy","Mystery","Adventure","Crime","Family","History"].map(genre => (
                                        <Badge
                                            key={genre}
                                            bg={selectedGenres.includes(genre) ? "warning" : "secondary"}
                                            style={{ cursor: "pointer", fontSize: "0.85rem", padding: "8px 12px" }}
                                            onClick={() => toggleGenre(genre)}
                                        >
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>
                                {prefsStatus && (
                                    <Form.Label className={`text-${prefsStatus.type} w-100 text-center mb-2`}>
                                        {prefsStatus.message}
                                    </Form.Label>
                                )}
                                <Button className="w-100" onClick={updatePreferences}>Save Preferences</Button>
                            </Card.Body>
                        </Card>

                        {/* Delete Account */}
                        <div className="d-flex gap-3">
                            <Card className="p-3" style={{ maxWidth: "218px", borderColor: "#A8293E" }}>
                                <Card.Header style={{ borderColor: "#A8293E" }}>
                                    <Card.Subtitle style={{ color: "#A8293E" }}>
                                        WARNING: All data will be irrecoverable
                                    </Card.Subtitle>
                                </Card.Header>
                                <Card.Body>
                                    {deleteStatus && (
                                        <Form.Label className={`text-${deleteStatus.type} w-100 text-center mb-2`}>
                                            {deleteStatus.message}
                                        </Form.Label>
                                    )}
                                    <Button variant="warning" onClick={deleteUser}>Delete Account</Button>
                                </Card.Body>
                            </Card>
                        </div>

                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}
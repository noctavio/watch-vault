import { Card, Form, Button, Badge } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { useForm } from "react-hook-form";
import { UserContext } from './User';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

const isLogin = (aUser) => {
    return (aUser === null || aUser === undefined || Object.keys(aUser).length === 0);
};

export default function Settings(){
    const { user, setUser } = useContext(UserContext);
    const [selectedGenres, setSelectedGenres] = useState(user?.favGeneres || []);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { register: registerPw, handleSubmit: handleSubmitPw, formState: { errors: pwErrors }, watch } = useForm();
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
                            <Button className="w-100" onClick={() => navigate("/login")}>
                                Go to Login
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </Layout>
        );
    }

    const deleteUser = async () => {
        if(confirm("Do you wish to Delete Account?")){
            try {
                const response = await fetch(`http://localhost:8080/api/auth/user/${user.userId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
                if(!response.ok){
                    const errorText = await response.text();
                    alert(errorText);
                    return;
                }
                alert("Account Deleted");
                setUser({});
                navigate("/");
            } catch {
                alert("Something went wrong. Please try again.");
            }
        }
    };

    const changeAccountInfo = async (data) => {
        const updates = {};
        if (data.username) updates.username = data.username;
        if (data.email) updates.email = data.email;
        if (Object.keys(updates).length === 0) {
            alert("No changes made.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/auth/user/${user.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                alert("Failed to update account info.");
            } else {
                setUser(prev => ({ ...prev, ...data }));
                alert("Account updated successfully!");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        }
    };

    const changePassword = async (data) => {
        try {
            const response = await fetch(`http://localhost:8080/api/auth/user/${user.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: data.password }),
            });
            if (!response.ok) {
                alert("Failed to update password.");
            } else {
                setUser(prev => ({ ...prev, password: data.password }));
                alert("Password updated successfully!");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        }
    };

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const updatePreferences = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/auth/user/${user.userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favGeneres: selectedGenres }),
            });
            if (!response.ok) {
                alert("Failed to update preferences.");
            } else {
                setUser(prev => ({ ...prev, favGeneres: selectedGenres }));
                alert("Preferences saved!");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        }
    };

    return(
        <Layout>
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Card className="p-3" style={{ width: "100%", maxWidth: "800px" }}>
                    <Card.Header className="text-center border-0 bg-transparent pt-3">
                        <PersonCircle size={64} color="#C9A84C" />
                        <Card.Title className="mt-2">User Settings</Card.Title>
                    </Card.Header>
                        <Card.Body className="d-flex flex-column gap-3">
                            <Card>
                            <Card.Header><Card.Subtitle>Account Info</Card.Subtitle></Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit(changeAccountInfo)}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            {...register("username", { minLength: 3 })}
                                            type="text"
                                            placeholder={user.username}
                                        />
                                        {errors.username?.type === 'minLength' && (
                                            <p className="text-danger small mt-1">Username must be at least 3 characters</p>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control
                                            {...register("email", { pattern: /^\S+@\S+$/i })}
                                            type="email"
                                            placeholder={user.email}
                                        />
                                        {errors.email && (
                                            <p className="text-danger small mt-1">A valid email is required</p>
                                        )}
                                    </Form.Group>
                                    <Button type="submit" className="w-100 mb-3">
                                        Update Account Info
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        <Card className="d-flex flex-column gap-3">
                            <Card.Header><Card.Subtitle>Password</Card.Subtitle></Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmitPw(changePassword)}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password*</Form.Label>
                                        <Form.Control
                                            {...registerPw("password", { required: true, minLength: 8 })}
                                            type="password"
                                            placeholder="Password"
                                        />
                                        {pwErrors.password?.type === 'required' && <p className="text-danger small mt-1">Password is required</p>}
                                        {pwErrors.password?.type === 'minLength' && <p className="text-danger small mt-1">Password must be at least 8 characters</p>}
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirm Password*</Form.Label>
                                        <Form.Control
                                            {...registerPw("confirmPassword", {
                                                required: true,
                                                validate: val => val === watch("password") || "Passwords do not match"
                                            })}
                                            type="password"
                                            placeholder="Confirm Password"
                                        />
                                        {pwErrors.confirmPassword?.type === 'required' && <p className="text-danger small mt-1">Confirm password is required</p>}
                                        {pwErrors.confirmPassword && <p className="text-danger small mt-1">{pwErrors.confirmPassword.message}</p>}
                                    </Form.Group>
                                    <Button type="submit" className="w-100 mb-3">
                                        Update Password
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>

                        <Card className="d-flex flex-column gap-3">
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
                                <Button className="w-100" onClick={updatePreferences}>
                                    Save Preferences
                                </Button>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3">
                            <Card className="p-3"style={{ maxWidth: "218px", borderColor: "#A8293E" }}>
                                <Card.Header style={{ borderColor: "#A8293E" }}>
                                    <Card.Subtitle style={{ color: "#A8293E" }}>
                                        WARNING: All data will be irrecoverable
                                    </Card.Subtitle>
                                </Card.Header>
                                <Card.Body>
                                    <Button variant="warning" onClick={deleteUser}>
                                        Delete Account
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}

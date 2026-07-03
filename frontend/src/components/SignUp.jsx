import { Card, Form, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { useForm } from "react-hook-form";
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';
import { UserContext } from './User';

export default function SignUp() {
    const { setUser } = useContext(UserContext);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState(null);
    const [usernameError, setUsernameError] = useState(null);
    const [emailError, setEmailError] = useState(null);

    const onSubmit = async (data) => {
        setStatusMessage(null);
        setUsernameError(null);
        setEmailError(null);
        const url = `${import.meta.env.VITE_API_URL}/api/auth/register`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await response.json();
            if (!response.ok) {
                if (json.error === 'username') {
                    setUsernameError('Username is already taken');
                } else if (json.error === 'email') {
                    setEmailError('Email is already taken');
                } else {
                    setStatusMessage({ message: json.error || "Something went wrong.", type: "danger" });
                }
                return;
            }
            // Auto-login on success
            localStorage.setItem("token", json.token);
            setUser(json);
            navigate("/");
        } catch (error) {
            setStatusMessage({ message: "Something went wrong. Please try again.", type: "danger" });
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Card className="p-3" style={{ width: "100%", maxWidth: "400px" }}>
                    <Card.Header className="text-center border-0 bg-transparent pt-3">
                        <PersonCircle size={64} />
                        <Card.Title className="mt-2 mb-0">Create Account</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>Username*</Form.Label>
                                <Form.Control
                                    {...register("username", { required: true, minLength: 3 })}
                                    type="text"
                                    placeholder="Enter Username"
                                />
                                {errors.username?.type === 'required' && <p className="text-danger small mt-1">Username is required</p>}
                                {errors.username?.type === 'minLength' && <p className="text-danger small mt-1">Username must be at least 3 characters</p>}
                                {usernameError && <p className="text-danger small mt-1">{usernameError}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Label>Email address*</Form.Label>
                                <Form.Control
                                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                                    type="email"
                                    placeholder="Enter Email"
                                />
                                {errors.email?.type === 'required' && <p className="text-danger small mt-1">Email is required</p>}
                                {errors.email?.type === 'pattern' && <p className="text-danger small mt-1">A valid email is required</p>}
                                {emailError && <p className="text-danger small mt-1">{emailError}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formPassword">
                                <Form.Label>Password*</Form.Label>
                                <Form.Control
                                    {...register("password", { required: true, minLength: 8 })}
                                    type="password"
                                    placeholder="Password"
                                />
                                {errors.password?.type === 'required' && <p className="text-danger small mt-1">Password is required</p>}
                                {errors.password?.type === 'minLength' && <p className="text-danger small mt-1">Password must be at least 8 characters</p>}
                            </Form.Group>
                            {statusMessage && (
                                <Form.Label className={`text-${statusMessage.type} w-100 text-center mb-2`}>
                                    {statusMessage.message}
                                </Form.Label>
                            )}
                            <Button variant="primary" type="submit" className="w-100 mb-3">
                                Create Account
                            </Button>
                            <Form.Group className="text-center">
                                <Form.Text className="me-1" style={{ color: '#ffffff' }}>Already have an account?</Form.Text>
                                <NavLink to="/login">Login Here</NavLink>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}
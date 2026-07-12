import { Card, Form, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { useForm } from "react-hook-form";
import { UserContext } from './UserContext';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

export default function Login(){
    const { user, setUser } = useContext(UserContext);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loginStatus, setLoginStatus] = useState(null);

    const onSubmit = async (data) => {
        const url = `${import.meta.env.VITE_API_URL}/api/auth/login`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                setLoginStatus({ message: "Invalid Username or Password", type: "danger" });
            } else {
                const json = await response.json();
                localStorage.setItem("token", json.token);
                setUser(json);
                navigate("/");
            }
        } catch (error) {
            setLoginStatus({ message: "Something went wrong. Please try again.", type: "danger" });
        }
    };

    return (
        <>
            <Layout>
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Card className="p-3" style={{ width: "100%", maxWidth: "400px" }}>
                        <Card.Header className="text-center border-0 bg-transparent pt-3">
                            <PersonCircle size={64} />
                            <Card.Title className="mt-2 mb-0">Login</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        {...register("username", { required: true })}
                                        type="text"
                                        placeholder="Enter Username"
                                    />
                                    {errors.username && <p className="text-danger small mt-1">Username is required</p>}
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                    {...register("password", { required: true })}
                                    type="password"
                                    placeholder="Password"
                                    />
                                    {errors.password && <p className="text-danger small mt-1">Password is required</p>}
                                </Form.Group>

                                {loginStatus && (
                                    <Form.Label className={`text-${loginStatus.type} w-100 text-center mb-2`}>
                                        {loginStatus.message}
                                    </Form.Label>
                                )}
                                <Button variant="primary" type="submit" className="w-100 mb-3">
                                    Login
                                </Button>
                                <Form.Group className="text-center">
                                    <Form.Text className="me-1" style={{ color: '#ffffff' }}>New here?</Form.Text>
                                    <NavLink to="/signup">Sign Up</NavLink>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Layout>
        </>
    );
};

import { Card, Form, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { useForm } from "react-hook-form";
import { UserContext } from './User';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

export default function Login(){
    const { user, setUser } = useContext(UserContext);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const url = "http://localhost:8080/api/auth/login";
        try{
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if(!response.ok){
                alert("Invalid Email or Password");
            } else {
                alert("Login Successful");
                const json = await response.json();
                setUser(json);
                navigate("/");
            }
        }catch(error){
            alert("Something went wrong. Please try again.");
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
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                    {...register("email", { required: true })}
                                    type="email"
                                    placeholder="Enter Email"
                                    />
                                    {errors.email && <p className="text-danger small mt-1">Email is required</p>}
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
                                <Button variant="primary" type="submit" className="w-100 mb-3">
                                    Login
                                </Button>
                                <Form.Group className="text-center">
                                    <Form.Text className="me-1">New here?</Form.Text>
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

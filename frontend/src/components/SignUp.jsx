import { Card, Form, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { } from "react-hook-form";
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';
import { UserContext } from './UserContext';

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch (`${import.meta.env.VITE_API_URL}/user/register`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, email, password}),
            });

            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 409) {
                    console.error("Generic 409 error: ", data.error);
                    return;
                }
                if (res.status === 400) {
                    console.error("Inputs missing: ", data.error);
                    return;
                }
                console.log("Something went wrong:", data);
                return;
            }
            
            console.log("Registered successfully:", data);
        } catch (err) {
            console.error("Network error, server unreachable:", err.message);
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
                        <Form onSubmit={handleSubmit}>

                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>Username*</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Username"
                                    value={username}
                                    onChange={(e)=> setUsername(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Label>Email address*</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formPassword">
                                <Form.Label>Password*</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 mb-3">
                                Create Account
                            </Button>
                            <Form.Group className="text-center">
                                <NavLink to="/login">Login?</NavLink>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}
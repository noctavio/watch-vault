import { Card, Form, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { } from "react-hook-form";
import { UserContext } from './UserContext';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

export default function Login(){
    const [errorMessage, setErrorMessage]= useState("");
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const {setUser} = useContext(UserContext);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            const res = await fetch (`${import.meta.env.VITE_API_URL}/user/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({usernameOrEmail, password}),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error);
                return;
            }
            setUser(data);
            console.log("Logged in successfully:", data);
            navigate('/');

        } catch (err) {
            setErrorMessage(err.message);
        }
    }

    return (
        <>
            <Layout>
                <div className="d-flex justify-content-center align-items-center">
                    <Card className="p-3" style={{ width: "100%", maxWidth: "400px" }}>
                        <Card.Header className="text-center border-0 bg-transparent pt-3">
                            <PersonCircle size={64} />
                            <Card.Title className="mt-2 mb-0">Login</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username/Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={usernameOrEmail}
                                        onChange={(e)=> setUsernameOrEmail(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e)=> setPassword(e.target.value)}
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 mb-3">
                                    Login
                                </Button>
                                {errorMessage && <div className="input-error">
                                    {errorMessage}
                                </div>}

                                <Form.Group className="text-center">
                                    <NavLink to="/signup">Register an Account?</NavLink>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Layout>
        </>
    );
};

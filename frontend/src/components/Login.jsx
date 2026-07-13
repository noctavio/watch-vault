import { Card, Form, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import React, { } from 'react';
import { } from "react-hook-form";
import { UserContext } from './UserContext';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

export default function Login(){

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
                            <Form>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="..."
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="..."
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 mb-3">
                                    Login
                                </Button>
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

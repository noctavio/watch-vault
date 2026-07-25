import { Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { } from "react-hook-form";
import { UserContext } from './UserContext.jsx';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

export default function Profile() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [genres, setGenres] = useState([]);

    // Deleting an account
    // Unrelated but Layout footer needs to always stick to the bottom of the page

    if (!user) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Card className="p-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>
                        <Card.Body>
                            <PersonCircle size={64} color="#C9A84C" className="mb-3" />
                            <Card.Title>Not Logged In</Card.Title>
                            <p className="card-text mb-4">You need to be logged in to view this page.</p>
                            <Button className="w-100" onClick={() => navigate("/login")}>
                                Go to Login
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Card className="p-3" style={{ width: "100%", maxWidth: "800px" }}>
                    <Card.Header className="text-center border-0 bg-transparent pt-3">
                        <PersonCircle size={64} color="#C9A84C" />
                        <Card.Title className="mt-2">User Settings</Card.Title>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column gap-3">

                        {/* Delete Account */}
                        <div className="d-flex gap-3">
                            <Card>
                                <Card.Header style={{ borderColor: "#A8293E" }}>
                                    <Card.Subtitle style={{ color: "#A8293E" }}>
                                        WARNING: All data will be irrecoverable
                                    </Card.Subtitle>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Label>
                                            
                                    </Form.Label>
                                    <Button variant="warning" >Delete Account</Button>
                                </Card.Body>
                            </Card>
                        </div>

                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}
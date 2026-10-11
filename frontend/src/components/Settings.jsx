import { Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { } from "react-hook-form";
import { UserContext } from './UserContext.jsx';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';

export default function Settings() {
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [genres, setGenres] = useState([]);

    const handleUsernameChange = async (e) => {
        return
    }

    return (
        <Layout>
            <div className="d-flex justify-content-center align-items-center">
                <Card className="p-4 text-center" style={{ maxWidth: "800px", width: "100%" }} >
                    <h2 style={{ color: "#C9A84C" }}>
                        Settings
                    </h2>
                    <Card.Header className="text-center" >
                        <PersonCircle size={64} />
                    </Card.Header>
                    <Form onSubmit={handleUsernameChange}> 
                        <Form.Group className="mb-3 form-edit">
                            <Form.Label>Change Username</Form.Label>
                            <Form.Control type="username"/>
                        </Form.Group>
                    </Form>
                    <Form>
                        <Form.Group className="mb-3 form-edit">
                            <Form.Label>Change Email</Form.Label>
                            <Form.Control type="email"/>
                        </Form.Group>
                    </Form>
                    <Form>
                        <Form.Group className="mb-3 form-edit">
                            <Form.Label>Change Password</Form.Label>
                            <Form.Control type="password"/>
                        </Form.Group>
                    </Form>
                    <Form.Label>
                        Select Genres
                    </Form.Label>

                    <Button style={{maxWidth: 150}}>
                        Delete Account
                    </Button>
                </Card>
            </div>
        </Layout>
    );
}
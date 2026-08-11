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

    // Change profile picture, username, password, or delete account

    // set genres here?

    return (
        <Layout>
            <div className="d-flex justify-content-center align-items-center">

                <Card className="p-4 text-center" style={{ maxWidth: "800px", width: "100%" }} >
                    <h2 style={{ color: "#C9A84C" }}>
                        Settings
                    </h2>
                </Card>
            </div>
        </Layout>
    );
}
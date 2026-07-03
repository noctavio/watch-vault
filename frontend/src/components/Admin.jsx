import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { UserContext } from './User';
import { PersonCircle } from 'react-bootstrap-icons';
import Layout from './Layout.jsx';
import UserPermissions from './admin_components/UserPermissions.jsx';
import ApiKeys from './admin_components/ApiKeys.jsx';
import UpdateMovies from './admin_components/UpdateMovies.jsx';

const isLogin = (aUser) => !aUser || Object.keys(aUser).length === 0;
const isAdmin = (aUser) => aUser?.role === "admin";

export default function Admin() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    if (!isAdmin(user)) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Card className="p-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>
                        <Card.Body>
                            <PersonCircle size={64} color="#C9A84C" className="mb-3" />
                            <Card.Title>Not Admin</Card.Title>
                            <p className="card-text mb-4">You do not have permission to use this.</p>
                            <Button className="w-100" onClick={() => navigate("/")}>Go to Home</Button>
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
                        <Card.Title className="mt-2">Admin Panel</Card.Title>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column gap-3">
                        <UserPermissions user={user} />
                        <ApiKeys />
                        <UpdateMovies />
                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}

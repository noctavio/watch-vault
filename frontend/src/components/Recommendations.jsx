import Layout from "./Layout.jsx";
import { Card, Button } from 'react-bootstrap';
import React, { useContext } from 'react';
import { UserContext } from './User';
import { useNavigate } from 'react-router-dom';
import ForYou from './recomendations_components/ForYou.jsx';
import TopRated from './recomendations_components/TopRated.jsx';
import MoreLike from './recomendations_components/MoreLike.jsx';
import CompletedSeries from './recomendations_components/CompletedSeries.jsx';
import { PersonCircle } from 'react-bootstrap-icons';

const isLogin = (aUser) => {
    return (aUser === null || aUser === undefined || Object.keys(aUser).length === 0);
};

export default function Recommendations(){
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    if (isLogin(user)) {
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

    return(
        <>
            <Layout>
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Card className="p-3 text-center" style={{ width: "100%", backgroundColor: "#13111A"}}>
                        <Card.Header><Card.Title>Your Recommendations</Card.Title></Card.Header>
                        <Card.Body>
                            <Card className="p-3 w-100">
                                <Card.Header><Card.Subtitle>For You</Card.Subtitle></Card.Header>
                                <Card.Body>
                                    <ForYou/>
                                </Card.Body>
                            </Card>
                            <Card className="p-3 w-100">
                                <Card.Header><Card.Subtitle>More Like</Card.Subtitle></Card.Header>
                                <Card.Body>
                                    <MoreLike/>
                                </Card.Body>
                            </Card>
                            <Card className="p-3 w-100">
                                <Card.Header><Card.Subtitle>Complete the Series</Card.Subtitle></Card.Header>
                                <Card.Body>
                                    <CompletedSeries/>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </div>
            </Layout>
        </>
    );
};

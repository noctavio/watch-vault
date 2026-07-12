import Layout from './Layout.jsx';
import { NavLink } from 'react-router-dom';
import { Container, Card, Button, Form, InputGroup } from 'react-bootstrap';
import Background from '../assets/background.jpg';
import { useState } from 'react';
import { UserContext } from './UserContext.jsx';

export default function Home() {
    const [searchResult, setQuery] = useState('');

    return (
        <>
            <Layout>
                <Container fluid>
                    <Card mb={3} id="background">
                        <Card.Img src={Background} alt="collage of movies"/>
                        <Card.ImgOverlay className="text-center">
                            <Card.Title as="h2">WELCOME TO WATCHVAULT</Card.Title>
                            <br />
                            <Card.Text style={{ maxWidth: '920px', margin: '0 auto' }}>
                                Welcome to WatchVault, your personal hub for everything movies!
                                Whether you're searching for your next favorite film, keeping track
                                of what you want to watch, or looking for personalized
                                recommendations, we've got you covered. Browse our collection,
                                build your own watchlist, and never lose track of a great movie
                                again
                            </Card.Text>
                            <br />
                            <Form className="d-flex justify-content-center mb-3">
                                <InputGroup style={{ maxWidth: '500px' }}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search the Vault..."
                                        value={searchResult}
                                        onChange={(e) => setQuery(e.target.value)}
                                        size="lg"
                                    />
                                    <Button variant="primary" size="lg" type="submit">
                                        Search
                                    </Button>
                                </InputGroup>
                            </Form>
                            <br />
                        </Card.ImgOverlay>
                    </Card>
                </Container>
                <br />
            </Layout>
        </>
    );
}

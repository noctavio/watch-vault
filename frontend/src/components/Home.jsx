import Layout from './Layout.jsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, InputGroup } from 'react-bootstrap';
import Background from '../assets/background.jpg';
import { useState } from 'react';

export default function Home(){
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <>
            <Layout>
                <Container fluid>
                    <Card mb={3} id="background">
                        <Card.Img src={Background} alt="collage of movies" />
                        <Card.ImgOverlay className="text-center">
                            <Card.Title as="h2">WELCOME TO WATCHVAULT</Card.Title>
                            <br />
                            <Card.Text>
                                Welcome to WatchVault, your personal hub for everything movies!
                                Whether you're searching for your next favorite film, keeping track
                                of what you want to watch, or looking for personalized
                                recommendations, we've got you covered. Browse our collection,
                                build your own watchlist, and never lose track of a great movie
                                again. Your next great watch is just a click away!
                            </Card.Text>
                            <br />
                            <Form onSubmit={handleSearch} className="d-flex justify-content-center mb-3">
                                <InputGroup style={{ maxWidth: '500px' }}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search the Vault..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        size="lg"
                                    />
                                    <Button variant="primary" size="lg" type="submit">
                                        Search
                                    </Button>
                                </InputGroup>
                            </Form>
                            <br />
                            <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
                                <Button variant="primary" size="lg" as={NavLink} to="/watchlist">
                                    My Watchlist
                                </Button>
                                <Button variant="primary" size="lg" as={NavLink} to="/recommendation">
                                    Recommended
                                </Button>
                            </div>
                        </Card.ImgOverlay>
                    </Card>
                </Container>
                <br />

                {/* Movie Carousel
                <Container id="browseMovies">
                    <h2>Browse Our Movies Selection</h2>
                    {alert && (
                    <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
                        {alert.message}
                    </Alert>
                    )}
                    <Carousel
                        id="movieCarousel"
                        activeIndex={carouselIndex}
                        onSelect={(index) => setCarouselIndex(index)}
                    >
                    {movies.map((movie) => (
                        <Carousel.Item key={movie.id}>
                        <img
                            className="d-block w-100"
                            src={movie.img}
                            alt={movie.title}
                        />
                        <Carousel.Caption>
                            <h3>{movie.title}</h3>
                        </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                    </Carousel>
                </Container>
                 */}
            </Layout>
        </>
    );
};

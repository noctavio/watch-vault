import Layout from './Layout.jsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, InputGroup, Carousel, Alert } from 'react-bootstrap';
import Background from '../assets/background.jpg';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from './User.jsx';

const normalizeMovie = (movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster ||
        (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
    rating: movie.rating ?? movie.vote_average,
    releaseYear: movie.releaseYear ||
        (movie.release_date ? movie.release_date.split("-")[0] : "N/A"),
    director: movie.director || "",
    genres: movie.genres || [],
    description: movie.description || movie.overview || "",
});

const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
};

function MovieCard({ movie, onAdd }) {
    return (
        <Card style={{ width: "200px", flexShrink: 0 }}>
            <div className="poster-wrap" style={{ position: "relative" }}>
                <Card.Img
                    variant="top"
                    src={movie.poster || "https://placehold.co/200x300?text=No+Image"}
                    alt={movie.title}
                    className="movie-poster"
                    style={{ height: "280px", objectFit: "cover" }}
                />
                {movie.genres?.[0] && (
                    <span className="genre-overlay">{movie.genres[0]}</span>
                )}
                <span className="rating-badge">★ {movie.rating?.toFixed(1)}</span>
            </div>
            <Card.Body className="p-2">
                <Card.Title className="mb-0" style={{ fontSize: "0.8rem" }}>
                    {movie.title}
                </Card.Title>
                <Card.Subtitle style={{ fontSize: "0.72rem", marginTop: "2px" }}>
                    {movie.director ? `${movie.director} · ` : ""}{movie.releaseYear}
                </Card.Subtitle>
            </Card.Body>
            <div className="p-2">
                <Button
                    size="sm"
                    variant="primary"
                    className="w-100"
                    onClick={() => onAdd(movie)}
                >
                    + Watchlist
                </Button>
            </div>
        </Card>
    );
}

export default function Home() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [movies, setMovies] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [alert, setAlert] = useState(null);
    const [loadingMovies, setLoadingMovies] = useState(true);

    useEffect(() => {
        const fetchRandomMovies = async () => {
            setLoadingMovies(true);
            try {
                const res = await fetch(`http://localhost:8080/api/search?page=1`);
                if (!res.ok) throw new Error("Failed to fetch movies.");
                const data = await res.json();
                const all = (data.movies || data.results || []).map(normalizeMovie);
                const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 20);
                setMovies(shuffled);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMovies(false);
            }
        };
        fetchRandomMovies();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const addToWatchlist = async (movie) => {
        if (!user) {
            setAlertMessage({ type: "danger", message: "You need to be logged in to add to your watchlist." });
            return;
        }
        try {
            const requestRes = await fetch(`http://localhost:8080/api/movies/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: movie.id }),
            });
            const requestData = await requestRes.json();
            if (!requestRes.ok && requestRes.status !== 409) {
                throw new Error(requestData.error || "Failed to save movie to the vault.");
            }
            const movieToSave = requestData.movie || movie;
            const getRes = await fetch(`http://localhost:8080/api/watchlist/${user.watchlistId}`);
            if (!getRes.ok) throw new Error("Failed to fetch watchlist.");
            const data = await getRes.json();
            const currentItems = data.items ?? [];
            if (currentItems.some((item) => item.id === movieToSave.id)) {
                setAlertMessage({ type: "warning", message: `"${movieToSave.title}" is already in your watchlist.` });
                return;
            }
            const putRes = await fetch(`http://localhost:8080/api/watchlist/${user.watchlistId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [...currentItems, movieToSave] }),
            });
            if (!putRes.ok) throw new Error("Failed to update watchlist.");
            setAlertMessage({ type: "success", message: `"${movieToSave.title}" added to your watchlist!` });
        } catch (err) {
            setAlertMessage({ type: "danger", message: err.message });
        }
    };

    const slides = chunkArray(movies, 4);

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
                                <Button variant="primary" size="lg" as={NavLink} to="/recommendations">
                                    Recommended
                                </Button>
                            </div>
                        </Card.ImgOverlay>
                    </Card>
                </Container>
                <br />

                <Container id="browseMovies">
                    <h2>Browse Our Movies Selection</h2>

                    {alert && (
                        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
                            {alert.message}
                        </Alert>
                    )}

                    {loadingMovies && <p>Loading movies...</p>}

                    {!loadingMovies && movies.length > 0 && (
                        <Carousel
                            id="movieCarousel"
                            activeIndex={carouselIndex}
                            onSelect={(index) => setCarouselIndex(index)}
                            indicators={slides.length > 1}
                        >
                            {slides.map((group, i) => (
                                <Carousel.Item key={i}>
                                    <div
                                        className="d-flex justify-content-center gap-3 py-3"
                                        style={{ minHeight: "420px" }}
                                    >
                                        {group.map((movie) => (
                                            <MovieCard
                                                key={movie.id}
                                                movie={movie}
                                                onAdd={addToWatchlist}
                                            />
                                        ))}
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    )}
                </Container>
            </Layout>
        </>
    );
}

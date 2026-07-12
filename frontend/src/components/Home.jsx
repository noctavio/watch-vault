import Layout from './Layout.jsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, InputGroup, Carousel, Alert } from 'react-bootstrap';
import Background from '../assets/background.jpg';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext.jsx';

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

export default function Home() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [movies, setMovies] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [alert, setAlertMessage] = useState(null);
    const [loadingMovies, setLoadingMovies] = useState(true);

    const [watchlistIds, setWatchlistIds] = useState(new Set());

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!user?.watchlistId) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`);
                if (!res.ok) return;
                const data = await res.json();
                const ids = new Set((data.items ?? []).map(item => item.id));
                setWatchlistIds(ids);
            } catch (err) {
                console.error(err);
            }
        };
        fetchWatchlist();
    }, [user]);

    useEffect(() => {
        const fetchRandomMovies = async () => {
            setLoadingMovies(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?page=1`);
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
            const requestRes = await fetch(`${import.meta.env.VITE_API_URL}/api/movies/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: movie.id }),
            });
            const requestData = await requestRes.json();
            if (!requestRes.ok && requestRes.status !== 409) {
                throw new Error(requestData.error || "Failed to save movie to the vault.");
            }
            const movieToSave = requestData.movie || movie;
            const getRes = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`);
            if (!getRes.ok) throw new Error("Failed to fetch watchlist.");
            const data = await getRes.json();
            const currentItems = data.items ?? [];
            const putRes = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [...currentItems, movieToSave] }),
            });
            if (!putRes.ok) throw new Error("Failed to update watchlist.");
            setWatchlistIds(prev => new Set([...prev, movie.id]))
        } catch (err) {
            setAlertMessage({ type: "danger", message: err.message });
        }
    };

    const removeFromWatchlist = async (movie) => {
        try {
            const getRes = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`);
            if (!getRes.ok) throw new Error("Failed to fetch watchlist.");
            const data = await getRes.json();
            const updatedItems = (data.items ?? []).filter(item => item.id !== movie.id);
            const putRes = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: updatedItems }),
            });
            if (!putRes.ok) throw new Error("Failed to update watchlist.");
            setWatchlistIds(prev => {
                const updated = new Set(prev);
                updated.delete(movie.id);
                return updated;
            });
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
                            <Card.Text style={{ maxWidth: '920px', margin: '0 auto' }}>
                                Welcome to WatchVault, your personal hub for everything movies!
                                Whether you're searching for your next favorite film, keeping track
                                of what you want to watch, or looking for personalized
                                recommendations, we've got you covered. Browse our collection,
                                build your own watchlist, and never lose track of a great movie
                                again
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
                        <Alert variant={alert.type} onClose={() => setAlertMessage(null)} dismissible>
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
                            className="pb-5"
                        >
                            {slides.map((group, i) => (
                                <Carousel.Item key={i}>
                                    <div
                                        className="d-flex justify-content-center gap-3 py-3"
                                        style={{
                                            minHeight: "420px",
                                            paddingBottom: "50px",
                                        }}
                                    >
                                        {group.map((movie) => (
                                            <Card
                                                key={movie.id}
                                                style={{
                                                    width: "200px",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <div
                                                    className="poster-wrap"
                                                    onClick={() => navigate(`/reviews/${movie.id}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <Card.Img
                                                        variant="top"
                                                        src={movie.poster || 'https://placehold.co/200x300?text=No+Image'}
                                                        alt={movie.title}
                                                        className="movie-poster"
                                                    />
                                                    {movie.genres?.[0] && (
                                                        <span className="genre-overlay">{movie.genres[0]}</span>
                                                    )}
                                                    <span className="rating-badge">★ {movie.rating?.toFixed(1)}</span>
                                                </div>

                                                <Card.Body className="p-2">
                                                    <Card.Subtitle
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            marginTop: '2px',
                                                        }}
                                                    >
                                                        {movie.director} · {movie.releaseYear}
                                                    </Card.Subtitle>

                                                    <Button
                                                        className="mt-2 w-100"
                                                        style={watchlistIds.has(movie.id) ? { backgroundColor: '#C9A84C', borderColor: '#C9A84C' } : {}}
                                                        onClick={() => watchlistIds.has(movie.id) ? removeFromWatchlist(movie) : addToWatchlist(movie)}
                                                    >
                                                        {watchlistIds.has(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                                                    </Button>
                                                </Card.Body>
                                            </Card>
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

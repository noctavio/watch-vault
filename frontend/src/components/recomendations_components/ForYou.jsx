import React, { useState, useContext, useEffect } from "react";
import { Container, Carousel, Alert, Button, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../User.jsx';

const GENRE_ID_MAP = {
    28: "Action", 35: "Comedy", 18: "Drama", 27: "Horror",
    10749: "Romance", 878: "Sci-Fi", 53: "Thriller", 16: "Animation",
    99: "Documentary", 14: "Fantasy", 9648: "Mystery", 12: "Adventure",
    80: "Crime", 10751: "Family", 36: "History"
};

const normalizeMovie = (movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster ||
        (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
    rating: movie.rating ?? movie.vote_average,
    releaseYear: movie.releaseYear ||
        (movie.release_date ? movie.release_date.split("-")[0] : "N/A"),
    director: movie.director || "",
    genres: movie.genres ||
        (movie.genre_ids ? movie.genre_ids.map((id) => GENRE_ID_MAP[id]).filter(Boolean) : []),
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

export default function ForYou() {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `http://localhost:8080/api/recommendations/fav_genre/movie/${user.userId}`
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch recommendations.");
                const normalized = (data.results || []).map(normalizeMovie);
                setMovies(normalized);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (user?.userId) fetchMovies();
    }, [user]);

    const addToWatchlist = async (movie) => {
        if (!user) {
            setAlert({ type: "danger", message: "You need to be logged in to add to your watchlist." });
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
                setAlert({ type: "warning", message: `"${movieToSave.title}" is already in your watchlist.` });
                return;
            }
            const putRes = await fetch(`http://localhost:8080/api/watchlist/${user.watchlistId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [...currentItems, movieToSave] }),
            });
            if (!putRes.ok) throw new Error("Failed to update watchlist.");
            setAlert({ type: "success", message: `"${movieToSave.title}" added to your watchlist!` });
        } catch (err) {
            setAlert({ type: "danger", message: err.message });
        }
    };

    const slides = chunkArray(movies, 4);

    return (
        <Container id="ForYou">
            {alert && (
                <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
                    {alert.message}
                </Alert>
            )}
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && movies.length > 0 && (
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
                                            <Card.Title
                                                className="mb-0"
                                                style={{ fontSize: '0.8rem' }}
                                            >
                                                {movie.title}
                                            </Card.Title>

                                            <Card.Subtitle
                                                style={{
                                                    fontSize: '0.72rem',
                                                    marginTop: '2px',
                                                }}
                                            >
                                                {movie.director} {movie.releaseYear}
                                            </Card.Subtitle>

                                            <Button
                                                className="mt-2 w-100"
                                                onClick={() => addToWatchlist(movie)}
                                            >
                                                Add to Watchlist
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}
            {!loading && !error && movies.length === 0 && (
                <p className="text-muted">No movies found.</p>
            )}
        </Container>
    );
}

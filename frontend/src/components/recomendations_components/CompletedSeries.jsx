import React, { useState, useEffect, useContext } from "react";
import { Container, Carousel, Alert, Button, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../User.jsx";

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

export default function CompletedSeries() {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null);
            try {
                const watchlistRes = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`
                );
                const watchlistData = await watchlistRes.json();
                if (!watchlistRes.ok)
                    throw new Error(watchlistData.error || "Failed to fetch watchlist.");

                const items = watchlistData.items || [];
                if (items.length === 0) {
                    setAlertMessage({ type: "info", message: "Your watchlist is empty! Add some movies to get recommendations here." });
                    setLoading(false);
                    return;
                }
                const watchlistIds = items.map((m) => m.id);
                const shuffledItems = [...items].sort(() => Math.random() - 0.5);

                let foundSeriesMovies = [];
                for (const movie of shuffledItems) {
                    const collectionRes = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/recommendations/movie/belongs_to_vault/${movie.id}`
                    );
                    const collectionData = await collectionRes.json();
                    if (collectionRes.ok && collectionData.parts?.length > 0) {
                        const filtered = collectionData.parts
                            .filter((part) => !watchlistIds.includes(part.id))
                            .map(normalizeMovie);
                        if (filtered.length > 0) {
                            foundSeriesMovies = filtered;
                            break;
                        }
                    }
                }

                if (foundSeriesMovies.length === 0) {
                    setAlertMessage({ type: "info", message: "You have no movies in your watchlist with sequels or in a series." });
                    setLoading(false);
                    return;
                }

                setMovies(foundSeriesMovies);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (user?.watchlistId) fetchMovies();
    }, [user]);

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
        } catch (err) {
            setAlertMessage({ type: "danger", message: err.message });
        }
    };

    const slides = chunkArray(movies, 4);

    return (
        <Container id="CompletedSeries">
            {alertMessage && (
                <Alert
                    variant={alertMessage.type}
                    onClose={() => setAlertMessage(null)}
                    dismissible
                >
                    {alertMessage.message}
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

                                        <Card.Body className="p-2" style={{ textAlign: "left" }}>
                                            <Card.Subtitle style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                                                {movie.director} · {movie.releaseYear}
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
                <p className="text-center" style={{ color: '#DC3545' }}>No movies found.</p>
            )}
        </Container>
    );
}

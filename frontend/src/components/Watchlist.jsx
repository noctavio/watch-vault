import { Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './User';
import Layout from './Layout.jsx';
import { PersonCircle } from 'react-bootstrap-icons';

const isLogin = (aUser) => {
    return (aUser === null || aUser === undefined || Object.keys(aUser).length === 0);
};

export default function Watchlist() {
    const { user } = useContext(UserContext);
    const [watchlist, setWatchlist] = useState([]);
    const [itemsChecked, setItemsChecked] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        fetchWatchlist();
    }, [user]);

    const fetchWatchlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`);
            if (!res.ok) throw new Error("Failed to fetch watchlist.");
            const data = await res.json();
            setWatchlist(data.items ?? []);
            setItemsChecked(data.itemsChecked ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (movie) => {
        try {
            const updatedItems = watchlist.filter((item) => item.id !== movie.id);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/${user.watchlistId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: updatedItems }),
            });
            if (!res.ok) throw new Error("Failed to remove movie.");
            setWatchlist(updatedItems);
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleWatched = async (movie) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/watchlist/watched/${user.watchlistId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: movie.id }),
            });
            if (!res.ok) throw new Error("Failed to update watched status.");
            const data = await res.json();
            setItemsChecked(data.itemsChecked);
        } catch (err) {
            alert(err.message);
        }
    };
 
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

    return (
        <Layout>
            <div className="container py-4">
                <h5 className="mb-3">Your Watchlist</h5>

                {loading && (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                )}

                {error && (
                    <p className="text-danger text-center">{error}</p>
                )}

                {!loading && !error && watchlist.length === 0 && (
                    <p className="text-center" style={{ color: '#DC3545' }}>NO RESULTS...</p>
                )}

                {!loading && !error && watchlist.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "1rem",
                        }}
                    >
                        {watchlist.map((movie) => {
                            const watched = itemsChecked.includes(movie.id);
                            return (
                                <Card
                                    key={movie.id}
                                    style={{
                                        width: "200px",
                                        opacity: watched ? 0.6 : 1,
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
                                        <Card.Subtitle style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                                            {movie.director} · {movie.releaseYear}
                                        </Card.Subtitle>
                                    </Card.Body>
                                    <div className="d-flex gap-1 p-2">
                                        <Button
                                            size="sm"
                                            variant={watched ? "secondary" : "success"}
                                            className="w-50"
                                            onClick={() => toggleWatched(movie)}
                                        >
                                            {watched ? "Unwatch" : "Watched"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            className="w-50"
                                            onClick={() => removeFromWatchlist(movie)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}

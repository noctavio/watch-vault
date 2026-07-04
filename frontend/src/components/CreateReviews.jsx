import { Card, Button, Spinner, Form, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './User';
import Layout from './Layout.jsx';
import { PersonCircle } from 'react-bootstrap-icons';

const isLogin = (aUser) => {
    return (aUser === null || aUser === undefined || Object.keys(aUser).length === 0);
};

export default function CreateReviews() {
    const { user } = useContext(UserContext);
    const [watchlist, setWatchlist]  = useState([]);
    const [itemsChecked, setItemsChecked] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const [selectedMovie, setSelectedMovie] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState('');
    const [recommend, setRecommend] = useState(false);
    const location = useLocation();
    const preselectedId = location.state?.movieId;

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

    useEffect(() => {
        if (user?.watchlistId) {
            fetchWatchlist();
        }
    }, [user]);

    useEffect(() => {
        if (preselectedId) {
            setSelectedMovie(String(preselectedId));
        }
    }, [preselectedId]);

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

    // Only movies marked as watched are reviewable
    const watchedMovies = watchlist.filter((movie) =>
        itemsChecked.includes(movie.id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMovie) return setError("Please select a movie to review.");
        if (!title.trim()) return setError("Please enter a review title.");
        if (!description.trim()) return setError("Please enter a description.");
        if (!rating) return setError("Please select a rating.");

        const movie = watchedMovies.find((m) => m.id === Number(selectedMovie));
        if (!movie) return setError("Selected movie not found.");

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    movieId: movie.id,
                    movieTitle: movie.title,
                    moviePoster: movie.poster,
                    movieYear: movie.releaseYear,
                    userId: user._id,
                    username: user.username,
                    title: title.trim(),
                    description: description.trim(),
                    rating: Number(rating),
                    recommend,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit review.');
            navigate(`/reviews/${movie.id}`)
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-center py-5 px-3">
                <Card style={{ width: '100%', maxWidth: '650px' }}>
                    <Card.Header>
                        <Card.Subtitle>Write a Review</Card.Subtitle>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column gap-3">

                        {!user && (
                            <Alert variant="warning">You must be logged in to write a review.</Alert>
                        )}

                        {loading && (
                            <div className="text-center py-3">
                                <Spinner animation="border" style={{ color: '#C9A84C' }} />
                            </div>
                        )}

                        {!loading && watchedMovies.length === 0 && (
                            <Alert variant="warning">
                                You have no watched movies to review. Mark movies as watched in your{' '}
                                <span
                                    style={{ color: '#C9A84C', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => navigate('/watchlist')}
                                >
                                    watchlist
                                </span>{' '}
                                first.
                            </Alert>
                        )}

                        {error   && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        {!loading && watchedMovies.length > 0 && (
                            <Form onSubmit={handleSubmit}>
                                {selectedMovie && (() => {
                                    const m = watchedMovies.find((mv) => mv.id === Number(selectedMovie));
                                    return m ? (
                                        <div className="d-flex gap-3 mb-3 align-items-center">
                                            <img
                                                src={m.poster || 'https://placehold.co/60x90?text=N/A'}
                                                alt={m.title}
                                                style={{ width: '55px', height: '82px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <div>
                                                <p className="mb-0 card-title" style={{ fontWeight: 700 }}>{m.title}</p>
                                                <p className="mb-0" style={{ fontSize: '0.82rem', color: '#D4D2E0' }}>
                                                    {m.releaseYear} · {m.genres?.[0]}
                                                </p>
                                                <p className="mb-0" style={{ fontSize: '0.78rem', color: '#888' }}>
                                                    Directed by {m.director}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                <Form.Group className="mb-3">
                                    <Form.Label>Rating*</Form.Label>
                                    <Form.Select
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        style={{ backgroundColor: '#2A2740', border: '1px solid #3D3960', color: '#F2F0FA' }}
                                    >
                                        <option value="">= Select a rating =</option>
                                        {[10,9,8,7,6,5,4,3,2,1].map((n) => (
                                            <option key={n} value={n}>
                                                {n} / 10 {n === 10 ? '- Masterpiece' : n >= 9 ? '-  Incredible' : 
                                                n == 8 ? '-  Great' : n >= 6 ? '- Good' : n >= 5 ? '- Average' : 
                                                n >= 4 ? '- Below Average': n >= 2 ? '- Poor' : '-  Slept'
                                                }
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Review Title*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Summarize your thoughts..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={100}
                                    />
                                    <Form.Text style={{ color: '#6c6a7e' }}>
                                        {title.length} / 100
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Review*</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Write your review here..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        maxLength={2000}
                                    />
                                    <Form.Text style={{ color: '#6c6a7e' }}>
                                        {description.length} / 2000
                                    </Form.Text>
                                </Form.Group>

                                <Button type="submit" className="w-100" disabled={submitting}>
                                    {submitting
                                        ? <><Spinner animation="border" size="sm" className="me-2" />Submitting...</>
                                        : 'Submit Review'
                                    }
                                </Button>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </Layout>
    );
}
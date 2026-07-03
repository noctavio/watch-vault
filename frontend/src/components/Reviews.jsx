import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import Layout from './Layout.jsx';
import { UserContext } from './User';

export default function Reviews() {
    const { movieId } = useParams();
    const { user } = useContext(UserContext);

    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('date');

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editRating, setEditRating] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const [page, setPage] = useState(1);
    const REVIEWS_PER_PAGE = 5;

    const handleSort = (val) => { setSortBy(val); setPage(1); }

    useEffect(() => {
        fetchMovie();
        fetchReviews();
    }, [movieId]);

    const fetchMovie = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search/${movieId}`);
            if (!res.ok) throw new Error("Movie not found");
            const data = await res.json();
            setMovie(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${movieId}`);
            if (!res.ok) throw new Error("Failed to fetch reviews");
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (reviewId, vote) => {
        if (!user) return alert("You must be logged in to vote.");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/vote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, vote }),
            });
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.error);
            setReviews((prev) => prev.map((r) => r.reviewId === reviewId ? updated : r));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, role: user.role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
        } catch (err) {
            alert(err.message);
        }
    };

    const startEdit = (review) => {
        setEditingId(review.reviewId);
        setEditTitle(review.title);
        setEditDesc(review.description);
        setEditRating(review.rating);
    };

    const handleEdit = async (reviewId) => {
        setEditLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    title: editTitle,
                    description: editDesc,
                    rating: Number(editRating),
                }),
            });
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.error);
            setReviews((prev) => prev.map((r) => r.reviewId === reviewId ? updated : r));
            setEditingId(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setEditLoading(false);
        }
    };

    const sorted = [...reviews].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'votes')  return (b.likes + b.dislikes) - (a.likes + a.dislikes);
        return new Date(b.createdAt) - new Date(a.createdAt); // date default
    });

    const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE);
    const paginated  = sorted.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

    const getUserVote = (review) => {
        if (!user) return null;
        return review.voters?.find((v) => v.userId === user._id)?.vote || null;
    };

    return (
        <Layout>
            <Container style={{ maxWidth: '800px' }} className="py-5">

                {/* Movie header */}
                {movie && (
                    <div className="d-flex gap-4 mb-5 align-items-start">
                        <img
                            src={movie.poster || 'https://placehold.co/120x180?text=N/A'}
                            alt={movie.title}
                            style={{ width: '120px', height: '180px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        />
                        <div>
                            <h2 className="mb-1">{movie.title}</h2>
                            <p style={{ color: '#C9A84C', fontFamily: "'Playfair Display', serif", marginBottom: '4px' }}>
                                {movie.releaseYear} · {movie.genres?.join(', ')}
                            </p>
                            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>
                                Directed by {movie.director}
                            </p>
                            <p style={{ color: '#D4D2E0', fontSize: '0.9rem' }}>{movie.description}</p>
                        </div>
                    </div>
                )}

                {/* Sort + heading row */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 style={{ margin: 0 }}>
                        {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                    </h2>
                    <Form.Select
                        style={{ width: '160px', backgroundColor: '#2A2740', border: '1px solid #3D3960', color: '#F2F0FA' }}
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                    >
                        <option value="date">Sort: Newest</option>
                        <option value="rating">Sort: Rating</option>
                        <option value="votes">Sort: Most Voted</option>
                    </Form.Select>
                </div>

                {loading && <div className="text-center py-5"><Spinner animation="border" style={{ color: '#C9A84C' }} /></div>}
                {error   && <Alert variant="danger">{error}</Alert>}
                {!loading && reviews.length === 0 && (
                    <Alert variant="warning">No reviews yet. Be the first to review this movie!</Alert>
                )}

                {/* Review cards */}
                <div className="d-flex flex-column gap-3">
                    {paginated.map((review) => {
                        const isOwner = user?._id === review.userId;
                        const isAdmin = user?.role === 'admin';
                        const userVote = getUserVote(review);
                        const isEditing = editingId === review.reviewId;

                        return (
                            <Card key={review.reviewId}>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <Card.Subtitle>{review.username}</Card.Subtitle>
                                        {review.recommend && (
                                            <Badge style={{ backgroundColor: '#C9A84C', color: '#13111A', fontSize: '0.7rem' }}>
                                                Recommends
                                            </Badge>
                                        )}
                                    </div>
                                    <span style={{ color: '#888', fontSize: '0.78rem' }}>
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </span>
                                </Card.Header>
                                
                                {/* Review*/}
                                <Card.Body>
                                    {isEditing ? (
                                        // Edit form
                                        <div className="d-flex flex-column gap-2">
                                            <Form.Control
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                placeholder="Review title"
                                            />
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={editDesc}
                                                onChange={(e) => setEditDesc(e.target.value)}
                                                placeholder="Review description"
                                            />
                                            <Form.Select
                                                value={editRating}
                                                onChange={(e) => setEditRating(e.target.value)}
                                                style={{ backgroundColor: '#2A2740', border: '1px solid #3D3960', color: '#F2F0FA', width: '200px' }}
                                            >
                                                {[10,9,8,7,6,5,4,3,2,1].map((n) => (
                                                <option key={n} value={n}>
                                                    {n} / 10 {n === 10 ? '- Masterpiece' : n >= 9 ? '-  Incredible' : 
                                                    n == 8 ? '-  Great' : n >= 6 ? '- Good' : n >= 5 ? '- Average' : 
                                                    n >= 4 ? '- Below Average': n >= 2 ? '- Poor' : '-  Slept'
                                                    }
                                                </option>
                                            ))}
                                            </Form.Select>
                                            <div className="d-flex gap-2 mt-1">
                                                <Button size="sm" onClick={() => handleEdit(review.reviewId)} disabled={editLoading}>
                                                    {editLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Card.Title style={{ fontSize: '1rem', marginBottom: 0 }}>
                                                    {review.title}
                                                </Card.Title>
                                                <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                                    ★ {review.rating} / 10
                                                </span>
                                            </div>
                                            <Card.Text style={{ fontSize: '0.9rem' }}>{review.description}</Card.Text>
                                        </>
                                    )}
                                </Card.Body>

                                {/* votes / edit / delete*/}
                                {!isEditing && (
                                    <Card.Footer className="d-flex justify-content-between align-items-center">
                                        {/* Like / dislike */}
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={userVote === 'like' ? 'warning' : 'secondary'}
                                                onClick={() => handleVote(review.reviewId, 'like')}
                                                disabled={isOwner}
                                                title={isOwner ? "Can't vote on your own review" : ''}
                                            >
                                                👍 {review.likes}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={userVote === 'dislike' ? 'danger' : 'secondary'}
                                                onClick={() => handleVote(review.reviewId, 'dislike')}
                                                disabled={isOwner}
                                                title={isOwner ? "Can't vote on your own review" : ''}
                                            >
                                                👎 {review.dislikes}
                                            </Button>
                                        </div>

                                        {/* Edit / delete whether an owner or an admin */}
                                        <div className="d-flex gap-2">
                                            {isOwner && (
                                                <Button size="sm" variant="warning" onClick={() => startEdit(review)}>
                                                    Edit
                                                </Button>
                                            )}
                                            {(isOwner || isAdmin) && (
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(review.reviewId)}>
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Footer>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Page Nav */}
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            className="btn"
                            onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={page <= 1}
                        >
                            &lt;
                        </button>
                        <span style={{ color: '#C9A84C', fontFamily: "'Playfair Display', serif" }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="btn"
                            onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={page >= totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </Container>
        </Layout>
    );
}
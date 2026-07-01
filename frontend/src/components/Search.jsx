import { useEffect, useState, useContext } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import Layout from './Layout.jsx';
import { UserContext } from './User';

export default function Search() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');

    const { user, setUser } = useContext(UserContext);
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
                const text = await res.text(); // debug string
                try {
                    const data = JSON.parse(text);
                    if (!res.ok) throw new Error(data.error || 'Search failed');
                    setMovies(data.movies);
                    setTotal(data.total);
                    setTotalPages(data.totalPages);
                } catch {
                    throw new Error(`Server returned non-JSON: ${text.slice(0, 80)}`);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [query, page]);

    const addToWatchlist = async (movie) => {
        if (!user) return alert("You need to be logged in to add to your watchlist.");
            try {
                const getRes = await fetch(`/api/watchlist/${user.watchlistId}`);
                if (!getRes.ok) throw new Error("Failed to fetch watchlist.");
                const data = await getRes.json();

                const currentItems = data.items ?? [];
                if (currentItems.some((item) => item.id === movie.id)) {
                    return alert(`"${movie.title}" is already in your watchlist.`);
                }

                const putRes = await fetch(`/api/watchlist/${user.watchlistId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: [...currentItems, movie] }),
                });
                if (!putRes.ok) throw new Error("Failed to update watchlist.");
                alert(`"${movie.title}" added to your watchlist!`);
            } catch (err) {
                alert(err.message);
            }
    };

    const goToPage = (newPage) => {
        setSearchParams({ q: query, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMovie = async (e, movie) => { 
        e.stopPropagation();
        if (!window.confirm(`Remove "${movie.title}" from the vault?`)) return;
        try {
            const res = await fetch('/api/movies/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: movie.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMovies((prev) => prev.filter((m) => m.id !== movie.id));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <Layout>
            <Container fluid className="px-4 py-4">

                <h2 className="mb-4">
                    {loading ? 'Searching the Vault...' : (
                        query
                            ? `${total} result${total !== 1 ? 's' : ''} for "${query}"`
                            : 'All Movies'
                    )}
                </h2>

                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{ color: '#C9A84C' }} />
                    </div>
                )}

                {!loading && error && (
                    <Alert variant="danger">{error}</Alert>
                )}

                {!loading && !error && movies.length === 0 && (
                    <>
                        <Alert variant="warning">
                            No movies found for "{query}". Try a different search term.
                        </Alert>

                        {user?.role === 'admin' && (
                          <div className="text-center mt-2">
                            <p style={{ color: '#D4D2E0' }}>Can't find what you're looking for?</p>
                            <Button onClick={() => navigate('/movierequest')}>
                                Request a Movie
                            </Button> 
                        </div>          
                        )}
        
                    </>
                )}

                {/* Card Grid */}
                {!loading && !error && movies.length > 0 && (
                    <div className="search-grid">
                        {movies.map((movie) => (
                            <Card key={movie.id}>
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

                                    {/*Admin only delete button */}
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={(e) => handleDeleteMovie(e, movie)}
                                            style={{
                                                position: 'absolute', bottom: '6px', right: '6px',
                                                width: '26px', height: '26px',
                                                background: '#A8293E', border: 'none', borderRadius: '4px',
                                                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                                                cursor: 'pointer', lineHeight: 1,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                            title="Remove from vault"
                                        >
                                            X
                                        </button>
                                    )}
                                </div>
                                <Card.Body className="p-2">
                                    <Card.Title className="mb-0" style={{ fontSize: '0.8rem' }}>
                                        {movie.title}
                                    </Card.Title>
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
                )}

                {/* Page Nav */}
                {!loading && totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            className="btn"
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1}
                        >
                            &lt;
                        </button>
                        <span style={{ color: '#C9A84C', fontFamily: "'Playfair Display', serif" }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="btn"
                            onClick={() => goToPage(page + 1)}
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

import { useState, useRef } from 'react';
import { Container, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Layout from './Layout.jsx';

export default function MovieRequest() {
    const [query, setQuery]    = useState('');
    const [results, setResults]  = useState([]);
    const [loading, setLoading]  = useState(false);
    const [adding, setAdding]   = useState(null); 
    const [message, setMessage]  = useState(null);  
    const [error, setError]    = useState(null);
    const lastSearch = useRef(0); 

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Rate limit: one search per 5 seconds (but you can add multiple no cooldown)
        const now = Date.now();
        const secondsSince = (now - lastSearch.current) / 1000;
        if (secondsSince < 5) {
            setError(`Please wait ${Math.ceil(5 - secondsSince)} more second(s) before searching again.`);
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);
        setResults([]);
        lastSearch.current = now;

        try {
            const res = await fetch(`/api/movies/tmdb-search?q=${encodeURIComponent(query.trim())}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Search failed');
            if (data.length === 0) setError('No results found. Try a different title.');
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (movie) => {
        setAdding(movie.id);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch('/api/movies/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: movie.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            setMessage({ type: 'success', text: data.message });
            // Remove some added movie from results
            setResults((prev) => prev.filter((m) => m.id !== movie.id));
        } catch (err) {
            setMessage({ type: 'danger', text: err.message });
        } finally {
            setAdding(null);
        }
    };

    return (
        <Layout>
            <Container style={{ maxWidth: '800px' }} className="py-5">
                <h2 className="mb-2">Request a Movie</h2>
                <p style={{ color: '#D4D2E0' }} className="mb-4">
                    Can't find a movie in the vault? Search for it below and we'll add it.
                </p>

                <Form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
                    <Form.Control
                        type="text"
                        placeholder="Search by title..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        size="lg"
                    />
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                    </Button>
                </Form>

                {error   && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant={message.type}>{message.text}</Alert>}

                {results.length > 0 && (
                    <div className="d-flex flex-column gap-3">
                        <p style={{ color: '#D4D2E0' }}>
                            Select the movie you'd like to add to the vault:
                        </p>
                        {results.map((movie) => (
                            <Card key={movie.id} className="d-flex flex-row align-items-center p-2 gap-3">
                                <img
                                    src={movie.poster || 'https://placehold.co/60x90?text=N/A'}
                                    alt={movie.title}
                                    style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                                />
     
                                <div className="flex-grow-1">
                                    <Card.Title className="mb-0" style={{ fontSize: '1rem' }}>
                                        {movie.title}
                                    </Card.Title>
                                    <Card.Subtitle className="mb-1" style={{ fontSize: '0.8rem' }}>
                                        {movie.releaseYear} · ★ {movie.rating?.toFixed(1)}
                                    </Card.Subtitle>
                                    <p style={{ fontSize: '0.78rem', color: '#D4D2E0', margin: 0 }}
                                       className="text-truncate-3">
                                        {movie.description || 'No description available.'}
                                    </p>
                                </div>

                                <Button
                                    size="sm"
                                    style={{ flexShrink: 0 }}
                                    disabled={adding === movie.id}
                                    onClick={() => handleRequest(movie)}
                                >
                                    {adding === movie.id
                                        ? <Spinner animation="border" size="sm" />
                                        : 'Add to Vault'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </Container>
        </Layout>
    );
}
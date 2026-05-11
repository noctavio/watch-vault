import React, { useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

export default function UpdateMovies() {
    const [loading, setLoading] = useState(false);

    const syncMovies = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/movies/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (!response.ok) {
                alert("Failed to sync Movies.");
            } else {
                alert("Movies updated successfully Sync!");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    return (
        <Card className="p-3">
            <Card.Header><Card.Subtitle>Update Movies</Card.Subtitle></Card.Header>
            <Card.Body style={{ overflowX: "auto" }}>
                {loading
                    ? <Spinner animation="border" />
                    : <Button onClick={syncMovies}>Sync Movies</Button>
                }
            </Card.Body>
        </Card>
    );
}

import React, { useState, useEffect } from "react";
import { Card, Button, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";

export default function ApiKeys() {
    const [keys, setKeys] = useState([]);
    const [message, setMessage] = useState("");
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchKeys = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/keys`);
        const data = await res.json();
        setKeys(data);
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const onSubmit = async (data) => {
        const existingKey = keys.find(
            (key) => key.name.toUpperCase() === data.name.toUpperCase()
        );
        let res;
        if (existingKey) {
            res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/keys/${data.name}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value: data.value
                })
            });
        } else {
            res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/keys`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
        }
        if (res.ok) {
            setMessage(existingKey ? "API key updated" : "API key created");
            reset();
            fetchKeys();
        } else {
            setMessage("Something went wrong");
        }
    };

    return (
        <Card className="p-3">
            <Card.Header>
                <Card.Subtitle>Manage API Keys</Card.Subtitle>
            </Card.Header>
            <Card.Body style={{ overflowX: "auto" }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">API Name</label>
                        <input
                            className="form-control"
                            placeholder="Example: tmdb"
                            {...register("name", { required: true })}
                        />
                        {errors.name && <p className="text-danger">API name is required</p>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">API Value</label>
                        <input
                            className="form-control"
                            placeholder="Enter API key value"
                            {...register("value", { required: true })}
                        />
                        {errors.value && <p className="text-danger">API value is required</p>}
                    </div>
                    <Button type="submit">Save Key</Button>
                </form>
                {message && <p className="mt-3">{message}</p>}
                <Table striped bordered hover responsive className="mt-4">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((key) => (
                            <tr key={key._id}>
                                <td>{key.name}</td>
                                <td>{key.value}</td>
                                <td>{new Date(key.updatedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}

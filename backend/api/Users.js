const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
const bcrypt = require('bcrypt');

router.post("/auth/login", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({ error: 'Bad request: No data provided' });
    }
    const collection = await db.listCollections({ name: "Users" }).toArray();
    if (collection.length === 0) {
        return res.status(404).send({ error: 'Not Found: Collection does not exist.' });
    }
    try {
        const user = await db.collection("Users").findOne({ email: req.body.email });
        const isMatch = user && await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }
        res.status(200).send({
            _id: user._id,
            username: user.username,
            email: user.email,
            watchlist: user.watchlist,
            favGeneres: user.favGeneres
        });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

router.post("/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send({ error: 'Bad request: username, email, and password are required' });
    }
    try {
        const usersCollection = db.collection("Users");
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ error: 'Conflict: A user with this email already exists' });
        }
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword,
            watchlist: [],
            favGeneres: [],
            createdAt: new Date()
        });
        res.status(201).send({ message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

module.exports = router;

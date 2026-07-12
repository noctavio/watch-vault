require("dotenv").config();
const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
const bcrypt = require('bcrypt');

const adminKey = process.env.ADMIN_KEY;

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

router.post("/auth/login", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({ error: 'Bad request: No data provided' });
    }
    try {
        const user = await db.collection("Users").findOne({ username: req.body.username });
        const isMatch = user && await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role, username: user.username },
            SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).send({
            token,                  
            _id: user._id,
            userId: user.userId,
            username: user.username,
            email: user.email,
            watchlistId: user.watchlistId,
            favGeneres: user.favGeneres,
            role: user.role
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
        const watchlistsCollection = db.collection("Watchlists");

        // Check both separately for specific errors
        const existingEmail = await usersCollection.findOne({ email });
        if (existingEmail) {
            return res.status(409).send({ error: 'email' });
        }

        const existingUsername = await usersCollection.findOne({ username });
        if (existingUsername) {
            return res.status(409).send({ error: 'username' });
        }

        const lastUser = await usersCollection.findOne({}, { sort: { userId: -1 } });

        const num = 2;

        const hashedPassword = await bcrypt.hash(password, 10);

        const watchlistResult = await watchlistsCollection.insertOne({
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await usersCollection.insertOne({
            username, email, password: hashedPassword,
            watchlistId: watchlistResult.insertedId,   // ObjectId, guaranteed unique, no race condition
            favGeneres: [],
            createdAt: new Date(),
            role: "user"
        });

        // Sign token and return user data for auto-login
        const token = jwt.sign(
            { userId, role: "user", username },
            SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).send({
            token,
            userId,
            username,
            email,
            watchlistId,
            favGeneres: [],
            role: "user"
        });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

router.put("/auth/user/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)){
            return res.status(400).send({ error: "Invalid ID format" });
        }
        const { watchlistId, password, role, ...allowedUpdates } = req.body;
        const result = await db.collection("Users").updateOne(
            { userId: id },
            {
                $set: allowedUpdates,
                $unset: { watchlist: "" }
            }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).send({ error: "No users found with that ID" });
        }
        res.status(200).send(result);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.delete("/auth/user/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)){
            return res.status(400).send({ error: "Invalid ID format" });
        }
        const user = await db.collection("Users").findOne({ userId: id });
        if (!user) {
            return res.status(404).send({ error: "User Not Found" });
        }
        if (user.watchlistId) {
            await db.collection("Watchlists").deleteOne({ watchlistId: user.watchlistId });
        }
        const results = await db.collection("Users").deleteOne({ userId: id });
        res.status(200).send(results);
    } catch (error) {
        console.error("Error Deleting User", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.get("/auth/admin/users", async (req, res) => {
    const results = await db.collection("Users").find({}).limit(100).toArray();
    console.log(results);
    res.status(200).send(results);
});

module.exports = router;

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
            userId: user.userId,
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

        const lastUser = await usersCollection.findOne({}, { sort: { userId: -1 } });
        const userId = lastUser ? lastUser.userId + 1 : 1;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword,
            watchlist: [],
            favGeneres: [],
            createdAt: new Date(),
            userId,
            role: "user"
        });

        res.status(201).send({ message: 'User created successfully', userId });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

router.put("/auth/user/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).send({ error: "Invalid ID format" });

        const result = await db
                            .collection("Users")
                            .updateOne({ userId: id }, { $set: req.body });
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
        if (isNaN(id)) return res.status(400).send({ error: "Invalid ID format" });

        console.log("User to delete:", id);
        const userDeleted = await db.collection("Users").findOne({ userId: id });
        if (userDeleted) {
            const results = await db.collection("Users").deleteOne({ userId: id });
            res.status(200).send(results);
        } else {
            res.status(404).send({ error: "User Not Found" });
        }
    } catch (error) {
        console.error("Error Deleting User", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;

require("dotenv").config();
const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

router.post("/user/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }
    if (username.length < 3 || username.length > 16) {
        return res.status(400).json({ error: "Username must be between 3-16 characters" });
    }
    if (password.length < 8 || password.length > 24) {
        return res.status(400).json({ error: "Password must be between 8-24 characters"});
    }
    if (username.includes('@')) {
        return res.status(400).json({ error: "Username cannot contain a '@' "});
    }

    try {
        const potentialUser = await db.collection("Users").findOne({
            $or: [{username}, {email}]
        });
        if (potentialUser) {
            return res.status(409).json({error: "Username or Email already exists"});
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.collection("Users").insertOne({
            username,
            email,
            password: hashedPassword,
            followers: [],
            following: [],
            genrePreference: [],
            createdAt: new Date(),
        }); 

        const token = jwt.sign({ userId: result.insertedId }, SECRET, { expiresIn: "7d" });

        res.status(201).json({
            token,
            _id: result.insertedId,
            username,
            email,
            followers: [],
            following: [],
            genrePreference: [],
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.post("/user/login", async (req, res) => {
    // extract username/email and password from the request
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: "Username/Email, and password are required" });
    }

    try {
        const userExists = await db.collection("Users").findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!userExists) {
            return res.status(400).json({ error: "Username or password are incorrect" });
        }

        const passwordMatch = await bcrypt.compare(password, userExists.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Username or password are incorrect" });
        }
        
        const token = jwt.sign({ userId: userExists._id }, SECRET, { expiresIn: "7d" });

        res.status(200).json({
            token,
            _id: userExists._id,
            username: userExists.username,
            email: userExists.email,
            followers: userExists.followers,
            following: userExists.following,
            genrePreference: userExists.genrePreference,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
})

router.get("/user", async (req, res) => {
    res.json({message:"echo retrieve USER"})
})

router.put("/user/edit", async (req, res) => {
    res.json({message:"echo update USER"})
})

router.delete("/user/delete", async (req, res) => {
    res.json({message:"echo delete USER"})
})

module.exports = router;

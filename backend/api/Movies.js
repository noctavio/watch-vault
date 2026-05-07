const express = require('express');
const router = express.Router();
const { db } = require("../db.js");

router.get("/search/:id", async (req, res) => {
    try {
        const results = await db.collection("Movies").findOne({ "id": Number(req.params.id) });
        if (!results) {
            return res.status(404).send({ error: "Movie not found" });
        }
        res.status(200).send(results);
    } catch (error) {
        console.error("Error fetching movie:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "";
        const page  = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 35;
        const skip  = (page - 1) * limit;

        // Build filter, hitting search (no input) returns all movies
        const filter = query.trim()
            ? { title: { $regex: query.trim(), $options: "i" } }  // case insensitive and near matches
            : {};

        const total   = await db.collection("Movies").countDocuments(filter);
        const movies  = await db.collection("Movies")
            .find(filter)
            .sort({ rating: -1 })   // sorts by rating (okay for now)
            .skip(skip)
            .limit(limit)
            .toArray();

        res.status(200).send({
            movies,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error searching movies:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

module.exports = router;
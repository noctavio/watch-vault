const express = require('express');
const router = express.Router();
const { db } = require("../db.js");

router.get("/watchlist/:id", async (req, res) => {
    try {
        const results = await db.collection("Watchlists").findOne({ "watchlistId": Number(req.params.id) });
        if (!results) {
            return res.status(404).send({ error: "Watchlist not found" });
        }
        res.status(200).send(results);
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.post("/watchlist", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({ error: "Bad request: No data provided" });
    }
    try {
        const watchlistsCollection = db.collection("Watchlists");
        const lastWatchList = await watchlistsCollection.findOne({}, { sort: { watchlistId: -1 } });
        const watchlistId = lastWatchList ? lastWatchList.watchlistId + 1 : 1;

        const results = await watchlistsCollection.insertOne({
            "items": [],
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "watchlistId": watchlistId
        });
        res.status(201).send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.put("/watchlist/:id", async (req, res) => {
    try {
        const watchlistId = Number(req.params.id);
        const exists = await db.collection("Watchlists").findOne({ "watchlistId": watchlistId });
        if (!exists) {
            return res.status(404).send({ error: "Watchlist not found" });
        }
        const results = await db.collection("Watchlists").updateOne(
            { "watchlistId": watchlistId },
            { $set: { "items": req.body.items, "updatedAt": new Date() } }
        );
        res.status(200).send(results);
    } catch (error) {
        console.error("Error updating watchlist:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.delete("/watchlist/:id", async (req, res) => {
    try {
        const watchlistId = Number(req.params.id);
        const exists = await db.collection("Watchlists").findOne({ "watchlistId": watchlistId });
        if (!exists) {
            return res.status(404).send({ error: "Watchlist not found" });
        }
        const results = await db.collection("Watchlists").deleteOne({ "watchlistId": watchlistId });
        res.status(200).send(results);
    } catch (error) {
        console.error("Error deleting watchlist:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

module.exports = router;

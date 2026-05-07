const express = require('express');
const router = express.Router();
const { db } = require("../db.js");

router.get("/auth/admin/keys", async (req, res) => {
    const results = await db.collection("Keys").find({}).limit(100).toArray();
    console.log(results);
    res.status(200).send(results);
});

router.get("/auth/admin/keys/:api_name", async (req, res) => {
    try {
        const results = await db.collection("Keys").findOne({ "name": req.params.api_name });
        if (!results) {
            return res.status(404).send({ error: "Key not found" });
        }
        res.status(200).send(results);
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.post("/auth/admin/keys", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({ error: "Bad request: No data provided" });
    }
    try {
        const results = await db.collection("Keys").insertOne({
            "name": req.body.name,
            "value": req.body.value,
            "createdAt": new Date(),
            "updatedAt": new Date(),
        });
        res.status(201).send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.put("/auth/admin/keys/:api_name", async (req, res) => {
    try {
        const exists = await db.collection("Keys").findOne({ "name": req.params.api_name });
        if (!exists) {
            return res.status(404).send({ error: "Key not found" });
        }
        const results = await db.collection("Keys").updateOne(
            { "name": req.params.api_name },
            { $set: { "value": req.body.value, "updatedAt": new Date() } }
        );
        res.status(200).send(results);
    } catch (error) {
        console.error("Error updating Keys:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

module.exports = router;

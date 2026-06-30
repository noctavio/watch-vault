const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
require("dotenv").config();

const BASE_URL = process.env.VITE_BASE_URL;

const GENRE_MAP = {
    Action: 28, Comedy: 35, Drama: 18, Horror: 27, Romance: 10749,
    "Sci-Fi": 878, Thriller: 53, Animation: 16, Documentary: 99,
    Fantasy: 14, Mystery: 9648, Adventure: 12, Crime: 80, Family: 10751, History: 36
};

const getTMDBKey = async () => {
    const result = await db.collection("Keys").findOne({ name: "TMDB" });
    if (!result) throw new Error("TMDB API key not found");
    return result.value;
};

router.get("/recommendations/fav_genre/movie/:id", async (req, res) => {
    try {
        const apiKey = await getTMDBKey();
        if (!req.params.id || isNaN(req.params.id)) {
            return res.status(400).send({ error: "Invalid User ID" });
        }

        const userPrefs = await db.collection("Users").findOne({ userId: Number(req.params.id) });
        if (!userPrefs) {
            return res.status(404).send({ error: "User not found" });
        }

        const genres = (userPrefs.favGeneres || [])
            .map((name) => GENRE_MAP[name])
            .filter(Boolean)
            .join("|");

        if (!genres) {
            return res.status(400).send({ error: "No valid favourite genres found for this user" });
        }

        const movies = await fetch(
            `${BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&with_genres=${genres}&vote_count.gte=200&vote_average.gte=6&page=1`,
        ).then((r) => r.json());

        return res.status(200).send(movies);
    } catch (error) {
        console.error("Error fetching fav_genre recommendations:", error);
        return res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.get("/recommendations/discover/top_rated/movie/:id", async (req, res) => {
    try {
        const apiKey = await getTMDBKey();
        if (!req.params.id || isNaN(req.params.id)) {
            return res.status(400).send({ error: "Invalid User ID" });
        }

        const userPrefs = await db.collection("Users").findOne({ userId: Number(req.params.id) });
        if (!userPrefs) {
            return res.status(404).send({ error: "User not found" });
        }

        const genres = (userPrefs.favGeneres || [])
            .map((name) => GENRE_MAP[name])
            .filter(Boolean)
            .join("|");

        if (!genres) {
            return res.status(400).send({ error: "No valid favourite genres found for this user" });
        }

        const movies = await fetch(
            `${BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=200&vote_average.gte=6&with_genres=${genres}&page=1`,
        ).then((r) => r.json());

        movies.results = movies.results.slice(0, 10);

        return res.status(200).send(movies);
    } catch (error) {
        console.error("Error fetching top_rated recommendations:", error);
        return res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.get("/recommendations/movie/belongs_to_vault/:id", async (req, res) => {
    try {
        const movieId = Number(req.params.id);
        if (!movieId || isNaN(movieId)) {
            return res.status(400).send({ error: "Invalid movie ID" });
        }

        const apiKey = await getTMDBKey();

        const movieDetails = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${apiKey}&append_to_response=belongs_to_collection`,
        ).then((r) => r.json());

        if (!movieDetails.belongs_to_collection) {
            return res.status(404).send({ error: "No collection found for this movie" });
        }

        const collectionId = movieDetails.belongs_to_collection.id;

        const collection = await fetch(
            `${BASE_URL}/collection/${collectionId}?api_key=${apiKey}`,
        ).then((r) => r.json());

        return res.status(200).send(collection);
    } catch (error) {
        console.error("Error fetching belongs_to_vault:", error);
        return res.status(500).send({ error: "An internal server error occurred" });
    }
});

router.get("/recommendations/movie/:id", async (req, res) => {
    try {
        const movieId = Number(req.params.id);
        if (!movieId || isNaN(movieId)) {
            return res.status(400).send({ error: "Invalid movie ID" });
        }

        const apiKey = await getTMDBKey();

        const movies = await fetch(
            `${BASE_URL}/movie/${movieId}/recommendations?api_key=${apiKey}`,
        ).then((r) => r.json());

        return res.status(200).send(movies);
    } catch (error) {
        console.error("Error fetching movie recommendations:", error);
        return res.status(500).send({ error: "An internal server error occurred" });
    }
});

module.exports = router;

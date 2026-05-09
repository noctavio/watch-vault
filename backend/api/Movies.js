const express = require('express');
const router = express.Router();
const { db } = require("../db.js");

const TOTAL_MOVIES = 1000;
const MOVIES_PER_PAGE = 20;
const TOTAL_PAGES = TOTAL_MOVIES / MOVIES_PER_PAGE;

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

// fetches 10 results from live api (for movie requests)
router.get("/movies/tmdb-search", async (req, res) => {
    try {
        const query = req.query.q?.trim();
        if (!query) return res.status(400).send({ error: "No search query provided" });

        const keyDoc = await db.collection("Keys").findOne({ name: "tmdb" });
        if (!keyDoc) return res.status(500).send({ error: "TMDB API key not found" });

        const API_KEY = keyDoc.value;
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );
        const data = await response.json();

        // Return top 10 results, sorted by popularity so we don't get our tmdb use revoked
        const results = data.results
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 10)
            .map((m) => ({
                id: m.id,
                title: m.title,
                releaseYear: m.release_date ? m.release_date.split("-")[0] : "N/A",
                poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
                rating: m.vote_average,
                description: m.overview,
            }));

        res.status(200).send(results);
    } catch (error) {
        console.error("TMDB search error:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

// Adds a requested movie to the DB
router.post("/movies/request", async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).send({ error: "No movie ID provided" });

        // Check if already in DB
        const existing = await db.collection("Movies").findOne({ id: Number(id) });
        if (existing) return res.status(409).send({ error: "Movie already in the vault" });

        const keyDoc = await db.collection("Keys").findOne({ name: "tmdb" });
        if (!keyDoc) return res.status(500).send({ error: "TMDB API key not found" });
        const API_KEY = keyDoc.value;
        const BASE_URL = "https://api.themoviedb.org/3";
        const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

        // Fetch full movie details
        const [detailRes, creditsRes] = await Promise.all([
            fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
            fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`)
        ]);
        const details = await detailRes.json();
        const credits = await creditsRes.json();
        const director = credits.crew?.find((p) => p.job === "Director")?.name || "Unknown";

        const movie = {
            id: details.id,
            title: details.title,
            description: details.overview,
            rating: details.vote_average,
            voteCount: details.vote_count,
            genres: details.genres?.map((g) => g.name) || [],
            director,
            poster: details.poster_path ? `${IMAGE_BASE}${details.poster_path}` : null,
            releaseYear: details.release_date ? details.release_date.split("-")[0] : "N/A",
            releaseDate: details.release_date,
            createdAt: new Date(),
        };

        await db.collection("Movies").insertOne(movie);
        res.status(201).send({ message: `"${movie.title}" has been added to the vault!`, movie });
    } catch (error) {
        console.error("Movie request error:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});


router.put("/movies/update", async (req, res) => {
    const BASE_URL = "https://api.themoviedb.org/3";
    const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    const PAGES_PER_ENDPOINT = 17;
    const ENDPOINTS = ["top_rated", "popular", "upcoming"];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
        const keyDoc = await db.collection("Keys").findOne({ name: "TMDB" });
        if (!keyDoc) {
            return res.status(500).send({ error: "TMDB API key not found" });
        }
        const API_KEY = keyDoc.value;
        const moviesCollection = db.collection("Movies");
        const results = { added: 0, updated: 0, duplicatesRemoved: 0, errors: [] };

        // 0. ensure unique index + clean up any existing duplicates
        await moviesCollection.createIndex({ id: 1 }, { unique: true, sparse: true });

        const dupes = await moviesCollection.aggregate([
            { $group: { _id: "$id", count: { $sum: 1 }, ids: { $push: "$_id" } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        for (const dupe of dupes) {
            const [keep, ...remove] = dupe.ids;
            await moviesCollection.deleteMany({ _id: { $in: remove } });
            results.duplicatesRemoved += remove.length;
        }

        // 1. fetch genre map (id -> name)
        const genreRes = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
        );
        const genreData = await genreRes.json();
        const genreMap = {};
        for (const g of genreData.genres) genreMap[g.id] = g.name;

        // 2. helper to fetch director from credits
        const fetchDirector = async (movieId) => {
            try {
                const res = await fetch(
                    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
                );
                if (!res.ok) return "Unknown";
                const data = await res.json();
                const director = data.crew.find((p) => p.job === "Director");
                return director ? director.name : "Unknown";
            } catch {
                return "Unknown";
            }
        };

        // 3. fetch movies from all endpoints, dedupe by id
        const movieMap = new Map();
        for (const endpoint of ENDPOINTS) {
            for (let page = 1; page <= PAGES_PER_ENDPOINT; page++) {
                const response = await fetch(
                    `${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`
                );
                if (!response.ok) {
                    results.errors.push({ endpoint, page, error: `HTTP ${response.status}` });
                    continue;
                }
                const data = await response.json();
                data.results.forEach((movie) => movieMap.set(movie.id, movie));
                if (page >= data.total_pages) break;
            }
        }

        // 4. enrich each movie with director + resolved genres then upsert
        const allMovies = [...movieMap.values()];
        const upsertOps = [];

        for (const movie of allMovies) {
            const director = await fetchDirector(movie.id);
            await sleep(50);

            upsertOps.push({
                updateOne: {
                    filter: { id: movie.id },
                    update: {
                        $set: {
                            id:       movie.id,
                            title:        movie.title,
                            description:  movie.overview,
                            rating:       movie.vote_average,
                            voteCount:    movie.vote_count,
                            genres:       movie.genre_ids.map((id) => genreMap[id] || "Unknown"),
                            director,
                            poster:       movie.poster_path   ? `${IMAGE_BASE}${movie.poster_path}`   : null,
                            backdropPath: movie.backdrop_path ? `${IMAGE_BASE}${movie.backdrop_path}` : null,
                            releaseYear:  movie.release_date  ? movie.release_date.split("-")[0]      : "N/A",
                            releaseDate:  movie.release_date,
                            updatedAt:    new Date(),
                        },
                        $setOnInsert: { createdAt: new Date() },
                    },
                    upsert: true,
                },
            });
        }

        if (upsertOps.length > 0) {
            const bulkResult = await moviesCollection.bulkWrite(upsertOps);
            results.added    = bulkResult.upsertedCount;
            results.updated += bulkResult.modifiedCount;
        }

        // 5. update stale movies already in DB that aren't in our fresh fetch
        const allIds = new Set(allMovies.map((m) => m.id));
        const lastUpdated = await moviesCollection
            .find({})
            .sort({ updatedAt: -1 })
            .limit(1)
            .toArray();
        const since = lastUpdated.length
            ? lastUpdated[0].updatedAt.toISOString().split("T")[0]
            : "2020-01-01";

        const changedIds = new Set();
        const changesResponse = await fetch(
            `${BASE_URL}/movie/changes?api_key=${API_KEY}&start_date=${since}`
        );
        if (changesResponse.ok) {
            const changesData = await changesResponse.json();
            changesData.results.forEach((m) => changedIds.add(m.id));
        }

        const staleMovies = await moviesCollection
            .find({ id: { $in: [...changedIds], $nin: [...allIds] } })
            .toArray();

        for (const doc of staleMovies) {
            try {
                const detailRes = await fetch(
                    `${BASE_URL}/movie/${doc.id}?api_key=${API_KEY}&language=en-US`
                );
                if (!detailRes.ok) throw new Error(`HTTP ${detailRes.status}`);
                const details = await detailRes.json();

                const director = await fetchDirector(doc.id);
                await sleep(50);

                await moviesCollection.updateOne(
                    { id: doc.id },
                    {
                        $set: {
                            title:        details.title,
                            description:  details.overview,
                            rating:       details.vote_average,
                            voteCount:    details.vote_count,
                            genres:       details.genres ? details.genres.map((g) => g.name) : [],
                            director,
                            poster:       details.poster_path   ? `${IMAGE_BASE}${details.poster_path}`   : null,
                            backdropPath: details.backdrop_path ? `${IMAGE_BASE}${details.backdrop_path}` : null,
                            releaseYear:  details.release_date  ? details.release_date.split("-")[0]      : "N/A",
                            releaseDate:  details.release_date,
                            runtime:      details.runtime,
                            status:       details.status,
                            updatedAt:    new Date(),
                        },
                    }
                );
                results.updated++;
            } catch (err) {
                results.errors.push({ id: doc.id, error: err.message });
            }
        }

        res.status(201).send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

module.exports = router;

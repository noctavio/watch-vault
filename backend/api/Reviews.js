const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
const { v4: uuidv4 } = require('uuid');

// GET all reviews for a movie
router.get("/reviews/:movieId", async (req, res) => {
    try {
        const movieId = Number(req.params.movieId);
        const reviews = await db.collection("Reviews")
            .find({ movieId })
            .sort({ createdAt: -1 })  // newest first
            .toArray();
        res.status(200).send(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

// POST a new review
router.post("/reviews", async (req, res) => {
    const { movieId, movieTitle, moviePoster, movieYear, userId, username, title, description, rating } = req.body;

    if (!movieId || !userId || !username || !title || !description || rating == null) {
        return res.status(400).send({ error: "Missing required fields" });
    }
    if (rating < 1 || rating > 10) {
        return res.status(400).send({ error: "Rating must be between 1 and 10" });
    }

    try {
        // One review per user per movie
        const existing = await db.collection("Reviews").findOne({ movieId: Number(movieId), userId });
        if (existing) {
            return res.status(409).send({ error: "You have already reviewed this movie" });
        }

        const review = {
            reviewId: uuidv4(),
            movieId: Number(movieId),
            movieTitle: movieTitle || "",
            moviePoster: moviePoster || null,
            movieYear: movieYear || "N/A",
            userId,
            username,
            title,
            description,
            rating: Number(rating),
            likes: 0,
            dislikes: 0,
            voters: [],  // { userId, vote: "like" | "dislike" }
            createdAt: new Date(),
        };

        await db.collection("Reviews").insertOne(review);
        res.status(201).send(review);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

// PUT title, description, rating
router.put("/reviews/:reviewId", async (req, res) => {
    const { title, description, rating, userId } = req.body;

    if (!userId) return res.status(400).send({ error: "userId required" });
    if (rating != null && (rating < 1 || rating > 10)) {
        return res.status(400).send({ error: "Rating must be between 1 and 10" });
    }

    try {
        const review = await db.collection("Reviews").findOne({ reviewId: req.params.reviewId });
        if (!review) return res.status(404).send({ error: "Review not found" });
        if (review.userId !== userId) return res.status(403).send({ error: "You can only edit your own reviews" });

        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (rating) updates.rating = Number(rating);

        const result = await db.collection("Reviews").findOneAndUpdate(
            { reviewId: req.params.reviewId },
            { $set: updates },
            { returnDocument: "after" }
        );
        res.status(200).send(result);
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

// PUT like or dislike on a review
router.put("/reviews/:reviewId/vote", async (req, res) => {
    const { userId, vote } = req.body;  // vote: "like"/"dislike"

    if (!userId || !vote) return res.status(400).send({ error: "userId and vote required" });
    if (!["like", "dislike"].includes(vote)) return res.status(400).send({ error: "vote must be 'like' or 'dislike'" });

    try {
        const review = await db.collection("Reviews").findOne({ reviewId: req.params.reviewId });
        if (!review) return res.status(404).send({ error: "Review not found" });
        if (review.userId === userId) return res.status(403).send({ error: "You cannot vote on your own review" });

        const existingVote = review.voters.find((v) => v.userId === userId);

        let likeDelta = 0;
        let dislikeDelta = 0;
        let updatedVoters = [...review.voters];

        if (!existingVote) {
            // New vote
            updatedVoters.push({ userId, vote });
            vote === "like" ? likeDelta++ : dislikeDelta++;
        } else if (existingVote.vote === vote) {
            // Same vote — remove it (toggle off)
            updatedVoters = updatedVoters.filter((v) => v.userId !== userId);
            vote === "like" ? likeDelta-- : dislikeDelta--;
        } else {
            // Switched vote
            updatedVoters = updatedVoters.map((v) => v.userId === userId ? { userId, vote } : v);
            if (vote === "like") { likeDelta++; dislikeDelta--; }
            else { likeDelta--; dislikeDelta++; }
        }

        const result = await db.collection("Reviews").findOneAndUpdate(
            { reviewId: req.params.reviewId },
            {
                $set: { voters: updatedVoters },
                $inc: { likes: likeDelta, dislikes: dislikeDelta }
            },
            { returnDocument: "after" }
        );
        res.status(200).send(result);
    } catch (error) {
        console.error("Error voting on review:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

// DELETE a review (by owner only)
router.delete("/reviews/:reviewId", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).send({ error: "userId required" });

    try {
        const review = await db.collection("Reviews").findOne({ reviewId: req.params.reviewId });
        if (!review) return res.status(404).send({ error: "Review not found" });
        if (review.userId !== userId && role !== 'admin') {
            return res.status(403).send({ error: "You can only delete your own reviews" });
        }

        await db.collection("Reviews").deleteOne({ reviewId: req.params.reviewId });
        res.status(200).send({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

module.exports = router;
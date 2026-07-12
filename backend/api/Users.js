require("dotenv").config();
const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

// create a user, 
// 
router.post("/user/register", async (req, res) => {
    res.json({ message: "echo Register" });
});

// authentice a user, 
// 
router.post("/user/login", async (req, res) => {
    res.json({message:"echo Login"});
})

// retrieve a user, 
// 
router.get("/user", async (req, res) => {
    res.json({message:"echo retrieve USER"})
})

// update a user, 
// 
router.put("/user/edit", async (req, res) => {
    res.json({message:"echo update USER"})
})

// delete a user
router.delete("/user/delete", async (req, res) => {
    res.json({message:"echo delete USER"})
})


module.exports = router;

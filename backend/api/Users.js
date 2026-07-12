require("dotenv").config();
const express = require('express');
const router = express.Router();
const { db } = require("../db.js");
const bcrypt = require('bcrypt');

const adminKey = process.env.ADMIN_KEY;

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

// create a user, 
// 

// authentice a user, 
// 

// retrieve a user, 
// 

// update a user, 
// 

// delete a user


module.exports = router;

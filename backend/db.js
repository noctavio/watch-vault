require("dotenv").config();

const { MongoClient } = require("mongodb");
const url = process.env.MONGODB_URI;
const dbName = "watch_vault"
const client = new MongoClient(url);
const db = client.db(dbName);

module.exports = { client, db };
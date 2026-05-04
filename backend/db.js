const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017";
const dbName = "watch_vault"
const client = new MongoClient(url);
const db = client.db(dbName);

module.exports = { client, db };

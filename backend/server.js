require("dotenv").config();

const express = require("express");
var cors = require("cors");
const { client } = require("./db");
const app = express();
app.use(express.json())
app.use(cors())
var bodyParser = require("body-parser");

const port = process.env.PORT || 8080;
const host = "0.0.0.0";

const userRoutes = require("./api/Users.js");
const watchlistRoutes = require("./api/Watchlist.js");
const searchRoutes = require("./api/Movies.js");
const keyRoutes = require("./api/Keys.js");
const reviewRoutes = require("./api/Reviews.js");
const recommendationsRoutes = require("./api/Recommendations.js");

app.use(userRoutes);
app.use(watchlistRoutes);
app.use(keyRoutes);
app.use(searchRoutes);
app.use(reviewRoutes);
app.use(recommendationsRoutes);

client.connect().then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
        console.log("App live at http://%s:%s", host, port);
    });
}).catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});

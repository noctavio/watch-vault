const express = require("express");
var cors = require("cors");
const { client } = require("./db");
const app = express();
app.use(express.json())
app.use(cors())
var bodyParser = require("body-parser");

const port = 8080;
const host = "localhost";

const userRoutes = require("./api/Users.js");
const watchlistRoutes = require("./api/Watchlist.js");
const searchRouter = require("./api/Movies.js");
const keyRoutes = require("./api/Keys.js");

app.use("/api", userRoutes);
app.use("/api", watchlistRoutes);
app.use("/api", keyRoutes)
app.use('/api', searchRouter);

client.connect().then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
        console.log("App live at http://%s:%s", host, port);
    });
}).catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});

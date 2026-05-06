const fs = require("fs");
 
const API_KEY = "57abe25a4cd0178a094bc72c1d886e7e"; // api key
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500"; // w500 = good quality, not too large
const TOTAL_MOVIES = 1000;
const MOVIES_PER_PAGE = 20;
const TOTAL_PAGES = TOTAL_MOVIES / MOVIES_PER_PAGE; // 50 pages
 
// Pause between requests so we don't hammer the API
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
 
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}
 
// Fetch genre id->name map
async function fetchGenreMap() {
  const data = await fetchJSON(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );
  const map = {};
  for (const g of data.genres) map[g.id] = g.name;
  return map;
}
 
// Fetch the director from a movies credits
async function fetchDirector(movieId) {
  try {
    const data = await fetchJSON(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
    );
    const director = data.crew.find((p) => p.job === "Director");
    return director ? director.name : "Unknown";
  } catch {
    return "Unknown";
  }
}
 
async function main() {
  console.log("🎬 Starting TMDB fetch...\n");
 
  // Fetch genre map first
  console.log("📋 Fetching genre list...");
  const genreMap = await fetchGenreMap();
 
  const movies = [];
 
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`📄 Fetching page ${page}/${TOTAL_PAGES}...`);
 
    const data = await fetchJSON(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
    );
 
    // Fetch director for each movie on this page (sequentially)
    for (const movie of data.results) {
      const director = await fetchDirector(movie.id);
 
      movies.push({
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        rating: movie.vote_average, 
        voteCount: movie.vote_count,
        genres: movie.genre_ids.map((id) => genreMap[id] || "Unknown"),
        director,
        poster: movie.poster_path
          ? `${IMAGE_BASE}${movie.poster_path}`
          : null,
        releaseYear: movie.release_date
          ? movie.release_date.split("-")[0]
          : "N/A",
      });
 
      await sleep(50);
    }
 
    await sleep(300);
  }
 
  // Write output
  fs.writeFileSync("movies.json", JSON.stringify(movies, null, 2));
 
  console.log(`\n${movies.length} movies saved to movies.json`);
  console.log(`Sample entry:\n`, JSON.stringify(movies[0], null, 2));
}
 
main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
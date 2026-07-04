# DISCLAIMER
Since I'm running Vercel, the app takes anywhere from 20-40 seconds to wake up upon first request

# AL_10
- `Alex Erickson` - aerick22@iastate.edu
- `Octavio Munoz` - munozo@iastate.edu

# Brief project description
Watchvault is an app where users can view trending films, save their favorite movies, and create and view reviews by other users. Any user can create their own set of watched movies where they must set the individual status to watched to create a review. Admins can manually delete reviews they deem inappropriate and delete any film in the database as well as request one through TMDB’s api. Every film on the app has its own individual review page which compiles and filters reviews through multiple pages; it incorporates a social feature through a like and dislike system.

## Setup instructions (if any)
Open two terminals: first terminal run following commands
    - cd frontend -> npm install bootstrap react-bootstrap react-bootstrap-icons react-hook-form react-router-dom -> npm run dev
second terminal run the following commands
    - cd backend -> npm install bcrypt body-parser cors express mongodb nodemon uuid -> nodemon server.js

### Known limitations (if any)
Pulls 1000 movies from tmdb api, stores it in local database. Movies not included have to be manually added by
an Admin through a simple to use movie request page.

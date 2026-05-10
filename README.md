# AL_10

## Submission Requirement

Before submitting, update this README with:

- `Alex Erickson` - email@iastate.edu
- `Octavio Munoz` - munozo@iastate.edu

# Brief project description
A movie watchlist website, allowers user to create accounts, add movies to watchlist, make reviews,
and mark as watched to keep track and many more features.

## Setup instructions (if any)
Open two terminals: first terminal run following commands
    - cd frontend -> npm install bootstrap react-bootstrap react-bootstrap-icons react-hook-form react-router-dom -> npm run dev
second terminal run the following commands
    - cd backend -> npm install bcrypt body-parser cors express mongodb nodemon uuid -> nodemon server.js

### Known limitations (if any)
Pulls 1000 movies from tmdb api, stores it in local database. Movies not included have to be manually added by
an Admin through a simple to use movie request page.

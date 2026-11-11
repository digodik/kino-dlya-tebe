# Kino dlya tebe (Cinema for You) 🗂️

My personal film catalog, designed as a criminal case file archive.

My list of watched films in phone notes grew to 300+ lines and became a mess, so I turned it into an archive: every film is a case folder with its own number, a "verdict" stamp with my rating and a handwritten note.

Year-long university project at Kharkiv University of Technology "STEP", successfully defended.

## Features

- Every film is a case folder ("CASE No. 042") on kraft paper
- My rating is a red ink stamp, 10/10 gets a double stamp
- Films I haven't watched yet are stamped "WANTED"
- Click a folder to open the full case file with "similar cases" (based on shared genres, era and rating)
- Filters by era, genre, series, "for a date" and "wanted"
- Search by title, description and year, sorting by rating, year or title
- "Pull a case" button picks a random film from the current filter
- Visitors can leave their own "jury verdict" rating
- You can add your own films, they are saved in localStorage

## Posters

Real film posters load from TMDB API and get cached. Without internet the site shows generated covers, nothing breaks.

## Tech

- HTML, CSS and plain JavaScript, no frameworks and no backend
- Film data lives in `js/films.js`, to add a film just add one object to the array
- Static site: works on any hosting or just by opening `index.html`

## Structure

```
kino-dlya-tebe/
├── index.html      main (and only) page
├── css/
│   └── style.css   case file archive styles
└── js/
    ├── films.js    film database
    ├── app.js      filters, search, case files, similar cases, random pick
    ├── posters.js  TMDB posters with caching
    ├── verdicts.js visitor ratings ("jury verdicts")
    └── custom.js   adding your own films (localStorage)
```

## How to run

Open `index.html` in a browser. That's it.

Author: Ivan Luchnykov ([@digodik](https://github.com/digodik))

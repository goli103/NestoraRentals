# Nestora (High Fidelity prototype)

A working front-end for the Nestora rental app.  it is in Plain HTML, CSS and JavaScript. 
 # By next Door Neighbors Group AP/ITEC 3230 A - Designing User Interfaces Fall 2026-2027
## Run it
Open `index.html` in Chrome, Edge or Firefox (double-click it). To share it with a tester, upload the whole folder to Netlify Drop, GitHub Pages or any static host.

## What works
- Search page with real filtering, sorting and a Toronto map with price pins.

- **Nestora Agent Nesti**: type a request in plain words ("2-bed in the Annex under $3000", "pets allowed", "best schools, 3 bedrooms"). It turns the sentence into a search, runs it on the search database, and explains the top match.

- Property page with ratings, school locator and map, and a Contact Landlord pop-up.

- Three-step tour booking with form checks, and a My Tours page (reschedule, cancel).

- Saved homes. Everything is stored in the browser (localStorage), so it survives a refresh.

- **Test mode** facilitator panel: the task list, a timer, click and error counts, and an export of the results. Testers never see it. Press **Alt+Shift+T** (Option+Shift+T on Mac) to show or hide its button, bottom left.
- `sus.html`: the 10-question System Usability Scale with automatic scoring.

## Files
- `index.html` – page structure and script order
- `css/style.css` – colours, type, layout (light and dark)
- `js/data.js` – sample listings, schools, reviews, app state
- `js/db.js` – the search database (index and `searchListings`)
- `js/agent.js` – the Nestora Agent, Nesti
- `js/home.js`, `property.js`, `booking.js`, `pages.js` – screens
- `js/store.js` – saving to the browser
- `js/test.js` – facilitator panel


## Running usability session for Nestora Rentals 
1. press **Alt+Shift+T** to show the Test mode button, click it, and enter a participant name. Close the panel and hide the button (Alt+Shift+T again) before the tester starts
2.Open `sus.html` and  the tester answer the 10 questions.

Listings, schools, ratings and reviews are sample data. 
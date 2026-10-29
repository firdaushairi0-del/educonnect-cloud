# Tutorbit prototype (front end)

Open `index.html` in a browser. No build step and no server needed. Everything uses sample data and resets on refresh.

## Folders

- `index.html` : the page shell. It loads Bootstrap 5 (CDN), then the CSS files, then the JavaScript files in order.
- `css/` : `bootstrap-fixes.css`, then `base.css` (colours, light/dark), `layout.css` (side navigation), `components.css` (buttons, forms, tables), `classrooms.css`, `match.css`, `public.css`.
- `js/core/` : `config.js` (constants, dates), `data.js` (sample data), `helpers.js` (lookups, formatting).
- `js/matching.js` : the weighted matching logic.
- `js/pages/` : one file per area of screens: `public.js`, `match.js`, `shell.js`, `dashboard.js`, `org-admin.js`, `reports.js`, `tutor.js`, `learner.js`.
- `js/actions/` : what the buttons and forms do, one file per area.
- `js/ui.js` and `js/main.js` : rendering and dialogs, then start-up.

## Notes

- The script order in `index.html` matters because the files share functions.
- Our own class names that clash with Bootstrap start with `ec-` (`ec-btn`, `ec-card`, `ec-row`, `ec-nav`, `ec-nav-item`, `ec-badge`, `ec-progress`, `ec-lead`).
- Bootstrap, the fonts and the QR library load from the internet.

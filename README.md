# Smokey Dreamz website (v2)

Static site: plain HTML, CSS and JS, no build step. Hosted on Render as a static site (`render.yaml`).

## Edit your details
Open `script.js` and fill in `CONFIG` at the top: address, WhatsApp number (digits only, e.g. `27821234567`), Instagram, Facebook and opening hours. The open/closed sign, Google Maps button, WhatsApp button and join form all read from it.

## Edit the menu
`MENU` in `script.js`. `price: null` (or no price) shows "Ask in store". Photos live in `assets/img/` as `.webp`.

## Files
- `index.html` – all sections (age gate, hologram intro, hero, about, menu, chill bar, gallery, membership, visit, FAQ, join, footer)
- `styles.css` – theme colours at the top under `:root`
- `script.js` – config, menu data, carousels, open/closed logic, form → WhatsApp
- `assets/art/` – lion mascot, wordmark, slime edge, boba (SVG)
- `tools/` – Python scripts that generate the lion and wordmark SVGs

## Deploy on Render
New → Blueprint → pick this repo and the `website-v2` branch. Render reads `render.yaml` and publishes the site.

## Legal notes (South Africa)
Written around a private members' club model under the Cannabis for Private Purposes Act, 2024: "contributions", no public sales, no online sales or delivery, an 18+ age gate and a POPIA consent box. Have a lawyer check the copy before going live.

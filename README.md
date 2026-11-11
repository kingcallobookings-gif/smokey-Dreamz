# Smokey Dreamz website

A static site: plain HTML, CSS and JS with no build step. Open `index.html` in a browser, or host it free on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## Files
- `index.html`: all page sections (age gate, hero, about, menu, membership, visit, FAQ, join form, footer)
- `styles.css`: theme colours are at the top under `:root`
- `script.js`: menu data (`MENU`), opening hours (`HOURS`), form handling, animations
- `assets/favicon.svg`: placeholder logo

## Placeholders to replace
- [ ] Address, phone/WhatsApp, email (`#visit` section in `index.html`)
- [ ] Map: replace the OpenStreetMap iframe `src` with your real location (or a Google Maps embed)
- [ ] Opening hours: both the table in `index.html` and `HOURS` in `script.js`
- [ ] Menu items and contributions: `MENU` in `script.js`
- [ ] Membership tiers and fees: `#membership` in `index.html`
- [ ] Instagram / socials link in the footer
- [ ] Real logo and product photos (save them in `assets/`)
- [ ] Join form: connect it to Formspree, Netlify Forms or a WhatsApp link (see the `TODO` in `script.js`)

## Legal notes (South Africa)
The Cannabis for Private Purposes Act, 2024 permits private adult use and cultivation but prohibits dealing. The site is written around a private members' club model: "contributions" instead of prices, no public sales, an 18+ age gate and a POPIA consent box. Have a lawyer check the copy before going live, because club legality is still before the courts.

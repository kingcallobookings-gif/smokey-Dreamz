# Smokey Dreamz website

A static site: plain HTML, CSS and JS with no build step. Open `index.html` in a browser, or host it free on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## Files
- `index.html`: all page sections (age gate, hero, about, menu, membership, visit, FAQ, join form, footer)
- `styles.css`: theme colours are at the top under `:root`
- `script.js`: menu data (`MENU`), opening hours (`HOURS`), form handling, animations
- `assets/`: favicon, shop photos and product close-ups

## Done
- [x] Lion logo, favicon and hero sign (from shop photos, in `assets/photos/`)
- [x] Real menu: strain wall, pre-rolls, edibles, glass and gear (`STRAINS` and `MENU` in `script.js`, photos in `assets/products/`)
- [x] Shop photo gallery

## Still to replace
- [ ] Address, phone/WhatsApp, email (`#visit` section in `index.html`)
- [ ] Google Maps link in the `.map-card` (`index.html`)
- [ ] Opening hours: both the table in `index.html` and `HOURS` in `script.js`
- [ ] Contributions for each menu item (`price: null` shows "Ask in store")
- [ ] Membership fees, if you want them shown
- [ ] Instagram / socials link in the footer
- [ ] Join form: connect it to WhatsApp, Formspree or Netlify Forms (see the `TODO` in `script.js`)

## Legal notes (South Africa)
The Cannabis for Private Purposes Act, 2024 permits private adult use and cultivation but prohibits dealing. The site is written around a private members' club model: "contributions" instead of prices, no public sales, an 18+ age gate and a POPIA consent box. Have a lawyer check the copy before going live, because club legality is still before the courts.

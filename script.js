/* Smokey Dreamz — site behaviour */
(() => {
  "use strict";

  /* ======== EDIT YOUR DETAILS HERE ======== */
  const CONFIG = {
    address: "",                 // e.g. "12 Long Street, Cape Town"
    mapsQuery: "",               // what to search on Google Maps (defaults to address)
    whatsapp: "",                // international format, digits only, e.g. "27821234567"
    instagram: "",               // full URL
    facebook: "",                // full URL
    // 24h clock, [open, close]. 0 = Sunday. Use null for closed all day.
    hours: { 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 22], 6: [10, 22], 0: [11, 18] },
  };

  /* ======== MENU ========
     img: file in assets/img (without .webp). price: Rand amount, or null → "Ask in store".
     small: true keeps the photo small (character pieces). */
  const MENU = {
    flower: {
      label: "Flower", title: "The strain wall", note: "Our current strains. Ask a budtender what's fresh.",
      strains: [
        ["Sweets", "#ff5fd2", "#ffb3ec"], ["Gabriel's Crown", "#ffcc33", "#fff1b3"], ["Planet of the Grapes", "#7c3aed", "#c4b5fd"],
        ["Space Jam", "#38bdf8", "#bae6fd"], ["Blue Cheese", "#2563eb", "#93c5fd"], ["Cupid's Kush", "#ff3b4f", "#ffb3bc"],
        ["GMO", "#39ff6a", "#c6ffd4"], ["London Lobster", "#f97316", "#fed7aa"], ["Rainbow Sherbet", "#e879f9", "#a7f3d0"],
      ],
    },
    preroll: {
      label: "Pre-rolls", title: "Pre-rolls", note: "Tap a tube to pop it open.",
      tubes: [
        { name: "White Wedding", id: "white-wedding", w: 220, h: 1021, cap: 163, glow: "#ff3b4f" },
        { name: "Fruit Salad", id: "fruit-salad", w: 220, h: 988, cap: 103, glow: "#3b82f6" },
        { name: "Ethos Cookies", id: "ethos-cookies", w: 220, h: 1101, cap: 132, glow: "#8b5cf6" },
        { name: "House pre-rolls", glass: true, w: 220, h: 1000, cap: 110, glow: "#ffcc33" },
      ],
      items: [
        { name: "Captain Crunch", detail: "Pre-roll in a sealed tube", img: "captain-crunch" },
        { name: "House pre-rolls", detail: "Rolled in-house, in glass tubes. Ask what's rolled today", img: "house-prerolls" },
      ],
    },
    edible: {
      label: "Edibles", title: "Edibles", note: "Start low, go slow. Ask us about strengths.",
      items: [
        { name: "Sour Snakes", detail: "Candy Land · Indica · 5 × 60mg", img: "sour-snakes" },
        { name: "Itty Bitty Tiddies", detail: "Candy Land · Sativa · 3 × 40mg", img: "itty-bitty" },
        { name: "Mini Weed Leaves", detail: "Candy Land · Indica · 10 × 5mg", img: "mini-leaves" },
        { name: "Around the Block", detail: "Candy Land · Indica · 2 × 80mg", img: "around-block" },
        { name: "Sucker THC lollipops", detail: "Candy Land · 10, 25, 50 or 100mg", img: "sucker" },
        { name: "FAR Pink Lemonade", detail: "Fast-acting rosin gummies · 10 × 5mg", img: "far" },
        { name: "Medibles", detail: "Full-spectrum gummies · 5 × 30mg", img: "medibles" },
        { name: "Rolo's", detail: "Sativa · 5 × 20mg", img: "rolos" },
      ],
    },
    glass: {
      label: "Glass & bongs", title: "Glass & bongs", note: "Hand-picked glass and silicone pieces.",
      items: [
        { name: "Black Leaf bongs", detail: "Quality German glass in a few styles", img: "bongs" },
        { name: "Percolator bong", detail: "Smooth, filtered hits", price: 650 },
        { name: "Frosted moon bong", detail: "A statement piece for the shelf", price: 1200 },
        { name: "Character water pipes", detail: "Novelty and silicone character pieces", img: "novelty-bong", small: true },
        { name: "Silicone spoon pipes", detail: "Tough, colourful and easy to clean", img: "silicone-pipe" },
      ],
    },
    gear: {
      label: "Accessories", title: "Accessories", note: "Everything for the perfect session.",
      items: [
        { name: "Rolling trays", detail: "Printed metal trays in loads of designs", img: "rolling-tray" },
        { name: "Rolling tray kits", detail: "Tray, pipe and extras together", img: "trays-pipes" },
        { name: "RAW Hemp Wick", detail: "Natural hemp and beeswax · 6m", price: 30, img: "hemp-wick" },
        { name: "Smoking screens", detail: "5 screens per pack", img: "screens" },
        { name: "Alien mug", detail: "Wrap-around psychedelic alien print", img: "alien-mug" },
      ],
    },
    incense: {
      label: "Incense & crystals", title: "Incense & crystals", note: "Set the mood.",
      items: [
        { name: "Tribal Soul · Moon Rituals", detail: "Incense sticks", hue: "#a78bfa" },
        { name: "Tribal Soul · White Sage + Palo Santo", detail: "Incense sticks", hue: "#d6d3d1" },
        { name: "Tribal Soul · Crystal Healing", detail: "Incense sticks", hue: "#67e8f9" },
        { name: "Tribal Soul · 7 Chakras", detail: "Incense sticks", hue: "#f472b6" },
        { name: "Tulasi White Sage", detail: "Smudge incense", hue: "#bef264" },
        { name: "Pyrite crystal incense", detail: "Crystal-infused sticks", hue: "#fbbf24" },
      ],
    },
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* blocked */ } },
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Age gate → hologram intro ---------- */
  const gate = $("#ageGate"), holo = $("#holo");
  function playHologram() {
    if (reduce) { document.body.classList.remove("locked"); return; }
    holo.classList.remove("hidden");
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      holo.classList.add("leaving");
      setTimeout(() => { holo.classList.add("hidden"); document.body.classList.remove("locked"); }, 650);
    };
    holo.addEventListener("click", finish);
    setTimeout(finish, 3600);
  }
  function enter() { gate.classList.add("hidden"); playHologram(); }
  if (store.get("sd_age_ok") === "1") enter();
  $("#ageYes").addEventListener("click", () => { store.set("sd_age_ok", "1"); enter(); });
  $("#ageNo").addEventListener("click", () => { $("#ageDenied").hidden = false; });

  /* ---------- Header + mobile nav ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const nav = $("#nav"), toggle = $("#navToggle");
  const setNav = (open) => { nav.classList.toggle("open", open); toggle.setAttribute("aria-expanded", String(open)); document.body.style.overflow = open ? "hidden" : ""; };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));

  /* ---------- Marquee ---------- */
  const words = ["Members only", "Good vibes", "18+", "Boba bar", "Start low, go slow", "Light up, drift off"];
  const run = words.map((w) => `<span>${w}</span><span><b>✦</b></span>`).join("");
  $("#marquee").innerHTML = run + run;

  /* ---------- Menu ---------- */
  const fmt = (n) => "R" + n.toLocaleString("en-ZA");
  const tabs = $("#tabs"), panels = $("#panels");
  const keys = Object.keys(MENU);
  tabs.innerHTML = keys.map((k, i) => `<button class="tab" role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}">${MENU[k].label}</button>`).join("");

  function itemCard(it, label) {
    const initial = it.name.replace(/^Tribal Soul · /, "").charAt(0);
    const pic = it.img
      ? `<div class="pic${it.small ? " small" : ""}"><img src="assets/img/${it.img}.webp" alt="${esc(it.name)}" loading="lazy" decoding="async" width="560" height="560"></div>`
      : `<div class="pic"><div class="gen" style="background:radial-gradient(circle at 50% 40%,${it.hue || "#7c3aed"}55,#12061f 70%)"><span style="color:${it.hue || "#c4b5fd"}">${esc(initial)}</span></div></div>`;
    return `<article class="card item">${pic}<div class="body"><span class="tag">${esc(label)}</span><h4>${esc(it.name)}</h4><p>${esc(it.detail)}</p>${
      it.price ? `<span class="price">${fmt(it.price)} <small style="font-size:.7em;color:var(--muted)">contribution</small></span>` : `<span class="ask">Ask in store</span>`}</div></article>`;
  }
  panels.innerHTML = keys.map((k, i) => {
    const c = MENU[k];
    const tubeHTML = (t) => `<button class="tube${t.glass ? " glass" : ""}" style="--w:${t.w};--h:${t.h};--cap:${t.cap};--glow:${t.glow}" aria-pressed="false" aria-label="Open the ${esc(t.name)} tube">
        <span class="tube-stage"><img class="joint" src="assets/art/joint.svg" alt="" loading="lazy">${t.glass
          ? `<span class="t-cap glass-cap"></span><span class="t-body glass-body"></span>`
          : `<img class="t-cap" src="assets/tubes/${t.id}-cap.webp" alt="" loading="lazy"><img class="t-body" src="assets/tubes/${t.id}-body.webp" alt="${esc(t.name)} pre-roll tube" loading="lazy">`}</span>
        <span class="tube-name">${esc(t.name)}</span><span class="tube-hint">Tap to open</span></button>`;
    const body = c.strains
      ? `<div class="strain-wall">${c.strains.map(([n, c1, c2]) => `<div class="card strain" style="--c1:${c1};--c2:${c2}"><span class="jar"></span><h4>${esc(n)}</h4><small>Ask in store</small></div>`).join("")}</div>`
      : c.tubes
      ? `<div class="rack">${c.tubes.map(tubeHTML).join("")}</div><div class="rack-shelf"></div><p class="rack-note">All pre-rolls: Ask in store for today's contributions.</p><div class="extra-row">${c.items.map((it) => itemCard(it, c.label)).join("")}</div>`
      : `<div class="carousel" id="car-${k}">${c.items.map((it) => itemCard(it, c.label)).join("")}</div>`;
    const nav = (c.strains || c.tubes) ? "" : `<div class="car-nav"><button class="car-btn" data-car="car-${k}" data-dir="-1" aria-label="Previous">‹</button><button class="car-btn" data-car="car-${k}" data-dir="1" aria-label="Next">›</button></div>`;
    return `<div class="panel${i === 0 ? " active" : ""}" role="tabpanel" id="panel-${k}" aria-labelledby="tab-${k}"><div class="panel-intro"><div><h3>${c.title}</h3><p>${c.note}</p></div>${nav}</div>${body}</div>`;
  }).join("");
  tabs.addEventListener("click", (e) => {
    const t = e.target.closest(".tab"); if (!t) return;
    $$(".tab", tabs).forEach((b) => b.setAttribute("aria-selected", String(b === t)));
    $$(".panel", panels).forEach((p) => p.classList.toggle("active", p.id === t.getAttribute("aria-controls")));
    t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
  panels.addEventListener("click", (e) => {
    const b = e.target.closest(".car-btn"); if (!b) return;
    const car = document.getElementById(b.dataset.car);
    car.scrollBy({ left: Number(b.dataset.dir) * car.clientWidth * 0.8, behavior: "smooth" });
  });

  /* ---------- Smoke puffs (click anything tasty) ---------- */
  const puffLayer = document.createElement("div"); puffLayer.className = "puff-layer"; document.body.appendChild(puffLayer);
  function smokeBurst(x, y, n = 9, spread = 1) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span"); p.className = "sp";
      p.style.left = x + "px"; p.style.top = y + "px";
      puffLayer.appendChild(p);
      const dx = (Math.random() - 0.5) * 90 * spread, dy = -(90 + Math.random() * 140) * spread, s = 1.8 + Math.random() * 2;
      const anim = p.animate([
        { transform: "translate(0,0) scale(.4)", opacity: 0 },
        { transform: `translate(${dx * 0.25}px,${dy * 0.25}px) scale(${s * 0.55})`, opacity: 0.7, offset: 0.25 },
        { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 0 },
      ], { duration: 2200 + Math.random() * 1400, easing: "cubic-bezier(.22,1,.36,1)", delay: i * 60 });
      anim.onfinish = () => p.remove();
    }
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".item, .strain, .bar-card, .chip, .shot, .feature, .hero-lion");
    if (t && !e.target.closest(".tube")) smokeBurst(e.clientX, e.clientY);
  });

  /* ---------- Pre-roll tubes: squeeze → lid flips on its hinge → joint eases out → smoke ---------- */
  const tubeSmoke = new WeakMap();
  function tipPoint(tube) { const j = tube.querySelector(".joint").getBoundingClientRect(); return [j.left + j.width / 2, j.top + 2]; }
  function setTube(tube, open) {
    if (tube.dataset.busy) return;
    tube.dataset.busy = "1"; setTimeout(() => delete tube.dataset.busy, 700);
    tube.setAttribute("aria-pressed", String(open));
    tube.querySelector(".tube-hint").textContent = open ? "Tap to close" : "Tap to open";
    clearInterval(tubeSmoke.get(tube));
    if (open) {
      tube.classList.add("squeeze");
      setTimeout(() => { tube.classList.remove("squeeze"); tube.classList.add("open"); }, 160);
      setTimeout(() => {
        if (!tube.classList.contains("open")) return;
        const [x, y] = tipPoint(tube); smokeBurst(x, y, 6, 0.55);
        tubeSmoke.set(tube, setInterval(() => {
          if (!tube.classList.contains("open") || document.hidden) return;
          const r = tube.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
          const [tx, ty] = tipPoint(tube); smokeBurst(tx, ty, 2, 0.4);
        }, 650));
      }, 1500);
    } else {
      tube.classList.remove("open");
    }
  }
  panels.addEventListener("click", (e) => {
    const tube = e.target.closest(".tube"); if (!tube) return;
    setTube(tube, !tube.classList.contains("open"));
  });

  /* ---------- Constant rising smoke ---------- */
  const cv = document.createElement("canvas"); cv.id = "smokeCanvas"; cv.setAttribute("aria-hidden", "true");
  document.body.insertBefore(cv, document.body.firstChild);
  const cx2 = cv.getContext("2d");
  let SW = 0, SH = 0, wisps = [];
  const puffSprite = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(235,222,255,.55)"); gr.addColorStop(.5, "rgba(190,160,255,.18)"); gr.addColorStop(1, "rgba(160,120,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  })();
  function sizeSmoke() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    SW = innerWidth; SH = innerHeight; cv.width = SW * dpr; cv.height = SH * dpr; cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(34, SW / 30));
    wisps = Array.from({ length: n }, () => newWisp(true));
  }
  function newWisp(anywhere) {
    return { x: Math.random() * SW, y: anywhere ? Math.random() * SH : SH + 80, r: 50 + Math.random() * 120,
      vy: -(0.25 + Math.random() * 0.55), ph: Math.random() * 6.28, a: 0.25 + Math.random() * 0.45, g: 1.0006 + Math.random() * 0.0012 };
  }
  let last = 0;
  function smokeTick(t) {
    requestAnimationFrame(smokeTick);
    if (document.hidden || t - last < 33) return; last = t;
    cx2.clearRect(0, 0, SW, SH);
    for (const w of wisps) {
      w.y += w.vy; w.ph += 0.01; w.x += Math.sin(w.ph) * 0.4; w.r *= w.g;
      const life = Math.min(1, (SH + 80 - w.y) / 200) * Math.min(1, w.y / (SH * 0.5));
      cx2.globalAlpha = Math.max(0, w.a * life);
      cx2.drawImage(puffSprite, w.x - w.r, w.y - w.r, w.r * 2, w.r * 2);
      if (w.y < -w.r) Object.assign(w, newWisp(false));
    }
  }
  if (!reduce) { sizeSmoke(); addEventListener("resize", sizeSmoke); requestAnimationFrame(smokeTick); }

  /* ---------- Gallery dots + auto-advance ---------- */
  const gal = $("#gallery-track"), dots = $("#gallery-dots");
  const shots = $$(".shot", gal);
  dots.innerHTML = shots.map((_, i) => `<button aria-label="Photo ${i + 1}"${i === 0 ? ' class="on"' : ""}></button>`).join("");
  const dotBtns = $$("button", dots);
  dotBtns.forEach((d, i) => d.addEventListener("click", () => gal.scrollTo({ left: shots[i].offsetLeft - gal.offsetLeft - (gal.clientWidth - shots[i].clientWidth) / 2, behavior: "smooth" })));
  let galIdx = 0;
  gal.addEventListener("scroll", () => {
    const mid = gal.scrollLeft + gal.clientWidth / 2;
    let best = 0, bd = Infinity;
    shots.forEach((s, i) => { const c = s.offsetLeft - gal.offsetLeft + s.clientWidth / 2; const d = Math.abs(c - mid); if (d < bd) { bd = d; best = i; } });
    galIdx = best; dotBtns.forEach((d, i) => d.classList.toggle("on", i === best));
  }, { passive: true });
  let galPaused = false;
  gal.addEventListener("pointerdown", () => { galPaused = true; });
  if (!reduce) setInterval(() => { if (!galPaused && !document.hidden) dotBtns[(galIdx + 1) % shots.length].click(); }, 4500);

  /* ---------- Visit: details + hours + open/closed (SA time) ---------- */
  const todo = (t) => `<span class="todo">${t}</span>`;
  $("#addr").innerHTML = CONFIG.address ? esc(CONFIG.address) : todo("Address coming soon");
  $("#waText").innerHTML = CONFIG.whatsapp ? "+" + esc(CONFIG.whatsapp) : todo("Number coming soon");
  const q = encodeURIComponent(CONFIG.mapsQuery || CONFIG.address || "Smokey Dreamz South Africa");
  $("#mapBtn").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const waBase = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : null;
  [$("#waBtn"), $("#waFloat")].forEach((a) => { if (waBase) a.href = waBase + "?text=" + encodeURIComponent("Hi Smokey Dreamz! 👋"); else a.hidden = true; });
  if (CONFIG.instagram) $("#igLink").href = CONFIG.instagram; else $("#igLink").hidden = true;
  if (CONFIG.facebook) $("#fbLink").href = CONFIG.facebook; else $("#fbLink").hidden = true;

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hh = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  function saNow() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Johannesburg", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return { day, h: Number(p.hour) + Number(p.minute) / 60 };
  }
  function renderHours() {
    const { day, h } = saNow();
    $("#hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const r = CONFIG.hours[d];
      return `<tr${d === day ? ' class="today"' : ""}><td>${DAYS[d]}</td><td>${r ? `${hh(r[0])} – ${hh(r[1])}` : "Closed"}</td></tr>`;
    }).join("");
    const r = CONFIG.hours[day];
    const st = $("#openStatus");
    const open = r && h >= r[0] && h < r[1];
    st.className = "open-status " + (open ? "open" : "closed");
    if (open) st.textContent = `Open now · until ${hh(r[1])}`;
    else {
      let msg = "Closed now";
      for (let i = 0; i < 8; i++) {
        const d = (day + i) % 7, rr = CONFIG.hours[d];
        if (!rr || (i === 0 && h >= rr[0])) continue;
        msg += ` · opens ${i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d]} at ${hh(rr[0])}`; break;
      }
      st.textContent = msg;
    }
  }
  renderHours(); setInterval(renderHours, 60000);

  /* ---------- Join form → WhatsApp ---------- */
  const form = $("#joinForm"), msg = $("#formMsg");
  const ageOf = (dob) => { const d = new Date(dob), t = new Date(); let a = t.getFullYear() - d.getFullYear(); if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--; return a; };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.className = "form-msg"; let ok = true;
    $$("input", form).forEach((el) => {
      const bad = el.type === "checkbox" ? !el.checked : !el.value.trim() || !el.checkValidity();
      (el.type === "checkbox" ? el.closest(".check") : el).classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.textContent = "Please fill in every field and tick both boxes."; msg.classList.add("err"); return; }
    if (ageOf(form.dob.value) < 18) { msg.textContent = "Sorry, you need to be 18 or older to join."; msg.classList.add("err"); return; }
    const text = `Hi Smokey Dreamz! I'd like to apply for membership.\n\nName: ${form.name.value.trim()}\nEmail: ${form.email.value.trim()}\nWhatsApp: ${form.wa.value.trim()}\nDate of birth: ${form.dob.value}\n✅ I confirm I'm 18+\n✅ I consent to my details being used for membership (POPIA)`;
    if (!CONFIG.whatsapp) { msg.textContent = "Applications open as soon as our WhatsApp number is added. Check back soon!"; msg.classList.add("err"); return; }
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    msg.innerHTML = `Thanks, ${esc(form.name.value.split(" ")[0])}! Tap below to open WhatsApp with your details, then hit send.<br><a class="btn" style="margin-top:12px" href="${url}" target="_blank" rel="noopener">Open WhatsApp</a>`;
    msg.classList.add("ok");
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });

  /* ---------- Hero parallax (desktop) ---------- */
  const stage = $(".stage");
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      stage.style.transform = `translate(${x * 14}px, ${y * 10}px)`;
    }, { passive: true });
  }

  $("#year").textContent = new Date().getFullYear();
})();

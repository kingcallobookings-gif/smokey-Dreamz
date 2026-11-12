/* Smokey Dreamz — site behaviour */
(() => {
  "use strict";

  /* ---------- Age gate ---------- */
  const gate = document.getElementById("ageGate");
  const AGE_KEY = "sd_age_ok";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };
  function unlock() {
    gate.classList.add("hidden");
    document.body.classList.remove("locked");
  }
  if (store.get(AGE_KEY) === "1") unlock();
  document.getElementById("ageYes").addEventListener("click", () => {
    store.set(AGE_KEY, "1");
    unlock();
  });
  document.getElementById("ageNo").addEventListener("click", () => {
    document.getElementById("ageDenied").hidden = false;
  });

  /* ---------- Header + mobile nav ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------- Menu ----------
     Taken from the shop photos. img = file in assets/products. price: Rand amount, or null to show "Ask in store". */
  const STRAINS = ["Sweets", "Gabriel's Crown", "Planet of the Grapes", "Space Jam", "Blue Cheese",
                   "Cupid's Kush", "GMO", "London Lobster", "Rainbow Sherbet"];
  const MENU = [
    { name: "White Wedding",        cat: "preroll", detail: "Pre-roll in a sealed tube",             price: null, img: "white-wedding" },
    { name: "Ethos Cookies",        cat: "preroll", detail: "Pre-roll in a sealed tube",             price: null, img: "ethos-cookies" },
    { name: "Fruit Salad",          cat: "preroll", detail: "Pre-roll in a sealed tube",             price: null, img: "fruit-salad" },
    { name: "Captain Crunch",       cat: "preroll", detail: "Pre-roll in a sealed tube",             price: null, img: "captain-crunch" },
    { name: "House pre-rolls",      cat: "preroll", detail: "Cones in clear tubes. Ask what's rolled today", price: null, img: "house-prerolls" },
    { name: "Sour Snakes",          cat: "edible",  detail: "Candy Land · Indica · 5 × 60mg = 300mg", price: null, img: "sour-snakes" },
    { name: "Itty Bitty Tiddies",   cat: "edible",  detail: "Candy Land · Sativa · 3 × 40mg = 120mg", price: null, img: "itty-bitty" },
    { name: "Mini Weed Leaves",     cat: "edible",  detail: "Candy Land · Indica · 10 × 5mg = 50mg",  price: null, img: "mini-leaves" },
    { name: "Around the Block",     cat: "edible",  detail: "Candy Land · Indica · 2 × 80mg = 160mg", price: null, img: "around-block" },
    { name: "Sucker THC lollipops", cat: "edible",  detail: "Candy Land · 10, 25, 50 or 100mg",       price: null, img: "sucker" },
    { name: "FAR Pink Lemonade",    cat: "edible",  detail: "Fast-acting rosin gummies · 10 × 5mg",   price: null, img: "far" },
    { name: "Medibles Lychee",      cat: "edible",  detail: "Full-spectrum gummies · 5 × 30mg = 150mg", price: null, img: "medibles" },
    { name: "Rolo's",               cat: "edible",  detail: "Sativa · 5 × 20mg = 100mg",              price: null, img: "rolos" },
    { name: "Glass bongs",          cat: "gear",    detail: "Percolator, beaker and novelty pieces",  price: null, img: "bongs" },
    { name: "Rolling trays & glass pipes", cat: "gear", detail: "Printed metal trays and hand-blown spoon pipes", price: null, img: "trays-pipes" },
    { name: "Alien mug",            cat: "gear",    detail: "Wrap-around psychedelic alien print",    price: null, img: "alien-mug" },
    { name: "RAW Hemp Wick",        cat: "gear",    detail: "Natural hemp and beeswax · 6m",          price: 30,   img: "hemp-wick" },
    { name: "Smoking screens",      cat: "gear",    detail: "5 screens per wallet pack",              price: null, img: "screens" },
  ];
  const LABELS = { preroll: "Pre-roll", edible: "Edible", gear: "Glass & gear" };
  const grid = document.getElementById("menuGrid");
  const fmt = (n) => "R" + n.toLocaleString("en-ZA");
  document.getElementById("strains").innerHTML = STRAINS.map((s) => `<li>${s}</li>`).join("");

  function renderMenu(filter) {
    const items = filter === "all" ? MENU : MENU.filter((m) => m.cat === filter);
    grid.innerHTML = items.map((m, i) => `
      <article class="product cat-${m.cat}" style="animation-delay:${i * 40}ms">
        <div class="product-art"><img src="assets/products/${m.img}.jpg" alt="${m.name}" loading="lazy" width="640" height="480" /></div>
        <div class="product-body">
          <span class="tag">${LABELS[m.cat]}</span>
          <h3>${m.name}</h3>
          <p class="desc">${m.detail}</p>
          <div class="meta">${m.price ? `<span class="price">${fmt(m.price)}</span>` : `<span class="ask">Ask in store</span>`}</div>
        </div>
      </article>`).join("");
  }
  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("active", c === chip);
        c.setAttribute("aria-selected", String(c === chip));
      });
      renderMenu(chip.dataset.filter);
    })
  );
  renderMenu("all");
  /* ---------- Open / closed (South Africa time) ---------- */
  const HOURS = { 0: [11, 18], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 22], 6: [10, 22] };
  const status = document.getElementById("openStatus");
  function updateStatus() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Johannesburg" }));
    const [o, c] = HOURS[now.getDay()];
    const h = now.getHours() + now.getMinutes() / 60;
    const open = h >= o && h < c;
    status.className = "open-status " + (open ? "open" : "closed");
    status.textContent = open ? `Open now · closes at ${c}:00` : `Closed now · opens at ${o}:00`;
  }
  updateStatus();
  setInterval(updateStatus, 60_000);

  /* ---------- Join form ---------- */
  const form = document.getElementById("joinForm");
  const msg = document.getElementById("formMsg");
  function age(dob) {
    const d = new Date(dob), t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
    return a;
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.className = "form-msg";
    let ok = true;
    form.querySelectorAll("input[required]").forEach((el) => {
      const bad = el.type === "checkbox" ? !el.checked : !el.value.trim() || !el.checkValidity();
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      msg.textContent = "Please fill in all fields and tick the box.";
      msg.classList.add("err");
      return;
    }
    if (age(form.dob.value) < 18) {
      msg.textContent = "Sorry, you need to be 18 or older to join.";
      msg.classList.add("err");
      return;
    }
    // TODO: send to a backend, form service or WhatsApp. See README.
    msg.textContent = `Thanks, ${form.name.value.split(" ")[0]}! We'll be in touch within 24 hours.`;
    msg.classList.add("ok");
    form.reset();
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".section-head, .feature, .steps li, .tier, .faq details, .map-card, .two-col > div:first-child");
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Floating ember particles ---------- */
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, parts = [];
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, W / 18));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vy: -(Math.random() * 0.35 + 0.1),
      vx: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.6 + 0.2,
      hue: [0, 48, 130, 280][Math.floor(Math.random() * 4)],
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y += p.vy; p.x += p.vx + Math.sin(p.y / 40) * 0.15;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${p.a})`;
      ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(tick);
  }
  resize(); tick();
  window.addEventListener("resize", resize);

  document.getElementById("year").textContent = new Date().getFullYear();
})();

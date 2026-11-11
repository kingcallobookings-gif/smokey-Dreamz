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
     SAMPLE DATA: replace with the club's real strains, edibles and gear.
     price = member contribution in Rand. */
  const MENU = [
    { name: "Midnight Haze",    type: "indica", thc: "24%", price: 120, unit: "/g",    emoji: "🌙", desc: "Heavy, calming body high. Earthy grape and pine. A nightcap in a jar." },
    { name: "Durban Poison",    type: "sativa", thc: "21%", price: 110, unit: "/g",    emoji: "⚡", desc: "South Africa's legendary landrace. Sweet anise, clear-headed and energising." },
    { name: "Cloud Candy",      type: "hybrid", thc: "22%", price: 115, unit: "/g",    emoji: "☁️", desc: "Balanced and social. Berry sweetness with a soft, floaty finish." },
    { name: "Purple Dreamz",    type: "indica", thc: "26%", price: 140, unit: "/g",    emoji: "💜", desc: "Our house signature. Deep purple buds, lavender and dark fruit." },
    { name: "Cape Sunrise",     type: "sativa", thc: "19%", price: 100, unit: "/g",    emoji: "🌅", desc: "Bright citrus, creative buzz. Made for daytime and good conversation." },
    { name: "Smokey OG",        type: "hybrid", thc: "25%", price: 130, unit: "/g",    emoji: "🔥", desc: "Fuel, pepper and lemon. Full-bodied and properly relaxing." },
    { name: "Dreamy Gummies",   type: "edible", thc: "10mg each", price: 180, unit: "/pack of 10", emoji: "🍬", desc: "Mixed berry gummies. Start with one, wait 90 minutes." },
    { name: "Choc Haze Brownie",type: "edible", thc: "20mg", price: 85,  unit: "/each",  emoji: "🍫", desc: "Rich dark-chocolate brownie, baked in house." },
    { name: "Glass Bubbler",    type: "gear",   thc: null,  price: 450, unit: "",       emoji: "🫧", desc: "Hand-blown borosilicate bubbler. Smooth hits, easy to clean." },
    { name: "Smokey Dreamz Grinder", type: "gear", thc: null, price: 250, unit: "",    emoji: "⚙️", desc: "4-piece aluminium grinder with kief catcher. Laser-etched logo." },
  ];
  const COLORS = { indica: "var(--indica)", sativa: "var(--sativa)", hybrid: "var(--hybrid)", edible: "var(--pink)", gear: "#8ec5ff" };
  const LABELS = { indica: "Indica", sativa: "Sativa", hybrid: "Hybrid", edible: "Edible", gear: "Gear" };
  const grid = document.getElementById("menuGrid");
  const fmt = (n) => "R" + n.toLocaleString("en-ZA");

  function renderMenu(filter) {
    const items = filter === "all" ? MENU : MENU.filter((m) => m.type === filter);
    grid.innerHTML = items.map((m, i) => `
      <article class="product" style="--c:${COLORS[m.type]};animation-delay:${i * 50}ms">
        <div class="product-art" aria-hidden="true">${m.emoji}</div>
        <span class="tag">${LABELS[m.type]}</span>
        <h3>${m.name}</h3>
        <p class="desc">${m.desc}</p>
        <div class="meta">
          <span>${m.thc ? "THC " + m.thc : "Accessory"}</span>
          <span><span class="price">${fmt(m.price)}</span>${m.unit}</span>
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
      hue: [270, 310, 135][Math.floor(Math.random() * 3)],
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

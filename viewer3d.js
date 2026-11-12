/* Smokey Dreamz — 3D pre-roll tube viewer (three.js r128)
   Drag to spin · tap or press "Open" to flip the lid on its hinge and raise the joint. */
(() => {
  "use strict";
  const host = document.getElementById("viewer3d");
  if (!host) return;
  const fail = () => host.closest(".panel")?.classList.add("no3d");
  if (!window.THREE) return fail();
  const T = window.THREE;
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: host.querySelector("canvas"), antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return fail(); }

  const TUBES = [
    { id: "white-wedding", name: "White Wedding", cap: "#d3182b", label: 3.8, glow: 0xff3b4f },
    { id: "fruit-salad", name: "Fruit Salad", cap: "#1f3fd0", label: 4.2, glow: 0x3b82f6 },
    { id: "ethos-cookies", name: "Ethos Cookies", cap: "#7a3fd6", label: 4.2, glow: 0x8b5cf6 },
    { id: "house", name: "House pre-roll", cap: "#ffc21a", label: 4.0, glow: 0xffcc33, glass: true },
  ];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- renderer / scene ---------- */
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 2.6, 13);
  const target = new T.Vector3(0, 1.75, 0);

  scene.add(new T.HemisphereLight(0xeadcff, 0x12061f, 0.55));
  const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 1; key.shadow.camera.far = 20; key.shadow.radius = 6; scene.add(key);
  const fill = new T.DirectionalLight(0xb7a6ff, 0.5); fill.position.set(-5, 3, 3); scene.add(fill);
  const rimG = new T.PointLight(0x39ff6a, 2.4, 12); rimG.position.set(-3.2, 3, -2.4); scene.add(rimG);
  const rimP = new T.PointLight(0xff5fd2, 1.8, 12); rimP.position.set(3.2, 2.2, -2.6); scene.add(rimP);
  const glowLight = new T.PointLight(0xff3b4f, 1.4, 6); glowLight.position.set(0, 0.6, 1.6); scene.add(glowLight);

  // pedestal
  const ped = new T.Mesh(new T.CylinderGeometry(1.35, 1.5, 0.22, 72),
    new T.MeshStandardMaterial({ color: 0x1d0b33, roughness: 0.35, metalness: 0.6 }));
  ped.position.y = -0.11; ped.receiveShadow = true; scene.add(ped);
  const ring = new T.Mesh(new T.TorusGeometry(1.42, 0.018, 12, 120), new T.MeshBasicMaterial({ color: 0x39ff6a }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.0; scene.add(ring);
  const ringGlow = new T.Mesh(new T.RingGeometry(1.3, 1.9, 96), new T.MeshBasicMaterial({ color: 0x39ff6a, transparent: true, opacity: 0.12, side: T.DoubleSide }));
  ringGlow.rotation.x = -Math.PI / 2; ringGlow.position.y = 0.005; scene.add(ringGlow);
  const shadowCatcher = new T.Mesh(new T.CircleGeometry(1.3, 64), new T.ShadowMaterial({ opacity: 0.45 }));
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = 0.002; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

  /* ---------- textures ---------- */
  const loader = new T.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = maxAniso; return t;
  }
  const flowerTex = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#7c7350"; g.fillRect(0, 0, w, h);
    const cols = ["#5e6b3a", "#7a7a45", "#8a6f4e", "#4f5a33", "#a08560", "#6b5a7a", "#9b8a5a", "#3e4a2c", "#b39b70"];
    for (let i = 0; i < 5200; i++) { g.fillStyle = cols[i % cols.length]; const s = 1 + Math.random() * 4; g.fillRect(Math.random() * w, Math.random() * h, s, s * (0.5 + Math.random())); }
    g.fillStyle = "rgba(235,220,200,.18)"; g.fillRect(0, 0, w, h);
  });
  const filterTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "#efcbbb"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(210,56,74,.8)"; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 50); g.lineTo(w, 44); g.moveTo(0, 74); g.lineTo(w, 68); g.stroke();
  });
  const smokeTex = canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.45, "rgba(230,215,255,.35)"); gr.addColorStop(1, "rgba(200,180,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  });

  /* ---------- tube builder ---------- */
  const R = 0.36, BODY_H = 2.75;
  function buildJoint() {
    const j = new T.Group();
    const coneH = 2.05;
    const cone = new T.Mesh(new T.CylinderGeometry(R * 0.66, R * 0.3, coneH, 40, 1, true),
      new T.MeshStandardMaterial({ map: flowerTex, roughness: 0.9, side: T.DoubleSide }));
    cone.position.y = coneH / 2; cone.castShadow = true; j.add(cone);
    const fold = new T.Mesh(new T.SphereGeometry(R * 0.66, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new T.MeshStandardMaterial({ color: 0x8a7a5c, roughness: 0.95 }));
    fold.scale.y = 0.35; fold.position.y = coneH; j.add(fold);
    const filt = new T.Mesh(new T.CylinderGeometry(R * 0.3, R * 0.29, 0.5, 32),
      new T.MeshStandardMaterial({ map: filterTex, roughness: 0.8 }));
    filt.position.y = -0.25; j.add(filt);
    return j;
  }
  function buildTube(def) {
    const g = new T.Group();
    const capCol = new T.Color(def.cap).convertSRGBToLinear();
    const plastic = new T.MeshPhysicalMaterial({ color: capCol, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 });
    // bottom cap
    const base = new T.Mesh(new T.CylinderGeometry(R * 1.04, R * 1.04, 0.18, 48), plastic);
    base.position.y = 0.09; base.castShadow = true; g.add(base);
    // body
    let bodyMat;
    if (def.glass) {
      bodyMat = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.1,
        clearcoat: 1, clearcoatRoughness: 0.02, side: T.DoubleSide, depthWrite: false });
    } else {
      const tex = loader.load(`assets/3d/${def.id}-label.webp`, () => (needsRender = true));
      tex.encoding = T.sRGBEncoding; tex.anisotropy = maxAniso; tex.wrapS = T.RepeatWrapping; tex.offset.x = 0.25;
      bodyMat = new T.MeshPhysicalMaterial({ map: tex, roughness: 0.32, metalness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    }
    const body = new T.Mesh(new T.CylinderGeometry(R, R, BODY_H, 64, 1, true), bodyMat);
    body.position.y = 0.18 + BODY_H / 2; body.castShadow = !def.glass; body.renderOrder = def.glass ? 2 : 0; g.add(body);
    const topY = 0.18 + BODY_H;
    // dark mouth (visible when open)
    if (!def.glass) {
      const mouth = new T.Mesh(new T.CircleGeometry(R * 0.97, 48), new T.MeshBasicMaterial({ color: 0x07020c }));
      mouth.rotation.x = -Math.PI / 2; mouth.position.y = topY - 0.02; g.add(mouth);
    }
    // lip ring
    const lip = new T.Mesh(new T.TorusGeometry(R * 1.0, 0.025, 10, 60), plastic);
    lip.rotation.x = Math.PI / 2; lip.position.y = topY; g.add(lip);
    // hinged lid: pivot at the back edge
    const hinge = new T.Group(); hinge.position.set(0, topY, -R * 1.02); g.add(hinge);
    const lid = new T.Mesh(new T.CylinderGeometry(R * 1.08, R * 1.08, 0.36, 48), plastic);
    lid.position.set(0, 0.18, R * 1.02); lid.castShadow = true; hinge.add(lid);
    const strap = new T.Mesh(new T.BoxGeometry(0.16, 0.12, 0.05), plastic); strap.position.set(0, -0.02, -0.01); hinge.add(strap);
    // joint
    const joint = buildJoint();
    const jointRest = def.glass ? 0.62 : topY - 2.05 - 0.12;
    joint.position.y = jointRest; g.add(joint);
    return { group: g, hinge, joint, jointRest, topY, def, open: 0, target: 0 };
  }

  const tubes = TUBES.map(buildTube);
  const stage = new T.Group(); stage.scale.setScalar(1); scene.add(stage);
  let current = 0; stage.add(tubes[0].group);

  /* ---------- smoke particles ---------- */
  const smoke = [];
  function puff(pos) {
    const m = new T.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false, color: 0xf1e8ff });
    const s = new T.Sprite(m); s.position.copy(pos); s.scale.setScalar(0.25);
    s.userData = { life: 0, max: 2.6 + Math.random() * 1.4, vx: (Math.random() - 0.5) * 0.18, vy: 0.42 + Math.random() * 0.25, grow: 0.5 + Math.random() * 0.5 };
    scene.add(s); smoke.push(s);
  }
  const tipWorld = new T.Vector3();

  /* ---------- sizing / visibility ---------- */
  let visible = false, needsRender = true;
  function resize() {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.position.z = r.width < 520 ? 15 : 12.2;
    camera.updateProjectionMatrix(); needsRender = true;
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 }).observe(host);

  /* ---------- interaction ---------- */
  let rotY = 0.35, velY = 0, dragging = false, lastX = 0, moved = 0, idle = 0;
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; moved = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    velY = dx * 0.012; rotY += velY; idle = 0; needsRender = true;
  });
  const end = () => { if (dragging && moved < 6) toggle(); dragging = false; };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", () => (dragging = false));

  const openBtn = host.querySelector(".v-open");
  const nameEl = host.querySelector(".v-name");
  const picker = host.querySelector(".v-picker");
  picker.innerHTML = TUBES.map((t, i) => `<button type="button" class="v-pick${i === 0 ? " on" : ""}" style="--c:${t.cap}" aria-pressed="${i === 0}"><i></i>${t.name}</button>`).join("");
  let swapT = 1, swapping = null;
  picker.addEventListener("click", (e) => {
    const b = e.target.closest(".v-pick"); if (!b) return;
    const i = [...picker.children].indexOf(b); if (i === current) return;
    [...picker.children].forEach((x, k) => { x.classList.toggle("on", k === i); x.setAttribute("aria-pressed", String(k === i)); });
    swapping = i; swapT = 0;
  });
  function toggle() {
    const t = tubes[current]; t.target = t.target ? 0 : 1; t.smokeAt = performance.now() + 1100;
    syncUI();
  }
  function syncUI() {
    const t = tubes[current];
    openBtn.textContent = t.target ? "Close tube" : "Open tube";
    nameEl.textContent = t.def.name;
    glowLight.color.setHex(t.def.glow);
  }
  openBtn.addEventListener("click", toggle);
  syncUI();

  /* ---------- animation ---------- */
  const easeOutBack = (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  let prev = performance.now(), lastPuff = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    if (!visible || document.hidden) return;

    // swap products: shrink out, grow in
    if (swapping !== null) {
      swapT += dt * 3.2;
      const out = tubes[current].group;
      if (swapT < 0.5) { const k = 1 - swapT * 2; out.scale.setScalar(Math.max(0.001, k)); out.position.y = (1 - k) * 0.6; }
      else {
        if (stage.children[0] === out) { stage.remove(out); out.scale.setScalar(1); out.position.y = 0; tubes[current].target = 0; tubes[current].open = 0; current = swapping; stage.add(tubes[current].group); syncUI(); }
        const k = easeOutBack(Math.min(1, (swapT - 0.5) * 2)); tubes[current].group.scale.setScalar(Math.max(0.001, k));
        if (swapT >= 1) swapping = null;
      }
    }

    // spin with inertia + idle auto-rotate
    if (!dragging) { velY *= 0.94; rotY += velY; idle += dt; if (idle > 1.2 && !reduce) rotY += dt * 0.35 * Math.min(1, idle - 1.2); }
    stage.rotation.y = rotY;

    // open / close
    const t = tubes[current];
    const dir = Math.sign(t.target - t.open);
    if (dir) { t.open = Math.min(1, Math.max(0, t.open + dir * dt * (dir > 0 ? 0.62 : 1.1))); }
    const p = t.open;
    // lid flips during first 45% of the timeline; joint rises after
    const lidK = Math.min(1, p / 0.45);
    t.hinge.rotation.x = -2.05 * (dir >= 0 ? easeOutBack(lidK) : easeOutCubic(lidK));
    const jk = Math.max(0, (p - 0.35) / 0.65);
    t.joint.position.y = t.jointRest + (t.def.glass ? 2.0 : 1.75) * easeOutCubic(jk);
    t.group.scale.x = t.group.scale.z = (swapping === null ? 1 : t.group.scale.x) * (1 - 0.05 * Math.sin(Math.min(1, p / 0.12) * Math.PI) * (dir > 0 ? 1 : 0));

    // smoke from the tip while open
    if (t.target && p > 0.9 && now - lastPuff > 140 && !reduce) {
      lastPuff = now;
      t.joint.localToWorld(tipWorld.set(0, 2.12, 0)); puff(tipWorld);
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i], u = s.userData; u.life += dt;
      const k = u.life / u.max;
      s.position.x += (u.vx + Math.sin(u.life * 2 + i) * 0.06) * dt; s.position.y += u.vy * dt;
      s.scale.setScalar(0.25 + k * 1.6 * u.grow);
      s.material.opacity = k < 0.15 ? k / 0.15 * 0.55 : 0.55 * (1 - (k - 0.15) / 0.85);
      if (u.life >= u.max) { scene.remove(s); s.material.dispose(); smoke.splice(i, 1); }
    }

    ringGlow.material.opacity = 0.1 + 0.05 * Math.sin(now / 900);
    camera.lookAt(target);
    renderer.render(scene, camera);
  }
  resize();
  requestAnimationFrame(frame);
  host.classList.add("ready");
})();

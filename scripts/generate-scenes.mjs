// Generates the art-directed Kigali hill scenes in public/images.
// Deterministic (seeded) so output is stable. Run: node scripts/generate-scenes.mjs
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("public/images");
fs.mkdirSync(OUT, { recursive: true });

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridge(r, W, H, base, amp, waves = 4) {
  const ph = Array.from({ length: waves }, () => r() * Math.PI * 2);
  const fr = Array.from({ length: waves }, (_, i) => (i + 1) * (0.6 + r() * 0.9));
  const pts = [];
  for (let x = 0; x <= W; x += W / 120) {
    let y = 0;
    for (let i = 0; i < waves; i++) y += Math.sin((x / W) * Math.PI * fr[i] + ph[i]) / (i + 1);
    pts.push([x, base - y * amp]);
  }
  return pts;
}
const toPath = (pts, W, H) => `M0 ${H} L${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} L${W} ${H} Z`;
const yAt = (pts, x) => {
  for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts.at(-1)[1];
};

function lights(r, pts, W, count, depth, colors, size) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const top = yAt(pts, x);
    const y = top + 6 + Math.pow(r(), 1.6) * depth;
    const c = colors[Math.floor(r() * colors.length)];
    const rad = size * (0.5 + r());
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${c}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
  }
  return s;
}

function trail(d, color, width, blur, opacity = 1) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * 3}" stroke-linecap="round" opacity="${0.35 * opacity}" filter="url(#${blur})"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;
}

function defs(sky, extra = "") {
  return `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>
<filter id="b2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="b6" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="haze"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.07 0"/></filter>
${extra}
</defs>`;
}

function scene({ file, W, H, seed, sky, sun, layers, lightsOn, road, trails = "", overlay = "" }) {
  const r = rng(seed);
  let body = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (sun) body += `<circle cx="${sun.x}" cy="${sun.y}" r="${sun.r * 3}" fill="${sun.glow}" opacity=".35" filter="url(#b20)"/><circle cx="${sun.x}" cy="${sun.y}" r="${sun.r}" fill="${sun.color}"/>`;
  const ridges = [];
  layers.forEach((L, i) => {
    const pts = ridge(r, W, H, L.base, L.amp * 1.8, L.waves ?? 5);
    ridges.push(pts);
    body += `<path d="${toPath(pts, W, H)}" fill="${L.color}"${i < 2 ? ' filter="url(#haze)"' : ""}/>`;
    if (lightsOn && L.lights) body += lights(r, pts, W, L.lights, L.depth ?? 120, L.lightColors ?? ["#FFD79A", "#FFF4DA", "#F8B062"], L.lightSize ?? 1.4);
  });
  if (road) body += road(ridges, r);
  body += trails + overlay;
  body += `<rect width="${W}" height="${H}" filter="url(#grain)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${defs(sky)}${body}</svg>`;
  fs.writeFileSync(path.join(OUT, file), svg);
  console.log(file, (svg.length / 1024).toFixed(1) + "kB");
}

// 1 — Dusk over the hills: "Same destination. Different prices."
scene({
  file: "hero-1.svg", W: 1600, H: 1000, seed: 11,
  sky: [[0, "#0E2E28"], [0.45, "#3E5A48"], [0.75, "#C98E5A"], [1, "#F2C38C"]],
  sun: { x: 1180, y: 610, r: 34, color: "#FBE2B4", glow: "#F6B668" },
  layers: [
    { base: 640, amp: 26, color: "#8E8A6E" },
    { base: 690, amp: 34, color: "#5F6B55", lights: 140, depth: 60, lightSize: 1.1 },
    { base: 760, amp: 46, color: "#30473C", lights: 220, depth: 110 },
    { base: 860, amp: 60, color: "#173A31", lights: 120, depth: 70, lightSize: 1.8 },
    { base: 980, amp: 40, color: "#0B2520" },
  ],
  lightsOn: true,
  trails:
    trail("M-40 930 C 300 860, 520 980, 820 900 S 1300 820, 1660 870", "#FF8A5B", 3, "b6") +
    trail("M-40 948 C 320 880, 540 1000, 840 918 S 1320 840, 1660 890", "#FFF1D6", 2.2, "b6", 0.9) +
    trail("M-40 940 C 310 872, 530 990, 830 910 S 1310 832, 1660 880", "#D9F068", 1.2, "b2", 0.8),
});

// 2 — Night city with a measured route: "Every kilometre, accounted for."
const ticks = (() => {
  let s = "";
  const pts = [[120, 760], [380, 690], [610, 720], [840, 610], [1060, 640], [1300, 520], [1500, 470]];
  const d = "M" + pts[0].join(" ") + pts.slice(1).map((p, i) => { const q = pts[i]; const mx = (q[0] + p[0]) / 2; return ` C ${mx} ${q[1]}, ${mx} ${p[1]}, ${p[0]} ${p[1]}`; }).join("");
  s += trail(d, "#D9F068", 4, "b6");
  pts.forEach(([x, y], i) => {
    s += `<circle cx="${x}" cy="${y}" r="${i === pts.length - 1 ? 11 : 6}" fill="#0B2520" stroke="#D9F068" stroke-width="3"/>`;
  });
  s += `<circle cx="1500" cy="470" r="30" fill="none" stroke="#D9F068" stroke-width="1.5" opacity=".6"/><circle cx="1500" cy="470" r="52" fill="none" stroke="#D9F068" stroke-width="1" opacity=".25"/>`;
  return s;
})();
scene({
  file: "hero-2.svg", W: 1600, H: 1000, seed: 29,
  sky: [[0, "#06171A"], [0.55, "#0E2D2B"], [1, "#2D4A40"]],
  layers: [
    { base: 520, amp: 30, color: "#173733", lights: 260, depth: 80, lightSize: 1, lightColors: ["#FFE2A8", "#EAF6FF", "#FFC27A"] },
    { base: 620, amp: 44, color: "#112E2A", lights: 420, depth: 140, lightSize: 1.2, lightColors: ["#FFE2A8", "#EAF6FF", "#FFC27A", "#D9F068"] },
    { base: 760, amp: 56, color: "#0C2421", lights: 380, depth: 160, lightSize: 1.6 },
    { base: 920, amp: 50, color: "#071A18", lights: 90, depth: 60, lightSize: 2.2 },
  ],
  lightsOn: true,
  trails: ticks,
});

// 3 — Morning arrival: "Arrive. Confirm. Pay."
scene({
  file: "hero-3.svg", W: 1600, H: 1000, seed: 47,
  sky: [[0, "#B9C9B6"], [0.5, "#E3E3CF"], [1, "#F8F1DD"]],
  sun: { x: 420, y: 380, r: 44, color: "#FFF8E4", glow: "#FFF1C2" },
  layers: [
    { base: 540, amp: 30, color: "#C5CCB4" },
    { base: 610, amp: 40, color: "#9FAE93" },
    { base: 700, amp: 52, color: "#6E8670", lights: 60, depth: 80, lightColors: ["#F8F6F0", "#E8E6DF"], lightSize: 1.6 },
    { base: 820, amp: 56, color: "#3C5C4D", lights: 40, depth: 60, lightColors: ["#F8F6F0"], lightSize: 2 },
    { base: 960, amp: 36, color: "#123D35" },
  ],
  lightsOn: true,
  trails:
    trail("M-40 900 C 260 820, 560 900, 820 800 S 1120 700, 1240 690", "#D9F068", 5, "b6") +
    `<circle cx="1240" cy="690" r="16" fill="#123D35" stroke="#D9F068" stroke-width="5"/><circle cx="1240" cy="690" r="46" fill="none" stroke="#123D35" stroke-width="2" opacity=".35"/><circle cx="1240" cy="690" r="80" fill="none" stroke="#123D35" stroke-width="1.2" opacity=".18"/>`,
});

// 4 — Tall editorial crop for the "Why" section.
scene({
  file: "editorial-hills.svg", W: 1000, H: 1300, seed: 83,
  sky: [[0, "#123D35"], [0.6, "#2C5A4B"], [1, "#B9A06E"]],
  sun: { x: 690, y: 760, r: 26, color: "#F7E6B8", glow: "#E9C27E" },
  layers: [
    { base: 820, amp: 30, color: "#7A7B5E" },
    { base: 900, amp: 40, color: "#4F614E", lights: 90, depth: 70 },
    { base: 1010, amp: 56, color: "#284539", lights: 130, depth: 110, lightSize: 1.6 },
    { base: 1160, amp: 60, color: "#123D35", lights: 50, depth: 60, lightSize: 2 },
    { base: 1290, amp: 30, color: "#0B2520" },
  ],
  lightsOn: true,
  trails:
    trail("M-40 1240 C 200 1180, 420 1250, 620 1170 S 900 1080, 1040 1100", "#FF8A5B", 3, "b6") +
    trail("M-40 1256 C 210 1196, 430 1266, 630 1186 S 910 1096, 1040 1116", "#FFF1D6", 2, "b6", 0.8),
});

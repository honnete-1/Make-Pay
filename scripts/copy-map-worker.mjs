// MapLibre GL v6 ships its worker as a separate ES module. Bundlers cannot
// resolve its `new URL(..., import.meta.url)` reference, so we serve a copy
// from /public that always matches the installed version.
import fs from "node:fs";
import path from "node:path";
const src = path.resolve("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
const dest = path.resolve("public/maplibre-gl-worker.mjs");
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log("[make-pay] copied MapLibre worker to public/");
} else {
  console.warn("[make-pay] MapLibre worker not found — the app will use the schematic map fallback.");
}

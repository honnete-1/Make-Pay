import type { LngLat, Place } from "@/types";

/**
 * DEMONSTRATION ROAD GRAPH — KIGALI
 * ---------------------------------
 * A simplified, hand-placed network of approximate junction coordinates used
 * by the mock routing service. It is NOT survey data and must not be used for
 * navigation. Replace the mock router with a production routing API
 * (e.g. OSRM, Valhalla, GraphHopper) — see src/lib/services/index.ts.
 */

export interface GraphNode {
  id: string;
  coordinate: LngLat;
  /** Road / junction label used in route descriptions. */
  label: string;
}

export const NODES: Record<string, GraphNode> = {
  cbd: { id: "cbd", coordinate: [30.0619, -1.9441], label: "Kigali City Tower" },
  cbd_n: { id: "cbd_n", coordinate: [30.0566, -1.9404], label: "KN 1 Rd" },
  nyabugogo: { id: "nyabugogo", coordinate: [30.0452, -1.9389], label: "Nyabugogo" },
  gisozi: { id: "gisozi", coordinate: [30.0607, -1.9312], label: "KG 14 Ave" },
  kinamba: { id: "kinamba", coordinate: [30.0668, -1.9355], label: "Kinamba" },
  kn3: { id: "kn3", coordinate: [30.0652, -1.9479], label: "KN 3 Rd" },
  kiyovu: { id: "kiyovu", coordinate: [30.0702, -1.9507], label: "Kiyovu" },
  kimihurura_rb: { id: "kimihurura_rb", coordinate: [30.0808, -1.9521], label: "Kimihurura roundabout" },
  kcc: { id: "kcc", coordinate: [30.0928, -1.9538], label: "KG 2 Roundabout" },
  kigali_heights: { id: "kigali_heights", coordinate: [30.0916, -1.9528], label: "KG 7 Ave" },
  kisimenti: { id: "kisimenti", coordinate: [30.1046, -1.9533], label: "Kisimenti" },
  remera: { id: "remera", coordinate: [30.1124, -1.9573], label: "Remera" },
  amahoro: { id: "amahoro", coordinate: [30.1172, -1.9519], label: "KG 17 Ave" },
  kimironko_rd: { id: "kimironko_rd", coordinate: [30.1204, -1.9472], label: "KG 11 Ave" },
  kimironko: { id: "kimironko", coordinate: [30.1262, -1.9441], label: "Kimironko Market" },
  kibagabaga: { id: "kibagabaga", coordinate: [30.1178, -1.9302], label: "Kibagabaga" },
  nyarutarama: { id: "nyarutarama", coordinate: [30.1004, -1.9358], label: "Nyarutarama" },
  kacyiru: { id: "kacyiru", coordinate: [30.0862, -1.9381], label: "Kacyiru" },
  kacyiru_w: { id: "kacyiru_w", coordinate: [30.0742, -1.9412], label: "KG 7 Ave" },
  nyamirambo_rd: { id: "nyamirambo_rd", coordinate: [30.0532, -1.9618], label: "KN 2 Ave" },
  nyamirambo: { id: "nyamirambo", coordinate: [30.0441, -1.9787], label: "Nyamirambo" },
  rwandex: { id: "rwandex", coordinate: [30.0742, -1.9641], label: "Rwandex" },
  sonatubes: { id: "sonatubes", coordinate: [30.0961, -1.9652], label: "Sonatubes" },
  kicukiro: { id: "kicukiro", coordinate: [30.1036, -1.9761], label: "Kicukiro Centre" },
  giporoso: { id: "giporoso", coordinate: [30.1141, -1.9638], label: "Giporoso" },
  kanombe_rd: { id: "kanombe_rd", coordinate: [30.1262, -1.9671], label: "KK 18 Ave" },
  airport: { id: "airport", coordinate: [30.1378, -1.9684], label: "Kigali International Airport" },
};

/** Undirected edges between nodes. */
export const EDGES: [string, string][] = [
  ["cbd", "cbd_n"], ["cbd_n", "nyabugogo"], ["cbd_n", "gisozi"], ["gisozi", "kinamba"],
  ["kinamba", "kacyiru_w"], ["cbd", "kacyiru_w"], ["kacyiru_w", "kacyiru"],
  ["kacyiru", "nyarutarama"], ["nyarutarama", "kibagabaga"], ["kibagabaga", "kimironko"],
  ["kacyiru", "kimihurura_rb"], ["cbd", "kn3"], ["kn3", "kiyovu"], ["kiyovu", "kimihurura_rb"],
  ["kimihurura_rb", "kcc"], ["kcc", "kisimenti"], ["kisimenti", "remera"], ["remera", "amahoro"],
  ["amahoro", "kimironko_rd"], ["kimironko_rd", "kimironko"], ["nyarutarama", "kisimenti"], ["kisimenti", "kimironko_rd"],
  ["cbd", "nyamirambo_rd"], ["nyamirambo_rd", "nyamirambo"], ["kn3", "rwandex"], ["rwandex", "sonatubes"],
  ["sonatubes", "kcc"], ["sonatubes", "kicukiro"], ["sonatubes", "giporoso"], ["giporoso", "remera"],
  ["giporoso", "kanombe_rd"], ["kanombe_rd", "airport"], ["kicukiro", "giporoso"], ["nyamirambo_rd", "rwandex"],
  ["kcc", "kigali_heights"], ["kigali_heights", "kimihurura_rb"],
];

/**
 * Passenger-facing places. Each maps to a graph node of the same id.
 * Broad areas list `childIds` so the app can ask "Where in Remera?".
 * Coordinates are approximate demo positions, not surveyed points.
 */
export const PLACES: Place[] = [
  { id: "cbd", name: "Downtown Kigali", area: "Kigali City Tower · CBD", coordinate: NODES.cbd!.coordinate, keywords: ["downtown", "cbd", "city", "tower", "town", "mu mujyi", "kct"] },
  { id: "remera", name: "Remera", area: "Remera centre", coordinate: NODES.remera!.coordinate, keywords: ["remera"], childIds: ["amahoro", "giporoso", "kisimenti"] },
  { id: "amahoro", name: "Amahoro Stadium", area: "Remera", coordinate: NODES.amahoro!.coordinate, keywords: ["amahoro", "stadium", "sitade", "bk arena", "remera"], parentId: "remera" },
  { id: "giporoso", name: "Giporoso", area: "Remera", coordinate: NODES.giporoso!.coordinate, keywords: ["giporoso", "remera"], parentId: "remera" },
  { id: "kisimenti", name: "Kisimenti", area: "Remera", coordinate: NODES.kisimenti!.coordinate, keywords: ["kisimenti", "kisementi", "remera"], parentId: "remera" },
  { id: "kimironko", name: "Kimironko Market", area: "Kimironko", coordinate: NODES.kimironko!.coordinate, keywords: ["kimironko", "market", "isoko"] },
  { id: "kcc", name: "Kigali Convention Centre", area: "Kimihurura", coordinate: NODES.kcc!.coordinate, keywords: ["kimihurura", "kcc", "convention", "radisson"] },
  { id: "kigali_heights", name: "Kigali Heights", area: "Kimihurura", coordinate: NODES.kigali_heights!.coordinate, keywords: ["kigali heights", "heights", "kimihurura"] },
  { id: "nyabugogo", name: "Nyabugogo", area: "Nyabugogo Bus Park", coordinate: NODES.nyabugogo!.coordinate, keywords: ["nyabugogo", "bus", "park", "gare", "gare routière"] },
  { id: "kicukiro", name: "Kicukiro", area: "Kicukiro Centre", coordinate: NODES.kicukiro!.coordinate, keywords: ["kicukiro", "centre", "sonatubes"] },
  { id: "kacyiru", name: "Kacyiru", area: "Government quarter", coordinate: NODES.kacyiru!.coordinate, keywords: ["kacyiru", "embassy", "ministry"] },
  { id: "nyamirambo", name: "Nyamirambo", area: "Biryogo", coordinate: NODES.nyamirambo!.coordinate, keywords: ["nyamirambo", "biryogo", "mosque"] },
  { id: "kibagabaga", name: "Kibagabaga", area: "Kibagabaga Hospital", coordinate: NODES.kibagabaga!.coordinate, keywords: ["kibagabaga", "hospital", "ibitaro"] },
  { id: "gisozi", name: "Gisozi", area: "Kigali Genocide Memorial", coordinate: NODES.gisozi!.coordinate, keywords: ["gisozi", "memorial"] },
  { id: "airport", name: "Kigali Airport", area: "Kanombe · KGL", coordinate: NODES.airport!.coordinate, keywords: ["airport", "kanombe", "kgl", "flight", "ikibuga"] },
];

/** Shown on the home screen before the passenger types anything. */
export const POPULAR_PLACE_IDS = ["cbd", "remera", "kimironko", "nyabugogo", "kicukiro", "kcc", "kigali_heights"];

/** Sample journeys featured on the landing page and the app home. */
export const SAMPLE_JOURNEYS: { originId: string; destinationId: string; label: string }[] = [
  { originId: "cbd", destinationId: "remera", label: "Downtown → Remera" },
  { originId: "cbd", destinationId: "kimironko", label: "Downtown → Kimironko" },
  { originId: "cbd", destinationId: "nyamirambo", label: "Downtown → Nyamirambo" },
  { originId: "cbd", destinationId: "airport", label: "Downtown → Airport" },
  { originId: "nyabugogo", destinationId: "kacyiru", label: "Nyabugogo → Kacyiru" },
];

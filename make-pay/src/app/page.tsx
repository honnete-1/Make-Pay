import { redirect } from "next/navigation";

/** The passenger app is the product; the campaign site lives at /about. */
export default function Root() {
  redirect("/app");
}

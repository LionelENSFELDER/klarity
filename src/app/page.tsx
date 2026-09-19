import { redirect } from "next/navigation";

// La racine n'a plus de contenu propre : le middleware renvoie les
// visiteurs non connectés vers /auth/signin, les autres vers le calendrier.
export default function Home() {
  redirect("/calendar");
}

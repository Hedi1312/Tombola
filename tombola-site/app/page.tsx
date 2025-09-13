// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
    redirect("/fr"); // Redirection automatique vers la version française
}

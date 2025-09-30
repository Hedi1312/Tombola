"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DesinscriptionClient() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");

    let message = "";
    let style = "";

    if (status === "success") {
        message = "✅ Vous avez été désinscrit avec succès.";
        style = "bg-green-100 text-green-700";
    } else if (status === "invalid") {
        message = "❌ Lien invalide ou déjà utilisé.";
        style = "bg-red-100 text-red-700";
    } else if (status === "error") {
        message = "⚠️ Une erreur technique est survenue.";
        style = "bg-yellow-100 text-yellow-700";
    } else {
        message = "ℹ️ Statut inconnu.";
        style = "bg-gray-100 text-gray-700";
    }

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg text-center mb-12 text-gray-700">
                <h1 className="text-2xl font-bold mb-6">❌ Désinscription</h1>
                <div className={`p-4 rounded-lg mb-6 ${style}`}>{message}</div>
                <Link
                    href="/"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    Retour au site
                </Link>
            </div>
        </section>
    );
}

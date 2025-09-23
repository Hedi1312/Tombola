"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";


export default function DesinscriptionPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");

    let message = "";
    let style = "";

    if (status === "success") {
        message = "✅ Vous avez été désinscrit avec succès. Vous ne recevrez plus de notifications.";
        style = "bg-green-100 text-green-700";
    } else if (status === "invalid") {
        message = "❌ Ce lien de désinscription est invalide ou déjà utilisé.";
        style = "bg-red-100 text-red-700";
    } else if (status === "error") {
        message = "⚠️ Une erreur technique est survenue. Veuillez réessayer plus tard.";
        style = "bg-yellow-100 text-yellow-700";
    } else {
        message = "ℹ️ Statut de désinscription inconnu.";
        style = "bg-gray-100 text-gray-700";
    }

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg text-center mb-12 text-gray-700">
                <h1 className="text-2xl font-bold mb-6">❌ Désinscription</h1>
                <div className={`p-4 rounded-lg mb-6 ${style}`}>
                    {message}
                </div>
                <Link
                    href="/"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                    Retour au site
                </Link>
            </div>
        </section>
    );
}

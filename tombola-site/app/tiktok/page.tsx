"use client";
import { useEffect } from "react";

export default function TikTokRedirect() {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Remplace la page actuelle dans l'historique par la cible
            window.location.replace("https://www.tiktok.com/@futureejetrip");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-16 px-4 md:px-6">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center mx-auto mb-12">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">
                    Vous allez être redirigé vers notre TikTok
                </h1>
                <p className="text-gray-600 text-center">
                    Préparez-vous à découvrir nos vidéos !
                </p>

                <div className="flex flex-col items-center gap-4 mt-6">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg">Redirection en cours...</p>
                </div>
            </div>
        </section>

    );
}

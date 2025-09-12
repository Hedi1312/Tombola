"use client";
import { useEffect } from "react";

export default function TikTokRedirect() {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Remplace la page actuelle dans l'historique par la cible
            window.location.replace("https://www.cotizup.com/voyage-peda-eje-rabat");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">
                Vous allez être redirigé vers notre cagnotte 💰
            </h1>
            <p className="text-gray-600 text-center">
                Préparez-vous à faire chauffer la CB !
            </p>


            <div className="flex flex-col items-center gap-4 mt-6">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-700 text-lg">Redirection en cours...</p>
            </div>
        </div>
    );
}

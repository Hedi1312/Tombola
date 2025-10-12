"use client";
import { useEffect } from "react";
import { FaMoneyBillWave } from "react-icons/fa";

export default function TikTokRedirect() {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Remplace la page actuelle dans l'historique par la cible
            window.location.replace("https://www.cotizup.com/voyage-peda-eje-rabat");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-16 px-4 md:px-6">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center mx-auto mb-12">
                <div className="flex items-center justify-center space-x-6 mb-10">
                    <FaMoneyBillWave className="h-10 w-10 text-green-800" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                        Cagnotte
                    </h1>
                </div>
                <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
                    Vous allez être redirigé vers notre cagnotte 💰
                </h2>
                <p className="text-gray-600 text-center">
                    Préparez-vous à faire chauffer la CB !
                </p>

                <div className="flex flex-col items-center gap-4 mt-6">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-lg">Redirection en cours...</p>
                </div>
            </div>
        </section>

    );
}

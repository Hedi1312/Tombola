"use client";
import { useState } from "react";

export default function Acheter() {
    const [tickets, setTickets] = useState(1);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!email) {
            alert("Veuillez saisir votre e-mail.");
            return;
        }

        setLoading(true);
        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets, email }),
        });

        const data = await res.json();
        setLoading(false);

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Erreur lors de la création de la session de paiement.");
            console.error(data.error);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 flex flex-col gap-6">
                <h2 className="text-3xl font-extrabold text-gray-800 text-center">
                    🎟️ Acheter vos tickets
                </h2>
                <p className="text-gray-600 text-center">
                    Participez à notre tombola pour soutenir notre projet scolaire et tentez de gagner un super lot !
                </p>

                <label className="flex flex-col text-gray-700 text-lg">
                    Votre e-mail :
                    <input
                        type="email"
                        placeholder="exemple@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="flex flex-col text-gray-700 text-lg">
                    Nombre de tickets :
                    <input
                        type="number"
                        min="1"
                        value={tickets}
                        onChange={(e) => setTickets(parseInt(e.target.value))}
                        className="mt-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
                >
                    {loading ? "Redirection..." : "💳 Payer vos tickets"}
                </button>

                <p className="text-sm text-gray-500 text-center">
                    Le prix est de <span className="font-bold">2€ par ticket</span>. Tout l&apos;argent récolté soutient notre projet.
                </p>
            </div>
        </main>
    );
}

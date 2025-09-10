"use client";
import { useState } from "react";

export default function Acheter() {
    const [tickets, setTickets] = useState(1);
    const [loading, setLoading] = useState(false); // <- important

    const handlePayment = async () => {
        setLoading(true);
        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets }),
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
        <main className="flex flex-col items-center p-6 min-h-screen bg-gray-50">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                    Acheter vos tickets 🎟️
                </h2>

                <label className="block mb-6 text-lg text-gray-700">
                    Nombre de tickets :
                    <input
                        type="number"
                        min="1"
                        value={tickets}
                        onChange={(e) => setTickets(parseInt(e.target.value))}
                        className="ml-3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                >
                    {loading ? "Redirection..." : "💳 Payer vos tickets"}
                </button>
            </div>
        </main>
    );
}

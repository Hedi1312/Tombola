"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function CheckoutForm() {
    const [tickets, setTickets] = useState(1);
    const [email, setEmail] = useState("");
    const [full_name, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const ticketPrice = 2; // Prix d'un ticket
    const total = tickets * ticketPrice;

    // 🔹 Effet pour cacher le message après 3 secondes
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer); // nettoyage si message change avant 3s
    }, [message]);

    const handleStripePayment = async () => {
        if (!email || !full_name) {
            setMessage("❌ Veuillez remplir tous les champs avant de payer !");
            return;
        }

        setLoading(true);
        const res = await fetch("/api/create-checkout-session-stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets, email, full_name: full_name }),
        });

        const data = await res.json();
        setLoading(false);

        if (data.url) {
            window.location.href = data.url;
        } else {
            setMessage("❌ Erreur lors de la création de la session de paiement.");
            console.error(data.error);
        }
    };


    return (
        <div className="flex flex-col gap-4">

            {/* Affichage du message sur la page */}
            {message && (
                <p
                    className={`mb-4 rounded-lg text-center text-base p-2 ${
                        message.startsWith("✅")
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {message}
                </p>
            )}

            <label className="flex flex-col text-gray-700 text-lg">
                Votre nom complet :
                <input
                    type="text"
                    placeholder="Prénom NOM"
                    value={full_name}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </label>
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Nombre de tickets"
                    min={1}
                    max={100}
                    value={tickets}
                    onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) value = 1;
                        if (value > 100) value = 100; // ✅ Vérification côté JS
                        setTickets(value);
                    }}
                    className="mt-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </label>

            {/* Affichage du montant total */}
            <p className="text-lg font-semibold text-gray-700 text-right">
                Total : <span>{total} €</span>
            </p>


            <div className="flex flex-row gap-4 mt-4">
                <div className="flex-1">
                    <button
                        onClick={handleStripePayment}
                        disabled={loading}
                        className="w-full h-12 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200 cursor-pointer"
                    >
                        {loading ? "Redirection..." : "💳 Paiement"}
                    </button>
                </div>
            </div>

        </div>
    );
}

export default function Acheter() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                    Acheter vos tickets à 2€
                </h1>
                <p className="text-gray-600 text-center">
                    Participez à notre tombola pour soutenir notre projet scolaire et tentez de gagner un super lot !
                </p>

                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>


                <p className="text-sm text-gray-500 text-center">
                    Le prix est de <span className="font-bold">2€ par ticket</span>. Tout l&apos;argent récolté soutient notre projet.
                </p>
            </div>
        </section>
    );
}
"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function CheckoutForm() {
    const [tickets, setTickets] = useState(1);
    const [email, setEmail] = useState("");
    const [full_name, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string>("");



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

            {/* Boutons Stripe + PayPal sur une seule ligne, identiques */}
            <div className="flex flex-row gap-4 mt-4">
                {/* Bouton Stripe */}
                <div className="flex-1">
                    <button
                        onClick={handleStripePayment}
                        disabled={loading}
                        className="w-full h-12 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200 cursor-pointer"
                    >
                        {loading ? "Redirection..." : "💳 Paiement par CB"}
                    </button>
                </div>

                {/* Bouton PayPal (compte uniquement, style natif) */}
                <PayPalScriptProvider
                    options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "EUR" }}
                >

                <div className="flex-1 h-12">
                        <PayPalButtons
                            fundingSource="paypal"
                            style={{
                                layout: "vertical",
                                height: 48, // ajuste la hauteur pour correspondre au bouton Stripe
                                shape: "pill",    // bordure arrondie
                            }}
                            createOrder={async () => {
                                // Vérification des champs
                                if (!email || tickets < 1 || !full_name) {
                                    setMessage("❌ Veuillez remplir tous les champs avant de payer !");
                                    // Renvoie un ordre invalide pour éviter l'ouverture du popup
                                    throw new Error("Champs incomplets");
                                }
                                const res = await fetch("/api/create-checkout-session-paypal", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ tickets, email, full_name }),
                                });
                                const data = await res.json();
                                setAccessToken(data.accessToken); // stocke le token pour la redirection
                                return data.orderID;
                            }}
                            onApprove={async (_data, actions) => {
                                try {
                                    if (!actions.order) throw new Error("Order actions not available");

                                    // 1️⃣ Capture le paiement
                                    await actions.order.capture();

                                    // 2️⃣ Redirection seulement une fois le paiement confirmé
                                    window.location.href = `/mes-tickets?token=${accessToken}`;
                                } catch (err) {
                                    console.error("❌ Erreur lors de la capture PayPal :", err);
                                    setMessage("❌ Une erreur est survenue lors du paiement PayPal.");
                                }
                            }}

                        />
                    </div>
                </PayPalScriptProvider>
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
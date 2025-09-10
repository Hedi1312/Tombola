"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function CheckoutForm({ tickets }: { tickets: number }) {
    const stripe = useStripe();
    const elements = useElements();

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        const res = await fetch("http://localhost:4242/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets }),
        });

        const data = await res.json();
        const result = await stripe.redirectToCheckout({ sessionId: data.id });

        if (result.error) {
            alert(result.error.message);
        }
    };

    return (
        <button
            onClick={handlePayment}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
            💳 Payer CB / Apple Pay
        </button>
    );
}

export default function Acheter() {
    const [tickets, setTickets] = useState(1);

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

                <Elements stripe={stripePromise}>
                    <CheckoutForm tickets={tickets} />
                </Elements>
            </div>
        </main>
    );
}

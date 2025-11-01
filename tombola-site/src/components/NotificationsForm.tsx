"use client";

import { useState } from "react";

export default function NotificationsForm({onClose,}: { onClose: () => void; }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Vérification du nom complet : pas de chiffres
        const nameHasNumbers = /\d/.test(fullName);
        if (nameHasNumbers) {
            setMessage("❌ Le nom complet ne doit pas contenir de chiffres.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`✅ Vous serez notifié(e) lors du tirage à ${email} !`);
                setFullName("");
                setEmail("");
            } else {
                setMessage(`❌ Erreur : ${data.error || "Merci de réessayer"}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm relative text-gray-700">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    ✖
                </button>

                <h2 className="text-xl font-bold mb-10">🔔 Recevoir un mail après le tirage</h2>

                {message && (
                    <div
                        className={`p-3 rounded-lg text-center text-base mb-6 ${
                            message.startsWith("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}


                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="NOM Prénom"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                    <input
                        type="email"
                        placeholder="Adresse mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2 w-full mb-4"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Envoi..." : "Je veux être notifié(e)"}
                    </button>
                </form>
            </div>
        </div>
    );
}

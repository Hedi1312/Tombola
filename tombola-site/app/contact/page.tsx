"use client";

import { useState } from "react";
import { MailQuestionMark, Send } from "lucide-react";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await res.json();

            if (!data.success) {
                setStatus("error");
                setErrorMsg(data.error || "Erreur lors de l'envoi du message.");
            } else {
                setStatus("success");
                setName("");
                setEmail("");
                setMessage("");
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
            setErrorMsg("Erreur inconnue lors de l'envoi du message.");
        }
    }

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 mb-12">
                <div className="flex items-center justify-center space-x-6">
                    <MailQuestionMark className="h-10 w-10 text-red-800" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                        Contact / Support
                    </h1>
                </div>


                <p className="text-center text-gray-700 mt-6 mb-6">
                    Vous avez une question ou besoin d&apos;aide ? Envoyez-nous un message et nous vous répondrons rapidement.
                </p>

                {/* Message de statut */}
                {(status === "success" || status === "error") && (
                    <div
                        className={`p-3 rounded-lg text-center text-base ${
                            status === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {status === "success"
                            ? "✅ Votre message a été envoyé avec succès !"
                            : `❌ ${errorMsg}`}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-700">
                    <input
                        type="text"
                        placeholder="Nom"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        placeholder="Votre message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />


                    <button
                        type="submit"
                        className="bg-blue-600 transition hover:bg-blue-700 text-white font-bold py-3 px-6 mb-6 mt-8 rounded-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        disabled={status === "loading"}
                    >
                        {status === "loading" ? (
                            "Envoi..."
                        ) : (
                            <>
                                <Send className="text-white" size={20} />
                                Envoyer
                            </>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}

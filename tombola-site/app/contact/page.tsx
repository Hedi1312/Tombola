"use client";

import { useState } from "react";
import { MailQuestionMark, Send } from "lucide-react";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("message", message);
        if (file) formData.append("file", file);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                body: formData,
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
                setFile(null);
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
            setErrorMsg("Erreur inconnue lors de l'envoi du message.");
        } finally {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 mb-12">
                <div className="flex items-center justify-center space-x-6">
                    <MailQuestionMark className="h-10 w-10 text-red-800" />
                    <h1 className="text-3xl font-extrabold text-gray-800">Contact / Support</h1>
                </div>

                <p className="text-center text-gray-700 my-6">
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
                    <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required className="p-3 border rounded-lg" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="p-3 border rounded-lg" />
                    <textarea placeholder="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="p-3 border rounded-lg resize-none" />

                    {/* Champ fichier custom */}
                    {/* Champ fichier custom */}
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">📎 Pièce jointe (optionnel)</label>

                        <button
                            type="button"
                            onClick={() => document.getElementById("fileInput")?.click()}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer"
                        >
                            Joindre un fichier (PDF, Image, etc...)
                        </button>

                        {/* Input caché */}
                        <input
                            id="fileInput"
                            type="file"
                            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />

                        {/* Affichage du nom du fichier sélectionné */}
                        {file && (
                            <p className="text-sm text-gray-500 mt-1">
                                ✅ {file.name}
                            </p>
                        )}
                    </div>


                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 mt-6 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            disabled={status === "loading"}>
                        {status === "loading" ? "Envoi..." : (<><Send size={20} /> Envoyer</>)}
                    </button>
                </form>
            </div>
        </section>
    );
}

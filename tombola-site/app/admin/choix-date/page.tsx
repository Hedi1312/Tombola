"use client";

import { useEffect, useState } from "react";
import {ArrowLeft} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChoixDatePage() {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const router = useRouter();

    // Charger la date actuelle depuis l'API
    useEffect(() => {
        const fetchDate = async () => {
            const res = await fetch("/api/admin/choix-date");
            const data = await res.json();
            if (data.success && data.drawDate) {
                const dt = new Date(data.drawDate);
                const year = dt.getFullYear();
                const month = String(dt.getMonth() + 1).padStart(2, "0");
                const day = String(dt.getDate()).padStart(2, "0");
                const hours = String(dt.getHours()).padStart(2, "0");
                const minutes = String(dt.getMinutes()).padStart(2, "0");
                const localISO = `${year}-${month}-${day}T${hours}:${minutes}`;
                setSelectedDate(localISO);
            }
        };
        fetchDate();
    }, []);

    const handleSave = async () => {
        if (!selectedDate) return;

        const localDate = new Date(selectedDate);
        const now = new Date();

        if (localDate < now) {
            setMessage("❌ La date choisie est déjà passée !");
            return;
        }

        const utcDate = new Date(
            localDate.getTime() - localDate.getTimezoneOffset() * 60 * 1000
        ).toISOString();

        const res = await fetch("/api/admin/choix-date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newDate: utcDate }),
        });

        const data = await res.json();
        if (data.success) {
            // Crée un objet Date pour l'affichage local
            const displayDate = new Date(selectedDate);
            const formattedDate = displayDate.toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
            setMessage(`✅ Date du tirage mise à jour : ${formattedDate.replace(" ", " à ")}`);
        } else {
            setMessage(`❌ Erreur : ${data.error}`);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-md">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3 mb-6 w-full">
                    <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left">
                        Choisir la date du tirage
                    </h1>

                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition cursor-pointer w-auto md:ml-4"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                </div>


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

                <input
                    type="datetime-local"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 mb-4 mt-5"
                />

                <button
                    onClick={handleSave}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                >
                    Enregistrer
                </button>
            </div>
        </main>
    );
}

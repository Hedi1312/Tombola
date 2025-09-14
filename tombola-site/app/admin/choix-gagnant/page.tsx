"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Winner {
    name: string;
    ticket: string;
}

export default function ChoixGagnantPage() {
    const router = useRouter();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const fetchWinners = async () => {
            const res = await fetch("/api/choix-gagnant");
            const data = await res.json();
            if (data.success && data.winners) {
                interface WinnerAPI {
                    name: string;
                    ticket: string | number;
                }

                setWinners(
                    data.winners.map((w: WinnerAPI) => ({ name: w.name, ticket: String(w.ticket) }))
                );
            } else {
                setWinners([
                    { name: "", ticket: "" },
                    { name: "", ticket: "" },
                    { name: "", ticket: "" },
                    { name: "", ticket: "" },
                    { name: "", ticket: "" },
                ]);
            }
        };
        fetchWinners();
    }, []);

    const handleChange = (index: number, field: keyof Winner, value: string) => {
        const newWinners = [...winners];
        newWinners[index][field] = value;
        setWinners(newWinners);
    };

    const handleAdd = () => {
        if (winners.length < 5) setWinners([...winners, { name: "", ticket: "" }]);
    };

    const handleDelete = (index: number) => {
        const newWinners = winners.filter((_, i) => i !== index);
        setWinners(newWinners);
    };

    const handleSave = async () => {
        // Vérification des lignes
        for (let i = 0; i < winners.length; i++) {
            const w = winners[i];
            if (w.name.trim() === "" || !/^\d{6}$/.test(w.ticket)) {
                setMessage(`❌ Ligne ${i + 1} invalide : nom requis et ticket doit être exactement 6 chiffres.`);
                window.scrollTo({ top: 0, behavior: "smooth" }); // ← scroll vers le haut
                return;
            }
        }

        // Vérification de l'unicité des tickets
        const tickets = winners.map((w) => w.ticket);
        const uniqueTickets = new Set(tickets);
        if (uniqueTickets.size !== tickets.length) {
            setMessage("❌ Chaque ticket doit être unique !");
            window.scrollTo({ top: 0, behavior: "smooth" }); // ← scroll vers le haut
            return;
        }

        const res = await fetch("/api/choix-gagnant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ winners }),
        });

        const data = await res.json();
        if (data.success) {
            setMessage("✅ Gagnants mis à jour !");
            window.scrollTo({ top: 0, behavior: "smooth" }); // ← scroll vers le haut
            setTimeout(() => setMessage(""), 5000);
        } else {
            setMessage(`❌ Erreur : ${data.error}`);
            window.scrollTo({ top: 0, behavior: "smooth" }); // ← scroll vers le haut
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-lg md:max-w-3xl bg-white rounded-2xl p-6 md:p-12 shadow-md flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3 mb-6 w-full">
                    <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left">
                        Choisir les gagnants
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
                    <p className="mb-4 rounded-lg bg-blue-100 text-blue-800 p-2 text-center">{message}</p>
                )}

                {winners.map((winner, index) => (
                    <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-700 w-full justify-between"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                            <span className="font-bold">{index + 1}.</span>

                            <input
                                type="text"
                                placeholder="Nom"
                                value={winner.name}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                className="w-full sm:w-48 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <input
                                type="text"
                                placeholder="Ticket"
                                value={winner.ticket}
                                onChange={(e) =>
                                    handleChange(index, "ticket", e.target.value.replace(/\D/g, ""))
                                }
                                className="w-full sm:w-32 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={() => handleDelete(index)}
                            className="flex items-center gap-1 rounded-lg bg-red-500 w-auto shrink-0 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition self-end sm:self-auto mt-2 sm:mt-0 cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Supprimer
                        </button>
                    </div>
                ))}

                {winners.length < 5 && (
                    <button
                        onClick={handleAdd}
                        className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition"
                    >
                        Ajouter un gagnant
                    </button>
                )}

                <button
                    onClick={handleSave}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition"
                >
                    Enregistrer les gagnants
                </button>
            </div>
        </main>
    );
}

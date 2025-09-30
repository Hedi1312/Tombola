"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Winner {
    name: string;
    email: string;
    ticket: string;
}

interface Ticket {
    full_name: string;
    email: string;
    ticket_number: string;
}


export default function ChoixGagnantPage() {
    const router = useRouter();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [message, setMessage] = useState<string>("");
    const [winnerCount, setWinnerCount] = useState(0); // valeur par défaut 0 gagnants


    useEffect(() => {
        const fetchWinners = async () => {
            const res = await fetch("/api/admin/choix-gagnant");
            const data = await res.json();
            if (data.success && data.winners) {
                interface WinnerAPI {
                    name: string;
                    email: string;
                    ticket: string;
                }

                const existingWinners = data.winners.map((w: WinnerAPI) => ({
                    name: w.name,
                    email: w.email,
                    ticket: String(w.ticket).padStart(6, "0"),
                }));

                setWinners(existingWinners);
                setWinnerCount(existingWinners.length);
            } else {
                setWinners([
                    { name: "", email: "", ticket: "" },
                    { name: "", email:"", ticket: "" },
                    { name: "", email:"", ticket: "" },
                    { name: "", email:"", ticket: "" },
                    { name: "", email:"", ticket: "" },
                    { name: "", email:"", ticket: "" },
                    { name: "", email:"", ticket: "" },
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

    const handleDelete = (index: number) => {
        const newWinners = winners.filter((_, i) => i !== index);
        setWinners(newWinners);
        setWinnerCount(newWinners.length);
    };

    // Tirage aléatoire

    // Fonction pour mélanger un tableau correctement
    function shuffleArray<T>(array: T[]): T[] {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // échange
        }
        return arr;
    }


    const handleRandomize = async () => {
        if (winnerCount <= 0) {
            setMessage("❌ Veuillez choisir un nombre de gagnants supérieur à 0.");
            return;
        }

        try {
            // Récupérer tous les tickets
            const res = await fetch("/api/admin/tickets-vendus");
            const data = await res.json();

            if (!data.success || !data.tickets || data.tickets.length === 0) {
                setMessage("❌ Aucun ticket disponible pour le tirage.");
                return;
            }

            // Mélanger les tickets aléatoirement
            const shuffled = shuffleArray(data.tickets);

            // Sélectionner uniquement le nombre de gagnants souhaité
            const selected = shuffled.slice(0, winnerCount) as Ticket[];

            // Créer les gagnants
            const newWinners = selected.map((t: Ticket) => ({
                name: t.full_name,
                email: t.email,
                ticket: String(t.ticket_number).padStart(6, "0"),
            }));

            setWinners(newWinners);
            setMessage(`✅ ${newWinners.length} gagnant(s) tiré(s) au hasard !`);
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(`❌ Erreur lors du tirage : ${err.message}`);
            } else {
                setMessage(`❌ Erreur lors du tirage : ${String(err)}`);
            }
        }
    };




    const handleSave = async () => {
        // Vérification des lignes
        for (let i = 0; i < winners.length; i++) {
            const w = winners[i];
            if (w.name.trim() === "" || !/^\d{6}$/.test(w.ticket) || w.email.trim() === "") {
                setMessage(`❌ Ligne ${i + 1} invalide : nom, email requis et ticket doit être exactement 6 chiffres.`);
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

        const res = await fetch("/api/admin/choix-gagnant", {
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
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-lg md:max-w-3xl bg-white rounded-2xl p-6 md:p-12 shadow-md flex flex-col gap-6 mb-12">
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

                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <label className="font-medium">Nombre de gagnants :</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        value={winnerCount}
                        onChange={(e) => {
                            const count = Number(e.target.value);
                            setWinnerCount(count);

                            // Ajuster le tableau winners
                            const newWinners = [...winners];
                            if (newWinners.length < count) {
                                while (newWinners.length < count) {
                                    newWinners.push({ name: "", email: "", ticket: "" });
                                }
                            } else if (newWinners.length > count) {
                                newWinners.length = count;
                            }
                            setWinners(newWinners);
                        }}
                        className="w-16 rounded-lg border px-2 py-1"
                    />
                </div>

                <button
                    onClick={handleRandomize}
                    className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white font-medium hover:bg-yellow-600 transition mb-4 cursor-pointer"
                >
                    Tirer au sort les gagnants
                </button>


                {winners.map((winner, index) => (
                    <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-700 w-full justify-between"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                            <span className="font-bold">{index + 1}.</span>

                            <input
                                type="text"
                                placeholder="Prénom NOM"
                                value={winner.name}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                className="w-full sm:w-48 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <input
                                type="email"
                                placeholder="Adresse mail"
                                value={winner.email}
                                onChange={(e) => handleChange(index, "email", e.target.value)}
                                className="w-full sm:w-48 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
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

                <button
                    onClick={handleSave}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition cursor-pointer"
                >
                    Enregistrer les gagnants
                </button>
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Winner {
    name: string;
    email: string;
    ticket: string;
    persisted?: boolean;
}

interface Ticket {
    full_name: string;
    email: string;
    ticket_number: string;
}


function ConfirmModal({
          isOpen,
          onConfirm,
          onCancel,
          message,
    }: {
        isOpen: boolean;
        onConfirm: () => void;
        onCancel: () => void;
        message?: string;
    }) {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
                    <p className="text-gray-800 mb-6">{message || "Êtes-vous sûr ?"}</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onConfirm}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Supprimer
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        );
}


export default function ChoixGagnantPage() {
    const router = useRouter();
    const [allWinners, setAllWinners] = useState<Winner[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [message, setMessage] = useState<string>("");
    const [winnerCount, setWinnerCount] = useState(""); // valeur par défaut du nombre de gagnants

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWinnerIndex, setSelectedWinnerIndex] = useState<number | null>(null);


    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden"; // bloque le scroll
        } else {
            document.body.style.overflow = "auto"; // réactive le scroll
        }

        return () => {
            document.body.style.overflow = "auto"; // nettoyage au cas où
        };
    }, [modalOpen]);



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
                    persisted: true,
                }));

                setAllWinners(existingWinners);
                setWinners(existingWinners);
                setWinnerCount(existingWinners.length > 0 ? existingWinners.length.toString() : "");

            } else {
                setWinners([]);   // Aucun gagnant, donc le tableau est vide
                setWinnerCount("");
            }

        };
        fetchWinners();
    }, []);

    const handleChange = (
        index: number,
        field: Exclude<keyof Winner, "persisted">,
        value: string
    ) => {
        const updatedVisible = [...winners];
        updatedVisible[index][field] = value;
        setWinners(updatedVisible);

        const updatedAll = [...allWinners];
        updatedAll[index] = updatedVisible[index];
        setAllWinners(updatedAll);
    };



    const handleConfirmDelete = async (index: number) => {
        const winnerToDelete = winners[index];

        // Supprimer de allWinners
        const updatedAll = allWinners.filter(w => w !== winnerToDelete);

        // Supprimer du tableau visible
        const updatedVisible = winners.filter((_, i) => i !== index);

        setAllWinners(updatedAll);
        setWinners(updatedVisible);
        setWinnerCount(updatedVisible.length.toString());
        setModalOpen(false);
        setSelectedWinnerIndex(null);

        // Sauvegarder avec le tableau à jour
        await handleSave(updatedVisible);
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
        const count = parseInt(winnerCount, 10);

        if (isNaN(count) || count <= 0) {
            setMessage("❌ Veuillez choisir un nombre de gagnants supérieur à 0.");
            return;
        }

        try {
            const res = await fetch("/api/admin/tickets-vendus");
            const data: { success: boolean; tickets?: Ticket[] } = await res.json();

            if (!data.success || !data.tickets || data.tickets.length === 0) {
                setMessage("❌ Aucun ticket disponible pour le tirage.");
                return;
            }

            const shuffled = shuffleArray(data.tickets);

            // 🧠 Exclure les tickets déjà enregistrés (persisted)
            const usedTickets = new Set(
                winners
                    .filter((w) => w.persisted && w.ticket.trim() !== "")
                    .map((w) => w.ticket.trim())
            );

            const availableTickets = shuffled.filter(
                (t) => !usedTickets.has(String(t.ticket_number).padStart(6, "0"))
            );

            const updatedWinners = [...winners];
            let nextTicketIndex = 0;

            // 🧩 Étape 1 : Remplacer uniquement les champs non persistés ou vides
            for (let i = 0; i < updatedWinners.length; i++) {
                const w = updatedWinners[i];

                // On ne touche pas à ceux déjà enregistrés
                if (w.persisted) continue;

                const isEmpty =
                    w.name.trim() === "" &&
                    w.email.trim() === "" &&
                    w.ticket.trim() === "";

                if ((isEmpty || !w.persisted) && nextTicketIndex < availableTickets.length) {
                    const t = availableTickets[nextTicketIndex++];
                    updatedWinners[i] = {
                        name: t.full_name,
                        email: t.email,
                        ticket: String(t.ticket_number).padStart(6, "0"),
                        persisted: false, // encore non enregistré
                    };
                }
            }

            // 🧩 Étape 2 : Ajouter des gagnants si la liste est trop courte
            while (updatedWinners.length < count && nextTicketIndex < availableTickets.length) {
                const t = availableTickets[nextTicketIndex++];
                updatedWinners.push({
                    name: t.full_name,
                    email: t.email,
                    ticket: String(t.ticket_number).padStart(6, "0"),
                    persisted: false,
                });
            }

            // Tronquer si nécessaire
            if (updatedWinners.length > count) updatedWinners.length = count;

            setWinners(updatedWinners);
            setMessage("✅ Gagnants non encore enregistrés mis à jour !");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => setMessage(""), 5000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(`❌ Erreur lors du tirage : ${err.message}`);
            } else {
                setMessage(`❌ Erreur inattendue`);
            }
        }

    };



    async function handleNotifyWinners() {
        try {
            const res = await fetch("/api/admin/notifier-gagnant", { method: "POST" });
            const data = await res.json();

            if (!data.success) {
                setMessage("❌ Les mails ont déjà été envoyés.");
                return;
            }
            setMessage("✅ Emails envoyés avec succès !");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Erreur:", err);
            setMessage(`❌ Erreur lors de l'envoi : ${err instanceof Error ? err.message : String(err)}`);
        }
    }


    const handleSave = async (winnersToSave?: Winner[]) => {
        const list = winnersToSave || winners; // utilise le tableau passé ou le state

        // Vérifications...
        for (let i = 0; i < list.length; i++) {
            const w = list[i];
            if (w.name.trim() === "" || !/^\d{6}$/.test(w.ticket) || w.email.trim() === "") {
                setMessage(`❌ Ligne ${i + 1} invalide : nom, email requis et ticket doit être exactement 6 chiffres.`);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }
        }

        const tickets = list.map(w => w.ticket);
        const uniqueTickets = new Set(tickets);
        if (uniqueTickets.size !== tickets.length) {
            setMessage("❌ Chaque ticket doit être unique !");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const res = await fetch("/api/admin/choix-gagnant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ winners: list }),
        });

        const data = await res.json();
        if (data.success) {
            const persistedList = list.map(w => ({ ...w, persisted: true }));
            setAllWinners(persistedList);
            setWinners(persistedList);
            setMessage("✅ Gagnants mis à jour !");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => setMessage(""), 5000);
        } else {
            setMessage(`❌ Erreur : ${data.error}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
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
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer w-auto md:ml-4"
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
                        placeholder="0-100"
                        min={0}
                        max={100}
                        value={winnerCount}
                        onChange={(e) => {
                            const value = e.target.value;
                            setWinnerCount(value);

                            let count = parseInt(value || "0", 10);
                            if (isNaN(count) || count < 0) count = 0;
                            if (count > 100) count = 100;

                            const updatedAll = [...allWinners];

                            // Si on veut plus de gagnants que ce qu'on a déjà, on en ajoute
                            if (updatedAll.length < count) {
                                while (updatedAll.length < count)
                                    updatedAll.push({ name: "", email: "", ticket: "", persisted: false });
                            }

                            // On garde toujours tout en mémoire
                            setAllWinners(updatedAll);

                            // On n'affiche que les "count" premiers
                            setWinners(updatedAll.slice(0, count));
                        }}

                        className="w-16 rounded-lg border px-2 py-1"
                    />

                </div>

                <div className="flex flex-wrap gap-4 mt-4 mb-8">
                    <button
                        onClick={handleRandomize}
                        className="flex-1 min-w-[200px] rounded-lg bg-yellow-500 px-4 py-2 text-white font-medium hover:bg-yellow-600 transition cursor-pointer"
                    >
                        Tirer au sort les gagnants
                    </button>

                    <button
                        onClick={handleNotifyWinners}
                        className="flex-1 min-w-[200px] rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700 transition cursor-pointer"
                    >
                        Envoyer les emails
                    </button>
                </div>



                {winners.map((winner, index) => (
                    <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-700 w-full justify-between mb-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                            <span className="font-bold">{index + 1}.</span>

                            <input
                                type="text"
                                placeholder="Prénom NOM"
                                value={winner.name}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                className={`w-full sm:w-48 rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                                    winner.persisted ? "bg-gray-300 text-gray-500" : "bg-white"
                                }`}
                            />

                            <input
                                type="email"
                                placeholder="Adresse mail"
                                value={winner.email}
                                onChange={(e) => handleChange(index, "email", e.target.value)}
                                className={`w-full sm:w-48 rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                                    winner.persisted ? "bg-gray-300 text-gray-500" : "bg-white"
                                }`}
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
                                className={`w-full sm:w-32 rounded-lg border border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                                    winner.persisted ? "bg-gray-300 text-gray-500" : "bg-white text-gray-800"
                                }`}

                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setSelectedWinnerIndex(index);
                                setModalOpen(true);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-red-600 w-auto shrink-0 px-3 py-1.5 text-sm text-white hover:bg-red-700 transition self-end sm:self-auto mt-2 sm:mt-0 cursor-pointer"
                        >
                            <Trash2 size={16} />
                            Supprimer
                        </button>
                    </div>
                ))}



                <button
                    onClick={() => handleSave()}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition cursor-pointer mt-2"
                >
                    Enregistrer les gagnants
                </button>

                <ConfirmModal
                    isOpen={modalOpen && selectedWinnerIndex !== null}
                    onConfirm={() => {
                        if (selectedWinnerIndex !== null) handleConfirmDelete(selectedWinnerIndex);
                    }}
                    onCancel={() => setModalOpen(false)}
                    message={
                        selectedWinnerIndex !== null
                            ? `⚠️ Supprimer le gagnant "${winners[selectedWinnerIndex].name}" - "${winners[selectedWinnerIndex].ticket}" - "${winners[selectedWinnerIndex].email}" ?`
                            : ""
                    }
                />



            </div>
        </section>
    );
}

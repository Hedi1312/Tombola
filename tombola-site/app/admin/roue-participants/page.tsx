"use client";

import { useEffect, useState } from "react";
import { LoaderPinwheel, ArrowLeft, Search, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

interface Participant {
    id: number;
    email: string;
    total_wins: number;
    total_losses: number;
    played_at: string;
    last_result: "win" | "lose" | null;
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
                        <RotateCcw size={18} />
                        Réinitialiser
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                    >
                        <X size={18} />
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RoueParticipantsAdmin() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] =
        useState<Participant | null>(null);

    useLockBodyScroll(modalOpen);

    useEffect(() => {
        fetchParticipants();
    }, []);

    async function fetchParticipants() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/roue-participants");
            const data = await res.json();
            if (data.success) {
                setParticipants(data.participants || []);
            } else {
                setMessage(`❌ Erreur API : ${data.error || "inconnue"}`);
            }
        } catch (err) {
            setMessage(`❌ Erreur lors du chargement : ${err}`);
        } finally {
            setLoading(false);
        }
    }

    function openModal(participant: Participant) {
        setSelectedParticipant(participant);
        setModalOpen(true);
    }

    async function handleReset(id: number) {
        try {
            const res = await fetch(`/api/admin/roue-participants/${id}`, {
                method: "PATCH",
            });
            const data = await res.json();

            if (data.success) {
                setMessage(`✅ ${data.message}`);
                await fetchParticipants();
            } else {
                setMessage(
                    `❌ ${data.message || data.error || "Réinitialisation impossible."}`
                );
            }
        } catch (err) {
            console.error(err);
            setMessage(`❌ Erreur lors de la réinitialisation`);
        } finally {
            setModalOpen(false);
            setSelectedParticipant(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    const filteredParticipants = participants
        .filter((p) => p.email.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const dateA = new Date(a.played_at).getTime();
            const dateB = new Date(b.played_at).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    const totalWins = participants.reduce(
        (acc, p) => acc + (p.total_wins || 0),
        0
    );
    const totalLosses = participants.reduce(
        (acc, p) => acc + (p.total_losses || 0),
        0
    );

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md mb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <LoaderPinwheel className="h-8 w-8 text-red-800" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Participants de la Roue{" "}
                            <span className="text-indigo-600">({participants.length})</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => router.push("/admin/roue-probabilite")}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                </div>

                {/* Statistiques globales */}
                <div className="flex justify-center gap-6 my-12">
                    <div className="bg-green-100 px-4 py-2 rounded-lg text-green-800 font-semibold shadow">
                        Gains totaux : {totalWins}
                    </div>
                    <div className="bg-red-100 px-4 py-2 rounded-lg text-red-800 font-semibold shadow">
                        Pertes totales : {totalLosses}
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 my-12 max-w-md mx-auto text-gray-700">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none"
                    />
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

                {loading ? (
                    <p className="mt-6 text-center text-gray-600">
                        Chargement des participants...
                    </p>
                ) : filteredParticipants.length === 0 ? (
                    <p className="mt-6 text-center text-gray-600">
                        Aucun participant trouvé pour le moment.
                    </p>
                ) : (
                    <>
                        {/* TABLEAU DESKTOP */}
                        <div className="hidden sm:block overflow-x-auto mb-4">
                            <table className="w-full border-collapse rounded-lg shadow text-gray-700">
                                <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="px-4 py-2 align-middle">#</th>
                                    <th className="px-4 py-2 align-middle text-center">Email</th>
                                    <th className="px-4 py-2 align-middle text-center">Gains</th>
                                    <th className="px-4 py-2 align-middle text-center">Pertes</th>
                                    <th className="px-4 py-2 align-middle text-center">Dernier résultat</th>
                                    <th
                                        className="px-4 py-2 cursor-pointer select-none text-center"
                                        onClick={() =>
                                            setSortOrder((prev) =>
                                                prev === "asc" ? "desc" : "asc"
                                            )
                                        }
                                    >
                                        Dernière participation{" "}
                                        {sortOrder === "asc" ? "⬇️" : "⬆️"}
                                    </th>
                                    <th className="px-4 py-2 text-center">Réinitialiser</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredParticipants.map((participant) => (
                                    <tr
                                        key={participant.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-2 align-middle">{participant.id}</td>
                                        <td className="px-4 py-2 align-middle text-center">{participant.email}</td>
                                        <td className="px-4 py-2 align-middle text-center text-green-600 font-semibold">
                                            {participant.total_wins}
                                        </td>
                                        <td className="px-4 py-2 align-middle text-center text-red-600 font-semibold">
                                            {participant.total_losses}
                                        </td>
                                        <td className="px-4 py-2 align-middle text-center">
                                            {participant.last_result === "win"
                                                ? "✅ Gagné"
                                                : participant.last_result === "lose"
                                                    ? "❌ Perdu"
                                                    : "—"}
                                        </td>
                                        <td className="px-4 py-2 align-middle text-center">
                                            {new Date(participant.played_at).toLocaleString("fr-FR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </td>

                                        <td className="px-4 py-2 align-middle">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openModal(participant)}
                                                    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition cursor-pointer"
                                                >
                                                    <RotateCcw size={16} />
                                                    Réinitialiser
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cartes Mobile */}
                        <div className="sm:hidden text-gray-700">
                            {/* Bouton de tri sur mobile */}
                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
                                    className="flex items-center gap-2 rounded-lg mb-4 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
                                >
                                    Trier par date {sortOrder === "asc" ? "⬇️" : "⬆️"}
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {filteredParticipants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="p-4 border rounded-lg shadow-sm bg-gray-50"
                                    >
                                        <p>
                                            <strong>Id :</strong> {participant.id}
                                        </p>
                                        <p>
                                            <strong>Email :</strong> {participant.email}
                                        </p>
                                        <p className="text-green-600 font-semibold">
                                            Gains : {participant.total_wins}
                                        </p>
                                        <p className="text-red-600 font-semibold">
                                            Pertes : {participant.total_losses}
                                        </p>
                                        <p>
                                            <strong>Dernier résultat :</strong>{" "}
                                            {participant.last_result === "win"
                                                ? "✅ Gagné"
                                                : participant.last_result === "lose"
                                                    ? "❌ Perdu"
                                                    : "—"}
                                        </p>
                                        <p>
                                            <strong>Dernière participation :</strong>{" "}
                                            {new Date(participant.played_at).toLocaleString("fr-FR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={() => openModal(participant)}
                                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition cursor-pointer"
                                            >
                                                <RotateCcw size={16} />
                                                Réinitialiser
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <ConfirmModal
                    isOpen={modalOpen && selectedParticipant !== null}
                    onConfirm={() => {
                        if (selectedParticipant) handleReset(selectedParticipant.id);
                    }}
                    onCancel={() => setModalOpen(false)}
                    message={
                        selectedParticipant
                            ? `⚠️ Voulez-vous vraiment réinitialiser "${selectedParticipant.email}" ?`
                            : ""
                    }
                />
            </div>
        </section>
    );
}

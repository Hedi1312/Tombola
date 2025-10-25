"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BellRing, Send, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {useLockBodyScroll} from "@/src/lib/useLockBodyScroll";

interface Participant {
    id: number;
    full_name: string;
    email: string;
    notified: boolean;
    access_token: string;
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
                        <Trash2 size={18} />
                        Supprimer
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

export default function NotificationsAdminPage() {
    const router = useRouter();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [loadingNotify, setLoadingNotify] = useState(false);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<Participant | null>(null);


    // Bloquer le scroll derrière le modal
    useLockBodyScroll(modalOpen);

    const total = participants.length;
    const pending = participants.filter((p) => !p.notified).length;

    async function fetchParticipants() {
        setLoading(true);
        const res = await fetch("/api/admin/envoyer-notifications");
        const data = await res.json();
        if (data.success) setParticipants(data.participants);
        else setMessage(`❌ ${data.error}`);
        setLoading(false);
    }

    async function handleNotifyAll() {
        try {
            if (participants.length === 0) {
                setMessage("❌ Aucun participant à notifier !");
                return;
            }

            const pending = participants.filter((p) => !p.notified);
            if (pending.length === 0) {
                setMessage("❌ Tous les participants ont déjà été notifiés !");
                return;
            }

            setLoadingNotify(true);
            const res = await fetch("/api/admin/envoyer-notifications", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                setMessage("✅ Emails envoyés !");
                await fetchParticipants();
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Erreur réseau lors de l'envoi des emails.");
        } finally {
            setLoadingNotify(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }


    async function handleDelete(id: number) {
        try {
            const res = await fetch(`/api/admin/envoyer-notifications/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setMessage(`❌ Erreur HTTP ${res.status}`);
                return;
            }

            if (data.success) {
                setParticipants((prev) => prev.filter((p) => p.id !== id));
                setMessage(`✅ Participant supprimé : "${selected?.full_name}" - "${selected?.email}"`);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Erreur réseau lors de la suppression.");
        } finally {
            setModalOpen(false);
            setSelected(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function openModal(p: Participant) {
        setSelected(p);
        setModalOpen(true);
    }

    const filtered = participants.filter(
        (p) =>
            p.full_name.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        fetchParticipants();
    }, []);




    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md mb-12 text-gray-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3 mb-6 w-full">
                    <div className="flex items-center space-x-3">
                        <BellRing className="h-8 w-8 text-yellow-500" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Notifications participants{" "}
                            <span className="text-indigo-600">
                                ({pending}/{total})
                            </span>
                        </h1>
                    </div>

                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer w-auto md:ml-4"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <p
                        className={`mb-4 p-2 rounded-lg text-center ${
                            message.startsWith("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </p>
                )}

                {/* Barre de recherche */}
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 my-8 max-w-md mx-auto text-gray-700">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none"
                    />
                </div>

                {/* Bouton envoyer */}
                <button
                    onClick={handleNotifyAll}
                    disabled={loadingNotify}
                    className="mb-4 mt-10 rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Send size={18} />
                    {loadingNotify ? "Envoi en cours..." : "Envoyer les emails aux participants"}
                </button>

                {/* Contenu */}
                {loading ? (
                    <p className="mt-6 text-center text-gray-600">Chargement...</p>
                ) : filtered.length === 0 ? (
                    <p className="mt-6 text-center text-gray-600">
                        Aucune personne à notifier pour le moment.
                    </p>
                ) : (
                    <>
                        {/* Table Desktop */}
                        <div className="hidden sm:block overflow-x-auto mt-10">
                            <table className="w-full border-collapse rounded-lg shadow text-gray-700 mb-4">
                                <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="px-4 py-2 align-middle">#</th>
                                    <th className="px-4 py-2 align-middle text-center">Nom complet</th>
                                    <th className="px-4 py-2 align-middle text-center">Email</th>
                                    <th className="px-4 py-2 align-middle text-center">État</th>
                                    <th className="px-4 py-2 align-middle text-center">Supprimer</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-2 align-middle">{p.id}</td>
                                        <td className="px-4 py-2 align-middle text-center">{p.full_name}</td>
                                        <td className="px-4 py-2 align-middle text-center">{p.email}</td>
                                        <td className="px-4 py-2 align-middle text-center">
                                            {p.notified ? (
                                                <span className="text-green-600 font-medium">
                                                        ✅ Notifié
                                                    </span>
                                            ) : (
                                                <span className="text-red-600 font-medium">
                                                        ❌ En attente
                                                    </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 align-middle">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openModal(p)}
                                                    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cartes Mobile (affichage responsive) */}
                        <div className="sm:hidden text-gray-700 mt-8">
                            <div className="grid gap-4">
                                {filtered.map((p) => (
                                    <div
                                        key={p.id}
                                        className="p-4 border rounded-lg shadow-sm bg-gray-50"
                                    >
                                        <p>
                                            <strong>Id :</strong> {p.id}
                                        </p>
                                        <p>
                                            <strong>Nom complet :</strong> {p.full_name}
                                        </p>
                                        <p className="break-all">
                                            <strong>Email :</strong> {p.email}
                                        </p>
                                        <p>
                                            <strong>État :</strong>{" "}
                                            {p.notified ? (
                                                <span className="text-green-600 font-medium">
                                                    ✅ Notifié
                                                </span>
                                            ) : (
                                                <span className="text-red-600 font-medium">
                                                    ❌ En attente
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={() => openModal(p)}
                                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {/* Modal de confirmation */}
                <ConfirmModal
                    isOpen={modalOpen && selected !== null}
                    onConfirm={() => selected && handleDelete(selected.id)}
                    onCancel={() => setModalOpen(false)}
                    message={
                        selected
                            ? `⚠️ Supprimer le participant "${selected.full_name}" - "${selected.email}" ?`
                            : ""
                    }
                />
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Ticket, ArrowLeft, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

interface TicketData {
    id: number;
    email: string;
    full_name: string;
    ticket_number: string;
    access_token: string;
    created_at: string;
}

// Composant de popup confirmation
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



export default function TicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
    const router = useRouter();
    const [message, setMessage] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");



    // Bloquer le scroll derrière le modal
    useLockBodyScroll(modalOpen);


    useEffect(() => {
        fetchTickets();
    }, []);

    async function fetchTickets() {
        setLoading(true);
        const res = await fetch("/api/admin/tickets-vendus");
        const data = await res.json();
        if (data.success) setTickets(data.tickets || []);
        else console.error("Erreur API:", data.error);
        setLoading(false);
    }

    function openModal(ticket: TicketData) {
        setSelectedTicket(ticket);
        setModalOpen(true);
    }


    async function handleDelete(id: number) {
        try {
            const res = await fetch(`/api/admin/tickets-vendus/${id}`, { method: "DELETE" });
            if (!res.ok) {
                console.error("Erreur HTTP", res.status, await res.text());
                return;
            }
            const data = await res.json();

            if (data.success) {
                setTickets(prev => prev.filter(t => t.id !== id));
                setMessage(`✅ Le ticket suivant est supprimé : ID: ${selectedTicket!.id}, Numéro: ${selectedTicket!.ticket_number}, Email: ${selectedTicket!.email}`);
                setModalOpen(false);      // ← ferme le modal ici
                setSelectedTicket(null);  // ← réinitialise le ticket sélectionné
            }
            else {
                setMessage(`❌ Erreur : ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage(`❌ Erreur lors de la suppression du ticket`);
        } finally {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

    }


    const filteredTickets = tickets
        .filter((t) =>
            t.full_name.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            String(t.ticket_number).includes(search)
        )
        .sort((a, b) => {
            const parseDate = (d: string) => new Date(d.replace(" ", "T")).getTime();
            const dateA = parseDate(a.created_at);
            const dateB = parseDate(b.created_at);

            if (dateA === dateB) {
                // Si même date → trier par ID pour garder un ordre logique
                return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
            }

            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });





    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md mb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <Ticket className="h-8 w-8 text-red-500" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Tickets vendus{" "}
                            <span className="text-indigo-600">({filteredTickets.length}/{tickets.length})</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                </div>

                {/* Barre de recherche */}
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-6 max-w-md mx-auto text-gray-700">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email ou numéro..."
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


                {/* Contenu */}
                {loading ? (
                    <p className="mt-6 text-center text-gray-600">
                        Chargement des tickets...
                    </p>
                ) : filteredTickets.length === 0 ? (
                    <p className="mt-6 text-center text-gray-600">
                        Aucun ticket trouvé pour le moment.
                    </p>
                ) : (
                    <>
                        {/* Table Desktop */}
                        <div className="hidden sm:block overflow-x-auto mb-4">
                            <table className="w-full border-collapse rounded-lg shadow text-gray-700">
                                <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Nom complet</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Numéro du ticket</th>
                                    <th
                                        className="px-4 py-2 cursor-pointer select-none"
                                        onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
                                    >
                                        Date achat {sortOrder === "asc" ? "⬇️" : "⬆️"}
                                    </th>

                                    <th className="px-4 py-2">Supprimer</th>
                                </tr>
                                </thead>
                                <tbody>

                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-2">{ticket.id}</td>
                                        <td className="px-4 py-2">{ticket.full_name}</td>
                                        <td className="px-4 py-2">{ticket.email}</td>
                                        <td className="px-4 py-2">{ticket.ticket_number}</td>
                                        <td className="px-4 py-2">
                                            {new Date(ticket.created_at).toLocaleString("fr-FR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => openModal(ticket)}
                                                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                                Supprimer
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cartes Mobile */}
                        <div className="grid gap-4 sm:hidden text-gray-700">
                            {filteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-4 border rounded-lg shadow-sm bg-gray-50"
                                >
                                    <p>
                                        <strong>Id :</strong> {ticket.id}
                                    </p>
                                    <p>
                                        <strong>Nom :</strong> {ticket.full_name}
                                    </p>
                                    <p>
                                        <strong>Email :</strong> {ticket.email}
                                    </p>
                                    <p>
                                        <strong>Ticket :</strong> {ticket.ticket_number}
                                    </p>
                                    <p>
                                        <strong>Date :</strong>{" "}
                                        {new Date(ticket.created_at).toLocaleString("fr-FR", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        })}
                                    </p>
                                    <button
                                        onClick={() => openModal(ticket)}
                                        className="mt-3 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        Supprimer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Modal réutilisé */}
                <ConfirmModal
                    isOpen={modalOpen && selectedTicket !== null}
                    onConfirm={() => {
                        if (selectedTicket) handleDelete(selectedTicket!.id);
                    }}
                    onCancel={() => setModalOpen(false)}
                    message={
                        selectedTicket
                            ? `⚠️ Voulez-vous vraiment supprimer le ticket ? ID: "${selectedTicket!.id}" - "${selectedTicket!.ticket_number}" - "${selectedTicket!.email}"`
                            : ""
                    }
                />


            </div>
        </section>
    );
}

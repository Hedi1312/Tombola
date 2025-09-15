"use client";

import { useEffect, useState } from "react";
import { Ticket, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface TicketData {
    id: number;
    email: string;
    full_name: string;
    ticket_number: number;
    access_token: string;
    created_at: string;
}


export default function TicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchTickets = async () => {
            const res = await fetch("/api/admin/tickets-vendus");

            const data = await res.json();

            if (data.success) {
                setTickets(data.tickets || []);
            } else {
                console.error("Erreur API:", data.error);
            }
            setLoading(false);
        };

        fetchTickets();
    }, []);

    // Filtrage par recherche
    const filteredTickets = tickets.filter(
        (t) =>
            t.full_name.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            String(t.ticket_number).includes(search)
    );

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <Ticket className="h-8 w-8 text-green-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Tickets vendus{" "}
                            <span className="text-indigo-600">({tickets.length})</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition cursor-pointer"
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

                {/* Contenu */}
                {loading ? (
                    <p className="mt-6 text-center text-gray-600">
                        Chargement des tickets...
                    </p>
                ) : filteredTickets.length === 0 ? (
                    <p className="mt-6 text-center text-gray-600">
                        Aucun ticket trouvé.
                    </p>
                ) : (
                    <>
                        {/* Table Desktop */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full border-collapse rounded-lg shadow text-gray-700">
                                <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Nom complet</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Numéro du ticket</th>
                                    <th className="px-4 py-2">Date achat</th>
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
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

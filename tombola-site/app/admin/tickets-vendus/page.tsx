"use client";

import { useEffect, useState } from "react";
import { Ticket, ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface TicketData {
    id: number;
    email: string;
    full_name: string;
    ticket_number: number;
    access_token: string;
    created_at: string;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTickets = async () => {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Erreur Supabase:", error.message);
            } else {
                setTickets(data || []);
            }
            setLoading(false);
        };

        fetchTickets();
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3 mb-6">
                    <div className="flex items-center space-x-3">
                        <Ticket className="h-8 w-8 text-green-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Tickets vendus <span className="text-indigo-600">({tickets.length})</span>
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

                {loading ? (
                    <p className="mt-6 text-center text-gray-600">Chargement des tickets...</p>
                ) : tickets.length === 0 ? (
                    <p className="mt-6 text-center text-gray-600">Aucun ticket vendu pour l’instant.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse rounded-lg shadow text-gray-700">
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
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{ticket.id}</td>
                                    <td className="px-4 py-2">{ticket.full_name}</td>
                                    <td className="px-4 py-2">{ticket.email}</td>
                                    <td className="px-4 py-2">{ticket.ticket_number}</td>
                                    <td className="px-4 py-2">{new Date(ticket.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}

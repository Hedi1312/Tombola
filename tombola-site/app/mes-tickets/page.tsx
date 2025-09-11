"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Ticket {
    id: number;
    ticket_number: number;
    full_name: string;
    created_at: string;
}

export default function MesTickets({ searchParams }: { searchParams?: { token?: string } }) {
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = searchParams?.token;

    useEffect(() => {
        if (!token) {
            setError("Token manquant. Entrez votre email pour rechercher vos billets.");
            setLoading(false);
            return;
        }

        async function fetchTickets() {
            try {
                const { data, error } = await supabase
                    .from("tickets")
                    .select("*")
                    .eq("access_token", token)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error(error);
                    setError("Erreur lors de la récupération des billets.");
                } else if (!data || data.length === 0) {
                    setError("Aucun billet trouvé pour ce token.");
                } else {
                    const tickets: Ticket[] = data as Ticket[];
                    setTickets(tickets);
                }
            } catch (err) {
                console.error(err);
                setError("Erreur inconnue lors de la récupération des billets.");
            } finally {
                setLoading(false);
            }
        }

        fetchTickets();
    }, [token]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6">
                <h2 className="text-3xl font-extrabold text-gray-800 text-center">
                    🎟️ Mes Tickets
                </h2>

                {loading && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 text-lg">Récupération de vos billets… 🍀</p>
                    </div>
                )}

                {!loading && error && <p className="text-red-500 text-center">{error}</p>}

                {!loading && tickets && tickets.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">
                            Vos tickets :
                        </h3>
                        <ul className="grid grid-cols-2 gap-3">
                            {tickets.map((ticket) => (
                                <li
                                    key={ticket.id}
                                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center font-mono"
                                >
                                    #{ticket.ticket_number}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}

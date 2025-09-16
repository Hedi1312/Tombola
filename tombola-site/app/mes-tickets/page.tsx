"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import TicketCard from "@/app/components/TicketCard";
import Image from "next/image";
import ticket from "@/ressources/img/ticket.png";

interface Ticket {
    id: number;
    ticket_number: string;
    full_name: string;
    created_at: string;
}

export default function MesTickets() {
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
            setError("Erreur. Vous devez utiliser le lien reçu par email.");
            setLoading(false);
            return;
        }

        async function fetchTickets() {
            try {
                // délai min 3 secondes
                const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

                const fetchData = supabase
                    .from("tickets")
                    .select("*")
                    .eq("access_token", token)
                    .order("id", { ascending: false });

                const [{ data, error }] = await Promise.all([fetchData, minDelay]);

                if (error) {
                    console.error(error);
                    setError("Erreur lors de la récupération des billets.");
                } else if (!data || data.length === 0) {
                    setError("Aucun billet trouvé pour cet url.");
                } else {
                    setTickets(data as Ticket[]);
                }
            } catch (err) {
                console.error(err);
                setError("Erreur inconnue lors de la récupération des billets.");
            } finally {
                setLoading(false);
            }
        }

        fetchTickets();

    }, []); // on ne relance pas inutilement

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 mb-12">

                {/* Image + Titre alignés */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Image src={ticket} alt="Ticket" width={60} height={60} />
                    <h2 className="text-3xl font-extrabold text-gray-800 text-center">
                        Mes Tickets
                    </h2>
                </div>

                {loading && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 text-lg">
                            Récupération de vos billets... 🍀
                        </p>
                    </div>
                )}

                {!loading && error && <p className="text-red-500 text-center">{error}</p>}

                {!loading && tickets && tickets.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
                            Vos tickets : {tickets.length}
                        </h3>
                        <p className="text-center text-gray-700 mt-4">
                            <br/><strong>⚠️ Pensez à garder ce lien envoyé par mail pour retrouver vos billets plus tard.</strong><br/> <br/><br/>
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-6 justify-items-center">
                            {tickets.map((ticket) => (
                                <li key={ticket.id}>
                                    <TicketCard ticketNumber={ticket.ticket_number} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>

    );
}

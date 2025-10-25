"use client";

import { useEffect, useState } from "react";
import TicketCard from "@/src/components/TicketCard";
import Image from "next/image";


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

    // validation UUID v4 (format attendu pour token)
    const isValidUuid = (s: string | null) => {
        if (!s) return false;
        // regex simple pour v4 UUID 36 chars with dashes
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
            setError("Erreur. Veuillez utiliser l'URL reçu par mail.");
            setLoading(false);
            return;
        }

        // token format validation (fast fail)
        if (!isValidUuid(token)) {
            setError("Erreur. Veuillez utiliser l'URL reçu par mail.");
            setLoading(false);
            return;
        }

        let elapsedTime = 0;
        const pollingInterval = 2000; // toutes les 2 secondes
        const minDelay = 2000; // délai minimum de 2 secondes
        const maxTime = 15000; // 15 secondes maximum

        const startTime = Date.now();

        async function fetchTickets() {
            try {
                const res = await fetch(`/api/mes-tickets?token=${token}`);
                const data = await res.json();

                if (data.success && data.tickets?.length) {
                    // s'assurer que le minimum de 3 secondes est respecté
                    const timeElapsed = Date.now() - startTime;
                    const remainingDelay = Math.max(0, minDelay - timeElapsed);

                    setTimeout(() => {
                        setTickets(data.tickets);
                        setLoading(false);
                    }, remainingDelay);

                    clearInterval(intervalId); // tickets récupérés → stop polling
                } else {
                    elapsedTime += pollingInterval;
                    if (elapsedTime >= maxTime) {
                        setError("Vos tickets ne sont pas encore disponibles. Actualisé la page ou attendez de les recevoir par mail.");
                        setLoading(false);
                        clearInterval(intervalId);
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Erreur inconnue lors de la récupération des tickets.");
                setLoading(false);
                clearInterval(intervalId);
            }
        }

        // première tentative immédiate
        fetchTickets();
        // polling toutes les 2 secondes
        const intervalId = setInterval(fetchTickets, pollingInterval);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 mb-12">

                {/* Image + Titre alignés */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Image src="/img/ticket/ticket.png" alt="Ticket" width={60} height={60} />
                    <h2 className="text-3xl font-extrabold text-gray-800 text-center">
                        Mes Tickets
                    </h2>
                </div>

                {loading && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 text-lg">
                            Récupération de vos tickets... 🍀
                        </p>
                    </div>
                )}

                {!loading && error && <p className="mb-4 rounded-lg text-center text-base p-2 bg-red-100 text-red-700">{error}</p>}

                {!loading && tickets && tickets.length > 0 && (
                    <div className="mt-4">
                        <p className="bg-yellow-100 text-gray-700 text-sm p-3 rounded-md text-center max-w-lg mx-auto mb-10">
                            ⚠️ Vous allez recevoir un ou plusieurs mails avec vos tickets et un lien pour pouvoir les retrouver plus tard !
                        </p>
                        <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
                            Vos tickets : {tickets.length}
                        </h3>
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
        </section>

    );
}

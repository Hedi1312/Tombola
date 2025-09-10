"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Ticket {
    id: string;
    name: string;
    quantity: number;
    color: string; // Couleur du ticket
}

export default function MesTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simuler un appel API pour récupérer les tickets de l'utilisateur
        setTimeout(() => {
            setTickets([
                { id: "TKT001", name: "Ticket de tombola 🎟️", quantity: 2, color: "bg-blue-100" },
                { id: "TKT002", name: "Ticket de tombola 🎟️", quantity: 1, color: "bg-pink-100" },
                { id: "TKT003", name: "Ticket de tombola 🎟️", quantity: 3, color: "bg-green-100" },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 md:p-8 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800">
                    🎟️ Mes Tickets
                </h1>

                {loading ? (
                    <p className="text-gray-600 text-lg md:text-xl">Chargement de vos tickets...</p>
                ) : tickets.length === 0 ? (
                    <p className="text-gray-700 text-lg md:text-xl">
                        Vous n'avez encore acheté aucun ticket.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className={`${ticket.color} flex justify-between items-center p-4 rounded-xl shadow-md`}
                            >
                                <span className="font-semibold text-gray-800">{ticket.name}</span>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}

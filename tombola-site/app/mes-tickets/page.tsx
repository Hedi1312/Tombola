"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase"; // <-- importe ton client existant

export default function MesTickets() {
    const [email, setEmail] = useState("");
    const [tickets, setTickets] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        setLoading(true);
        setError("");
        setTickets([]);

        const { data, error } = await supabase
            .from("tickets")
            .select("ticket_number, created_at")
            .eq("email", email)
            .order("created_at", { ascending: false });

        setLoading(false);

        if (error) {
            console.error(error);
            setError("Une erreur est survenue lors de la recherche.");
            return;
        }

        if (!data || data.length === 0) {
            setError("Aucun ticket trouvé pour cet email.");
        } else {
            setTickets(data.map((t) => t.ticket_number));
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 flex flex-col gap-6">
                <h2 className="text-3xl font-extrabold text-gray-800 text-center">
                    🎟️ Mes Tickets
                </h2>
                <p className="text-gray-600 text-center">
                    Entrez l’email utilisé pour l’achat afin de retrouver vos tickets.
                </p>

                <input
                    type="email"
                    placeholder="Votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-gray-700 text-lg px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleSearch}
                    disabled={loading || !email}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
                >
                    {loading ? "Recherche..." : "🔎 Rechercher mes tickets"}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {tickets.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">
                            Vos tickets :
                        </h3>
                        <ul className="grid grid-cols-2 gap-3">
                            {tickets.map((ticket, idx) => (
                                <li
                                    key={idx}
                                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center font-mono"
                                >
                                    #{ticket}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}

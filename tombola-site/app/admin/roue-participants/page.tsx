"use client";

import { useEffect, useState } from "react";
import { LoaderPinwheel, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Participant {
    id: number;
    email: string;
    is_win: boolean;
    played_at: string;
}

export default function RoueParticipantsAdmin() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const router = useRouter();
    const [message, setMessage] = useState("");

    // Compteur gagnants
    const totalWinners = participants.filter((p) => p.is_win).length;

    useEffect(() => {
        async function fetchParticipants() {
            try {
                const res = await fetch("/api/admin/roue-participants");
                const data = await res.json();
                if (data.success) setParticipants(data.participants || []);
                else setMessage(`❌ Erreur API : ${data.error || "inconnue"}`);
            } catch (err) {
                setMessage(`❌ Erreur lors du chargement des participants : ${err}`);
            }
            setLoading(false);
        }
        fetchParticipants();
    }, []);

    const filteredParticipants = participants
        .filter((p) => {
            const term = search.toLowerCase();
            return (
                p.email.toLowerCase().includes(term) ||
                (p.is_win ? "gagné" : "perdu").includes(term)
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.played_at).getTime();
            const dateB = new Date(b.played_at).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md mb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex items-center justify-center md:justify-start space-x-3 w-full">
                        <LoaderPinwheel className="h-8 w-8 text-red-800" />
                        <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left">
                            Participants de la Roue{" "}
                            <span className="text-green-600">
      ({totalWinners}
    </span>
                            <span className="text-indigo-500">/{participants.length})</span>
                        </h1>
                    </div>



                    <div className="flex justify-center md:justify-end w-full">
                        <button
                            onClick={() => router.push("/admin/dashboard")}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                            Retour
                        </button>
                    </div>
                </div>

                {/* Barre de recherche centrée */}
                <div className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2 mb-6 max-w-md mx-auto text-gray-700 shadow-sm">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par email ou statut (gagné/perdu)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none text-left text-gray-700"
                    />
                </div>

                {message && (
                    <p
                        className={`mb-4 text-center rounded-lg text-base p-2 ${
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
                    <p className="mt-10 text-center text-gray-600 text-lg">
                        Chargement des participants...
                    </p>
                ) : filteredParticipants.length === 0 ? (
                    <p className="mt-10 text-center text-gray-600 text-lg">
                        Aucun participant trouvé.
                    </p>
                ) : (
                    <>
                        {/* Table Desktop */}
                        <div className="hidden sm:block overflow-x-auto mb-4">
                            <table className="w-full border-collapse rounded-lg shadow text-gray-700">
                                <thead className="bg-gray-100 text-gray-700 text-center">
                                <tr>
                                    <th className="px-4 py-3 text-left">#</th>
                                    <th className="px-4 py-3 text-center">Email</th>
                                    <th className="px-4 py-3 text-center">Gagné ?</th>
                                    <th
                                        className="px-4 py-3 cursor-pointer select-none text-right"
                                        onClick={() =>
                                            setSortOrder((prev) =>
                                                prev === "asc" ? "desc" : "asc"
                                            )
                                        }
                                    >
                                        Date de participation{" "}
                                        <span className="ml-1">
                        {sortOrder === "asc" ? "⬇️" : "⬆️"}
                      </span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredParticipants.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-t hover:bg-gray-50 transition text-center"
                                    >
                                        <td className="px-4 py-2 text-left">{p.id}</td>
                                        <td className="px-4 py-2 text-center">{p.email}</td>
                                        <td className="px-4 py-2 text-center">
                                            {p.is_win ? "✅ Oui" : "❌ Non"}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {new Date(p.played_at).toLocaleString("fr-FR", {
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
                        <div className="sm:hidden text-gray-700">
                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={() =>
                                        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                                    }
                                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
                                >
                                    Trier par date {sortOrder === "asc" ? "⬇️" : "⬆️"}
                                </button>
                            </div>

                            <div className="grid gap-4 justify-center">
                                {filteredParticipants.map((p) => (
                                    <div
                                        key={p.id}
                                        className="p-4 border rounded-lg shadow-sm bg-gray-50 w-full max-w-md mx-auto text-center"
                                    >
                                        <p>
                                            <strong>ID :</strong> {p.id}
                                        </p>
                                        <p>
                                            <strong>Email :</strong> {p.email}
                                        </p>
                                        <p>
                                            <strong>Gagné :</strong> {p.is_win ? "✅ Oui" : "❌ Non"}
                                        </p>
                                        <p>
                                            <strong>Date :</strong>{" "}
                                            {new Date(p.played_at).toLocaleString("fr-FR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

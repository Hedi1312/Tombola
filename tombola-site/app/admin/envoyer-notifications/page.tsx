"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BellRing, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface Participant {
    id: number;
    full_name: string;
    email: string;
    notified: boolean;
    access_token: string;
}

export default function NotificationsAdminPage() {
    const router = useRouter();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [loadingNotify, setLoadingNotify] = useState(false);

    async function fetchParticipants() {
        setLoading(true);
        const res = await fetch("/api/admin/envoyer-notifications");
        const data = await res.json();
        if (data.success) setParticipants(data.participants);
        else setMessage(`❌ ${data.error}`);
        setLoading(false);
    }

    async function handleNotifyAll() {

        if (participants.length === 0) {
            setMessage("❌ Aucun participant à notifier !");
            return; // empêche l'exécution si la liste est vide
        }

        const pending = participants.filter(p => !p.notified);

        if (pending.length === 0) {
            setMessage("❌ Tous les participants ont déjà été notifiés !");
            return;
        }

        setLoadingNotify(true);

        try {
            const res = await fetch("/api/admin/envoyer-notifications", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                setMessage("✅ Emails envoyés !");
                await fetchParticipants(); // attendre que la liste soit rechargée
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Erreur réseau lors de l'envoi des emails.");
        } finally {
            setLoadingNotify(false); // ← désactive le loading quoi qu’il arrive
        }
    }

    useEffect(() => {
        fetchParticipants();
    }, []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg mb-12 text-gray-700" >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3 mb-6 w-full">
                    <div className="flex items-center space-x-3">
                        <BellRing className="h-8 w-8 text-yellow-500" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Notifications participants
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

                <button
                    onClick={handleNotifyAll}
                    disabled={loadingNotify}
                    className="mb-4 mt-10 rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-2"
                >
                    <Send size={18} />
                    {loadingNotify ? "Envoi en cours..." : "Envoyer les emails aux participants"}
                </button>


                {loading ? (
                    <p className="mt-6 text-center text-gray-600">Chargement...</p>
                ) : participants.length === 0 ? (
                    <p className="mt-6 text-center text-gray-600">Aucune personne à notifier pour le moment.</p>
                ) : (
                    <table className="w-full border-collapse rounded-lg shadow text-gray-700 mb-4 mt-10">
                        <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="px-4 py-2 align-middle">Nom</th>
                            <th className="px-4 py-2 align-middle text-center">Email</th>
                            <th className="px-4 py-2 align-middle text-center">État</th>
                        </tr>
                        </thead>
                        <tbody>
                        {participants.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 align-middle">{p.full_name}</td>
                                <td className="px-4 py-2 align-middle text-center break-all">{p.email}</td>
                                <td className="px-4 py-2 align-middle text-center">
                                    {p.notified ? (
                                        <span className="text-green-600 font-medium">✅ Notifié</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">❌ En attente</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}

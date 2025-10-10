"use client";

import { useState } from "react";
import { ArrowLeft, CirclePlus, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddTicketForm() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [quantity, setQuantity] = useState(""); // vide par défaut
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/admin/creer-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, email, quantity: parseInt(quantity || "0") }),

            });

            const data = await res.json();


            if (data.success) {
                setMessage(`✅ ${data.tickets.length} ticket(s) créé(s) avec succès !`);
                setFullName("");
                setEmail("");
                setQuantity("");
            } else {
                setMessage(`❌ Erreur: ${data.error}`);
            }

        } catch {
            setMessage("❌ Erreur réseau");
        }

        window.scrollTo({ top: 0, behavior: "smooth" }); // ← scroll vers le haut
        setLoading(false);
    };

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-lg md:max-w-2xl bg-white rounded-2xl p-6 md:p-10 shadow-md flex flex-col gap-6 mb-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 w-full">
                    <div className="flex items-center space-x-3">
                        <CirclePlus className="h-8 w-8 text-green-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Créer des tickets
                        </h1>
                    </div>

                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer w-auto"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                </div>

                {message && (
                    <div
                        className={`p-3 rounded-lg text-center text-base ${
                            message.startsWith("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 items-center text-gray-700"
                >
                    <input
                        type="text"
                        placeholder="Prénom NOM"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2 w-full max-w-xs"
                    />

                    <input
                        type="email"
                        placeholder="Adresse mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2 w-full max-w-xs"
                    />

                    <div className="flex flex-col w-full max-w-xs">
                        <label
                            htmlFor="quantity"
                            className="text-base font-medium text-gray-700 mb-1"
                        >
                            Nombre de tickets :
                        </label>
                        <input
                            id="quantity"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Nombre de tickets"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)} // juste setter la valeur brute
                            onBlur={() => {
                                let val = parseInt(quantity);
                                if (isNaN(val) || val < 1) val = 1;
                                if (val > 100) val = 100;
                                setQuantity(val.toString());
                            }}
                            min={1}
                            max={100}
                            required
                            className="border rounded-lg px-3 py-2 w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full max-w-xs flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-white font-medium hover:bg-green-800 shadow-sm hover:shadow-md transition cursor-pointer mt-4 mb-6 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "Création..." : "Créer les tickets"}
                    </button>
                </form>
            </div>
        </section>
    );
}

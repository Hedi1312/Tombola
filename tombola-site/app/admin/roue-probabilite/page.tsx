"use client";
import { useEffect, useState } from "react";
import { LoaderPinwheel, ArrowLeft, Save, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WinProbabilityAdmin() {
    const [probability, setProbability] = useState(30);
    const [manualInput, setManualInput] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter()

    useEffect(() => {
        const fetchProbability = async () => {
            try {
                const res = await fetch("/api/admin/roue-probabilite");
                const data = await res.json();
                if (data.success) {
                    const roundedValue = Math.round(data.value * 100);
                    setProbability(roundedValue);
                    setManualInput(roundedValue);
                }
            } catch (err) {
                console.warn("Erreur récupération probabilité :", err);
            }
        };
        fetchProbability();
    }, []);

    const saveProbability = async (value?: number) => {

        try {
            const finalValue = value !== undefined ? value : probability;
            if (finalValue < 0 || finalValue > 100) {
                setMessage("❌ La valeur doit être entre 0 et 100%");
                return;
            }
            setLoading(true);
            setMessage("");

            const res = await fetch("/api/admin/roue-probabilite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: finalValue / 100 }),
            });
            const data = await res.json();
            if (data.success) {
                setProbability(finalValue);
                setManualInput(finalValue);
                setMessage(`✅ Probabilité mise à jour  à ${finalValue} %`);
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`❌ Erreur : ${data.error}`);
            }
        } catch (err) {
            setMessage(`❌ Erreur serveur : ${err}`);
        } finally {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setLoading(false);
        }
    };

    const presetValues = [0, 5, 10, 25, 50, 100];

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 md:px-6 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-md mb-12">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <LoaderPinwheel className="h-8 w-8 text-green-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Probabilité de gain : {" "}
                            <span className="text-indigo-600">{probability}%</span>
                        </h1>

                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                </div>


                <button
                    onClick={() => router.push("/admin/roue-participants")}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition cursor-pointer"
                >
                    <Users size={20} />
                    Voir la liste des participants
                </button>


                {message && (
                    <p
                        className={`mb-4 mt-10 rounded-lg text-center text-base p-2 ${
                            message.startsWith("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </p>
                )}

                <div className="my-15">

                    {/* Bloc des presets */}
                    <div className="w-full max-w-4xl mx-auto grid grid-cols-3 gap-2 mb-6">
                        {presetValues.map((val) => (
                            <button
                                key={val}
                                onClick={() => saveProbability(val)}
                                className={`px-4 py-2 rounded-lg font-bold border cursor-pointer ${
                                    probability === val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                                } hover:bg-blue-500 hover:text-white transition text-center`}
                            >
                                {val}%
                            </button>
                        ))}
                    </div>

                    {/* Bloc input + bouton aligné comme les presets */}
                    <div className="w-full mt-12 flex flex-col gap-3">

                        {/* Label au-dessus, bien positionné */}
                        <div className="text-center mb-2">
                            <label className="font-bold text-gray-700">
                                Probabilité personnalisée :
                            </label>
                        </div>

                        {/* Ligne avec - / champ / + alignés */}
                        <div className="flex items-center justify-center gap-3 text-gray-700 mb-6">
                            <button
                                onClick={() => setManualInput((prev) => Math.max(0, prev - 1))}
                                className="px-4 py-2 bg-gray-200 rounded-lg font-bold cursor-pointer"
                            >
                                -
                            </button>

                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min={0}
                                max={100}
                                value={manualInput}
                                onChange={(e) => setManualInput(Number(e.target.value))}
                                className="h-12 px-4 border rounded-lg text-center w-20"
                            />

                            <button
                                onClick={() => setManualInput((prev) => Math.min(100, prev + 1))}
                                className="px-4 py-2 bg-gray-200 rounded-lg font-bold cursor-pointer"
                            >
                                +
                            </button>
                        </div>



                        <button
                            onClick={() => saveProbability(Number(manualInput))}
                            disabled={loading}
                            className="px-4 py-2 w-full sm:max-w-xs sm:mx-auto flex items-center justify-center gap-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 shadow-sm hover:shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 flex-shrink-0" />
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>

                </div>

            </div>
        </section>
    );
}

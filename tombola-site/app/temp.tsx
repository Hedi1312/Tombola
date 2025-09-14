"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

//  Définis ici le gagnant si le tirage est fait
const winnerName = "";
const winnerTicket = 0;



export default function ResultatPage() {
    const { width, height } = useWindowSize();
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showWinner, setShowWinner] = useState(false);
    const [countdown10s, setCountdown10s] = useState<number>(10);
    const [drawDate, setDrawDate] = useState<Date | null>(null);

    // Charger la date depuis l'API
    useEffect(() => {
        const fetchDate = async () => {
            const res = await fetch("/api/choix-date");
            const data = await res.json();
            if (data.success && data.drawDate){
                setDrawDate(new Date(data.drawDate));
            }

        };
        fetchDate();

    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        let endTime: number;

        if (winnerName && winnerTicket) {
            // Si gagnant défini → déclenche le compte à rebours de 10 secondes
            setTimeLeft(10);
            const interval10s = setInterval(() => {
                setCountdown10s((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval10s);
                        setShowWinner(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if(drawDate) {
            // Sinon date du tirage
            endTime = Date.parse(drawDate.toISOString());
            const interval = setInterval(() => {
                const diff = Math.floor((endTime - Date.now()) / 1000);
                setTimeLeft(diff > 0 ? diff : 0);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [mounted, drawDate]);

    const formatTime = (seconds: number) => {
        const d = Math.floor(seconds / (60 * 60 * 24));
        const h = Math.floor((seconds % (60 * 60 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${d}j ${h}h ${m}m ${s}s`;
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-hidden">
            <Confetti width={width} height={height} recycle={true} numberOfPieces={300} />

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 flex flex-col gap-6 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    🎉 Résultat de la Tombola <br/><br/>
                </h1>


                {winnerName && winnerTicket ? (
                    !showWinner ? (
                        <p className="text-gray-700 text-lg md:text-xl">
                            Suspense…Révélation du gagnant dans <strong>{countdown10s}s</strong> 🍀
                        </p>
                    ) : (
                        <>
                            <p className="text-gray-700 text-lg md:text-xl">
                                Félicitations au vainqueur ! 🏆
                            </p>
                            <div className="mt-4 bg-green-100 text-green-800 px-6 py-4 rounded-lg text-center font-mono text-xl animate-pulse">
                                {winnerName} – Ticket #{winnerTicket}
                            </div>
                        </>
                    )
                ): drawDate ? (
                    // Cas 2 : tirage prévu mais pas encore fait
                    <div className="flex flex-col gap-4">
                        <p className="text-gray-700 text-lg md:text-xl">
                            📅 Tirage prévu le{" "}
                            <strong>
                                {drawDate.toLocaleString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                }).replace(" ", " à ")}
                            </strong>
                        </p>
                        <p className="text-gray-700 text-lg md:text-xl">
                            ⏳ Le tirage aura lieu dans <strong>{formatTime(timeLeft)}</strong>
                        </p>
                    </div>
                ) : (
                    // Cas 3 : pas de date du tirage définie
                    <p className="text-gray-700 text-lg md:text-xl">
                        ⏳ En attente de la date du tirage...
                    </p>
                )}
            </div>
        </main>
    );
}



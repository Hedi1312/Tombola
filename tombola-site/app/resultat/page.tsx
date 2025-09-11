"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function ResultatPage() {
    // 👇 Remplace ici par le nom et le numéro du vainqueur si tirage fait
    const winnerName = "";
    const winnerTicket = 0;

    const [mounted, setMounted] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [countdown, setCountdown] = useState(10); // suspense tirage fait
    const [timeLeft, setTimeLeft] = useState(0); // suspense tirage pas fait
    const [showWinner, setShowWinner] = useState(false);

    // Date du tirage : 1 mois à partir d'aujourd'hui
    const drawDate = new Date();
    drawDate.setMonth(drawDate.getMonth() + 1);

    useEffect(() => {
        // Montage côté client
        setMounted(true);
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEffect(() => {
        if (winnerName && winnerTicket) {
            // Tirage déjà fait → compte à rebours 10s
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setShowWinner(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else {
            // Tirage pas fait → compte à rebours jusqu'au tirage réel
            const updateCountdown = () => {
                const now = new Date();
                const diff = drawDate.getTime() - now.getTime();
                setTimeLeft(diff > 0 ? diff : 0);
            };
            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
        }
    }, [winnerName, winnerTicket]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50">
            {mounted && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={true}
                    numberOfPieces={200}
                />
            )}

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 flex flex-col gap-6 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    🎉 Résultat de la tombola <br/> <br/>
                </h1>

                {!winnerName || !winnerTicket ? (
                    <p className="text-gray-700 text-lg md:text-xl">
                        Le tirage au sort n&apos;a pas encore été effectué. <br /><br/>
                        Le tirage aura lieu dans <strong>{formatTime(timeLeft)}</strong> 🍀
                    </p>
                ) : !showWinner ? (
                    <p className="text-gray-700 text-lg md:text-xl">
                        🎲 Suspense… Le vainqueur sera dévoilé dans {countdown} seconde{countdown > 1 ? "s" : ""} !
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
                )}
            </div>
        </main>
    );
}

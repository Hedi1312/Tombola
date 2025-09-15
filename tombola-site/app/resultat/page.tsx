/*
"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import TicketCard from "@/app/components/TicketCard";

interface Winner {
    name: string;
    ticket: string;
    rank: number;
}

export default function ResultatPage() {
    const { width, height } = useWindowSize();
    const [mounted, setMounted] = useState(false);
    const [drawDate, setDrawDate] = useState<Date | null>(null);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const [phase, setPhase] = useState<'countdown' | 'suspense' | 'revealing' | 'revealed'>('countdown');
    const [preCountdown, setPreCountdown] = useState<number>(10);
    const [revealedWinners, setRevealedWinners] = useState<Winner[]>([]);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const res = await fetch("/api/resultat");
            const data = await res.json();
            if (data.success) {
                setDrawDate(data.drawDate ? new Date(data.drawDate) : null);
                setWinners(data.winners || []);
            }
        };
        fetchData();
    }, []);




    // Compte à rebours jusqu'au tirage
    useEffect(() => {
        if (!drawDate) return;
        const interval = setInterval(() => {
            const diff = Math.floor((drawDate.getTime() - Date.now()) / 1000);
            setTimeLeft(diff > 0 ? diff : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, [drawDate]);

    // Quand le tirage est atteint, démarrer suspense
    useEffect(() => {
        if (timeLeft === 0 && winners.length == 7 && phase === 'countdown') {
            setPhase('suspense');
            setPreCountdown(10);
        }
    }, [timeLeft, winners, phase]);

    // Compte à rebours suspense 10s
    useEffect(() => {
        if (phase !== 'suspense') return;
        if (preCountdown === 0) {
            setPhase('revealing');
            setRevealedWinners([]);
            return;
        }
        const timer = setTimeout(() => setPreCountdown(preCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [preCountdown, phase]);

    // Révélation un par un
    useEffect(() => {
        if (phase !== 'revealing') return;
        const sorted = [...winners].sort((a, b) => b.rank - a.rank);
        if (revealedWinners.length >= sorted.length) {
            setPhase('revealed');
            return;
        }
        const timer = setTimeout(() => {
            setRevealedWinners(sorted.slice(0, revealedWinners.length + 1));
        }, 2000);
        return () => clearTimeout(timer);
    }, [revealedWinners, phase, winners]);


    const formatTime = (s: number) => {
        const d = Math.floor(s / (60 * 60 * 24));
        const h = Math.floor((s % (60 * 60 * 24)) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${d}j ${h}h ${m}m ${sec}s`;
    };




    if (!mounted) return null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-hidden">
            {(phase === 'revealing' || phase === 'revealed') && (
                <Confetti width={width} height={height} recycle={true} numberOfPieces={300} />
            )}

            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    🎉 Résultat de la Tombola
                </h1>

                {drawDate && phase === 'countdown' && (
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
                            ⏳ Tirage prévu dans <strong>{formatTime(timeLeft)}</strong>
                        </p>
                    </div>

                )}

                {phase === 'suspense' && (
                    <p className="text-gray-700 text-lg md:text-xl">
                        Suspense… révélation des gagnants dans <strong>{preCountdown}s</strong> 🍀
                    </p>
                )}

                {(phase === 'revealing' || phase === 'revealed') && revealedWinners.length > 0 && (
                    /!*<ul className="flex flex-col-reverse gap-3 mt-8">
                        {revealedWinners.map(w => (
                            <li key={w.rank} className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-mono text-lg">
                                #{w.rank} – {w.name} – Ticket {w.ticket}
                            </li>
                        ))}
                    </ul>*!/
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center mt-8 flex flex-col-reverse">
                        {revealedWinners.map(w => (
                            <li key={w.rank} className="flex flex-col items-center">
                                <TicketCard ticketNumber={parseInt(w.ticket)} />
                                <p className="mt-2 text-gray-800 font-semibold">
                                    #{w.rank} – {w.name}
                                </p>
                            </li>
                        ))}
                    </ul>

                )}

                {phase === 'revealed' && <p className="text-gray-700 text-lg md:text-xl mt-4">🏆 Tous les gagnants ont été révélés !</p>}

                {!drawDate && mounted && <p className="text-gray-700 text-lg md:text-xl">⏳ En attente de la date du tirage...</p>}

            </div>
        </main>
    );
}
*/




"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import TicketCard from "@/app/components/TicketCard";
import { useWindowSize } from "react-use";

interface Winner {
    name: string;
    ticket: string;
    rank: number;
}

export default function ResultatPage() {
    const { width, height } = useWindowSize();
    const [mounted, setMounted] = useState(false);
    const [drawDate, setDrawDate] = useState<Date | null>(null);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const [phase, setPhase] = useState<'countdown' | 'suspense' | 'revealing' | 'revealed'>('countdown');
    const [preCountdown, setPreCountdown] = useState<number>(10);
    const [revealedWinners, setRevealedWinners] = useState<Winner[]>([]);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const res = await fetch("/api/resultat");
            const data = await res.json();
            if (data.success) {
                setDrawDate(data.drawDate ? new Date(data.drawDate) : null);
                setWinners(data.winners || []);
            }
        };
        fetchData();
    }, []);




    // Compte à rebours jusqu'au tirage
    useEffect(() => {
        if (!drawDate) return;
        const interval = setInterval(() => {
            const diff = Math.floor((drawDate.getTime() - Date.now()) / 1000);
            setTimeLeft(diff > 0 ? diff : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, [drawDate]);

    // Quand le tirage est atteint, démarrer suspense
    useEffect(() => {
        if (timeLeft === 0 && winners.length == 7 && phase === 'countdown') {
            setPhase('suspense');
            setPreCountdown(10);
        }
    }, [timeLeft, winners, phase]);

    // Compte à rebours suspense 10s
    useEffect(() => {
        if (phase !== 'suspense') return;
        if (preCountdown === 0) {
            setPhase('revealing');
            setRevealedWinners([]);
            return;
        }
        const timer = setTimeout(() => setPreCountdown(preCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [preCountdown, phase]);

    // Révélation un par un
    useEffect(() => {
        if (phase !== 'revealing') return;
        const sorted = [...winners].sort((a, b) => a.rank - b.rank).reverse(); // 5 → 1
        if (revealedWinners.length >= sorted.length) {
            setPhase('revealed');
            return;
        }
        const timer = setTimeout(() => {
            setRevealedWinners(sorted.slice(0, revealedWinners.length + 1));
        }, 2000);
        return () => clearTimeout(timer);
    }, [revealedWinners, phase, winners]);


    const formatTime = (s: number) => {
        const d = Math.floor(s / (60 * 60 * 24));
        const h = Math.floor((s % (60 * 60 * 24)) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${d}j ${h}h ${m}m ${sec}s`;
    };



    if (!mounted) return null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-hidden">
            {(phase === 'revealing' || phase === 'revealed') && (
                <Confetti width={width} height={height} recycle={true} numberOfPieces={300} />
            )}

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    🎉 Résultat de la Tombola
                </h1>

                {phase === 'revealed' && <p className="text-gray-700 text-xl md:text-xl mt-4">🏆 Tous les gagnants ont été révélés !</p>}

                {drawDate && phase === 'countdown' && (
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
                            ⏳ Tirage prévu dans <strong>{formatTime(timeLeft)}</strong>
                        </p>
                    </div>

                )}

                {phase === 'suspense' && (
                    <p className="text-gray-700 text-lg md:text-xl">
                        Suspense… révélation des gagnants dans <strong>{preCountdown}s</strong> 🍀
                    </p>
                )}

                {(phase === 'revealing' || phase === 'revealed') && revealedWinners.length > 0 && (
                    <ul className="flex flex-col-reverse gap-3 mt-8">
                        {revealedWinners.map(w => (
                            <li key={w.rank} className="px-6 py-3 rounded-lg font-mono text-lg flex flex-col items-center">
                                <TicketCard ticketNumber={parseInt(w.ticket)} />
                                <p className="mt-2 text-gray-800 font-semibold">
                                    #{w.rank} – {w.name}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}


                {!drawDate && mounted && <p className="text-gray-700 text-lg md:text-xl">⏳ En attente de la date du tirage...</p>}

            </div>
        </main>
    );
}

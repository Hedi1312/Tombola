"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import TicketCard from "@/app/components/TicketCard";
import { useWindowSize } from "react-use";
import { HiOutlineBellAlert } from "react-icons/hi2";
import NotificationsForm from "@/app/components/NotificationsForm";

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
    const [preCountdown, setPreCountdown] = useState<number>(5);    //Temps du compte à rebours
    const [revealedWinners, setRevealedWinners] = useState<Winner[]>([]);
    const [notifyOpen, setNotifyOpen] = useState(false);

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


    // Bloquer le scroll derrière le modal
    useEffect(() => {
        if (notifyOpen) {
            document.body.style.overflow = "hidden"; // bloque le scroll
        } else {
            document.body.style.overflow = "auto";   // réactive le scroll
        }

        return () => {
            document.body.style.overflow = "auto"; // nettoyage au cas où
        };
    }, [notifyOpen]);

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
        if (timeLeft === 0 && winners.length >0 && phase === 'countdown') {
            setPhase('suspense');
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

    // Révélation un par un du dernier au premier
    useEffect(() => {
        if (phase !== 'revealing') return;
        const sorted = [...winners].sort((a, b) => a.rank - b.rank).reverse();
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
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-hidden">
            {(phase === 'revealing' || phase === 'revealed') && (
                <Confetti width={width} height={height} recycle={true} numberOfPieces={300} />
            )}

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                    🎉 Résultat de la Tombola
                </h1>


                <div className="mt-5 mb-8">
                    <button
                        onClick={() => setNotifyOpen(true)}
                        className="text-4xl text-yellow-500 hover:text-yellow-600 transition cursor-pointer"
                        aria-label="Notifications"
                    >
                        <HiOutlineBellAlert />
                    </button>
                    <p className="text-sm text-gray-600 mt-1 text-center">
                        🔔 Cliquez sur la cloche pour recevoir un mail après le tirage
                    </p>
                </div>

                {notifyOpen && <NotificationsForm onClose={() => setNotifyOpen(false)} />}



                {phase === 'revealing' && revealedWinners.length < winners.length && (
                    <p className="text-gray-700 text-lg md:text-xl mt-4">
                        ⏳ En attente du tirage de tous les gagnants...
                    </p>
                )}

                {phase === 'revealed' && (
                    <p className="text-gray-700 text-xl md:text-xl mt-4">
                        🏆 Tous les gagnants ont été révélés !
                    </p>
                )}

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
                        {revealedWinners.map((w,index) => (
                            <li key={w.rank} className="px-6 py-3 rounded-lg font-mono text-lg flex flex-col items-center">
                                <TicketCard ticketNumber={w.ticket} />
                                <p className="mt-2 text-gray-800 font-semibold">
                                    #{w.rank} – {w.name}
                                </p>
                                {/* Séparateur sauf pour le premier élément (en haut, donc index === 0) */}
                                {index !== 0 && (
                                    <hr className="w-full my-4 border-t-2 border-dashed border-gray-300" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {!drawDate && mounted && <p className="text-gray-700 text-lg md:text-xl">⏳ En attente de la date du tirage...</p>}

            </div>
        </section>
    );
}

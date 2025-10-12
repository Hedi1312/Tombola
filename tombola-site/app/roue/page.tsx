"use client";

import { useEffect, useRef, useState } from "react";
import { Save, LoaderPinwheel } from "lucide-react";
import Image from "next/image";

export default function RouePage() {
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [messageModal, setMessageModal] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState(false);
    const [winProbability, setWinProbability] = useState(0.3); // par défaut 30% si l'API ne répond pas



    const radius = 170; // roue fixe 340px
    const center = radius;

    const tipRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastBoundaryRef = useRef<number>(0);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);

    // Ref pour bloquer les gains consécutifs
    const lastWasWinRef = useRef(false);

    // Récupérer dynamiquement le taux de victoire
    useEffect(() => {
        async function fetchProbability() {
            try {
                const res = await fetch("/api/admin/roue-probabilite");
                const data = await res.json();
                if (data.success && typeof data.value === "number") {
                    setWinProbability(data.value); // data.value est déjà un décimal ex: 0.25
                }
            } catch {
                console.warn("Impossible de charger winProbability, valeur par défaut utilisée.");
            }
        }
        fetchProbability();
    }, []);


    // Précharge le son
    useEffect(() => {
        const loadSound = async () => {
            try {
                const ctx = new AudioContext();
                audioCtxRef.current = ctx;
                const res = await fetch("/sounds/clic.mp3");
                const arrayBuffer = await res.arrayBuffer();
                const buffer = await ctx.decodeAudioData(arrayBuffer);
                bufferRef.current = buffer;
            } catch (e) {
                console.warn("Erreur chargement son :", e);
            }
        };
        loadSound();
    }, []);

    useEffect(() => {
        let scrollY = 0;

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
        };

        if (spinning || showResult || showFormModal) {
            scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";

            document.addEventListener("touchmove", handleTouchMove, { passive: false });
        } else {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.overflow = "";
            window.scrollTo(0, scrollY);

            document.removeEventListener("touchmove", handleTouchMove);
        }

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.overflow = "";
            document.removeEventListener("touchmove", handleTouchMove);
            window.scrollTo(0, scrollY);
        };
    }, [spinning, showResult, showFormModal]);




    const playTickSound = () => {
        const ctx = audioCtxRef.current;
        const buffer = bufferRef.current;
        if (!ctx || !buffer) return;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.25;
        source.connect(gainNode).connect(ctx.destination);
        source.start();
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);


    const segments = [
        { label: "Gagné", color: "#10b981", isWinner: true },
        { label: "Perdu", color: "#f472b6", isWinner: false },
        { label: "Perdu", color: "#fbbf24", isWinner: false },
        { label: "Perdu", color: "#60a5fa", isWinner: false },
        { label: "Gagné", color: "#10b981", isWinner: true },
        { label: "Perdu", color: "#f87171", isWinner: false },
        { label: "Perdu", color: "#a78bfa", isWinner: false },
        { label: "Perdu", color: "#e77a0c", isWinner: false },
    ];

    const createSegment = (index: number, total: number) => {
        const angle = (360 / total) * index;
        const nextAngle = (360 / total) * (index + 1);
        const x1 = center + radius * Math.cos((angle * Math.PI) / 180);
        const y1 = center + radius * Math.sin((angle * Math.PI) / 180);
        const x2 = center + radius * Math.cos((nextAngle * Math.PI) / 180);
        const y2 = center + radius * Math.sin((nextAngle * Math.PI) / 180);
        return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    };

    const animateTipWithGlow = () => {
        if (!tipRef.current) return;
        const amplitude = 5;
        tipRef.current.animate(
            [
                { transform: `translate(-50%, 0) translateX(${amplitude}px)`, boxShadow: "0 0 0px 0px rgba(255,255,255,0)" },
                { transform: `translate(-50%, 0) translateX(${-amplitude}px)`, boxShadow: "0 0 12px 4px rgba(255,255,255,0.9)" },
                { transform: `translate(-50%, 0) translateX(0px)`, boxShadow: "0 0 0px 0px rgba(255,255,255,0)" },
            ],
            { duration: 140, easing: "ease-out", iterations: 1 }
        );
    };

    // 1x/jour
    const hasPlayedToday = () => {
        const lastPlay = localStorage.getItem("wheelLastPlay");
        return lastPlay === new Date().toDateString();
    };
    const setPlayedToday = () => {
        localStorage.setItem("wheelLastPlay", new Date().toDateString());
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingButton(true);
        setMessage(null);
        setMessageModal(null);

        // Vérification du nom complet : pas de chiffres
        const nameHasNumbers = /\d/.test(fullName);
        if (nameHasNumbers) {
            setMessageModal("❌ Le nom complet ne doit pas contenir de chiffres.");
            setLoadingButton(false);
            return;
        }

        try {
            const res = await fetch("/api/roue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, email }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`✅ Ticket généré ! Vous allez recevoir très prochainement votre ticket par mail à ${email}`);
                setShowFormModal(false);
                setShowResult(false);
            } else {
                setMessageModal(`❌ Erreur: ${data.error}`);

            }
        } catch (err) {
            setMessage(`❌ Erreur serveur : `+ err);
        }
        setLoadingButton(false);
    };

    const spinWheel = () => {
        if (spinning) return;
        if (hasPlayedToday()) {
            setMessage("❌ Vous avez déjà joué aujourd'hui. Revenez demain !");
            setTimeout(() => setMessage(""), 5000);
            return;
        }
        setSpinning(true);
        setShowResult(false);

        const totalSegments = segments.length;
        const segmentAngle = 360 / totalSegments;

        // Gestion gain consécutif
        let willWin = false;
        if (lastWasWinRef.current) {
            willWin = false; // pas de double gain
        } else {
            willWin = Math.random() < winProbability;
        }

        const winners = segments.map((s, i) => (s.isWinner ? i : -1)).filter(i => i >= 0);
        const losers = segments.map((s, i) => (!s.isWinner ? i : -1)).filter(i => i >= 0);

        const targetIndex = willWin
            ? winners[Math.floor(Math.random() * winners.length)]
            : losers[Math.floor(Math.random() * losers.length)];

        const targetSegment = segments[targetIndex];
        setIsWin(targetSegment.isWinner);

        const centerAngle = targetIndex * segmentAngle + segmentAngle / 2;
        const POINTER_ANGLE = 270;

        const startRotation = rotation;
        const startNormalized = ((startRotation % 360) + 360) % 360;
        const offset = (POINTER_ANGLE - ((centerAngle + startNormalized) % 360) + 360) % 360;

        const extraRotations = 7 * 360;
        const finalRotation = startRotation + extraRotations + offset;
        const duration = 8000;
        const startTime = performance.now();
        lastBoundaryRef.current = Math.floor(startRotation / segmentAngle);

        playTickSound();

        const step = (now: number) => {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            const eased = easeOutCubic(t);
            const current = startRotation + (finalRotation - startRotation) * eased;
            setRotation(current);

            const prevBoundary = lastBoundaryRef.current;
            const currentBoundary = Math.floor(current / segmentAngle);
            if (currentBoundary > prevBoundary) {
                const crossed = currentBoundary - prevBoundary;
                for (let i = 0; i < crossed; i++) {
                    playTickSound();
                    animateTipWithGlow();
                }
                lastBoundaryRef.current = currentBoundary;
            }

            if (t < 1) {
                animationFrameRef.current = requestAnimationFrame(step);
            } else {
                setRotation(finalRotation);
                setSpinning(false);
                setResult(targetSegment.label);
                setShowResult(true);
                setPlayedToday();
                lastWasWinRef.current = targetSegment.isWinner;
            }
        };
        animationFrameRef.current = requestAnimationFrame(step);
    };

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-visible">
            <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-8 mx-auto mb-12 text-gray-700 flex flex-col items-center">
                <div className="flex items-center justify-center space-x-6 mb-10">
                    <LoaderPinwheel className="h-10 w-10 text-red-800" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                        Roue de la chance
                    </h1>
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Image src="/img/ticket/ticket.png" alt="Ticket" width={80} height={80} />
                    <p className="text-lg text-gray-600 text-center my-10">
                        Tentez de gagner gratuitement un <span className="font-bold">ticket pour la tombola</span> !
                    </p>
                </div>

                {message && (
                    <div
                        className={`p-3 rounded-lg mb-10 text-center text-base ${
                            message.startsWith("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <div className="relative w-[340px] h-[340px] mb-20 mt-10">
                    {/* Pointeur */}
                    <div className="absolute top-[-35px] left-1/2 -translate-x-1/2 flex items-start justify-center z-10" style={{ width: "6px", height: "90px", pointerEvents: "none" }}>
                        <div style={{ width: 6, height: 50, background: "#dc2626", borderRadius: 6, position: "relative", left: "50%", transform: "translateX(-50%)" }} />
                        <div ref={tipRef} style={{ position: "absolute", top: 36, left: "50%", width: 18, height: 18, borderRadius: "50%", background: "#fff", border: "3px solid #dc2626", transform: "translate(-50%, 0)", boxShadow: "0 0 0px 0px rgba(255,255,255,0)" }} />
                    </div>

                    {/* Roue */}
                    <svg width={radius * 2} height={radius * 2} className="cursor-pointer shadow-lg rounded-full z-0" onClick={spinWheel} style={{ transform: `rotate(${rotation}deg)` }}>
                        {segments.map((seg, i) => {
                            const segmentAngle = 360 / segments.length;
                            const angle = segmentAngle * i + segmentAngle / 2;
                            const textRadius = radius * 0.65;
                            const x = center + textRadius * Math.cos((angle * Math.PI) / 180);
                            const y = center + textRadius * Math.sin((angle * Math.PI) / 180);
                            return (
                                <g key={i}>
                                    <path d={createSegment(i, segments.length)} fill={seg.color} stroke="#fff" strokeWidth={2} />
                                    <text x={x} y={y} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${angle}, ${x}, ${y})`}>
                                        {seg.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Bouton central SPIN */}
                    <div className="absolute top-1/2 left-1/2 cursor-pointer select-none" onClick={spinWheel} style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)`, transition: spinning ? "none" : "transform 0.3s ease-out" }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-lg border-4 border-purple-200" style={{ background: "radial-gradient(circle at 30% 30%, #ff4d94, #a855f7 60%, #6d28d9)", boxShadow: "0 0 20px rgba(168,85,247,0.8), inset 0 0 10px rgba(255,255,255,0.5)", textShadow: "0 0 10px rgba(255,255,255,0.8)" }}>SPIN</div>
                    </div>
                </div>

                {/* Modal résultat */}
                {showResult && result && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/40">
                        <div className="bg-white w-full max-w-md sm:max-w-lg px-8 py-8 rounded-3xl shadow-2xl border border-purple-200 text-center animate-zoom-in relative">
                            <h2 className={`text-3xl sm:text-4xl font-bold ${isWin ? "text-green-500" : "text-red-500"}`}>{result}</h2>
                            <p className="text-lg sm:text-xl text-gray-700 mt-4">{isWin ? "Bravo ! Vous avez gagné 🎉" : "Dommage… Réessayez demain !"}</p>
                            {isWin && <button onClick={() => setShowFormModal(true)} className="mt-6 px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition cursor-pointer">Récupérer mon ticket</button>}
                            {!isWin && <button onClick={() => setShowResult(false)} className="mt-6 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition cursor-pointer">Fermer</button>}
                        </div>
                    </div>
                )}

                {/* Modal formulaire */}
                {showFormModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/40">
                        <form
                            onSubmit={handleSubmitForm}
                            className="bg-white w-full max-w-md px-8 py-8 rounded-3xl shadow-2xl border border-purple-200 text-center animate-zoom-in relative"
                        >
                            <h2 className="text-2xl font-bold mb-8">Entrez vos informations</h2>

                            {messageModal && (
                                <div
                                    className={`p-3 rounded-lg mb-10 text-center text-base ${
                                        messageModal.startsWith("✅")
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {messageModal}
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="Nom complet"
                                value={fullName}
                                required
                                onChange={e => setFullName(e.target.value)}
                                className="w-full mb-4 px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="email"
                                placeholder="Adresse mail"
                                value={email}
                                required
                                onChange={e => setEmail(e.target.value)}
                                className="w-full mb-4 px-4 py-2 border rounded-lg"
                            />
                            <button
                                type="submit"
                                disabled={loadingButton}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition disabled:opacity-50 cursor-pointer"
                            >
                                <Save size={18} />
                                {loadingButton ? "Enregistrement..." : "Enregistrer"}
                            </button>
                        </form>
                    </div>

                )}


            </div>

            <style jsx>{`
        @keyframes zoom-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </section>
    );
}

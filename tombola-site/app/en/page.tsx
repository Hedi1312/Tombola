"use client";
import { useState } from "react";
import Link from "next/link";


export default function Home() {
    const [expanded, setExpanded] = useState(false);

    return (
        <main className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            {/* Conteneur principal en ligne */}
            <div className="flex flex-col md:flex-row gap-6 max-w-6xl w-full">
                {/* Bloc tombola plus petit et hauteur automatique */}
                <div className="md:w-2/5 bg-white rounded-2xl shadow-md p-8 text-center text-gray-700 self-start">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                        🎟️ Tombola
                    </h1>
                    <p className="text-base md:text-lg mb-6">
                        Participate in our tombola to support our school project.<br /> <br />
                        A great prize to win and a good cause at the same time !<br />
                    </p>
                    <Link href="/en/buy">
                        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition cursor-pointer">
                            Buy a ticket
                        </button>
                    </Link>
                </div>

                {/* Bloc présentation centré */}
                <div className="flex-1 bg-white rounded-2xl shadow-md p-8 text-gray-700 flex flex-col justify-center items-center text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                        Presentation
                    </h1>
                    <p
                        className={`text-base md:text-lg leading-relaxed transition-all duration-300 ${
                            expanded ? "" : "line-clamp-5"
                        }`}
                    >
                        <br />
                        We are 3 students: Ménissa 🤍, Manon 🫶🏻 and Sarah ✌🏼. We are studying Early Childhood Education at the Saint-Honoré training center and have the opportunity to go on a 5-day educational trip in March 2026.<br /><br />
                        During this trip, we have created a project to meet different social professionals abroad, to discover a new culture and new professional practices.<br /><br />
                        We are also interested in meeting young people in difficult situations (or not), and we have focused on visiting a shelter located in Rabat, Morocco.<br /><br />
                        This facility provides a refuge for young people in difficulty and therapeutic stays in natural environments such as the desert, mountains, and sea.<br /><br />
                        Whatever the amount, we sincerely invite you to participate in this fundraising to help finance our project.<br /><br />
                        All unused money will be donated to the association.<br /><br />
                        If you cannot participate financially, a simple share can greatly help us.<br /><br />
                        Thank you so much 🫱🏻‍🫲🏾<br />
                        Ménissa, Manon and Sarah ! 🥰
                    </p>

                    {/* Bouton Lire plus / Réduire */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-4 text-blue-600 font-semibold hover:underline"
                    >
                        {expanded ? "Collapse" : "Read more"}
                    </button>
                </div>
            </div>
        </main>
    );
}

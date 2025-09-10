"use client";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-800">
                    🎟️ Tombola pour le Maroc
                </Link>
                <div className="flex gap-6">
                    <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
                        Accueil
                    </Link>
                    <Link href="/acheter" className="text-gray-700 hover:text-blue-600 transition">
                        Acheter
                    </Link>
                    <Link href="/mes-tickets/1" className="text-gray-700 hover:text-blue-600 transition">
                        Mes tickets
                    </Link>
                    <Link href="/resultats" className="text-gray-700 hover:text-blue-600 transition">
                        Résultats
                    </Link>
                    <Link href="https://www.tiktok.com/@futureejetrip" className="text-gray-700 hover:text-blue-600 transition">
                        TikTok
                    </Link>
                    <Link href="https://www.cotizup.com/voyage-peda-eje-rabat" className="text-gray-700 hover:text-blue-600 transition">
                        Cagnotte
                    </Link>
                </div>
            </div>
        </nav>
    );
}

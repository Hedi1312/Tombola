"use client";
import { useState } from "react";
import Link from "next/link";
import {FaHome, FaTiktok} from "react-icons/fa";
import Image from "next/image";
import maroc from "../ressources/img/maroc.png";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    // Fonction pour fermer le menu mobile
    const handleLinkClick = () => setIsOpen(false);
    return (
        <nav className="bg-white shadow-md w-full">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    <span>🎟️ Tombola pour le Maroc</span>
                    <Image src={maroc} alt="Maroc" width={24} height={24} />
                </Link>

                {/* Menu desktop */}
                <div className="hidden md:flex gap-6">
                    <Link href="/" className="text-gray-700 hover:text-blue-600 transition"><FaHome size={24} /></Link>
                    <Link href="/acheter" className="text-gray-700 hover:text-blue-600 transition">Acheter</Link>
                    <Link href="/lot-a-gagner" className="text-gray-700 hover:text-blue-600 transition">Lot à gagner</Link>
                    <Link href="/resultat" className="text-gray-700 hover:text-blue-600 transition">Résultat</Link>
                    <Link href="/cagnotte" className="text-gray-700 hover:text-blue-600 transition">Cagnotte</Link>
                    <Link href="/tiktok" className="text-gray-700 hover:text-blue-600 transition"><FaTiktok size={22} /></Link>
                </div>

                {/* Menu mobile toggle */}
                <button
                    className="md:hidden text-gray-800"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? "✖️" : "☰"}
                </button>
            </div>

            {/* Menu mobile */}
            {isOpen && (
                <div className="md:hidden px-6 pb-4 flex flex-col gap-2">
                    <Link href="/" className="text-gray-700" onClick={handleLinkClick}><FaHome size={22} /></Link>
                    <Link href="/acheter" className="text-gray-700" onClick={handleLinkClick}>Acheter</Link>
                    <Link href="/lot-a-gagner" className="text-gray-700" onClick={handleLinkClick}>Lot à gagner</Link>
                    <Link href="/resultat" className="text-gray-700" onClick={handleLinkClick}>Résultat</Link>
                    <Link href="/cagnotte" className="text-gray-700" onClick={handleLinkClick}>Cagnotte</Link>
                    <Link href="/tiktok" className="text-gray-700" onClick={handleLinkClick}><FaTiktok size={22} /></Link>
                </div>
            )}
        </nav>
    );
}



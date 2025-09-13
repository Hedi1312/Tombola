"use client";
import { useState } from "react";
import Link from "next/link";
import { FaHome, FaTiktok } from "react-icons/fa";
import Image from "next/image";
import maroc from "../../ressources/img/maroc.png";
import france from "../../ressources/img/france.png";
import unitedKingdom from "../../ressources/img/unitedKingdom.png";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

export default function NavbarFr() {
    const [isOpen, setIsOpen] = useState(false); // menu mobile
    const [openDropdown, setOpenDropdown] = useState(false); // dropdown desktop
    const { selectedLang, setSelectedLang } = useLanguage();
    const router = useRouter();

    const changeLang = (lang: "fr" | "en") => {
        setOpenDropdown(false);
        setIsOpen(false); // ferme le menu mobile si ouvert
        setSelectedLang(lang);
        router.push(lang === "fr" ? "/fr" : "/en");
    };

    return (
        <nav className="bg-white shadow-md w-full">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/fr" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    <span>🎟️ Marocola</span>
                    <Image src={maroc} alt="Maroc" width={24} height={24} />
                </Link>

                {/* Menu desktop */}
                <div className="hidden md:flex gap-6 items-center">
                    <Link href="/fr" className="text-gray-700 hover:text-blue-600 transition">
                        <FaHome size={24} />
                    </Link>
                    <Link href="/fr/acheter" className="text-gray-700 hover:text-blue-600 transition">Acheter un ticket</Link>
                    <Link href="/fr/lot-a-gagner" className="text-gray-700 hover:text-blue-600 transition">Lot à gagner</Link>
                    <Link href="/fr/resultat" className="text-gray-700 hover:text-blue-600 transition">Résultat</Link>
                    <Link href="/fr/cagnotte" className="text-gray-700 hover:text-blue-600 transition">Cagnotte</Link>
                    <Link href="/fr/tiktok" className="text-gray-700 hover:text-blue-600 transition">
                        <FaTiktok size={22} />
                    </Link>
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition">Admin</Link>


                    {/* Selecteur de langue */}
                    <div className="relative text-gray-700">
                        <button
                            className="flex items-center gap-2 border p-2 rounded cursor-pointer"
                            onClick={() => setOpenDropdown(!openDropdown)}
                        >
                            <Image
                                src={selectedLang === "fr" ? france : unitedKingdom}
                                alt={selectedLang === "fr" ? "France" : "United Kingdom"}
                                width={24}
                                height={24}
                            />
                            <span>{selectedLang === "fr" ? "Français" : "English"}</span>
                        </button>
                        {openDropdown && (
                            <ul className="absolute mt-1 bg-white shadow-md rounded w-full z-10">
                                <li
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => changeLang("en")}
                                >
                                    <Image src={unitedKingdom} alt="United Kingdom" width={24} height={24} />
                                    English
                                </li>
                                <li
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => changeLang("fr")}
                                >
                                    <Image src={france} alt="France" width={24} height={24} />
                                    Français
                                </li>
                            </ul>
                        )}
                    </div>
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
                    <Link href="/fr" className="text-gray-700" onClick={() => setIsOpen(false)}>
                        <FaHome size={22} />
                    </Link>
                    <Link href="/fr/acheter" className="text-gray-700" onClick={() => setIsOpen(false)}>Acheter un ticket</Link>
                    <Link href="/fr/lot-a-gagner" className="text-gray-700" onClick={() => setIsOpen(false)}>Lot à gagner</Link>
                    <Link href="/fr/resultat" className="text-gray-700" onClick={() => setIsOpen(false)}>Résultat</Link>
                    <Link href="/fr/cagnotte" className="text-gray-700" onClick={() => setIsOpen(false)}>Cagnotte</Link>
                    <Link href="/fr/tiktok" className="text-gray-700" onClick={() => setIsOpen(false)}>
                        <FaTiktok size={22} />
                    </Link>
                    <Link href="/admin" className="text-gray-700" onClick={() => setIsOpen(false)}>Admin</Link>


                    {/* Sélecteur langue mobile */}
                    <div className="flex-col gap-2 mt-2 text-gray-700">
                        <button
                            className="flex items-center gap-2 border p-2 rounded cursor-pointer"
                            onClick={() => setOpenDropdown(!openDropdown)}
                        >
                            <Image
                                src={selectedLang === "fr" ? france : unitedKingdom}
                                alt={selectedLang === "fr" ? "France" : "United Kingdom"}
                                width={24}
                                height={24}
                            />
                            <span>{selectedLang === "fr" ? "Français" : "English"}</span>
                        </button>
                        {openDropdown && (
                            <ul className="bg-white shadow-md rounded mt-1">
                                <li
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => changeLang("en")}
                                >
                                    <Image src={unitedKingdom} alt="United Kingdom" width={24} height={24} />
                                    English
                                </li>
                                <li
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => changeLang("fr")}
                                >
                                    <Image src={france} alt="France" width={24} height={24} />
                                    Français
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

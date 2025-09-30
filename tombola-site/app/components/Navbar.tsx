"use client";

import Link from "next/link";
import {FaHome, FaTiktok, FaUserShield, FaDonate, FaGifts, FaShoppingBasket } from "react-icons/fa";
import { MailQuestionMark } from 'lucide-react';
import { GiTrophy } from 'react-icons/gi';
import { FiMenu, FiX } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // ⚡ On est sûr d'être côté client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleAdminClick = () => {
        if (!isMounted) return; // ne rien faire tant que le composant n'est pas monté
        const isAdminLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";
        if (isAdminLoggedIn) {
            router.replace("/admin/dashboard");
        } else {
            router.replace("/admin-login");
        }
    };


    // Fonction pour fermer le menu mobile
    const handleLinkClick = () => setIsOpen(false);
    return (
        <nav className="bg-white shadow-md w-full">
            <div className="max-w-8xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-gray-800">
                    <Image src="/img/ticket/ticket.png" alt="Ticket" width={100} height={100} />
                    <span>Marocola</span>
                    <Image src="/img/ui/maroc.png" alt="Maroc" width={24} height={24} />
                </Link>

                {/* Menu desktop */}
                <div className="hidden md:flex gap-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-700 transition"><FaHome size={32} /></Link>
                    <Link href="/acheter" className="text-gray-600 hover:text-gray-700 transition"><FaShoppingBasket size={30} /></Link>
                    <Link href="/lot-a-gagner" className="text-gray-600 hover:text-gray-700 transition"><FaGifts  size={30} /></Link>
                    <Link href="/resultat" className="text-gray-600 hover:text-gray-700 transition"><GiTrophy  size={30} /></Link>
                    <Link href="/cagnotte" className="text-gray-600 hover:text-gray-700 transition"><FaDonate size={30} /></Link>
                    <Link href="/tiktok" className="text-gray-600 hover:text-gray-700 transition"><FaTiktok size={30} /></Link>
                    <Link href="/contact" className="text-gray-600 hover:text-gray-700 transition"><MailQuestionMark size={32} /></Link>
                    <button
                        onClick={handleAdminClick}
                        className="text-gray-600 hover:text-gray-700 transition font-medium cursor-pointer"
                    ><FaUserShield size={32} /></button>
                </div>

                {/* Menu mobile toggle avec animation */}
                <button
                    className="md:hidden text-gray-800"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                            <motion.span
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.1 }}
                            >
                                <FiX size={32} />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.1 }}
                            >
                                <FiMenu size={32} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

            </div>

            {/* Menu mobile */}
            {isOpen && (
                <div className="md:hidden">
                    {/* Trait séparateur */}
                    <div className="border-t border-gray-700 my-4"></div>

                    <div className="md:hidden px-6 pt-2 pb-6 grid grid-cols-4 gap-8 text-center">
                        <Link href="/" className="text-gray-700" onClick={handleLinkClick}><FaHome size={36} /></Link>
                        <Link href="/acheter" className="text-gray-700" onClick={handleLinkClick}><FaShoppingBasket size={36} /></Link>
                        <Link href="/lot-a-gagner" className="text-gray-700" onClick={handleLinkClick}><FaGifts size={36} /></Link>
                        <Link href="/resultat" className="text-gray-700" onClick={handleLinkClick}><GiTrophy size={36} /></Link>
                        <Link href="/cagnotte" className="text-gray-700" onClick={handleLinkClick}><FaDonate size={36} /></Link>
                        <Link href="/tiktok" className="text-gray-700" onClick={handleLinkClick}><FaTiktok size={36} /></Link>
                        <Link href="/contact" className="text-gray-700" onClick={handleLinkClick}><MailQuestionMark size={38} /></Link>
                        <button onClick={() => {handleAdminClick();handleLinkClick();}} className="text-gray-700 text-left"><FaUserShield size={38} /></button>
                    </div>
                </div>
            )}
        </nav>
    );
}



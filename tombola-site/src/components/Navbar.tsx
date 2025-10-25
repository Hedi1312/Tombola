"use client";

import Link from "next/link";
import {FaHome, FaTiktok, FaUserShield, FaMoneyBillWave, FaGifts } from "react-icons/fa";
import { MailQuestionMark, LoaderPinwheel } from 'lucide-react';
import { GiTrophy } from 'react-icons/gi';
import { FiMenu, FiX } from "react-icons/fi";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [adminHref, setAdminHref] = useState<string | null>(null);


    useEffect(() => {
        const updateAdminHref = () => {
            const isAdmin = sessionStorage.getItem("admin_logged_in") === "true";
            setAdminHref(isAdmin ? "/admin/dashboard" : "/admin-login");
        };

        if (typeof window !== "undefined") {
            updateAdminHref(); // 🔹 fait la lecture initiale
            window.addEventListener("admin-login", updateAdminHref);
            window.addEventListener("admin-logout", updateAdminHref);
        }

        return () => {
            window.removeEventListener("admin-login", updateAdminHref);
            window.removeEventListener("admin-logout", updateAdminHref);
        };
    }, []);




    // Fonction pour fermer le menu mobile
    const handleLinkClick = () => setIsOpen(false);
    return (
        <nav className="bg-white shadow-md w-full">
            <div className="max-w-8xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-4 text-4xl text-gray-800" onClick={handleLinkClick} style={{ fontFamily: 'Norwester'}}>
                    <Image src="/img/ticket/ticket.png" alt="Ticket" width={100} height={100} />
                    <span>MAROCOLA</span>
                    <Image src="/img/ui/maroc.png" alt="Maroc" width={24} height={24} />
                </Link>

                {/* Menu desktop */}
                <div className="hidden md:flex gap-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-700 transition"><FaHome size={32} /></Link>
                    <Link href="/lot-a-gagner" className="text-gray-600 hover:text-gray-700 transition"><FaGifts  size={30} /></Link>
                    <Link href="/resultat" className="text-gray-600 hover:text-gray-700 transition"><GiTrophy  size={30} /></Link>
                    <Link href="/roue" className="text-gray-600 hover:text-gray-700 transition"><LoaderPinwheel  size={30} /></Link>
                    <Link href="/cagnotte" className="text-gray-600 hover:text-gray-700 transition"><FaMoneyBillWave size={30} /></Link>
                    <Link href="/tiktok" className="text-gray-600 hover:text-gray-700 transition"><FaTiktok size={30} /></Link>
                    <Link href="/contact" className="text-gray-600 hover:text-gray-700 transition"><MailQuestionMark size={32} /></Link>
                    {adminHref && (
                        <Link href={adminHref} className="text-gray-600 hover:text-gray-700 transition"><FaUserShield size={32} /></Link>
                    )}

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

                    <div className="md:hidden pt-2 pb-6 grid grid-cols-4 gap-8 justify-items-center">
                        <Link href="/" className="text-gray-700" onClick={handleLinkClick}><FaHome size={36} /></Link>
                        <Link href="/lot-a-gagner" className="text-gray-700" onClick={handleLinkClick}><FaGifts size={36} /></Link>
                        <Link href="/resultat" className="text-gray-700" onClick={handleLinkClick}><GiTrophy size={36} /></Link>
                        <Link href="/roue" className="text-gray-700" onClick={handleLinkClick}><LoaderPinwheel  size={36} /></Link>
                        <Link href="/cagnotte" className="text-gray-700" onClick={handleLinkClick}><FaMoneyBillWave size={36} /></Link>
                        <Link href="/tiktok" className="text-gray-700" onClick={handleLinkClick}><FaTiktok size={36} /></Link>
                        <Link href="/contact" className="text-gray-700" onClick={handleLinkClick}><MailQuestionMark size={38} /></Link>
                        {adminHref && (
                            <Link href={adminHref} className="text-gray-700" onClick={handleLinkClick}><FaUserShield size={38} /></Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}



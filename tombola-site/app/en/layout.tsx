/*
"use client";
import NavbarEn from "./components/NavbarEn";
import FooterEn from "./components/FooterEn";
import { LanguageProvider } from "@/app/context/LanguageContext";

export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <NavbarEn />
                <main className="pt-6">{children}</main>
            <FooterEn />
        </LanguageProvider>

    );
}*/

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";

export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <Navbar />
            <main className="pt-6">{children}</main>
            <Footer />
        </LanguageProvider>

    );
}

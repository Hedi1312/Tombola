/*
"use client";
import NavbarFr from "./components/NavbarFr";
import FooterFr from "./components/FooterFr";
import { LanguageProvider } from "@/app/context/LanguageContext";

export default function FrLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <NavbarFr />
                <main className="pt-6">{children}</main>
            <FooterFr />
        </LanguageProvider>

    );
}*/

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";

export default function FrLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <Navbar />
            <main className="pt-6">{children}</main>
            <Footer />
        </LanguageProvider>
    );
}

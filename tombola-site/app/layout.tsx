// app/layout.tsx
"use client"; // nécessaire pour utiliser les hooks

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Wrapper client pour pouvoir utiliser le hook useLanguage
function HtmlWrapper({ children }: { children: React.ReactNode }) {
    const { selectedLang } = useLanguage();

    return (
        <html lang={selectedLang}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {children}
        <Analytics />
        </body>
        </html>
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <HtmlWrapper>{children}</HtmlWrapper>
        </LanguageProvider>
    );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react"; // 👈 import ajouté

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Tombola pour le Maroc",
    description: "Site de tombola pour notre projet scolaire",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        >
        <Navbar />
        <main className="pt-6">{children}</main> {/* pt-6 pour espacer sous la navbar */}
        <Footer />
        <Analytics />
        </body>
        </html>
    );
}

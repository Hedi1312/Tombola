"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { PRIZES, Prize } from "@/lib/lots";
import { FaGifts } from "react-icons/fa";


export default function LotAGagnerPage() {
    const [selected, setSelected] = useState<Prize | null>(null);

    useEffect(() => {
        if (selected) {
            // Bloquer le scroll
            document.body.style.overflow = "hidden";
        } else {
            // Réactiver le scroll
            document.body.style.overflow = "auto";
        }

        // Nettoyage si le composant se démonte
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [selected]);

    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-hidden">
            <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-8 mx-auto mb-12 text-gray-700">
                {/* Header */}
                <div className="flex items-center justify-center space-x-6 mb-20">
                    <FaGifts className="h-10 w-10 text-red-800" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                        Lots à gagner
                    </h1>
                </div>

                {/* Grille des lots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {PRIZES.map((lot) => (
                        <article
                            key={lot.id}
                            className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                {lot.img ? (
                                    <Image
                                        src={lot.img}
                                        alt={lot.title}
                                        fill
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Pas d&apos;image
                                    </div>
                                )}
                            </div>

                            <div className="p-4 flex flex-col text-gray-700">
                                <h3 className="text-lg font-semibold text-center text-indigo-700">
                                    {lot.title}
                                </h3>
                                <p className="text-md font-bold mt-2 line-clamp-3 mb-2">
                                    {lot.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between text-sm pt-4 border-t">
                                    <span className="italic">Nombre d&apos;éléments</span>
                                    <span className="font-medium">{lot.items.length}</span>
                                </div>

                                <button
                                    onClick={() => setSelected(lot)}
                                    className="mt-4 w-full py-2 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    Voir plus
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-gray-700">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelected(null)}
                    />
                    <div className="relative max-w-xl w-full bg-white rounded-2xl p-6 shadow-2xl z-10 animate-fadeIn">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                            onClick={() => setSelected(null)}
                        >
                            ✕
                        </button>

                        <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-gray-200">
                            {selected.img && (
                                <Image
                                    src={selected.img}
                                    alt={selected.title}
                                    fill
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-indigo-700 text-center">
                            {selected.title}
                        </h2>
                        <p className="text-xl font-bold text-center mt-4">{selected.description}</p>

                        <div className="mt-4 flex flex-col gap-3 text-lg">
                            {selected.items.map((item, idx) => (
                                <div key={idx}>
                                    <span className="mx-3">x{item.quantity}</span>
                                    <span className="border-l border-gray-700 pl-3">{item.name}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelected(null)}
                            className="mt-8 w-full py-2 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

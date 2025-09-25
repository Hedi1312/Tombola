"use client";


import Image from "next/image";
import React, { useState } from "react";
import { PRIZES, Prize } from "@/lib/lots";

export default function LotAAgagnerPage() {
    const [selected, setSelected] = useState<Prize | null>(null);


    return (
        <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-gray-50 relative overflow-hidden">
            <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-6 md:p-10 mx-auto mb-12 text-gray-700">
                {/* Header */}
                <div className="flex justify-center mb-20">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center">
                        🎟️ Lots à gagner
                    </h1>
                </div>


                {/* Liste des lots */}
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

                            <div className="flex-1 p-4 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 text-center">
                                    {lot.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-3 mb-2">
                                    {lot.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                                    <span className="italic">Quantité</span>
                                    <span className="font-medium">x{lot.quantity ?? 1}</span>
                                </div>

                                <button
                                    onClick={() => setSelected(lot)}
                                    className="mt-4 w-full py-2 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelected(null)}
                    />
                    <div className="relative max-w-xl w-full bg-white rounded-2xl p-6 shadow-2xl z-10 animate-fadeIn">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            onClick={() => setSelected(null)}
                        >
                            ✕
                        </button>

                        <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-gray-200">
                            {selected.img ? (
                                <Image
                                    src={selected.img}
                                    alt={selected.title}
                                    fill
                                    className="w-full h-full object-cover"
                                />
                            ) : null}
                        </div>

                        <h2 className="text-2xl font-bold text-indigo-700">
                            {selected.title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">{selected.description}</p>
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                            <div>Quantité: {selected.quantity ?? 1}</div>
                        </div>

                        <button
                            onClick={() => setSelected(null)}
                            className="mt-6 w-full py-2 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

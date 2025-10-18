"use client";
import { useState } from "react";
import Image from "next/image";
import { FileText, LoaderPinwheel } from "lucide-react";
import { FaGifts } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
    const [expanded, setExpanded] = useState({ presentation: false });

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-16 px-4 md:px-6">

            {/* ================== LIGNE 1 ================== */}
            <div className="flex flex-wrap justify-center gap-10 max-w-6xl w-full mb-12">
                {/* Bloc Achat */}
                <div className="w-full md:w-1/2 max-w-[500px] bg-white rounded-2xl shadow-md p-8 text-center text-gray-700 flex-shrink-0 min-h-[350px]">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <Image src="/img/ticket/ticket.png" alt="Ticket" width={80} height={80} />
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Acheter Ticket</h1>
                    </div>
                    <p className="text-base md:text-lg mb-6">
                        Vous pouvez acheter des tickets à 2€ l&apos;unité via notre support/contact par virement ou PayPal.<br /><br />
                        Contactez-nous pour recevoir les informations nécessaires.<br />
                    </p>
                    <Link href="/contact">
                        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition cursor-pointer">
                            Nous contacter
                        </button>
                    </Link>
                </div>

                {/* Bloc Lots */}
                <div className="w-full md:w-1/2 max-w-[500px] bg-white rounded-2xl shadow-md p-8 text-center text-gray-700 flex-shrink-0 min-h-[350px]">
                    <h1 className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold mb-10 mt-0.75 text-gray-800">
                        <FaGifts size={40} className="text-red-800" />
                        Lots
                    </h1>
                    <p className="text-base md:text-lg mb-6">
                        Participez à notre tombola pour soutenir notre projet scolaire.<br /><br />
                        Des supers lots à gagner et une bonne action à la clé !<br />
                    </p>
                    <Link href="/lot-a-gagner">
                        <button className="px-6 py-3 mt-7.5 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition cursor-pointer">
                            Voir les lots
                        </button>
                    </Link>
                </div>
            </div>

            {/* ================== LIGNE 2 ================== */}
            <div className="flex flex-wrap justify-center items-start gap-10 max-w-6xl w-full mb-12">
                {/* Bloc Roue de la chance */}
                <div className="w-full md:w-1/2 max-w-[500px] bg-white rounded-2xl shadow-md p-8 text-center text-gray-700 flex flex-col justify-between min-h-[350px]">
                    <div>
                        <h1 className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold mb-10 mt-1 text-gray-800">
                            <LoaderPinwheel size={40} className="text-red-800" />
                            Roue de la Chance
                        </h1>
                        <p className="text-base md:text-lg mb-6">
                            Une roue de la chance est disponible avec 1 tirage par jour sur le site.
                            Tentez chaque jour votre chance pour obtenir un ticket de tombola gratuitement !
                        </p>
                    </div>
                    <Link href="/roue">
                        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition cursor-pointer">
                            Jouer maintenant
                        </button>
                    </Link>
                </div>

                {/* Bloc Présentation */}
                <div className="w-full md:w-1/2 max-w-[500px] bg-white rounded-2xl shadow-md p-8 text-gray-700 flex flex-col justify-start items-center text-center min-h-[350px]">
                    <h1 className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold mb-3 mt-1 text-gray-800">
                        <FileText size={40} />
                        Présentation
                    </h1>

                    <p
                        className={`text-base md:text-lg leading-relaxed transition-all duration-300 ${
                            expanded.presentation ? "" : "line-clamp-5 overflow-hidden"
                        }`}
                    >
                        <br />
                        Nous sommes 3 étudiantes : Ménissa 🤍, Manon 🫶🏻 et Sarah ✌🏼. Nous effectuons des études d&apos;éducatrice de jeunes enfants au centre de formation Saint-Honoré et nous avons l&apos;opportunité d&apos;effectuer un voyage pédagogique de 5 jours en mars 2026.<br /><br />
                        A cette occasion, nous avons monté un projet pour rencontrer différents professionnels du domaine social à l&apos;étranger afin de découvrir une nouvelle culture et de nouvelles pratiques professionnelles.<br /><br />
                        Nous sommes également intéressées par la rencontre de jeunes en situation de grande difficulté (ou non), et nous avons porté notre intérêt sur la visite d&apos;un refuge situé à Rabat au Maroc.<br /><br />
                        Cette structure propose un refuge pour les jeunes en difficulté et des séjours thérapeutiques dans des environnements naturels tels que le désert, la montagne et la mer.<br /><br />
                        ✨ <strong>Pour financer le projet</strong>, nous avons décidé d&apos;organiser une <strong>tombola</strong>.
                        Vous pouvez soutenir notre démarche en <strong>achetant des tickets</strong> ou en contribuant directement à la <strong>cagnotte</strong>.<br/> <br/>
                        Quel que soit le montant, nous vous invitons sincèrement à participer à cette cagnotte afin de nous aider à financer ce projet.<br /><br />
                        Tout l&apos;argent non utilisé sera reversé à l&apos;association.<br /><br />
                        Si vous ne pouvez pas participer financièrement, un simple partage peut grandement nous aider.<br /><br />
                        Merci infiniment 🫱🏻‍🫲🏾<br />
                        Ménissa, Manon et Sarah !! 🥰
                    </p>

                    <button
                        onClick={() => setExpanded({ presentation: !expanded.presentation })}
                        className="mt-10 text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                        {expanded.presentation ? "Réduire" : "Lire plus"}
                    </button>
                </div>
            </div>
        </section>
    );
}

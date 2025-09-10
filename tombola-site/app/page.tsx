import Link from "next/link";


export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">

            {/* Conteneur principal en ligne */}
            <div className="flex flex-col md:flex-row gap-6 max-w-6xl w-full">

                {/* Bloc présentation centré */}
                <div className="flex-1 bg-white rounded-2xl shadow-md p-8 text-gray-700 flex flex-col justify-center items-center text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                        Présentation
                    </h1>
                    <p className="text-base md:text-lg leading-relaxed">
                       <br />
                        Nous sommes 3 étudiantes : Ménissa 🤍, Manon 🫶🏻 et Sarah ✌🏼. Nous effectuons des études d&apos;éducatrice de jeunes enfants au centre de formation Saint-Honoré et nous avons l&apos;opportunité d&apos;effectuer un voyage pédagogique de 5 jours en mars 2026.<br /><br />
                        A cette occasion, nous avons monté un projet pour rencontrer différents professionnels du domaine social à l&apos;étranger afin de découvrir une nouvelle culture et de nouvelles pratiques professionnelles.<br /><br />
                        Nous sommes également intéressées par la rencontre de jeunes en situation de grande difficulté (ou non), et nous avons porté notre intérêt sur la visite d&apos;un refuge situé à Rabat au Maroc.<br /><br />
                        Cette structure propose un refuge pour les jeunes en difficulté et des séjours thérapeutiques dans des environnements naturels tels que le désert, la montagne et la mer.<br /><br />
                        Quel que soit le montant, nous vous invitons sincèrement à participer à cette cagnotte afin de nous aider à financer ce projet.<br /><br />
                        Tout l&apos;argent non utilisé sera reversé à l&apos;association.<br /><br />
                        Si vous ne pouvez pas participer financièrement, un simple partage peut grandement nous aider.<br /><br />
                        Merci infiniment 🫱🏻‍🫲🏾<br />
                        Ménissa, Manon et Sarah !! 🥰
                    </p>
                </div>

                {/* Bloc tombola plus petit et hauteur automatique */}
                <div className="md:w-2/5 bg-white rounded-2xl shadow-md p-8 text-center text-gray-700 self-start">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                        🎟️ Tombola
                    </h1>
                    <p className="text-base md:text-lg mb-6">
                        Participez à notre tombola pour soutenir notre projet scolaire.<br />
                        De super lots à gagner et une bonne action à la clé !
                    </p>
                    <Link href="/acheter">
                        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
                            Acheter un ticket
                        </button>
                    </Link>
                </div>

            </div>
        </main>
    );
}

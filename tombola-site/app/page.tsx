import Link from "next/link";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-md p-8 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">
                    🎟️ Tombola
                </h1>
                <p className="text-lg mb-6 text-gray-700">
                    Participez à notre tombola pour soutenir notre projet scolaire.<br />
                    De super lots à gagner et une bonne action à la clé !
                </p>
                <Link href="/acheter">
                    <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
                        Acheter un ticket
                    </button>
                </Link>
            </div>
        </main>
    );
}



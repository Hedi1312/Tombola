export default function ResultatPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex flex-col items-center justify-start pt-16 px-4 md:px-6">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800">
                    🎁 Résultat de la tombola
                </h1>

                <p className="text-gray-700 text-lg md:text-xl mb-6">
                    Le tirage au sort n'a pas encore été fait.
                </p>

                <div className="flex justify-center gap-4 text-3xl md:text-4xl">
                    <span>✨</span>
                    <span>🎉</span>
                    <span>🎟️</span>
                </div>
            </div>
        </main>
    );
}

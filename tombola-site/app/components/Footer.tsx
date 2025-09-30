import { FaTiktok, FaDonate } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gray-100 text-gray-600 py-6 mt-10 text-center">
            <div className="flex justify-center gap-4 mb-1">
                <a
                    href="/tiktok"
                    className="hover:text-black"
                >
                    <FaTiktok size={20} />
                </a>

                <p className="text-sm">
                    © 2025 Marocola. Tous droits réservés.
                </p>

                <a
                    href="/cagnotte"
                    className="hover:text-black"
                >
                    <FaDonate size={20} />
                </a>
            </div>
        </footer>
    );
}

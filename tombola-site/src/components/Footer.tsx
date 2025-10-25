import { FaTiktok, FaMoneyBillWave } from "react-icons/fa";

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
                    © {new Date().getFullYear()}{" "} Marocola. Tous droits réservés.
                </p>

                <a
                    href="/cagnotte"
                    className="hover:text-black"
                >
                    <FaMoneyBillWave size={20} />
                </a>
            </div>
        </footer>
    );
}

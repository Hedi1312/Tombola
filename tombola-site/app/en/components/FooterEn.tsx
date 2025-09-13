import { FaTiktok } from "react-icons/fa";

export default function FooterEn() {
    return (
        <footer className="bg-gray-100 text-gray-600 py-6 mt-12 text-center">
            <div className="flex justify-center gap-6 mb-2">
                <a
                    href="/en/tiktok"
                    className="hover:text-black"
                >
                    <FaTiktok size={24} />
                </a>


            <p className="text-sm">
                © 2025 Marocola. All rights reserved.
            </p>
            </div>
        </footer>
    );
}

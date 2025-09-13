// app/context/LanguageContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type Language = "fr" | "en";

interface LanguageContextProps {
    selectedLang: Language;
    setSelectedLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [selectedLang, setSelectedLangState] = useState<Language>("fr");

    const setSelectedLang = (lang: Language) => {
        setSelectedLangState(lang);
        // redirige automatiquement vers la bonne page racine
        router.push(lang === "fr" ? "/fr" : "/en");
    };

    return (
        <LanguageContext.Provider value={{ selectedLang, setSelectedLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
};

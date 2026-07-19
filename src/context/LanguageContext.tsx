// src/context/LanguageContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, t as translate } from '../i18n/translations';

interface LanguageContextValue {
    language: Language;
    isEnglish: boolean;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string, fallback?: string) => string;
}

const STORAGE_KEY = 'ishop_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getInitialLanguage = (): Language => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'km' || saved === 'en') return saved;
    } catch (e) {
        // localStorage មិនអាចប្រើបានទេ (Private mode ។ល។)
    }
    return 'km';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        document.documentElement.setAttribute('lang', language);
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch (e) {
            // មិនអីទេបើរក្សាទុកមិនបាន
        }
    }, [language]);

    const setLanguage = (next: Language) => setLanguageState(next);
    const toggleLanguage = () => setLanguageState((prev) => (prev === 'km' ? 'en' : 'km'));

    const t = (key: string, fallback?: string) => translate(language, key, fallback);

    return (
        <LanguageContext.Provider value={{ language, isEnglish: language === 'en', setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextValue => {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage ត្រូវប្រើនៅក្នុង <LanguageProvider> ប៉ុណ្ណោះ');
    }
    return ctx;
};

export default LanguageContext;

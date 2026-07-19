import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageToggle.css';

interface LanguageToggleProps {
    className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
    const { language, setLanguage } = useLanguage();

    return (
        <div
            className={`lang-toggle ${className}`}
            role="group"
            aria-label="Language switcher / ប្តូរភាសា"
            title="ភាសា / Language"
        >
            <button
                type="button"
                className={`lang-toggle__option ${language === 'km' ? 'lang-toggle__option--active' : ''}`}
                onClick={() => setLanguage('km')}
                aria-pressed={language === 'km'}
            >
                ខ្មែរ
            </button>
            <button
                type="button"
                className={`lang-toggle__option ${language === 'en' ? 'lang-toggle__option--active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageToggle;

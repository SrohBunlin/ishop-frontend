import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Topbar.css';

interface TopbarProps {
    title: string;
    onExportReport: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, onExportReport }) => {
    const { t, language } = useLanguage();
    const today = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="app-topbar">
            <div>
                <h1 className="app-topbar__title">{title}</h1>
                <p className="app-topbar__subtitle">{today}</p>
            </div>
            <div className="app-topbar__actions">
                <button onClick={onExportReport} className="btn btn-primary rounded-pill app-topbar__action">
                    <i className="bi bi-file-earmark-pdf me-2"></i> {t('topbar.exportReport')}
                </button>
            </div>
        </header>
    );
};

export default Topbar;

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`}
            onClick={toggleTheme}
            aria-pressed={isDark}
            title={isDark ? 'ប្តូរទៅរបៀបពន្លឺ' : 'ប្តូរទៅរបៀបងងឹត'}
        >
            <span className="theme-toggle__track">
                <span className="theme-toggle__icon theme-toggle__icon--sun">
                    <i className="bi bi-sun-fill"></i>
                </span>
                <span className="theme-toggle__icon theme-toggle__icon--moon">
                    <i className="bi bi-moon-stars-fill"></i>
                </span>
                <span className="theme-toggle__thumb">
                    <i className={`bi ${isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                </span>
            </span>
        </button>
    );
};

export default ThemeToggle;

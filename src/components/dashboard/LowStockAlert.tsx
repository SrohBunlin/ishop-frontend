import React from 'react';
import { Product } from '../../types/dashboard.types';
import { useLanguage } from '../../context/LanguageContext';

interface LowStockAlertProps {
    products: Product[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
    const { t } = useLanguage();
    const lowStockProducts = products.filter((p) => p.stockQuantity < 5);

    if (lowStockProducts.length === 0) return null;

    return (
        <div className="db-alert">
            <div className="db-alert__icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div>
                <h4 className="db-alert__title">{t('lowStock.warning')} ({lowStockProducts.length})</h4>
                <ul className="db-alert__list">
                    {lowStockProducts.map((p) => (
                        <li className="db-alert__chip" key={p.id}>
                            {p.name} — {t('lowStock.remaining')} <b>{p.stockQuantity}</b> {t('lowStock.units')}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LowStockAlert;

import React from 'react';
import { Product, ReportStats } from '../../types/dashboard.types';
import { useLanguage } from '../../context/LanguageContext';

interface StatsCardsProps {
    products: Product[];
    reportData: ReportStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ products, reportData }) => {
    const { t } = useLanguage();
    const totalItems = products.length;
    const totalValue = products.reduce((acc, curr) => acc + curr.price * curr.stockQuantity, 0);
    const lowStockItems = products.filter((p) => p.stockQuantity < 5).length;

    return (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
            <div className="col">
                <div className="db-stat-card">
                    <div className="db-stat-icon">
                        <i className="bi bi-box-seam-fill"></i>
                    </div>
                    <div className="db-stat-body">
                        <p className="db-stat-label">{t('stats.totalProducts')}</p>
                        <p className="db-stat-value">{totalItems}</p>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="db-stat-card">
                    <div className="db-stat-icon db-stat-icon--success">
                        <i className="bi bi-wallet2"></i>
                    </div>
                    <div className="db-stat-body">
                        <p className="db-stat-label">{t('stats.totalStockValue')}</p>
                        <p className="db-stat-value">${totalValue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="db-stat-card">
                    <div className="db-stat-icon db-stat-icon--danger">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div className="db-stat-body">
                        <p className="db-stat-label">{t('stats.lowStock')}</p>
                        <p className="db-stat-value db-stat-value--danger">{lowStockItems}</p>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="db-stat-card">
                    <div className="db-stat-icon db-stat-icon--warning">
                        <i className="bi bi-receipt"></i>
                    </div>
                    <div className="db-stat-body">
                        <p className="db-stat-label">{t('stats.totalOrders')}</p>
                        <p className="db-stat-value">{reportData.totalOrders} {t('stats.invoices')}</p>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="db-stat-card">
                    <div className="db-stat-icon db-stat-icon--success">
                        <i className="bi bi-graph-up-arrow"></i>
                    </div>
                    <div className="db-stat-body">
                        <p className="db-stat-label">{t('stats.totalRevenue')}</p>
                        <p className="db-stat-value">${reportData.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;

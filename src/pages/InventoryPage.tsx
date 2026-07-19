import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import InventoryTable, { StockFilter } from '../components/products/InventoryTable';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const InventoryPage: React.FC = () => {
    const { t } = useLanguage();
    const { products, fetchProducts } = useProducts();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [stockFilter, setStockFilter] = useState<StockFilter>('all');

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const { totalStockValue, totalUnits, lowStockCount, outOfStockCount } = useMemo(() => {
        let value = 0;
        let units = 0;
        let low = 0;
        let out = 0;
        products.forEach((p) => {
            value += (p.price || 0) * (p.stockQuantity || 0);
            units += p.stockQuantity || 0;
            if (p.stockQuantity === 0) out += 1;
            else if (p.stockQuantity <= 5) low += 1;
        });
        return { totalStockValue: value, totalUnits: units, lowStockCount: low, outOfStockCount: out };
    }, [products]);

    return (
        <DashboardLayout title={t('inventory.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-4 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-boxes"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('inventory.totalUnits')}</p>
                                    <p className="db-stat-value">{totalUnits.toLocaleString()}</p>
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
                                    <p className="db-stat-value">${totalStockValue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('stats.lowStock')}</p>
                                    <p className="db-stat-value">{lowStockCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--danger">
                                    <i className="bi bi-x-octagon-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('products.outOfStock')}</p>
                                    <p className="db-stat-value db-stat-value--danger">{outOfStockCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <LowStockAlert products={products} />

                <div className="dashboard-section">
                    <InventoryTable
                        products={products}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        stockFilter={stockFilter}
                        onStockFilterChange={setStockFilter}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InventoryPage;

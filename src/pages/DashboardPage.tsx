import React, { useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCards from '../components/dashboard/StatsCards';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopProducts from '../components/dashboard/TopProducts';
import ChartsGrid from '../components/dashboard/ChartsGrid';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const DashboardPage: React.FC = () => {
    const { t } = useLanguage();
    const { products, fetchProducts } = useProducts();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();

    useEffect(() => {
        fetchOrders();
        fetchProducts();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    return (
        <DashboardLayout title={t('dashboard.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <StatsCards products={products} reportData={reportData} />
                </div>

                <LowStockAlert products={products} />

                <div className="dashboard-section">
                    <div className="dashboard-section__heading">
                        <h2 className="dashboard-section__title">
                            <i className="bi bi-lightning-charge-fill"></i> {t('dashboard.activityRanking')}
                        </h2>
                    </div>
                    <div className="row g-3">
                        <div className="col-lg-6">
                            <RecentOrders orders={orders} />
                        </div>
                        <div className="col-lg-6">
                            <TopProducts products={products} />
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <div className="dashboard-section__heading">
                        <h2 className="dashboard-section__title">
                            <i className="bi bi-bar-chart-line-fill"></i> {t('dashboard.overview')}
                        </h2>
                    </div>
                    <ChartsGrid products={products} orders={orders} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;

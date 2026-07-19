import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReturnsTable from '../components/returns/ReturnsTable';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const isCancelled = (status: string): boolean => {
    const s = (status || '').toLowerCase();
    return s.includes('cancel') || s.includes('reject') || s.includes('return') || s.includes('refund') || s.includes('failed');
};

const ReturnsPage: React.FC = () => {
    const { t } = useLanguage();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const returns = useMemo(() => orders.filter((order) => isCancelled(order.status)), [orders]);

    const refundAmount = useMemo(
        () => returns.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        [returns]
    );

    return (
        <DashboardLayout title={t('returns.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--danger">
                                    <i className="bi bi-arrow-return-left"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('returns.total')}</p>
                                    <p className="db-stat-value">{returns.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-cash-coin"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('returns.refundAmount')}</p>
                                    <p className="db-stat-value">${refundAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('returns.ordersReviewed')}</p>
                                    <p className="db-stat-value">{orders.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <ReturnsTable returns={returns} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReturnsPage;

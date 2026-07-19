import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import OrdersTable from '../components/orders/OrdersTable';
import RecentOrders from '../components/dashboard/RecentOrders';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const isPending = (status: string): boolean => {
    const s = (status || '').toLowerCase();
    return s.includes('pending') || s.includes('process') || s.includes('wait');
};

const isCancelled = (status: string): boolean => {
    const s = (status || '').toLowerCase();
    return s.includes('cancel') || s.includes('reject') || s.includes('failed');
};

const OrdersPage: React.FC = () => {
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

    const { pendingCount, cancelledCount, completedCount } = useMemo(() => {
        let pending = 0;
        let cancelled = 0;
        orders.forEach((order) => {
            if (isPending(order.status)) pending += 1;
            else if (isCancelled(order.status)) cancelled += 1;
        });
        return {
            pendingCount: pending,
            cancelledCount: cancelled,
            completedCount: orders.length - pending - cancelled,
        };
    }, [orders]);

    return (
        <DashboardLayout title={t('orders.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('stats.totalOrders')}</p>
                                    <p className="db-stat-value">{reportData.totalOrders || orders.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-check-circle"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('orders.completed')}</p>
                                    <p className="db-stat-value">{completedCount}</p>
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
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-hourglass-split"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('orders.pending')}</p>
                                    <p className="db-stat-value">{pendingCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--danger">
                                    <i className="bi bi-x-circle"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('orders.cancelled')}</p>
                                    <p className="db-stat-value db-stat-value--danger">{cancelledCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <RecentOrders orders={orders} />
                </div>

                <div className="dashboard-section">
                    <OrdersTable orders={orders} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrdersPage;

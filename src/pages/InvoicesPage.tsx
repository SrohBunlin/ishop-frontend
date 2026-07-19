import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import InvoicesTable from '../components/invoices/InvoicesTable';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const isPending = (status: string): boolean => {
    const s = (status || '').toLowerCase();
    return s.includes('pending') || s.includes('process') || s.includes('wait');
};

const InvoicesPage: React.FC = () => {
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

    const { unpaidCount, paidAmount } = useMemo(() => {
        let unpaid = 0;
        let paid = 0;
        orders.forEach((order) => {
            if (isPending(order.status)) unpaid += 1;
            else paid += order.total_amount || 0;
        });
        return { unpaidCount: unpaid, paidAmount: paid };
    }, [orders]);

    return (
        <DashboardLayout title={t('invoices.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('invoices.total')}</p>
                                    <p className="db-stat-value">{reportData.totalOrders || orders.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-cash-stack"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('invoices.paidAmount')}</p>
                                    <p className="db-stat-value">${paidAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-hourglass-split"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('invoices.unpaid')}</p>
                                    <p className="db-stat-value">{unpaidCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <InvoicesTable orders={orders} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InvoicesPage;

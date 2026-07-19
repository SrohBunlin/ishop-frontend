import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AddOrderForm from '../components/AddOrderForm';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import { canEditOrderStatus } from '../utils/auth';
import '../styles/dashboard-theme.css';

const RECORDS_PER_PAGE = 10;

const getStatusClass = (status: string): string => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel') || s.includes('reject') || s.includes('failed')) return 'db-status-danger';
    if (s.includes('pending') || s.includes('process') || s.includes('wait')) return 'db-status-warning';
    return 'db-status-success';
};

const OrderTracking: React.FC = () => {
    const { t, language } = useLanguage();
    const { orders, fetchOrders, updateOrderStatus } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const { totalOrders, totalRevenue, pendingOrders } = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter((o) => (o.status || '').toUpperCase() === 'PENDING').length;
        const revenue = orders
            .filter((o) => (o.status || '').toUpperCase() === 'COMPLETED')
            .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        return { totalOrders: total, totalRevenue: revenue, pendingOrders: pending };
    }, [orders]);

    const filteredOrders = orders.filter((order) => {
        const search = (searchTerm || '').toLowerCase();
        const customerName = (order?.customer_name || '').toLowerCase();
        const orderId = (order?.id || '').toString();
        return customerName.includes(search) || orderId.includes(search);
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredOrders, RECORDS_PER_PAGE, searchTerm);

    const handleMarkCompleted = async (orderId: number) => {
        const ok = await updateOrderStatus(orderId, 'COMPLETED');
        if (!ok) alert(t('orderTracking.statusUpdateFail'));
    };

    return (
        <DashboardLayout title={t('orderTracking.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('orderTracking.totalOrders')}</p>
                                    <p className="db-stat-value">{totalOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('orderTracking.revenue')}</p>
                                    <p className="db-stat-value">${totalRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-hourglass-split"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('orderTracking.pendingCount')}</p>
                                    <p className="db-stat-value">{pendingOrders}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <AddOrderForm onOrderAdded={fetchOrders} />
                </div>

                <div className="dashboard-section">
                    <div className="db-panel">
                        <div className="db-panel__header">
                            <p className="db-panel__title">
                                <span className="db-panel__title-icon">
                                    <i className="bi bi-truck"></i>
                                </span>
                                {t('orderTracking.title2')}
                                <span className="db-panel__count">{filteredOrders.length}</span>
                            </p>
                            <div className="db-search">
                                <i className="bi bi-search"></i>
                                <SearchBar value={searchTerm} placeholder={t('orderTracking.searchPlaceholder')} onChange={setSearchTerm} />
                            </div>
                        </div>

                        {currentRecords.length === 0 ? (
                            <div className="db-empty">
                                <i className="bi bi-inbox"></i>
                                <p>{t('orderTracking.emptySearch')}</p>
                            </div>
                        ) : (
                            <div className="db-table-wrap">
                                <table className="db-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">{t('orderTracking.colId')}</th>
                                            <th scope="col">{t('orderTracking.colCustomer')}</th>
                                            <th scope="col">{t('orderTracking.colDate')}</th>
                                            <th scope="col">{t('orderTracking.colAmount')}</th>
                                            <th scope="col">{t('orderTracking.colStatus')}</th>
                                            <th scope="col">{t('orderTracking.colItems')}</th>
                                            <th scope="col">{t('orderTracking.colAction')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRecords.map((order) => (
                                            <tr key={order.id}>
                                                <td className="db-cell-id">#{order.id}</td>
                                                <td className="db-cell-name">{order.customer_name}</td>
                                                <td>
                                                    {order.order_date
                                                        ? new Date(order.order_date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH')
                                                        : t('orderTracking.noData')}
                                                </td>
                                                <td className="db-cell-price">${Number(order.total_amount || 0).toLocaleString()}</td>
                                                <td>
                                                    <span className={`db-pill ${getStatusClass(order.status)}`}>{order.status}</span>
                                                </td>
                                                <td>
                                                    {order.items && order.items.length > 0 ? (
                                                        <ul className="mb-0 ps-3 small">
                                                            {order.items.map((item, idx) => (
                                                                <li key={idx}>
                                                                    {item.product_name} (x{item.quantity})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        t('orderTracking.noData')
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="db-actions">
                                                        {(order.status || '').toUpperCase() === 'PENDING' ? (
                                                            canEditOrderStatus() ? (
                                                                <button className="btn btn-sm btn-success" onClick={() => handleMarkCompleted(order.id)}>
                                                                    <i className="bi bi-check-circle me-1"></i> {t('orderTracking.markCompleted')}
                                                                </button>
                                                            ) : (
                                                                <span className={`db-pill ${getStatusClass(order.status)}`}>{order.status}</span>
                                                            )
                                                        ) : (
                                                            <span className="text-muted small">{t('orderTracking.done')}</span>
                                                        )}
                                                        <Link
                                                            to={`/invoice/${order.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <i className="bi bi-eye"></i> {t('orderTracking.viewInvoice')}
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrderTracking;

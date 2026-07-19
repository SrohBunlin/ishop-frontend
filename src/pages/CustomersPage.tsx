import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CustomersTable from '../components/customers/CustomersTable';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const CustomersPage: React.FC = () => {
    const { t } = useLanguage();
    const { customers, fetchCustomers, deleteCustomer } = useCustomers();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetchCustomers();
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const { activeCount, totalSpent } = useMemo(() => {
        let active = 0;
        let spent = 0;
        customers.forEach((c) => {
            if ((c.status || 'ACTIVE').toUpperCase() === 'ACTIVE') active += 1;
            spent += c.totalSpent || 0;
        });
        return { activeCount: active, totalSpent: spent };
    }, [customers]);

    return (
        <DashboardLayout title={t('customers.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('customers.total')}</p>
                                    <p className="db-stat-value">{customers.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-person-check-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('customers.active')}</p>
                                    <p className="db-stat-value">{activeCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-cash-stack"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('customers.totalSpent')}</p>
                                    <p className="db-stat-value">${totalSpent.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <CustomersTable
                        customers={customers}
                        orders={orders}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onDelete={deleteCustomer}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomersPage;

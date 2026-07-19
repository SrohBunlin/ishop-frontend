import React, { useState } from 'react';
import { Customer, Order } from '../../types/dashboard.types';
import { canDeleteCustomer } from '../../utils/auth';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const RECORDS_PER_PAGE = 10;

const STATUS_CLASS: Record<string, string> = {
    'ACTIVE': 'db-status-success',
    'INACTIVE': 'db-status-warning',
    'BLOCKED': 'db-status-danger',
};

// ស្ថានភាពគណនីជា Enum ថេរ (ACTIVE/INACTIVE/BLOCKED) មិនមែនជា Data សេរីទេ ដូច្នេះអាចប្តូរភាសាបាន
const STATUS_LABEL_KEY: Record<string, string> = {
    'ACTIVE': 'customersTable.statusActive',
    'INACTIVE': 'customersTable.statusInactive',
    'BLOCKED': 'customersTable.statusBlocked',
};

const getOrderStatusClass = (status: string): string => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel') || s.includes('reject') || s.includes('failed')) return 'db-status-danger';
    if (s.includes('pending') || s.includes('process') || s.includes('wait')) return 'db-status-warning';
    return 'db-status-success';
};

interface CustomersTableProps {
    customers: Customer[];
    orders: Order[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onDelete: (id: number) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers, orders, searchQuery, onSearchChange, onDelete }) => {
    const { t, language } = useLanguage();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filteredCustomers = customers.filter((customer) => {
        const searchTermLower = searchQuery.toLowerCase().trim();
        if (!searchTermLower) return true;
        return (
            customer.customerName?.toLowerCase().includes(searchTermLower) ||
            customer.email?.toLowerCase().includes(searchTermLower) ||
            customer.phoneNumber?.toLowerCase().includes(searchTermLower) ||
            customer.id?.toString().includes(searchTermLower)
        );
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredCustomers, RECORDS_PER_PAGE, searchQuery);

    const getCustomerOrders = (customer: Customer): Order[] => {
        const nameLower = customer.customerName?.toLowerCase().trim();
        return orders
            .filter((order) => (
                (order.customerId !== undefined && order.customerId === customer.id) ||
                (order.customerId === undefined && order.customer_name?.toLowerCase().trim() === nameLower)
            ))
            .sort((a, b) => new Date(b.order_date || 0).getTime() - new Date(a.order_date || 0).getTime());
    };

    const toggleExpand = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const totalColumns = 9 + (canDeleteCustomer() ? 1 : 0);

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-people-fill"></i>
                    </span>
                    {t('customersTable.title')}
                    <span className="db-panel__count">{filteredCustomers.length}</span>
                </p>
                <div className="db-search">
                    <i className="bi bi-search"></i>
                    <SearchBar value={searchQuery} placeholder={t('customersTable.searchPlaceholder')} onChange={onSearchChange} />
                </div>
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('customersTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('customersTable.colId')}</th>
                                <th scope="col">{t('customersTable.colName')}</th>
                                <th scope="col">{t('customersTable.colPhone')}</th>
                                <th scope="col">{t('customersTable.colEmail')}</th>
                                <th scope="col">{t('customersTable.colAddress')}</th>
                                <th scope="col">{t('customersTable.colOrders')}</th>
                                <th scope="col">{t('customersTable.colTotalSpent')}</th>
                                <th scope="col">{t('customersTable.colStatus')}</th>
                                <th scope="col">{t('customersTable.colHistory')}</th>
                                {canDeleteCustomer() && <th scope="col">{t('customersTable.colAction')}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((customer) => {
                                const isExpanded = expandedId === customer.id;
                                const customerOrders = isExpanded ? getCustomerOrders(customer) : [];

                                return (
                                    <React.Fragment key={customer.id}>
                                        <tr>
                                            <td className="db-cell-id">#{customer.id}</td>
                                            <td className="db-cell-name">{customer.customerName}</td>
                                            <td>{customer.phoneNumber || t('customersTable.noData')}</td>
                                            <td>{customer.email || t('customersTable.noData')}</td>
                                            <td>{customer.address || t('customersTable.noData')}</td>
                                            <td>{customer.totalOrders ?? 0}</td>
                                            <td className="db-cell-price">${(customer.totalSpent ?? 0).toLocaleString()}</td>
                                            <td>
                                                <span className={`db-pill ${STATUS_CLASS[customer.status || 'ACTIVE'] || 'db-status-success'}`}>
                                                    {t(STATUS_LABEL_KEY[customer.status || 'ACTIVE'], customer.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="db-btn-edit"
                                                    onClick={() => toggleExpand(customer.id)}
                                                >
                                                    <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-clock-history'}`}></i>
                                                    {isExpanded ? ` ${t('customersTable.close')}` : ` ${t('customersTable.viewHistory')}`}
                                                </button>
                                            </td>
                                            {canDeleteCustomer() && (
                                                <td>
                                                    <div className="db-actions">
                                                        <button className="db-btn-delete" onClick={() => onDelete(customer.id)}>
                                                            <i className="bi bi-trash3"></i> {t('customersTable.delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>

                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={totalColumns} style={{ padding: 0, background: 'var(--shop-bg, #f8f9fa)' }}>
                                                    <div style={{ padding: '14px 18px' }}>
                                                        <p className="fw-semibold mb-2" style={{ color: 'var(--shop-primary, #124F9C)' }}>
                                                            <i className="bi bi-bag-check-fill"></i> {t('customersTable.purchaseHistoryOf')} {customer.customerName}
                                                        </p>
                                                        {customerOrders.length === 0 ? (
                                                            <div className="db-empty" style={{ padding: '16px 0' }}>
                                                                <i className="bi bi-inbox"></i>
                                                                <p>{t('customersTable.noOrdersYet')}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="db-table-wrap">
                                                                <table className="db-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th scope="col">{t('customersTable.colOrderId')}</th>
                                                                            <th scope="col">{t('customersTable.colDate')}</th>
                                                                            <th scope="col">{t('customersTable.colStatus')}</th>
                                                                            <th scope="col">{t('customersTable.colTotal')}</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {customerOrders.map((order) => (
                                                                            <tr key={order.id}>
                                                                                <td className="db-cell-id">#{order.id}</td>
                                                                                <td>{order.order_date ? new Date(order.order_date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH') : t('customersTable.noData')}</td>
                                                                                <td>
                                                                                    <span className={`db-pill ${getOrderStatusClass(order.status)}`}>{order.status}</span>
                                                                                </td>
                                                                                <td className="db-cell-price">${order.total_amount?.toLocaleString()}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

export default CustomersTable;

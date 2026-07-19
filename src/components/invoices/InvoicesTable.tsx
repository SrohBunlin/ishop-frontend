import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types/dashboard.types';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const RECORDS_PER_PAGE = 10;

const getStatusClass = (status: string): string => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel') || s.includes('reject') || s.includes('failed')) return 'db-status-danger';
    if (s.includes('pending') || s.includes('process') || s.includes('wait')) return 'db-status-warning';
    return 'db-status-success';
};

interface InvoicesTableProps {
    orders: Order[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ orders, searchTerm, onSearchChange }) => {
    const { t, language } = useLanguage();
    const filteredInvoices = orders.filter((order) => {
        const search = (searchTerm || '').toLowerCase();
        const customerName = (order?.customer_name || '').toLowerCase();
        const invoiceId = (order?.id || '').toString();
        return customerName.includes(search) || invoiceId.includes(search);
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredInvoices, RECORDS_PER_PAGE, searchTerm);

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-receipt"></i>
                    </span>
                    {t('invoicesTable.title')}
                    <span className="db-panel__count">{filteredInvoices.length}</span>
                </p>
                <div className="db-search">
                    <i className="bi bi-search"></i>
                    <SearchBar value={searchTerm} placeholder={t('invoicesTable.searchPlaceholder')} onChange={onSearchChange} />
                </div>
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('invoicesTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('invoicesTable.colId')}</th>
                                <th scope="col">{t('invoicesTable.colCustomer')}</th>
                                <th scope="col">{t('invoicesTable.colDate')}</th>
                                <th scope="col">{t('invoicesTable.colStatus')}</th>
                                <th scope="col">{t('invoicesTable.colTotal')}</th>
                                <th scope="col">{t('invoicesTable.colAction')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((order) => (
                                <tr key={order.id}>
                                    <td className="db-cell-id">#{order.id}</td>
                                    <td className="db-cell-name">{order.customer_name}</td>
                                    <td>{order.order_date ? new Date(order.order_date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH') : t('invoicesTable.noData')}</td>
                                    <td>
                                        <span className={`db-pill ${getStatusClass(order.status)}`}>{order.status}</span>
                                    </td>
                                    <td className="db-cell-price">${order.total_amount?.toLocaleString()}</td>
                                    <td>
                                        <Link to={`/invoice/${order.id}`} className="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">
                                            <i className="bi bi-eye"></i> {t('invoicesTable.view')}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

export default InvoicesTable;

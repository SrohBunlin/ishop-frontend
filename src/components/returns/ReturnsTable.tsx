import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types/dashboard.types';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const RECORDS_PER_PAGE = 10;

interface ReturnsTableProps {
    returns: Order[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const ReturnsTable: React.FC<ReturnsTableProps> = ({ returns, searchTerm, onSearchChange }) => {
    const { t, language } = useLanguage();
    const filteredReturns = returns.filter((order) => {
        const search = (searchTerm || '').toLowerCase();
        const customerName = (order?.customer_name || '').toLowerCase();
        const orderId = (order?.id || '').toString();
        return customerName.includes(search) || orderId.includes(search);
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredReturns, RECORDS_PER_PAGE, searchTerm);

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-arrow-return-left"></i>
                    </span>
                    {t('returnsTable.title')}
                    <span className="db-panel__count">{filteredReturns.length}</span>
                </p>
                <div className="db-search">
                    <i className="bi bi-search"></i>
                    <SearchBar value={searchTerm} placeholder={t('returnsTable.searchPlaceholder')} onChange={onSearchChange} />
                </div>
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{filteredReturns.length === 0 && returns.length === 0 ? t('returnsTable.empty') : t('returnsTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('returnsTable.colId')}</th>
                                <th scope="col">{t('returnsTable.colCustomer')}</th>
                                <th scope="col">{t('returnsTable.colDate')}</th>
                                <th scope="col">{t('returnsTable.colStatus')}</th>
                                <th scope="col">{t('returnsTable.colAmount')}</th>
                                <th scope="col">{t('returnsTable.colAction')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((order) => (
                                <tr key={order.id}>
                                    <td className="db-cell-id">#{order.id}</td>
                                    <td className="db-cell-name">{order.customer_name}</td>
                                    <td>{order.order_date ? new Date(order.order_date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH') : t('returnsTable.noData')}</td>
                                    <td>
                                        <span className="db-pill db-status-danger">{order.status}</span>
                                    </td>
                                    <td className="db-cell-price">${order.total_amount?.toLocaleString()}</td>
                                    <td>
                                        <Link to={`/invoice/${order.id}`} className="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">
                                            <i className="bi bi-eye"></i> {t('returnsTable.view')}
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

export default ReturnsTable;

import React from 'react';
import { Product } from '../../types/dashboard.types';
import { getStockStatus } from '../../utils/stockStatus';
import { LOCAL_PLACEHOLDER } from '../../styles/sharedStyles';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const RECORDS_PER_PAGE = 10;

const STATUS_CLASS: Record<string, string> = {
    outOfStock: 'db-status-danger',
    low: 'db-status-warning',
    inStock: 'db-status-success',
};

export type StockFilter = 'all' | 'inStock' | 'low' | 'outOfStock';

interface InventoryTableProps {
    products: Product[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    stockFilter: StockFilter;
    onStockFilterChange: (value: StockFilter) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ products, searchQuery, onSearchChange, stockFilter, onStockFilterChange }) => {
    const { t } = useLanguage();

    const filteredProducts = products.filter((product) => {
        const status = getStockStatus(product.stockQuantity).key;
        if (stockFilter !== 'all' && status !== stockFilter) return false;
        const searchTermLower = searchQuery.toLowerCase().trim();
        if (!searchTermLower) return true;
        return (
            product.name?.toLowerCase().includes(searchTermLower) ||
            product.sku?.toLowerCase().includes(searchTermLower) ||
            product.id?.toString().includes(searchTermLower)
        );
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredProducts, RECORDS_PER_PAGE, `${searchQuery}-${stockFilter}`);

    const filterTabs: { key: StockFilter; label: string }[] = [
        { key: 'all', label: t('inventory.filterAll') },
        { key: 'inStock', label: t('stock.inStock') },
        { key: 'low', label: t('stock.low') },
        { key: 'outOfStock', label: t('stock.outOfStock') },
    ];

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-clipboard-data"></i>
                    </span>
                    {t('inventoryTable.title')}
                    <span className="db-panel__count">{filteredProducts.length}</span>
                </p>
                <div className="db-search">
                    <i className="bi bi-search"></i>
                    <SearchBar value={searchQuery} placeholder={t('inventoryTable.searchPlaceholder')} onChange={onSearchChange} />
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={`btn btn-sm rounded-pill ${stockFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onStockFilterChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('inventoryTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('inventoryTable.colImage')}</th>
                                <th scope="col">{t('inventoryTable.colId')}</th>
                                <th scope="col">{t('inventoryTable.colName')}</th>
                                <th scope="col">{t('inventoryTable.colSku')}</th>
                                <th scope="col">{t('inventoryTable.colStock')}</th>
                                <th scope="col">{t('inventoryTable.colStockValue')}</th>
                                <th scope="col">{t('inventoryTable.colStatus')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((product) => {
                                const status = getStockStatus(product.stockQuantity);
                                const stockValue = (product.price || 0) * (product.stockQuantity || 0);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <img
                                                src={product.image && product.image !== 'undefined' ? `${API_BASE_URL}${product.image}` : LOCAL_PLACEHOLDER}
                                                alt={product.name}
                                                className="db-thumb"
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = LOCAL_PLACEHOLDER;
                                                }}
                                            />
                                        </td>
                                        <td className="db-cell-id">#{product.id}</td>
                                        <td className="db-cell-name">{product.name}</td>
                                        <td>{product.sku || t('inventoryTable.noData')}</td>
                                        <td>{product.stockQuantity}</td>
                                        <td className="db-cell-price">${stockValue.toLocaleString()}</td>
                                        <td>
                                            <span className={`db-pill ${STATUS_CLASS[status.key] || 'db-status-success'}`}>
                                                {t(`stock.${status.key}`, status.text)}
                                            </span>
                                        </td>
                                    </tr>
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

export default InventoryTable;

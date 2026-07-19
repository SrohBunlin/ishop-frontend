import React from 'react';
import { Product } from '../../types/dashboard.types';
import { getStockStatus } from '../../utils/stockStatus';
import { canManageProducts } from '../../utils/auth';
import { LOCAL_PLACEHOLDER } from '../../styles/sharedStyles';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const RECORDS_PER_PAGE = 10;

// ស្ថានភាពស្តុកគឺជា Label ថេរនៃ UI (មិនមែនជា data ពី server ទេ) ដូច្នេះអាចប្តូរភាសាបាន
const STATUS_CLASS: Record<string, string> = {
    outOfStock: 'db-status-danger',
    low: 'db-status-warning',
    inStock: 'db-status-success',
};

interface ProductsTableProps {
    products: Product[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, searchQuery, onSearchChange, onEdit, onDelete }) => {
    const { t } = useLanguage();
    const filteredProducts = products.filter((product) => {
        const searchTermLower = searchQuery.toLowerCase().trim();
        if (!searchTermLower) return true;
        return (
            product.name?.toLowerCase().includes(searchTermLower) ||
            product.price?.toString().includes(searchTermLower) ||
            product.stockQuantity?.toString().includes(searchTermLower) ||
            product.id?.toString().includes(searchTermLower)
        );
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredProducts, RECORDS_PER_PAGE, searchQuery);

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-box-seam-fill"></i>
                    </span>
                    {t('productsTable.title')}
                    <span className="db-panel__count">{filteredProducts.length}</span>
                </p>
                <div className="db-search">
                    <i className="bi bi-search"></i>
                    <SearchBar value={searchQuery} placeholder={t('productsTable.searchPlaceholder')} onChange={onSearchChange} />
                </div>
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('productsTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('productsTable.colId')}</th>
                                <th scope="col">{t('productsTable.colName')}</th>
                                <th scope="col">{t('productsTable.colPrice')}</th>
                                <th scope="col">{t('productsTable.colStock')}</th>
                                <th scope="col">{t('productsTable.colImage')}</th>
                                <th scope="col">{t('productsTable.colAction')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((product) => {
                                const status = getStockStatus(product.stockQuantity);
                                return (
                                    <tr key={product.id}>
                                        <td className="db-cell-id">#{product.id}</td>
                                        <td className="db-cell-name">{product.name}</td>
                                        <td className="db-cell-price">${product.price}</td>
                                        <td>
                                            <span className={`db-pill ${STATUS_CLASS[status.key] || 'db-status-success'}`}>
                                                {product.stockQuantity} ({t(`stock.${status.key}`, status.text)})
                                            </span>
                                        </td>
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
                                        <td>
                                            {canManageProducts() ? (
                                                <div className="db-actions">
                                                    <button className="db-btn-edit" onClick={() => onEdit(product)}>
                                                        <i className="bi bi-pencil-square"></i> {t('productsTable.edit')}
                                                    </button>
                                                    <button className="db-btn-delete" onClick={() => onDelete(product.id)}>
                                                        <i className="bi bi-trash3"></i> {t('productsTable.delete')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="db-badge-viewonly">{t('productsTable.viewOnly')}</span>
                                            )}
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

export default ProductsTable;

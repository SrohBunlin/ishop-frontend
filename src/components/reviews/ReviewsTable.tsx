import React from 'react';
import { Review } from '../../types/dashboard.types';
import { canModerateReviews } from '../../utils/auth';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const RECORDS_PER_PAGE = 10;

const STATUS_CLASS: Record<string, string> = {
    'APPROVED': 'db-status-success',
    'PENDING': 'db-status-warning',
    'HIDDEN': 'db-status-danger',
};

const STATUS_LABEL_KEY: Record<string, string> = {
    'APPROVED': 'reviewsTable.statusApproved',
    'PENDING': 'reviewsTable.statusPending',
    'HIDDEN': 'reviewsTable.statusHidden',
};

interface StarRatingProps {
    rating: number;
    starsLabel: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, starsLabel }) => {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return (
        <span style={{ color: '#f5a623', whiteSpace: 'nowrap' }} aria-label={`${safeRating} ${starsLabel}`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={`bi ${i < safeRating ? 'bi-star-fill' : 'bi-star'}`}></i>
            ))}
            <span className="ms-1 text-muted" style={{ fontSize: '0.85em' }}>({rating?.toFixed ? rating.toFixed(1) : rating})</span>
        </span>
    );
};

interface ReviewsTableProps {
    reviews: Review[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onDelete: (id: number) => void;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews, searchQuery, onSearchChange, onDelete }) => {
    const { t, language } = useLanguage();
    const filteredReviews = reviews.filter((review) => {
        const searchTermLower = searchQuery.toLowerCase().trim();
        if (!searchTermLower) return true;
        return (
            review.customerName?.toLowerCase().includes(searchTermLower) ||
            review.productName?.toLowerCase().includes(searchTermLower) ||
            review.comment?.toLowerCase().includes(searchTermLower) ||
            review.id?.toString().includes(searchTermLower)
        );
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredReviews, RECORDS_PER_PAGE, searchQuery);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
        : 0;

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-star-fill"></i>
                    </span>
                    {t('reviewsTable.title')}
                    <span className="db-panel__count">{filteredReviews.length}</span>
                    {reviews.length > 0 && (
                        <span className="db-pill db-status-success" style={{ marginLeft: '10px' }}>
                            <i className="bi bi-star-fill"></i> {t('reviewsTable.average')} {averageRating.toFixed(1)} / 5
                        </span>
                    )}
                </p>
                <div className="db-search">
                    <i className="bi bi-search"></i>
                    <SearchBar value={searchQuery} placeholder={t('reviewsTable.searchPlaceholder')} onChange={onSearchChange} />
                </div>
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('reviewsTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('reviewsTable.colId')}</th>
                                <th scope="col">{t('reviewsTable.colCustomer')}</th>
                                <th scope="col">{t('reviewsTable.colProduct')}</th>
                                <th scope="col">{t('reviewsTable.colRating')}</th>
                                <th scope="col">{t('reviewsTable.colComment')}</th>
                                <th scope="col">{t('reviewsTable.colDate')}</th>
                                <th scope="col">{t('reviewsTable.colStatus')}</th>
                                {canModerateReviews() && <th scope="col">{t('reviewsTable.colAction')}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((review,index) => (
                                <tr key={`${review.id}-${index}`}>
                                    <td className="db-cell-id">#{review.id}</td>
                                    <td className="db-cell-name">{review.customerName}</td>
                                    <td>{review.productName || t('reviewsTable.noData')}</td>
                                    <td><StarRating rating={review.rating} starsLabel={t('reviewsTable.starsOutOf5')} /></td>
                                    <td style={{ maxWidth: '320px' }}>{review.comment}</td>
                                    <td>{review.createdAt ? new Date(review.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH') : t('reviewsTable.noData')}</td>
                                    <td>
                                        <span className={`db-pill ${STATUS_CLASS[review.status || 'APPROVED'] || 'db-status-success'}`}>
                                            {t(STATUS_LABEL_KEY[review.status || 'APPROVED'], review.status)}
                                        </span>
                                    </td>
                                    {canModerateReviews() && (
                                        <td>
                                            <div className="db-actions">
                                                <button className="db-btn-delete" onClick={() => onDelete(review.id)}>
                                                    <i className="bi bi-trash3"></i> {t('reviewsTable.delete')}
                                                </button>
                                            </div>
                                        </td>
                                    )}
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

export default ReviewsTable;

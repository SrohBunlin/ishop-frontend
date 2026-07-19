import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useLanguage();
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link rounded-pill me-2"
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        {t('pagination.prev')}
                    </button>
                </li>
                {pageNumbers.map((n) => (
                    <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                        <button
                            type="button"
                            className="page-link rounded-circle me-2"
                            onClick={() => onPageChange(n)}
                        >
                            {n}
                        </button>
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link rounded-pill"
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        {t('pagination.next')}
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;

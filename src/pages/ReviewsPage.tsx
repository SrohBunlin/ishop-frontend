import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReviewsTable from '../components/reviews/ReviewsTable';
import { useReviews } from '../hooks/useReviews';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const ReviewsPage: React.FC = () => {
    const { t } = useLanguage();
    const { reviews, fetchReviews, deleteReview } = useReviews();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetchReviews();
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const { averageRating, pendingCount } = useMemo(() => {
        if (reviews.length === 0) return { averageRating: 0, pendingCount: 0 };
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        const pending = reviews.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length;
        return { averageRating: sum / reviews.length, pendingCount: pending };
    }, [reviews]);

    return (
        <DashboardLayout title={t('reviews.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-star-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('reviews.total')}</p>
                                    <p className="db-stat-value">{reviews.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-star-half"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('reviews.averageRating')}</p>
                                    <p className="db-stat-value">{averageRating.toFixed(1)} / 5</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-hourglass-split"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('reviews.pending')}</p>
                                    <p className="db-stat-value">{pendingCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <ReviewsTable
                        reviews={reviews}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onDelete={deleteReview}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReviewsPage;

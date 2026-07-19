// src/pages/account/AccountOrdersPage.tsx
// ប្រវត្តិកម្ម៉ង់ទិញរបស់ខ្ញុំ (My Orders) + វាយតម្លៃទំនិញ
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../hooks/useOrders';
import { useReviews } from '../../hooks/useReviews';
import { exportInvoicePdf } from '../../utils/exportInvoicePdf';
import '../../styles/shop-ui.css';

const getOrderStatusClass = (status: string): string => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel') || s.includes('reject') || s.includes('failed')) return 'account-status account-status--danger';
    if (s.includes('pending') || s.includes('process') || s.includes('wait')) return 'account-status account-status--warning';
    return 'account-status account-status--success';
};

interface UserProfile {
    firstName: string;
    lastName: string;
}

interface AccountOrdersPageProps {
    userProfile?: UserProfile | null;
}

const AccountOrdersPage: React.FC<AccountOrdersPageProps> = ({ userProfile }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { orders, fetchOrders, updateOrderStatus } = useOrders();
    const { reviews, fetchReviews, submitReview } = useReviews();

    const storedProfile: UserProfile | null = (() => {
        try {
            const raw = localStorage.getItem('user_profile');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();
    const profile = userProfile || storedProfile;
    const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();

    const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);

    const [reviewTarget, setReviewTarget] = useState<{ orderId: number; productId?: number; productName: string } | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSavingReview, setIsSavingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchOrders();
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const myOrders = useMemo(() => {
        const nameLower = fullName.toLowerCase();
        return orders
            .filter((order) => order.customer_name?.toLowerCase().trim() === nameLower)
            .sort((a, b) => new Date(b.order_date || 0).getTime() - new Date(a.order_date || 0).getTime());
    }, [orders, fullName]);

    const hasReviewed = (productName: string): boolean => {
        const nameLower = fullName.toLowerCase();
        return reviews.some(
            (r) => r.customerName?.toLowerCase().trim() === nameLower && r.productName?.toLowerCase().trim() === productName.toLowerCase().trim()
        );
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!window.confirm(t('account.confirmCancelOrder'))) return;
        setCancelingOrderId(orderId);
        try {
            const ok = await updateOrderStatus(orderId, 'CANCELLED');
            if (!ok) alert(t('account.cancelOrderFail'));
        } finally {
            setCancelingOrderId(null);
        }
    };

    const handleDownloadInvoice = (order: (typeof myOrders)[number]) => {
        exportInvoicePdf(order);
    };

    const openReviewModal = (orderId: number, productName: string, productId?: number) => {
        setReviewTarget({ orderId, productId, productName });
        setReviewRating(5);
        setReviewComment('');
        setReviewMessage(null);
    };

    const closeReviewModal = () => setReviewTarget(null);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewTarget) return;
        setIsSavingReview(true);
        setReviewMessage(null);
        try {
            const ok = await submitReview({
                productId: reviewTarget.productId,
                productName: reviewTarget.productName,
                customerName: fullName,
                rating: reviewRating,
                comment: reviewComment,
            });
            if (ok) {
                setReviewMessage({ type: 'success', text: t('account.reviewSaveSuccess') });
                setTimeout(() => setReviewTarget(null), 900);
            } else {
                setReviewMessage({ type: 'error', text: t('account.reviewSaveFail') });
            }
        } finally {
            setIsSavingReview(false);
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-page__inner">
                <button className="cart-back-btn" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('account.backToShop')}
                </button>

                <h2 className="cart-title">
                    <span className="cart-title__icon"><i className="bi bi-cart-check"></i></span>
                    {t('account.myOrders')}
                </h2>

                <div className="account-section">
                    <h3 className="account-section__title">
                        <i className="bi bi-cart-check"></i> {t('account.myOrders')}
                        <span className="db-panel__count">{myOrders.length}</span>
                    </h3>

                    {myOrders.length === 0 ? (
                        <div className="shop-empty-state" style={{ backgroundColor: 'var(--shop-bg)', borderRadius: '14px' }}>
                            <i className="bi bi-inbox"></i>
                            <p className="mb-0">{t('account.noOrders')}</p>
                        </div>
                    ) : (
                        <div className="account-order-list">
                            {myOrders.map((order) => {
                                const isPending = (order.status || '').toUpperCase() === 'PENDING';
                                const isCompleted = (order.status || '').toUpperCase() === 'COMPLETED';
                                return (
                                    <div key={order.id} className="account-order-item" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
                                        <div>
                                            <p className="account-order-item__id">#{order.id}</p>
                                            <p className="account-order-item__date">
                                                {order.order_date
                                                    ? new Date(order.order_date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH')
                                                    : t('account.noData')}
                                            </p>
                                        </div>
                                        <span className={getOrderStatusClass(order.status)}>{order.status}</span>
                                        <p className="account-order-item__total">${Number(order.total_amount || 0).toLocaleString()}</p>

                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
                                            <Link to={`/invoice/${order.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                <i className="bi bi-eye"></i> {t('account.viewDetail')}
                                            </Link>
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDownloadInvoice(order)}>
                                                <i className="bi bi-file-earmark-arrow-down"></i> {t('account.downloadInvoice')}
                                            </button>
                                            {isPending && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={cancelingOrderId === order.id}
                                                    onClick={() => handleCancelOrder(order.id)}
                                                >
                                                    {cancelingOrderId === order.id ? (
                                                        <span className="auth-spinner"></span>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-x-circle"></i> {t('account.cancelOrder')}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {isCompleted && order.items && order.items.length > 0 && (
                                            <div style={{ width: '100%', borderTop: '1px dashed var(--shop-border, #ddd)', paddingTop: '8px', marginTop: '4px' }}>
                                                <p className="small text-muted mb-1">{t('account.rateYourItems')}</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {order.items.map((item, idx) => {
                                                        const reviewed = hasReviewed(item.product_name);
                                                        return (
                                                            <button
                                                                key={idx}
                                                                className={`btn btn-sm ${reviewed ? 'btn-outline-secondary' : 'btn-outline-warning'}`}
                                                                disabled={reviewed}
                                                                onClick={() => openReviewModal(order.id, item.product_name, item.productId)}
                                                            >
                                                                <i className={`bi ${reviewed ? 'bi-check2-circle' : 'bi-star'}`}></i>{' '}
                                                                {reviewed ? t('account.alreadyReviewed') : t('account.writeReview')}: {item.product_name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal សរសេរមតិវាយតម្លៃ */}
            {reviewTarget && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow" style={{ borderRadius: '18px', border: 'none' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">{t('account.writeReview')}: {reviewTarget.productName}</h5>
                                <button type="button" className="btn-close" onClick={closeReviewModal}></button>
                            </div>
                            <div className="modal-body">
                                {reviewMessage && (
                                    <div className={reviewMessage.type === 'success' ? 'account-banner account-banner--success' : 'auth-error'}>
                                        <i className={`bi ${reviewMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                                        <span>{reviewMessage.text}</span>
                                    </div>
                                )}
                                <form onSubmit={handleSubmitReview}>
                                    <div className="auth-field">
                                        <label>{t('account.rating')}</label>
                                        <div style={{ display: 'flex', gap: '4px', fontSize: '1.4rem' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={`bi ${star <= reviewRating ? 'bi-star-fill' : 'bi-star'}`}
                                                    style={{ color: '#f5a623', cursor: 'pointer' }}
                                                    onClick={() => setReviewRating(star)}
                                                ></i>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="auth-field">
                                        <label>{t('account.comment')}</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="auth-submit-btn" disabled={isSavingReview}>
                                        {isSavingReview ? (
                                            <>
                                                <span className="auth-spinner"></span> {t('account.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send-check"></i> {t('account.submitReview')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountOrdersPage;

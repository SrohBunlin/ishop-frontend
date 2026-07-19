import React from 'react';
import { Order } from '../../types/dashboard.types';
import { Language } from '../../i18n/translations';
import { useLanguage } from '../../context/LanguageContext';

interface RecentOrdersProps {
    orders: Order[];
    limit?: number;
}

const getStatusClass = (status: string): string => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel') || s.includes('reject') || s.includes('failed')) return 'db-status-danger';
    if (s.includes('pending') || s.includes('process') || s.includes('wait')) return 'db-status-warning';
    return 'db-status-success';
};

const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

// 🎨 ពណ៌ Avatar ថេរសម្រាប់អតិថិជនម្នាក់ៗ (គណនាពីឈ្មោះ ដូច្នេះអតិថិជនតែម្នាក់បានពណ៌ដដែលរាល់ពេល)
const AVATAR_COLORS = ['#124F9C', '#17A34A', '#F2A922', '#9966FF', '#e5484d', '#0d9488'];
const colorForName = (name: string): string => {
    const sum = (name || '?').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const formatRelativeDate = (dateStr: string | undefined, t: (key: string) => string, language: Language): string => {
    if (!dateStr) return t('recentOrders.noData');
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return t('recentOrders.noData');

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return t('recentOrders.today');
    if (diffDays === 1) return t('recentOrders.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('recentOrders.daysAgo')}`;
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH', { day: 'numeric', month: 'short' });
};

// ✨ Sample dashboard component៖ សកម្មភាពការកុម្ម៉ង់ថ្មីៗ (Recent activity feed)
// បង្ហាញការកុម្ម៉ង់ N ចុងក្រោយគេ ដើម្បីមើលឃើញភ្លាមៗនូវសកម្មភាពថ្មីៗ មិនចាំបាច់រំកិលទៅមើលតារាងពេញខាងក្រោមទេ
const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, limit = 5 }) => {
    const { t, language } = useLanguage();
    const recentOrders = [...(orders || [])]
        .sort((a, b) => {
            const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
            const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, limit);

    return (
        <div className="db-panel h-100">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-clock-history"></i>
                    </span>
                    {t('recentOrders.title')}
                    <span className="db-panel__count">{orders?.length || 0}</span>
                </p>
            </div>

            {recentOrders.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('recentOrders.empty')}</p>
                </div>
            ) : (
                <ul className="db-activity-list">
                    {recentOrders.map((order) => (
                        <li className="db-activity-item" key={order.id}>
                            <div className="db-activity-avatar" style={{ backgroundColor: colorForName(order.customer_name) }}>
                                {getInitials(order.customer_name)}
                            </div>
                            <div className="db-activity-body">
                                <p className="db-activity-name">
                                    {order.customer_name || t('recentOrders.customer')}
                                    <span className="db-activity-order-id">#{order.id}</span>
                                </p>
                                <p className="db-activity-meta">{formatRelativeDate(order.order_date, t, language)}</p>
                            </div>
                            <div className="db-activity-side">
                                <span className={`db-pill ${getStatusClass(order.status)}`}>{order.status}</span>
                                <span className="db-activity-amount">${order.total_amount?.toLocaleString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecentOrders;

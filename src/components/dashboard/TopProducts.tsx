import React from 'react';
import { Product } from '../../types/dashboard.types';
import { LOCAL_PLACEHOLDER } from '../../styles/sharedStyles';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_URL;

interface TopProductsProps {
    products: Product[];
    limit?: number;
}

// ✨ Sample dashboard component៖ ទំនិញកំពូលតាមតម្លៃស្តុក (Top products by inventory value)
// តម្លៃស្តុក = តម្លៃ × ចំនួនក្នុងស្តុក — ជួយអោយឃើញភ្លាមថាដើមទុនភាគច្រើនកកកុញនៅលើទំនិញមុខណាខ្លះ
const TopProducts: React.FC<TopProductsProps> = ({ products, limit = 5 }) => {
    const { t } = useLanguage();
    const ranked = [...(products || [])]
        .map((p) => ({ ...p, value: (p.price || 0) * (p.stockQuantity || 0) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

    const maxValue = ranked.length > 0 ? ranked[0].value : 0;

    return (
        <div className="db-panel h-100">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-trophy-fill"></i>
                    </span>
                    {t('topProducts.title')}
                </p>
            </div>

            {ranked.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('topProducts.empty')}</p>
                </div>
            ) : (
                <ul className="db-rank-list">
                    {ranked.map((product, index) => (
                        <li className="db-rank-item" key={product.id}>
                            <span className={`db-rank-badge ${index === 0 ? 'db-rank-badge--top' : ''}`}>{index + 1}</span>
                            <img
                                src={product.image && product.image !== 'undefined' ? `${API_BASE_URL}${product.image}` : LOCAL_PLACEHOLDER}
                                alt={product.name}
                                className="db-thumb"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                    (e.target as HTMLImageElement).src = LOCAL_PLACEHOLDER;
                                }}
                            />
                            <div className="db-rank-body">
                                <div className="db-rank-top-row">
                                    <span className="db-rank-name">{product.name}</span>
                                    <span className="db-rank-value">${product.value.toLocaleString()}</span>
                                </div>
                                <div className="db-rank-bar-track">
                                    <div
                                        className="db-rank-bar-fill"
                                        style={{ width: maxValue > 0 ? `${(product.value / maxValue) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <span className="db-rank-sub">${product.price} × {product.stockQuantity} {t('topProducts.units')}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TopProducts;

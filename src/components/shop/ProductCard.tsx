// src/components/shop/ProductCard.tsx
// កាតទំនិញរួម ប្រើទាំងក្នុង LandingPage (ទំនិញទាំងអស់/លក់ដាច់បំផុត/ថ្មីមកដល់) និង ProductDetailPage (ទំនិញពាក់ព័ន្ធ)
// ចុចលើកាត → លោតទៅទំព័រព័ត៌មានលម្អិត /product/:id
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23aaaaaa'>No Image</text></svg>";

export interface ShopProduct {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    image?: string;
    categoryId?: number | string;
    subCategoryId?: number | string;
    tags?: string[];
    salePrice?: number;
    description?: string;
}

export const getProductImageUrl = (product: ShopProduct): string => {
    return product.image && product.image !== 'undefined' ? `${API_BASE_URL}${product.image}` : LOCAL_PLACEHOLDER;
};

export const getStockInfo = (qty: number, t: (key: string, fallback?: string) => string) => {
    if (qty <= 0) return { label: t('landing.outOfStock'), className: 'is-out', disabled: true };
    if (qty <= 5) return { label: `${t('landing.leftInStock')} ${qty}`, className: 'is-low', disabled: false };
    return { label: t('landing.inStock'), className: '', disabled: false };
};

export const hasActiveDiscount = (product: ShopProduct): boolean =>
    product.salePrice !== undefined && product.salePrice < product.price;

export const StarRating: React.FC<{ average: number; count: number }> = ({ average, count }) => {
    const { t } = useLanguage();
    if (!count) {
        return <p className="product-card__rating product-card__rating--empty">{t('landing.noRating')}</p>;
    }
    const rounded = Math.round(average);
    return (
        <p className="product-card__rating">
            <span style={{ color: '#f5a623' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={`bi ${i < rounded ? 'bi-star-fill' : 'bi-star'}`}></i>
                ))}
            </span>
            <span className="product-card__rating-value">{average.toFixed(1)}</span>
            <span className="product-card__rating-count">({count})</span>
        </p>
    );
};

interface ProductCardProps {
    product: ShopProduct;
    rating: { average: number; count: number };
}

const ProductCard: React.FC<ProductCardProps> = ({ product, rating }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const stock = getStockInfo(product.stockQuantity, t);
    const discounted = hasActiveDiscount(product);

    const goToDetail = () => navigate(`/product/${product.id}`);

    return (
        <div
            className="product-card"
            onClick={goToDetail}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onKeyDown={(e) => { if (e.key === 'Enter') goToDetail(); }}
        >
            <div className="product-card__image-wrap">
                <button
                    type="button"
                    className="product-card__wishlist-btn"
                    aria-label={t('landing.toggleWishlist')}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                        });
                    }}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 2,
                        border: 'none',
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                >
                    <i
                        className={isInWishlist(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'}
                        style={{ color: isInWishlist(product.id) ? '#e74c3c' : '#888' }}
                    ></i>
                </button>
                <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    onError={(e) => (e.target as HTMLImageElement).src = LOCAL_PLACEHOLDER}
                />
                <span className={`product-card__stock ${stock.className}`}>{stock.label}</span>
            </div>
            <div className="product-card__body">
                <h4 className="product-card__title">{product.name}</h4>
                <StarRating average={rating.average} count={rating.count} />
                {discounted ? (
                    <p className="product-card__price">
                        ${product.salePrice}{' '}
                        <span style={{ textDecoration: 'line-through', color: 'var(--shop-text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>
                            ${product.price}
                        </span>
                    </p>
                ) : (
                    <p className="product-card__price">${product.price}</p>
                )}
                <button
                    className="product-card__btn"
                    disabled={stock.disabled}
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                            id: product.id,
                            name: product.name,
                            price: discounted ? (product.salePrice as number) : product.price,
                            quantity: 1,
                            image: product.image
                        });
                    }}
                >
                    <i className="bi bi-cart-plus"></i>
                    {stock.disabled ? t('landing.outOfStock') : t('landing.addToCart')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

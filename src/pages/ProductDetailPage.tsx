// src/pages/ProductDetailPage.tsx
// ទំព័រព័ត៌មានលម្អិតទំនិញ — បើកឡើងពេលចុចលើកាតទំនិញនៅ LandingPage (ឬកន្លែងផ្សេងដែលប្រើ ProductCard)
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { CATEGORY_OPTIONS } from '../constants/productCategories';
import ProductCard, { ShopProduct, StarRating, getProductImageUrl, getStockInfo, hasActiveDiscount, LOCAL_PLACEHOLDER } from '../components/shop/ProductCard';
import '../styles/shop-ui.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

interface ProductReview {
    id: number;
    productId?: number;
    product?: { id: number };
    customerName?: string;
    rating: number;
    comment?: string;
    createdAt?: string;
    status?: string;
}

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        setQuantity(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        Promise.all([
            axios.get<ShopProduct[]>(`${API_BASE_URL}/api/products/all`).then(res => res.data).catch(() => []),
            axios.get<ProductReview[]>(`${API_BASE_URL}/api/reviews/all`).then(res => res.data).catch(() => []),
        ]).then(([productsData, reviewsData]) => {
            setProducts(productsData);
            setReviews(reviewsData);
        }).finally(() => setIsLoading(false));
    }, [productId]);

    const product = useMemo(
        () => products.find(p => p.id === productId),
        [products, productId]
    );

    const productReviews = useMemo(() => {
        return reviews.filter(r => {
            const pId = r.productId ?? r.product?.id;
            return pId === productId;
        });
    }, [reviews, productId]);

    const rating = useMemo(() => {
        if (productReviews.length === 0) return { average: 0, count: 0 };
        const total = productReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        return { average: total / productReviews.length, count: productReviews.length };
    }, [productReviews]);

    const category = useMemo(() => {
        if (!product?.categoryId) return null;
        return CATEGORY_OPTIONS.find(c => c.id === Number(product.categoryId)) || null;
    }, [product]);

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter(p => p.id !== product.id && p.categoryId !== undefined && Number(p.categoryId) === Number(product.categoryId))
            .slice(0, 4);
    }, [products, product]);

    const getRatingForProduct = (pid: number) => {
        const list = reviews.filter(r => (r.productId ?? r.product?.id) === pid);
        if (list.length === 0) return { average: 0, count: 0 };
        const total = list.reduce((sum, r) => sum + (r.rating || 0), 0);
        return { average: total / list.length, count: list.length };
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--shop-text-muted)' }}>{t('productDetail.loading')}</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="shop-empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-exclamation-circle"></i>
                <p className="mb-1" style={{ fontWeight: 700 }}>{t('productDetail.notFoundTitle')}</p>
                <p className="mb-3">{t('productDetail.notFoundDesc')}</p>
                <button className="shop-hero__btn" style={{ backgroundColor: 'var(--shop-primary)', color: '#fff' }} onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('productDetail.backToShop')}
                </button>
            </div>
        );
    }

    const stock = getStockInfo(product.stockQuantity, t);
    const discounted = hasActiveDiscount(product);

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product.id,
                name: product.name,
                price: discounted ? (product.salePrice as number) : product.price,
                quantity: 1,
                image: product.image,
            });
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--shop-bg, #f4f6fb)', minHeight: '100vh' }}>
            <div className="product-detail__breadcrumb">
                <Link to="/">{t('landing.allProducts')}</Link>
                {category && <><i className="bi bi-chevron-right"></i><span>{category.name}</span></>}
                <i className="bi bi-chevron-right"></i>
                <span>{product.name}</span>
            </div>

            <div className="product-detail">
                <div className="product-detail__image-wrap">
                    <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        onError={(e) => (e.target as HTMLImageElement).src = LOCAL_PLACEHOLDER}
                    />
                    <span className={`product-card__stock ${stock.className}`}>{stock.label}</span>
                </div>

                <div className="product-detail__info">
                    {category && <p className="product-detail__category">{t('productDetail.category')}: {category.name}</p>}
                    <h1 className="product-detail__title">{product.name}</h1>
                    <StarRating average={rating.average} count={rating.count} />

                    {discounted ? (
                        <p className="product-detail__price">
                            ${product.salePrice}
                            <span className="product-detail__price--old">${product.price}</span>
                        </p>
                    ) : (
                        <p className="product-detail__price">${product.price}</p>
                    )}

                    {product.tags && product.tags.length > 0 && (
                        <div className="product-detail__tags">
                            {product.tags.map(tag => (
                                <span key={tag} className="product-detail__tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="product-detail__actions">
                        <div className="product-detail__qty">
                            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="-">
                                <i className="bi bi-dash"></i>
                            </button>
                            <span>{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(q => Math.min(product.stockQuantity || 1, q + 1))}
                                aria-label="+"
                            >
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                        <button className="product-card__btn" style={{ flex: 1 }} disabled={stock.disabled} onClick={handleAddToCart}>
                            <i className="bi bi-cart-plus"></i>
                            {stock.disabled ? t('landing.outOfStock') : t('landing.addToCart')}
                        </button>
                        <button
                            type="button"
                            className="product-detail__wishlist-btn"
                            aria-label={t('landing.toggleWishlist')}
                            onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image })}
                        >
                            <i
                                className={isInWishlist(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'}
                                style={{ color: isInWishlist(product.id) ? '#e74c3c' : undefined }}
                            ></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------- ព័ត៌មានលម្អិត (Description) ---------- */}
            <div className="product-detail__section">
                <h5 className="product-detail__section-title">{t('productDetail.descriptionTitle')}</h5>
                {product.description ? (
                    <div className="product-detail__description" dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                    <p style={{ color: 'var(--shop-text-muted)' }}>{t('productDetail.noDescription')}</p>
                )}
            </div>

            {/* ---------- ការវាយតម្លៃ (Reviews) ---------- */}
            <div className="product-detail__section">
                <h5 className="product-detail__section-title">{t('productDetail.reviewsTitle')} ({productReviews.length})</h5>
                {productReviews.length === 0 ? (
                    <p style={{ color: 'var(--shop-text-muted)' }}>{t('productDetail.noReviews')}</p>
                ) : (
                    <div className="product-detail__reviews">
                        {productReviews.map(review => (
                            <div key={review.id} className="product-detail__review-card">
                                <div className="product-detail__review-head">
                                    <span className="product-detail__review-name">{review.customerName || '—'}</span>
                                    <span style={{ color: '#f5a623' }}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <i key={i} className={`bi ${i < Math.round(review.rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
                                        ))}
                                    </span>
                                </div>
                                {review.comment && <p className="product-detail__review-comment">{review.comment}</p>}
                                {review.createdAt && (
                                    <p className="product-detail__review-date">
                                        {new Date(review.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ---------- ទំនិញពាក់ព័ន្ធ (Related products) ---------- */}
            {relatedProducts.length > 0 && (
                <>
                    <div className="shop-section-label">
                        <h5>{t('productDetail.relatedProducts')}</h5>
                    </div>
                    <div className="shop-scroll-row">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={p} rating={getRatingForProduct(p.id)} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductDetailPage;

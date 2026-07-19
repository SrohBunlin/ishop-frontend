// src/pages/LandingPage.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
// បើប្អូនចង់ឱ្យពេលចុចវាលោតទៅទំព័រ Cart អាចប្រើ useNavigate
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORY_OPTIONS } from '../constants/productCategories';
import ProductCard, { ShopProduct } from '../components/shop/ProductCard';
import '../styles/shop-ui.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

type Product = ShopProduct;

interface ProductReview {
    id: number;
    productId?: number;
    product?: {         // 🟢 បន្ថែមមួយបន្ទាត់នេះ ដើម្បីគាំទ្រ nested object ពី Spring Boot
        id: number;
    };
    rating: number;
}

const LandingPage: React.FC = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');

    const navigate = useNavigate();
    const productsSectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setIsLoading(true);
        axios.get<Product[]>(`${API_BASE_URL}/api/products/all`)
            .then(res => setProducts(res.data))
            .catch(err => console.log("Product API Error:", err))
            .finally(() => setIsLoading(false));

        // 🟢 កូដថ្មីមានបន្ថែម log ដើម្បីឆែកមើលទិន្នន័យ Review
        axios.get<ProductReview[]>(`${API_BASE_URL}/api/reviews/all`)
            .then(res => {
                console.log("=== [DEBUG] ទិន្នន័យ Reviews ធ្លាក់ពី Backend ===");
                console.log(res.data);
                setReviews(res.data);
            })
            .catch(err => {
                console.error("=== [DEBUG] API Review មានបញ្ហា (ប្រហែលជាលោត 403 ឬ 404) ===");
                console.error(err);
            });
    }, []);

    // 🟢 កូដថ្មីជួយស្វែងរក Product ID គ្រប់ទម្រង់ និង Log ប្រាប់ពីបញ្ហា
    const ratingsByProduct = useMemo(() => {
        const map: Record<number, { total: number; count: number }> = {};

        if (reviews.length === 0) {
            console.log("=== [DEBUG] Array 'reviews' នៅទទេស្អាត (អត់មានទិន្នន័យគណនាទេ) ===");
            return map;
        }

        reviews.forEach((review) => {
            // ព្យាយាមទាញយក Product ID ពីគ្រប់ច្រកល្ហក (ទោះជា productId ឬ product.id)
            const pId = review.productId ?? (review as any).product?.id;

            console.log(`[DEBUG] កំពុងគណនា Review ID: ${review.id} | Rating: ${review.rating} | Product ID ទាញបាន: ${pId}`);

            if (pId === undefined) {
                console.warn("[DEBUG] ⚠️ រកមិនឃើញ Product ID នៅក្នុង Review នេះទេ!", review);
                return;
            }
            if (!map[pId]) map[pId] = { total: 0, count: 0 };
            map[pId].total += review.rating || 0;
            map[pId].count += 1;
        });

        console.log("=== [DEBUG] លទ្ធផល Map ក្រោយពេលគណនារួច៖ ===", map);
        return map;
    }, [reviews]);

    // 🌟 ទាញយក cart (ទិន្នន័យក្នុងកន្ត្រក) ដើម្បីរាប់ចំនួន — ការបន្ថែម/យកចេញ Wishlist ត្រូវបានផ្ទេរទៅ ProductCard component រួចហើយ
    const { cartItems } = useCart();

    // រាប់ចំនួនទំនិញសរុបក្នុងកន្ត្រក (បើសិនជា CartContext របស់ប្អូនមានទម្រង់ជា Array)
    const totalItems = cartItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

    const getRating = useCallback((productId: number) => {
        const entry = ratingsByProduct[productId];
        return { average: entry ? entry.total / entry.count : 0, count: entry?.count || 0 };
    }, [ratingsByProduct]);

    // ---------- ចំណាត់ថ្នាក់ផលិតផលតាមប្រភេទ Section ផ្សេងៗ ----------

    // លក់ដាច់បំផុត៖ ប្រើ tag 'លក់ដាច់បំផុត' បើមាន បើអត់ fallback ទៅតាមចំណាត់ថ្នាក់ការវាយតម្លៃខ្ពស់បំផុត
    const bestSellers = useMemo(() => {
        const tagged = products.filter(p => p.tags?.includes('លក់ដាច់បំផុត'));
        if (tagged.length > 0) return tagged.slice(0, 8);
        return [...products]
            .sort((a, b) => getRating(b.id).average - getRating(a.id).average)
            .slice(0, 8);
    }, [products, getRating]);

    // ថ្មីមកដល់៖ ប្រើ tag 'ថ្មីមកដល់' បើមាន បើអត់ fallback ទៅតាម ID ថ្មីបំផុត
    const newArrivals = useMemo(() => {
        const tagged = products.filter(p => p.tags?.includes('ថ្មីមកដល់'));
        if (tagged.length > 0) return tagged.slice(0, 8);
        return [...products].sort((a, b) => b.id - a.id).slice(0, 8);
    }, [products]);

    // កំពុងបញ្ចុះតម្លៃ៖ salePrice ទាបជាង price ឬមាន tag 'បញ្ចុះតម្លៃ'
    const onSaleProducts = useMemo(() => {
        return products.filter(p => (p.salePrice !== undefined && p.salePrice < p.price) || p.tags?.includes('បញ្ចុះតម្លៃ'));
    }, [products]);

    // ចំនួនផលិតផលក្នុងប្រភេទនីមួយៗ (សម្រាប់បង្ហាញលើ Chip)
    const productCountByCategory = useMemo(() => {
        const map: Record<number, number> = {};
        products.forEach(p => {
            const cId = p.categoryId ? Number(p.categoryId) : undefined;
            if (cId === undefined) return;
            map[cId] = (map[cId] || 0) + 1;
        });
        return map;
    }, [products]);

    const filteredProducts = useMemo(() => {
        let list = products;
        if (selectedCategoryId !== null) {
            list = list.filter(p => Number(p.categoryId) === selectedCategoryId);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.trim().toLowerCase();
            list = list.filter(p => p.name?.toLowerCase().includes(q));
        }
        return list;
    }, [products, searchTerm, selectedCategoryId]);

    const scrollToProducts = () => {
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCategoryClick = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        scrollToProducts();
    };

    const handleShowSaleItems = () => {
        if (onSaleProducts.length > 0) {
            setSelectedCategoryId(null);
            setSearchTerm('');
        }
        scrollToProducts();
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;
        Swal.fire({
            title: t('landing.subscribeSuccess'),
            icon: 'success',
            timer: 1600,
            showConfirmButton: false,
        });
        setNewsletterEmail('');
    };

    return (
        <div style={{ backgroundColor: 'var(--shop-bg, #f4f6fb)', position: 'relative', minHeight: '100vh' }}>

            {/* ---------- Hero ---------- */}
            <header className="shop-hero">
                <span className="shop-hero__badge">{t('landing.heroBadge')}</span>
                <h1 className="shop-hero__title">{t('landing.welcome')}</h1>
                <p className="shop-hero__subtitle">{t('landing.subtitle')}</p>
                <div className="shop-hero__cta">
                    <button className="shop-hero__btn" onClick={scrollToProducts}>
                        <i className="bi bi-bag-check"></i> {t('landing.shopNow')}
                    </button>
                </div>
            </header>

            {/* ---------- ស្លាកសញ្ញាទំនុកចិត្ត (Trust badges) ---------- */}
            <div className="trust-strip">
                <div className="trust-strip__item">
                    <span className="trust-strip__icon"><i className="bi bi-truck"></i></span>
                    <div>
                        <p className="trust-strip__title">{t('landing.freeShippingTitle')}</p>
                        <p className="trust-strip__desc">{t('landing.freeShippingDesc')}</p>
                    </div>
                </div>
                <div className="trust-strip__item">
                    <span className="trust-strip__icon"><i className="bi bi-shield-check"></i></span>
                    <div>
                        <p className="trust-strip__title">{t('landing.securePaymentTitle')}</p>
                        <p className="trust-strip__desc">{t('landing.securePaymentDesc')}</p>
                    </div>
                </div>
                <div className="trust-strip__item">
                    <span className="trust-strip__icon"><i className="bi bi-arrow-repeat"></i></span>
                    <div>
                        <p className="trust-strip__title">{t('landing.easyReturnTitle')}</p>
                        <p className="trust-strip__desc">{t('landing.easyReturnDesc')}</p>
                    </div>
                </div>
                <div className="trust-strip__item">
                    <span className="trust-strip__icon"><i className="bi bi-headset"></i></span>
                    <div>
                        <p className="trust-strip__title">{t('landing.supportTitle')}</p>
                        <p className="trust-strip__desc">{t('landing.supportDesc')}</p>
                    </div>
                </div>
            </div>

            {/* ---------- ជ្រើសរើសតាមប្រភេទ (Category quick nav) ---------- */}
            <div className="shop-section-label">
                <h5>{t('landing.shopByCategory')}</h5>
            </div>
            <div className="shop-categories-row">
                <button
                    className={`shop-category-chip ${selectedCategoryId === null ? 'shop-category-chip--active' : ''}`}
                    onClick={() => handleCategoryClick(null)}
                >
                    <i className="bi bi-grid"></i> {t('landing.allCategories')}
                </button>
                {CATEGORY_OPTIONS.map(cat => (
                    <button
                        key={cat.id}
                        className={`shop-category-chip ${selectedCategoryId === cat.id ? 'shop-category-chip--active' : ''}`}
                        onClick={() => handleCategoryClick(cat.id)}
                    >
                        {cat.name}
                        {productCountByCategory[cat.id] ? ` (${productCountByCategory[cat.id]})` : ''}
                    </button>
                ))}
            </div>

            {/* ---------- លក់ដាច់បំផុត (Best sellers) ---------- */}
            {!isLoading && bestSellers.length > 0 && (
                <>
                    <div className="shop-section-label">
                        <h5><i className="bi bi-fire" style={{ color: '#f5a623', marginRight: 6 }}></i>{t('landing.bestSellers')}</h5>
                    </div>
                    <div className="shop-scroll-row">
                        {bestSellers.map(product => (
                            <ProductCard key={product.id} product={product} rating={getRating(product.id)} />
                        ))}
                    </div>
                </>
            )}

            {/* ---------- បន្ទាំងផ្សព្វផ្សាយបញ្ចុះតម្លៃ (Promo banner) ---------- */}
            <div className="shop-promo-banner">
                <div>
                    <p className="shop-promo-banner__title">{t('landing.promoTitle')}</p>
                    <p className="shop-promo-banner__subtitle">{t('landing.promoSubtitle')}</p>
                </div>
                <button className="shop-promo-banner__btn" onClick={handleShowSaleItems}>
                    {t('landing.promoCta')} <i className="bi bi-arrow-right"></i>
                </button>
            </div>

            {/* ---------- ទំនិញថ្មីមកដល់ (New arrivals) ---------- */}
            {!isLoading && newArrivals.length > 0 && (
                <>
                    <div className="shop-section-label">
                        <h5><i className="bi bi-stars" style={{ color: 'var(--shop-primary)', marginRight: 6 }}></i>{t('landing.newArrivals')}</h5>
                    </div>
                    <div className="shop-scroll-row">
                        {newArrivals.map(product => (
                            <ProductCard key={product.id} product={product} rating={getRating(product.id)} />
                        ))}
                    </div>
                </>
            )}

            {/* ---------- ស្វែងរក + ទំនិញទាំងអស់ (All products) ---------- */}
            <div ref={productsSectionRef} className="shop-search" style={{ padding: '3em' }}>
                <i className="bi bi-search"></i>
                <input
                    type="text"
                    placeholder={t('landing.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="shop-section-label">
                <h5>{t('landing.allProducts')}</h5>
                {!isLoading && <span>{filteredProducts.length} {t('landing.itemsCount')}</span>}
            </div>

            {isLoading ? (
                <div className="shop-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div className="skeleton-card" key={i}>
                            <div className="skeleton-block" style={{ aspectRatio: '1 / 1' }} />
                            <div style={{ padding: '14px 16px' }}>
                                <div className="skeleton-block" style={{ height: 14, borderRadius: 6, marginBottom: 10 }} />
                                <div className="skeleton-block" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 14 }} />
                                <div className="skeleton-block" style={{ height: 34, borderRadius: 8 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="shop-empty-state">
                    <i className="bi bi-box-seam"></i>
                    <p className="mb-0">
                        {searchTerm ? `${t('landing.notFoundFor')} "${searchTerm}"${t('landing.noResultsSuffix') ? ' ' + t('landing.noResultsSuffix') : ''}` : t('landing.noProductsYet')}
                    </p>
                </div>
            ) : (
                <div className="shop-grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} rating={getRating(product.id)} />
                    ))}
                </div>
            )}

            {/* ---------- ការចុះឈ្មោះទទួលព័ត៌មាន (Newsletter) ---------- */}
            <div className="shop-newsletter">
                <h5 className="shop-newsletter__title">{t('landing.newsletterTitle')}</h5>
                <p className="shop-newsletter__subtitle">{t('landing.newsletterSubtitle')}</p>
                <form className="shop-newsletter__form" onSubmit={handleNewsletterSubmit}>
                    <input
                        type="email"
                        required
                        className="shop-newsletter__input"
                        placeholder={t('landing.emailPlaceholder')}
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit" className="shop-newsletter__btn">{t('landing.subscribe')}</button>
                </form>
            </div>

            {/* ---------- Footer ---------- */}
            <footer className="shop-footer">
                <div className="shop-footer__grid">
                    <div>
                        <p className="shop-footer__title">iShop</p>
                        <p className="shop-footer__about">{t('landing.footerAbout')}</p>
                    </div>
                    <div>
                        <p className="shop-footer__title">{t('landing.footerLinksTitle')}</p>
                        <ul className="shop-footer__links">
                            <li><button onClick={scrollToProducts}>{t('landing.allProducts')}</button></li>
                            <li><button onClick={() => navigate('/cart')}>{t('landing.viewCart')}</button></li>
                            <li><button onClick={() => navigate('/account')}>{t('nav.myAccount')}</button></li>
                            <li><button onClick={() => navigate('/login')}>{t('login.signIn')}</button></li>
                        </ul>
                    </div>
                    <div>
                        <p className="shop-footer__title">{t('landing.footerContactTitle')}</p>
                        <ul className="shop-footer__contact">
                            <li><i className="bi bi-geo-alt"></i> Phnom Penh, Cambodia</li>
                            <li><i className="bi bi-telephone"></i> +855 12 345 678</li>
                            <li><i className="bi bi-envelope"></i> support@ishop.com</li>
                        </ul>
                    </div>
                </div>
                <div className="shop-footer__bottom">
                    {t('landing.footerRights').replace('{year}', String(new Date().getFullYear()))}
                </div>
            </footer>

            {/* 🌟 ប៊ូតុងកន្ត្រកអណ្តែតនៅខាងក្រោមឆ្វេង */}
            {totalItems > 0 && (
                <button
                    className="floating-cart-btn"
                    onClick={() => navigate('/cart')}
                    aria-label={t('landing.viewCart')}
                >
                    <i className="bi bi-cart3"></i>
                    <span className="floating-cart-btn__badge">{totalItems}</span>
                </button>
            )}

        </div>
    );
};

export default LandingPage;

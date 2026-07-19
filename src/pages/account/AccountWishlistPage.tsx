// src/pages/account/AccountWishlistPage.tsx
// បញ្ជីទំនិញចង់បាន (Wishlist)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import '../../styles/shop-ui.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AccountWishlistPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCartFromWishlist = (item: (typeof wishlistItems)[number]) => {
        addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image });
    };

    return (
        <div className="cart-page">
            <div className="cart-page__inner">
                <button className="cart-back-btn" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('account.backToShop')}
                </button>

                <h2 className="cart-title">
                    <span className="cart-title__icon"><i className="bi bi-heart"></i></span>
                    {t('account.wishlist')}
                </h2>

                <div className="account-section">
                    <h3 className="account-section__title">
                        <i className="bi bi-heart"></i> {t('account.wishlist')}
                        <span className="db-panel__count">{wishlistItems.length}</span>
                    </h3>

                    {wishlistItems.length === 0 ? (
                        <div className="shop-empty-state" style={{ backgroundColor: 'var(--shop-bg)', borderRadius: '14px' }}>
                            <i className="bi bi-heart"></i>
                            <p className="mb-0">{t('account.noWishlist')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="account-order-list">
                                {wishlistItems.map((item) => (
                                    <div key={item.id} className="account-order-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {item.image && (
                                                <img
                                                    src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`}
                                                    alt={item.name}
                                                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px' }}
                                                />
                                            )}
                                            <p className="account-order-item__id" style={{ margin: 0 }}>{item.name}</p>
                                        </div>
                                        <p className="account-order-item__total">${Number(item.price).toLocaleString()}</p>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleAddToCartFromWishlist(item)}>
                                                <i className="bi bi-cart-plus"></i> {t('account.addToCart')}
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromWishlist(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-sm btn-link text-muted mt-2" onClick={clearWishlist}>
                                {t('account.clearWishlist')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountWishlistPage;

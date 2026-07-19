import React from 'react';
import { useCart, CartItem } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/shop-ui.css';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23aaaaaa'>No Image</text></svg>";

interface APIOrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface APIOrderData {
    customer_name: string;
    total_amount: number;
    items: APIOrderItem[];
}

const CartPage: React.FC = () => {
    const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const totalAmount: number = cartItems.reduce((acc: number, item: CartItem) => acc + (item.price * item.qty), 0);
    const totalItems: number = cartItems.reduce((acc: number, item: CartItem) => acc + item.qty, 0);

    const handleCheckout = async (): Promise<void> => {
        const orderData: APIOrderData = {
            customer_name: "Sroh Bunlin",
            total_amount: totalAmount,
            items: cartItems.map((item: CartItem): APIOrderItem => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.qty,
                price: item.price
            }))
        };

        try {
            const response = await axios.post('https://api.i-knet.com/api/orders/add', orderData);
            if (response.status === 200) {
                alert(t('cart.orderSuccess'));
                clearCart();
                navigate('/');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("API Error:", err.response?.data || err.message);
            } else {
                console.error("Unexpected Error:", err);
            }
            alert(t('cart.orderFail'));
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-page__inner">
                <button className="cart-back-btn" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('cart.backToShop')}
                </button>

                <h2 className="cart-title">
                    <span className="cart-title__icon"><i className="bi bi-cart3"></i></span>
                    {t('cart.title')}
                </h2>

                {cartItems.length === 0 ? (
                    <div className="shop-empty-state" style={{ backgroundColor: 'var(--shop-surface)', borderRadius: '18px', border: '1px solid var(--shop-border)' }}>
                        <i className="bi bi-cart-x"></i>
                        <p className="mb-3">{t('cart.empty')}</p>
                        <button className="checkout-btn" style={{ maxWidth: '220px', margin: '0 auto' }} onClick={() => navigate('/')}>
                            <i className="bi bi-shop"></i> {t('cart.goShopping')}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="cart-list">
                            {cartItems.map((item: CartItem) => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item__info">
                                        <img
                                            className="cart-item__thumb"
                                            src={item.image && item.image !== "undefined" ? `${API_BASE_URL}${item.image}` : LOCAL_PLACEHOLDER}
                                            alt={item.name}
                                            onError={(e) => (e.target as HTMLImageElement).src = LOCAL_PLACEHOLDER}
                                        />
                                        <div>
                                            <h4 className="cart-item__name">{item.name}</h4>
                                            <p className="cart-item__unit-price">${item.price} × {item.qty}</p>
                                        </div>
                                    </div>
                                    <div className="cart-item__actions">
                                        <div className="qty-stepper">
                                            <button onClick={() => updateQty(item.id, 'dec')} aria-label={t('cart.decreaseQty')}>−</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 'inc')} aria-label={t('cart.increaseQty')}>+</button>
                                        </div>
                                        <span className="cart-item__line-total">${(item.price * item.qty).toLocaleString()}</span>
                                        <button className="cart-item__remove" onClick={() => removeFromCart(item.id)} aria-label={t('cart.remove')}>
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="cart-summary__row">
                                <span>{t('cart.itemCount')}</span>
                                <span>{totalItems} {t('cart.itemsUnit')}</span>
                            </div>
                            <div className="cart-summary__total">
                                <span>{t('cart.total')}</span>
                                <span>${totalAmount.toLocaleString()}</span>
                            </div>
                            <button className="checkout-btn" onClick={handleCheckout}>
                                <i className="bi bi-credit-card"></i> {t('cart.checkoutNow')}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                className="clear-cart-btn"
                                onClick={() => {
                                    if (window.confirm(t('cart.clearConfirm'))) {
                                        clearCart();
                                    }
                                }}
                            >
                                <i className="bi bi-trash3"></i> {t('cart.clearAll')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;

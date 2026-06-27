import React from 'react';
import { useCart, CartItem } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// 🌟 បន្ថែម API URL និង Placeholder
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
    const navigate = useNavigate();
    const totalAmount: number = cartItems.reduce((acc: number, item: CartItem) => acc + (item.price * item.qty), 0);

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
                alert("ការបញ្ជាទិញជោគជ័យ!");
                clearCart();
                navigate('/');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("API Error:", err.response?.data || err.message);
            } else {
                console.error("Unexpected Error:", err);
            }
            alert("មានបញ្ហាបច្ចេកទេស!");
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                ← ត្រឡប់ទៅទិញទំនិញ
            </button>

            <h2 style={{ borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>🛒 កន្ត្រកទិញទំនិញ</h2>

            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>មិនទាន់មានទំនិញក្នុងកន្ត្រកនៅឡើយទេ។</p>
                </div>
            ) : (
                <div>
                    {cartItems.map((item: CartItem) => (
                        <div key={item.id} style={cartItemStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                                {/* 🌟 កែសម្រួលការបង្ហាញរូបភាពនៅទីនេះ */}
                                <img
                                    src={item.image && item.image !== "undefined" ? `${API_BASE_URL}${item.image}` : LOCAL_PLACEHOLDER}
                                    width="60"
                                    height="60"
                                    style={{ objectFit: 'cover', borderRadius: '5px' }}
                                    alt={item.name}
                                    onError={(e) => (e.target as HTMLImageElement).src = LOCAL_PLACEHOLDER}
                                />

                                <div>
                                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                                    <p style={{ margin: 0, color: '#666' }}>${item.price} x {item.qty}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={qtyControlStyle}>
                                    <button
                                        style={qtyBtnStyle}
                                        onClick={() => updateQty(item.id, 'dec')}
                                    >
                                        −
                                    </button>

                                    <span style={{ fontWeight: 'bold', margin: '0 10px' }}>{item.qty}</span>

                                    <button
                                        style={qtyBtnStyle}
                                        onClick={() => updateQty(item.id, 'inc')}
                                    >
                                        +
                                    </button>
                                </div>
                                <span style={{ fontWeight: 'bold' }}>${(item.price * item.qty).toLocaleString()}</span>
                                <button onClick={() => removeFromCart(item.id)} style={deleteBtnStyle}>លុប</button>
                            </div>
                        </div>
                    ))}

                    <div style={{ marginTop: '30px', textAlign: 'right', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <h3>សរុប៖ <span style={{ color: '#28a745' }}>${totalAmount.toLocaleString()}</span></h3>
                        <button style={checkoutBtnStyle} onClick={handleCheckout}>
                            បង់ប្រាក់ឥឡូវនេះ
                        </button>
                    </div>
                </div>
            )}
            {cartItems.length > 0 && (
                <button
                    onClick={() => {
                        if(window.confirm("តើអ្នកពិតជាចង់លុបទំនិញទាំងអស់មែនទេ?")) {
                            clearCart();
                        }
                    }}
                    style={{ color: 'red', cursor: 'pointer', marginTop: '20px', background: 'none', border: '1px solid red', padding: '5px 10px', borderRadius: '5px' }}
                >
                    🗑️ លុបទាំងអស់ចេញពីកន្ត្រក
                </button>
            )}
        </div>
    );
};

const cartItemStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' };
const deleteBtnStyle: React.CSSProperties = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const checkoutBtnStyle: React.CSSProperties = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const qtyControlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    padding: '5px 15px',
    backgroundColor: '#fff'
};

const qtyBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#28a745',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s'
};

export default CartPage;
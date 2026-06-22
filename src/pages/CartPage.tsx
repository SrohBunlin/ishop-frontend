import React from 'react';
import { useCart, CartItem } from '../context/CartContext'; // ទាញយក useCart និង CartItem interface មកប្រើ
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// កំណត់រចនាសម្ព័ន្ធទិន្នន័យសម្រាប់ទំនិញដែលត្រូវផ្ញើទៅ API (API Order Item Interface)
interface APIOrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
}

// កំណត់រចនាសម្ព័ន្ធទិន្នន័យលំដាប់កុម្ម៉ង់ទាំងមូល (API Order Data Interface)
interface APIOrderData {
    customer_name: string;
    total_amount: number;
    items: APIOrderItem[];
}

const CartPage: React.FC = () => {
    const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    // គណនាតម្លៃសរុប (TypeScript ដឹងច្បាស់ថា acc និង item គឺជាប្រភេទអ្វី)
    const totalAmount: number = cartItems.reduce((acc: number, item: CartItem) => acc + (item.price * item.qty), 0);

    const handleCheckout = async (): Promise<void> => {
        // រៀបចំទិន្នន័យឱ្យត្រូវតាមឈ្មោះ Column ក្នុង Database (snake_case) ដោយភ្ជាប់ជាមួយប្រភេទ APIOrderData
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
                                {/* បើ cartItems មិនទាន់មាន imageUrl ទេ អាចប្រើ image ដែលមានក្នុង CartItem interface */}
                                <img src={item.image || 'https://via.placeholder.com/60'} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '5px' }} alt={item.name} />
                                <div>
                                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                                    <p style={{ margin: 0, color: '#666' }}>${item.price} x {item.qty}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={qtyControlStyle}>
                                    {/* ប៊ូតុងដក (-) */}
                                    <button
                                        style={qtyBtnStyle}
                                        onClick={() => updateQty(item.id, 'dec')}
                                    >
                                        −
                                    </button>

                                    <span style={{ fontWeight: 'bold', margin: '0 10px' }}>{item.qty}</span>

                                    {/* ប៊ូតុងបូក (+) */}
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

// Styles (ប្រើប្រាស់ React.CSSProperties សម្រាប់គ្រប់គ្រង Inline Styles)
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
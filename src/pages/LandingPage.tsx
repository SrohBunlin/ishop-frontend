import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'https://api.i-knet.com';

// ១. បង្កើត Interface សម្រាប់ផលិតផលដែលបង្ហាញនៅលើទំព័រមុខ
interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    image?: string;
}

const LandingPage: React.FC = () => {
    // ២. កំណត់ប្រភេទ State ជា Array នៃ Product interface
    const [products, setProducts] = useState<Product[]>([]);
    const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23aaaaaa'>No Image</text></svg>";

    useEffect(() => {
        // ទាញទិន្នន័យពី Backend (Spring Boot) ដោយភ្ជាប់ប្រភេទទិន្នន័យ <Product[]> ជាមួយ Axios
        axios.get<Product[]>('https://api.i-knet.com/api/products/all')
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    }, []);

    const { addToCart, cartItems } = useCart();
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}>
            {/* 1. Navbar */}
            <nav style={navStyle}>
                <h2>📦 iShop</h2>
                <input type="text" placeholder="ស្វែងរកទំនិញ..." style={searchStyle} />

                {/* Icon កន្ត្រកទិញទំនិញ */}
                <div onClick={() => navigate('/cart')} style={cartContainerStyle}>
                    <span style={{ fontSize: '24px' }}>🛒</span>
                    {cartItems.length > 0 && (
                        <span style={badgeStyle}>{cartItems.length}</span>
                    )}
                </div>

                {/* ក្នុងផ្នែក Navbar ត្រង់ប៊ូតុង Admin Login */}
                <i onClick={() => navigate('/login')} style={loginBtnStyle} className="bi bi-person-circle fs-1"></i>
            </nav>

            {/* 2. Hero Section */}
            <header style={heroStyle}>
                <h1>ស្វាគមន៍មកកាន់ iShop</h1>
                <p>ទិញទំនិញបច្ចេកវិទ្យាចុងក្រោយបង្អស់នៅទីនេះ!</p>
            </header>

            {/* 3. Product Display */}
            <div style={gridContainer}>
                {products.map((product: Product) => (
                    <div key={product.id} style={cardStyle}>
                        <img
                            src={product.image && product.image !== "undefined" ? `${API_BASE_URL}${product.image}` : LOCAL_PLACEHOLDER}
                            alt={product.name}
                            className="card-img-top"
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                // កំណត់ប្រភេទ Type Cast ឱ្យទៅ HTMLImageElement ដើម្បីអាចប្តូរ src ពេលរូបភាពបែក
                                const target = e.target as HTMLImageElement;
                                target.src = LOCAL_PLACEHOLDER;
                            }}
                        />
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '10px 0' }}>{product.name}</h4>
                            <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '18px' }}>
                                ${product.price}
                            </p>
                            {/* ប៊ូតុងដាក់ក្នុងកន្ត្រក */}
                            <button
                                style={addBtnStyle}
                                onClick={() => {
                                    // បំប្លែងប្រភេទ product ពី LandingPage ទៅជាទម្រង់ CartItem ដែល addToCart ត្រូវការ
                                    addToCart({
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        quantity: 1,
                                        image: product.image
                                    });
                                }}
                                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    const target = e.target as HTMLButtonElement;
                                    target.style.backgroundColor = '#218838';
                                }}
                                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    const target = e.target as HTMLButtonElement;
                                    target.style.backgroundColor = '#28a745';
                                }}
                            >
                                🛒 ដាក់ក្នុងកន្ត្រក
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Styles (ប្រើប្រាស់ React.CSSProperties ទាំងអស់ដើម្បីឱ្យមាន Autocomplete ក្នុង TSX) ---
const searchStyle: React.CSSProperties = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '300px' };
const loginBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#124F9C',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500'
};
const heroStyle: React.CSSProperties = { textAlign: 'center', padding: '60px 20px', backgroundColor: '#28a745', color: '#fff' };
const gridContainer: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', padding: '40px 50px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' };

const addBtnStyle: React.CSSProperties = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
};

const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '2px solid white'
};

const cartContainerStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
};

const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 50px',
    backgroundColor: '#fff',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
};

export default LandingPage;
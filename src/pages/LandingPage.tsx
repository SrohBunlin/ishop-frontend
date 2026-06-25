// src/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_BASE_URL=process.env.REACT_APP_API_URL;

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    image?: string;
}

const LandingPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23aaaaaa'>No Image</text></svg>";

    useEffect(() => {
        axios.get<Product[]>(`${API_BASE_URL}/api/products/all`)
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    }, []);

    const { addToCart } = useCart();

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}>

            {/* 1. Navbar ត្រូវបានសម្អាត៖ ដកទាំង Cart និង Login ចេញ ព្រោះយើងប្រើ Navbar កណ្តាលដែលយើងបានសរសេររួចហើយ */}
            <nav style={navStyle}>
                <h2 style={{ margin: 0 }}>📦 iShop</h2>
                <input type="text" placeholder="ស្វែងរកទំនិញ..." style={searchStyle} />
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
                            style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                            onError={(e) => (e.target as HTMLImageElement).src = LOCAL_PLACEHOLDER}
                        />
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '10px 0' }}>{product.name}</h4>
                            <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '18px' }}>
                                ${product.price}
                            </p>
                            <button
                                style={addBtnStyle}
                                onClick={() => addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: 1,
                                    image: product.image
                                })}
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

// --- Styles សាមញ្ញសម្រាប់ LandingPage ---
const navStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', backgroundColor: '#fff', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const searchStyle: React.CSSProperties = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '300px' };
const heroStyle: React.CSSProperties = { textAlign: 'center', padding: '60px 20px', backgroundColor: '#28a745', color: '#fff' };
const gridContainer: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', padding: '40px 50px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' };
const addBtnStyle: React.CSSProperties = { backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' };

export default LandingPage;
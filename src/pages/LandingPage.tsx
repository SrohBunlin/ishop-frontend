// src/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
// បើប្អូនចង់ឱ្យពេលចុចវាលោតទៅទំព័រ Cart អាចប្រើ useNavigate
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

    const navigate = useNavigate();

    useEffect(() => {
        axios.get<Product[]>(`${API_BASE_URL}/api/products/all`)
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    }, []);

    // 🌟 ទាញយកទាំង addToCart និង cart (ទិន្នន័យក្នុងកន្ត្រក) ដើម្បីរាប់ចំនួន
    const { addToCart, cartItems } = useCart();

    // រាប់ចំនួនទំនិញសរុបក្នុងកន្ត្រក (បើសិនជា CartContext របស់ប្អូនមានទម្រង់ជា Array)
    const totalItems = cartItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', position: 'relative', minHeight: '100vh' }}>

            <nav style={navStyle}>
                <h2 style={{ margin: 0 }}>📦 iShop</h2>
                <input type="text" placeholder="ស្វែងរកទំនិញ..." style={searchStyle} />
            </nav>

            <header style={heroStyle}>
                <h1>ស្វាគមន៍មកកាន់ iShop</h1>
                <p>ទិញទំនិញបច្ចេកវិទ្យាចុងក្រោយបង្អស់នៅទីនេះ!</p>
            </header>

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

            {/* 🌟 នេះគឺជាប៊ូតុងកន្ត្រកអណ្តែតនៅខាងក្រោមឆ្វេង */}
            <div
                style={floatingCartStyle}
                onClick={() => navigate('/cart')} // ពេលចុចឱ្យរត់ទៅកាន់ Route /cart
            >
                <i className="bi bi-cart3"></i>

                {/* បង្ហាញចំនួនទំនិញពណ៌ក្រហម (Badge) ប្រសិនបើមានទំនិញក្នុងកន្ត្រក */}
                {totalItems > 0 && (
                    <span style={badgeStyle}>
                        {totalItems}
                    </span>
                )}
            </div>

        </div>
    );
};

// ... (Style ផ្សេងៗដែលប្អូនមានស្រាប់)
const navStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', backgroundColor: '#fff', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const searchStyle: React.CSSProperties = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '300px' };
const heroStyle: React.CSSProperties = { textAlign: 'center', padding: '60px 20px', backgroundColor: '#28a745', color: '#fff' };
const gridContainer: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', padding: '40px 50px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' };
const addBtnStyle: React.CSSProperties = { backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' };

// 🌟 Style សម្រាប់ Floating Cart
const floatingCartStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '40px', // គម្លាតពីបាតអេក្រង់
    left: '40px',   // 🌟 ដាក់នៅខាងឆ្វេង (ឆ្វេង = left, ស្តាំ = right)
    backgroundColor: '#0d6efd', // ពណ៌ខៀវ (ឬប្អូនអាចប្តូរជា #28a745 ពណ៌បៃតងតាម Theme ក៏បាន)
    color: '#fff',
    width: '65px',
    height: '65px',
    borderRadius: '50%', // ធ្វើឱ្យវាមានរាងមូល
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    zIndex: 1000,
    transition: 'transform 0.2s ease-in-out' // ឱ្យវារលោងពេលយក Mouse ទៅដាក់ពីលើ
};

// 🌟 Style សម្រាប់រង្វង់ពណ៌ក្រហម (Badge) រាប់ចំនួនទំនិញ
const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545', // ពណ៌ក្រហម
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
};

export default LandingPage;
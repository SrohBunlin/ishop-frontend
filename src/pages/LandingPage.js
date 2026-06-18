import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'https://api.i-knet.com';
const LandingPage = () => {
    const [products, setProducts] = useState([]);
    const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23aaaaaa'>No Image</text></svg>";
    useEffect(() => {
        // ទាញទិន្នន័យពី Backend (Spring Boot)
        axios.get('https://api.i-knet.com/api/products/all')
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    }, []);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const { cartItems } = useCart();
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
                <i onClick={() => navigate('/login')} style={loginBtnStyle} className="bi bi-person-circle fs-1">
                </i>
            </nav>

            {/* 2. Hero Section */}
            <header style={heroStyle}>
                <h1>ស្វាគមន៍មកកាន់ iShop</h1>
                <p>ទិញទំនិញបច្ចេកវិទ្យាចុងក្រោយបង្អស់នៅទីនេះ!</p>
            </header>
            {/* 3. Product Display */}
            <div style={gridContainer}>
                {products.map(product => (
                    <div key={product.id} style={cardStyle}>
                        <img
                            src={product.image && product.image !== "undefined" ? `${API_BASE_URL}${product.image}` : LOCAL_PLACEHOLDER}
                            alt={product.name}
                            className="card-img-top"
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = LOCAL_PLACEHOLDER;
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
                                onClick={() => addToCart(product)}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'} // ពណ៌ចាស់ជាងមុនបន្តិចពេល Hover
                                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
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

// --- Styles ---
const searchStyle = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '300px' };
const loginBtnStyle = {
    backgroundColor: 'none',
    color: '#124F9C',
    border: 'none',
    // padding: '8px 18px',
    //borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500'
};
const heroStyle = { textAlign: 'center', padding: '60px 20px', backgroundColor: '#28a745', color: '#fff' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', padding: '40px 50px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' };
const imgStyle = { width: '100%', height: '200px', objectFit: 'cover' };
const addBtnStyle = {
    backgroundColor: '#28a745', // ពណ៌បៃតងតំណាងឱ្យការទិញ
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    transition: 'background-color 0.3s ease', // បន្ថែម Effect ពេលប្តូរពណ៌
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px' // ចន្លោះរវាង Icon និងអក្សរ
};
const badgeStyle = {
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

const cartContainerStyle = {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
};
// const navRightSide = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '25px'
// };

const navStyle = {
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
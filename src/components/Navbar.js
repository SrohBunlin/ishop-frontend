
import React from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    // Helper function to determine if a link is active
    const isActive = (path) => location.pathname === path;

    const navItemStyle = (path) => ({
        // Adds the blue bottom border only when active
        borderBottom: isActive(path) ? '3px solid #1877f2' : '3px solid transparent',
        transition: 'all 0.2s ease'
    });

    const iconStyle = (path) => ({
        // Changes icon color to blue when active, grey when not
        color: isActive(path) ? '#1877f2' : '#65676b',
        fontSize: '1.8rem'
    });
    const navigate = useNavigate(); // 👈 ២. ប្រកាស variable ឈ្មោះ navigate

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login'); // ឥឡូវនេះវានឹងឈប់លោត Error ហើយ
    };
    const searchContainerStyle = {
        backgroundColor: '#f0f2f5',
        borderRadius: '20px',
        padding: '5px 12px',
        display: 'flex',
        alignItems: 'center',
        width: '240px'
    };

    const searchInputStyle = {
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        marginLeft: '8px',
        width: '100%',
        fontSize: '14px'
    };
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm w-100" style={{zindex: 1050, top: 0}} >
            <div className="container-fluid">

                {/* LEFT SECTION: Logo & Search */}
                <div>
                    <Link className="navbar-brand fw-bold text-primary" to="/" style={{ fontSize: '24px' }}>
                        I-Shop
                    </Link>
                </div>
                    <div style={searchContainerStyle}>
                        <i className="bi bi-search text-muted" style={{ fontSize: '14px' }}></i>
                        <input
                            type="text"
                            placeholder="ស្វែងរកទំនិញ..."
                            style={searchInputStyle}
                        />
                    </div>

                {/* CENTER SECTION: Navigation Icons */}
                <div className="d-none d-lg-flex justify-content-center flex-grow-1">
                    <ul className="navbar-nav d-flex flex-row">
                        {/* Home Icon */}
                        <li className="nav-item px-4" style={navItemStyle('/')}>
                            <Link className="nav-link" to="/">
                                <i className={isActive('/') ? "bi bi-house-door-fill" : "bi bi-house-door"}
                                   style={iconStyle('/')}></i>
                            </Link>
                        </li>
                        {/* Cart Icon */}
                        <li className="nav-item px-4" style={navItemStyle('/cart')}>
                            <Link className="nav-link" to="/cart">
                                <i className={isActive('/cart') ? "bi bi-cart-fill" : "bi bi-cart"}
                                   style={iconStyle('/cart')}></i>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* RIGHT SECTION: Profile & Logout */}
                <div className="d-flex align-items-center justify-content-end flex-grow-1" style={{ flexBasis: 0 }}>
                    <div className="d-flex align-items-center">
                        <button className="btn btn-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-grid-3x3-gap-fill"></i>
                        </button>
                        <button className="btn btn-light rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-bell-fill"></i>
                        </button>
                        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill ms-2">
                            ចាកចេញ
                        </button>
                    </div>

                    {/* Mobile Menu Toggler */}
                    <button className="navbar-toggler ms-2 border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

            </div>
        </nav>
    );
};


//const searchStyle = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '300px' };

export default Navbar;


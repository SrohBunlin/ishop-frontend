import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// ១. កំណត់ប្រភេទ Props សម្រាប់ Sidebar (ទទួល handleLogout ជា Function ដែលគ្មាន Return)
interface SidebarProps {
    handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleLogout }) => {
    const location = useLocation();

    // ២. កំណត់ឱ្យត្រឡប់តម្លៃជា boolean ច្បាស់លាស់
    const isActive = (path: string): boolean => location.pathname === path;

    return (
        <aside
            className="d-none d-md-block sticky-top shadow-sm"
            style={{
                width: '260px',
                backgroundColor: '#124F9C',
                top: '0',        // ជាប់នៅខាងលើបំផុត
                height: '100%',      // ឱ្យវាលាតពេញកម្ពស់ដែលនៅសល់
                position: 'relative', // ប្តូរពី sticky មក relative
                overflowY: 'auto', // បើ Menu ច្រើន វានឹង Scroll ក្នុង Sidebar ខ្លួនឯង
                flexShrink: 0     // ការពារកុំឱ្យ Sidebar រួញទទឹង
            }}
        >
            <div className="flex-grow-1 pt-3">
                <Link to="/admin/dashboard" className={`sidebar-link d-flex align-items-center p-3 text-white text-decoration-none ${isActive('/admin/dashboard') ? 'bg-white bg-opacity-25' : ''}`}>
                    <i className="bi bi-speedometer2 me-3"></i> Dashboard
                </Link>
                <Link to="/products" className={`sidebar-link d-flex align-items-center p-3 text-white text-decoration-none ${isActive('/products') ? 'bg-white bg-opacity-25' : ''}`}>
                    <i className="bi bi-box-seam me-3"></i> Inventory
                </Link>
                <Link to="/orders-tracking" className={`sidebar-link d-flex align-items-center p-3 text-white text-decoration-none ${isActive('/admin/orders-tracking') ? 'bg-white bg-opacity-25' : ''}`}>
                    <i className="bi bi-truck me-3"> </i> Order Tracking
                </Link>
                <hr className="mx-3 text-white opacity-50" />

                <button onClick={handleLogout} className="sidebar-link d-flex align-items-center p-3 bg-transparent border-0 w-100 text-warning text-start">
                    <i className="bi bi-box-arrow-right me-3"></i> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
// src/components/Navbar.tsx
import React from 'react';
import LandingPage from '../pages/LandingPage';
import LoginPage from "../pages/LoginPage";

interface OpenedPageItem {
    id: string;
    title: string;
    icon: string;
}

interface NavbarProps {
    openedPages: OpenedPageItem[];
    currentPageId: string | null;
    onOpenTab: (id: string, title: string, component: React.ReactNode, iconClass: string) => void;
    onClosePage: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ openedPages, currentPageId, onOpenTab, onClosePage }) => {
    const isPageOpened = (id: string) => openedPages.some(page => page.id === id);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 px-4 shadow-sm">
            <style>{`.custom-dropdown-btn::after { display: none !important; }`}</style>

            <div className="container-fluid">
                {/* ផ្នែកឆ្វេង៖ Logo & Search */}
                <div className="d-flex align-items-center" style={{ width: '300px' }}>
                    <span className="navbar-brand fw-bold text-primary fs-3" style={{ cursor: 'pointer' }} onClick={() => onOpenTab('home-page', '🏠 ទំព័រដើម', <LandingPage />, 'bi-house-door')}>
                        iShop
                    </span>
                </div>

                {/* 🌟 ផ្នែកកណ្តាល៖ បង្ខំឱ្យ Icons និង ប៊ូតុង Add នៅចំកណ្តាល Navbar តែម្តង 🌟 */}
                <div className="d-flex align-items-center justify-content-center flex-grow-1">
                    {openedPages.map((page) => (
                        <div
                            key={page.id}
                            className="position-relative mx-2 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: currentPageId === page.id ? '#e7f1ff' : '#f8f9fa', border: currentPageId === page.id ? '2px solid #0d6efd' : '1px solid #dee2e6', cursor: 'pointer' }}
                            onClick={() => {
                                if (page.id === 'home-page') onOpenTab('home-page', '🏠 ទំព័រដើម', <LandingPage />, 'bi-house-door');
                                if (page.id === 'user-login') onOpenTab('user-login', '👤 គណនីអ្នកប្រើប្រាស់', <LoginPage/>, 'bi-person-lock');
                            }}
                        >
                            <i className={`bi ${page.icon} fs-4 ${currentPageId === page.id ? 'text-primary' : 'text-secondary'}`}></i>
                            <span className="position-absolute d-flex align-items-center justify-content-center text-white bg-danger rounded-circle shadow-sm" onClick={(e) => { e.stopPropagation(); onClosePage(page.id); }} style={{ top: '-3px', right: '-3px', width: '18px', height: '18px', fontSize: '10px', fontWeight: 'bold', border: '2px solid #fff' }}>✕</span>
                        </div>
                    ))}

                    <div className="dropdown mx-2">
                        <button className="btn d-flex align-items-center justify-content-center p-0 dropdown-toggle custom-dropdown-btn border-0" type="button" id="navbarDropdownAdd" data-bs-toggle="dropdown" aria-expanded="false" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', color: '#fff', boxShadow: '0 4px 10px rgba(13, 110, 253, 0.3)' }}>
                            <i className="bi bi-plus-lg fs-4 fw-bold"></i>
                        </button>
                        <ul className="dropdown-menu border-0 p-2 mt-2 shadow-lg" aria-labelledby="navbarDropdownAdd" style={{ minWidth: '220px', borderRadius: '16px' }}>
                            <li className="px-3 py-2 fw-bold text-muted" style={{ fontSize: '11px' }}>ជម្រើសការងាររហ័ស</li>
                            {!isPageOpened('home-page') && <li><button className="dropdown-item py-2 d-flex align-items-center" onClick={() => onOpenTab('home-page', '🏠 ទំព័រដើម', <LandingPage />, 'bi-house-door')}><i className="bi bi-house-door text-primary me-3"></i> ទំព័រដើម</button></li>}
                            {!isPageOpened('user-login') && <li><button className="dropdown-item py-2 d-flex align-items-center" onClick={() => onOpenTab('user-login', '👤 គណនីអ្នកប្រើប្រាស់', <LoginPage/>, 'bi-person-lock')}><i className="bi bi-person-lock text-success me-3"></i> គណនីយ</button></li>}
                        </ul>
                    </div>
                </div>

                {/* ផ្នែកខាងស្តាំ៖ ទុកទំនេរដើម្បីឱ្យផ្នែកកណ្តាលនៅចំកណ្តាលពិតប្រាកដ */}
                <div style={{ width: '300px' }}></div>
            </div>
        </nav>
    );
};

export default Navbar;
// src/components/Navbar.tsx
import React, { useRef, useEffect } from 'react';
import LandingPage from '../pages/LandingPage';
import LoginPage from "../pages/LoginPage";

interface OpenedPageItem {
    id: string;
    icon: string;
}

interface NavbarProps {
    openedPages: OpenedPageItem[];
    currentPageId: string | null;
    onOpenTab: (id: string, title: string, component: React.ReactNode, iconClass: string) => void;
    onClosePage: (id: string) => void;
}

// បង្កើត Object សម្រាប់ផ្ទុកទិន្នន័យទំព័រ ដើម្បីងាយស្រួលគ្រប់គ្រង និងមិនបាច់សរសេរកូដដដែលៗ
const AVAILABLE_PAGES: Record<string, { title: string, component: React.ReactNode, icon: string }> = {
    'home-page': { title: '🏠 ទំព័រដើម', component: <LandingPage />, icon: 'bi-house-door' },
    'user-login': { title: '👤 គណនីអ្នកប្រើប្រាស់', component: <LoginPage />, icon: 'bi-person-lock' }
};

const Navbar: React.FC<NavbarProps> = ({ openedPages, currentPageId, onOpenTab, onClosePage }) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // បោសសម្អាត Timer នៅពេល Component ត្រូវបាន unmount ដើម្បីការពារ Memory Leak
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handlePressStart = (id: string) => {
        timerRef.current = setTimeout(() => {
            onClosePage(id);
        }, 1000); // 1000ms = 1 វិនាទី (លុបចោលភ្លាមៗ)
    };

    const handlePressEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleTabClick = (id: string) => {
        const page = AVAILABLE_PAGES[id];
        if (page) {
            onOpenTab(id, page.title, page.component, page.icon);
        }
    };

    const isPageOpened = (id: string) => openedPages.some(page => page.id === id);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 px-4 shadow-sm">
            <style>{`
                .custom-dropdown-btn::after { display: none !important; }
            `}</style>

            <div className="container-fluid">
                <div className="d-flex align-items-center" style={{ width: '300px' }}>
                    <span
                        className="navbar-brand fw-bold text-primary fs-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTabClick('home-page')}
                    >
                        iShop
                    </span>
                </div>

                <div className="d-flex align-items-center justify-content-center flex-grow-1">
                    {openedPages.map((page) => (
                        <div
                            key={page.id}
                            className="position-relative mx-2 d-flex align-items-center justify-content-center shadow-sm"
                            style={{
                                width: '44px', height: '44px', borderRadius: '50%',
                                backgroundColor: currentPageId === page.id ? '#e7f1ff' : '#f8f9fa',
                                border: currentPageId === page.id ? '2px solid #0d6efd' : '1px solid #dee2e6',
                                cursor: 'pointer',
                                userSelect: 'none' // ការពារកុំឱ្យ highlight ពេលសង្កត់យូរ
                            }}

                            // 🌟 មុខងារថ្មី៖ ចុចសង្កត់ (Hold) 1 វិនាទី គឺលុបចោលភ្លាម (សម្រាប់កុំព្យូទ័រ)
                            onMouseDown={() => handlePressStart(page.id)}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}

                            // 🌟 បន្ថែមសម្រាប់ទូរស័ព្ទដៃ (Touch Devices)
                            onTouchStart={() => handlePressStart(page.id)}
                            onTouchEnd={handlePressEnd}
                            onTouchCancel={handlePressEnd}

                            // មុខងារចុចធម្មតា (Click)
                            onClick={() => handleTabClick(page.id)}
                        >
                            <i className={`bi ${page.icon} fs-4 ${currentPageId === page.id ? 'text-primary' : 'text-secondary'}`}></i>
                        </div>
                    ))}

                    <div className="dropdown mx-2">
                        <button className="btn d-flex align-items-center justify-content-center p-0 dropdown-toggle custom-dropdown-btn border-0" type="button" id="navbarDropdownAdd" data-bs-toggle="dropdown" aria-expanded="false" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', color: '#fff', boxShadow: '0 4px 10px rgba(13, 110, 253, 0.3)' }}>
                            <i className="bi bi-plus-lg fs-4 fw-bold"></i>
                        </button>
                        <ul className="dropdown-menu border-0 p-2 mt-2 shadow-lg" aria-labelledby="navbarDropdownAdd" style={{ minWidth: '220px', borderRadius: '16px' }}>
                            <li className="px-3 py-2 fw-bold text-muted" style={{ fontSize: '11px' }}>ជម្រើសការងាររហ័ស</li>

                            {!isPageOpened('home-page') && (
                                <li>
                                    <button className="dropdown-item py-2 d-flex align-items-center" onClick={() => handleTabClick('home-page')}>
                                        <i className="bi bi-house-door text-primary me-3"></i> ទំព័រដើម
                                    </button>
                                </li>
                            )}

                            {!isPageOpened('user-login') && (
                                <li>
                                    <button className="dropdown-item py-2 d-flex align-items-center" onClick={() => handleTabClick('user-login')}>
                                        <i className="bi bi-person-lock text-success me-3"></i> គណនីអ្នកប្រើប្រាស់
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div style={{ width: '300px' }}></div>
            </div>
        </nav>
    );
};

export default Navbar;
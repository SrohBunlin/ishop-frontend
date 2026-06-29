// src/components/Navbar.tsx
import React, { useRef, useEffect } from 'react';
import LandingPage from '../pages/LandingPage';
import LoginPage from "../pages/LoginPage";
import { useNavigate } from 'react-router-dom';

interface OpenedPageItem {
    id: string;
    icon: string;
}

interface NavbarProps {
    openedPages: OpenedPageItem[];
    currentPageId: string | null;
    onOpenTab: (id: string, title: string, component: React.ReactNode, iconClass: string) => void;
    onClosePage: (id: string) => void;
    userProfile?: {
        firstName: string;
        lastName: string;
        profilePictureUrl: string;
    };
    handleLogout?: () => void; // ➕ បន្ថែម Prop នេះដើម្បីហៅមុខងារ Logout រួមគ្នាពី App.tsx
}

const AVAILABLE_PAGES: Record<string, { title: string, component: React.ReactNode, icon: string }> = {
    'home-page': { title: '🏠 ទំព័រដើម', component: <LandingPage />, icon: 'bi-house-door' },
    'user-login': { title: '👤 គណនីអ្នកប្រើប្រាស់', component: <LoginPage />, icon: 'bi-person-lock' }
};

// 🟢 ដំណោះស្រាយ៖ បន្ថែម userProfile និង handleLogout ចូលក្នុងវង់ក្រចកខាងក្រោមនេះ
const Navbar: React.FC<NavbarProps> = ({ openedPages, currentPageId, onOpenTab, onClosePage, userProfile, handleLogout }) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    // ឆែកមើលស្ថានភាព Login រស់រវើក (Reactive) តាមរយៈទិន្នន័យរបស់ userProfile Prop
    const isLoggedIn = !!localStorage.getItem('token') && userProfile?.profilePictureUrl !== undefined;

    // 🟢 លុបការអានពី localStorage ចេញ ហើយទាញពី userProfile Prop វិញដោយផ្ទាល់
    const firstLetter = userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : 'U';

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handlePressStart = (id: string) => {
        timerRef.current = setTimeout(() => {
            onClosePage(id);
        }, 1000);
    };

    const handlePressEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleTabClick = (id: string) => {
        const page = AVAILABLE_PAGES[id];

        if (page) {
            onOpenTab(id, page.title, page.component, page.icon);
        } else {
            onOpenTab(id, 'ទំព័រ', null, 'bi-window');
        }

        if (id === 'home-page') {
            navigate('/');
        } else if (id === 'user-profile') {
            navigate('/admin/dashboard');
        } else {
            navigate(`/${id}`);
        }
    };

    const isPageOpened = (id: string) => openedPages.some(page => page.id === id);

    const visiblePages = openedPages.filter(page => {
        if (isLoggedIn && page.id === 'user-login') return false;
        if (!isLoggedIn && (page.id === 'user-profile' || page.icon === 'profile-img')) return false;
        return true;
    });

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 px-4 shadow-sm">
            <style>{`
                .custom-dropdown-btn::after { display: none !important; }
            `}</style>

            <div className="container-fluid flex-grow-1">
                <div className="d-flex align-items-center" style={{ width: '100px' }}>
                    <span
                        className="navbar-brand fw-bold text-primary fs-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTabClick('home-page')}
                    >
                        iShop
                    </span>
                </div>
                <div className="d-flex align-items-center justify-content-center flex-grow-1">

                    {visiblePages.map((page) => (
                        <div
                            key={page.id}
                            className="position-relative mx-2 d-flex align-items-center justify-content-center shadow-sm"
                            style={{
                                width: '44px', height: '44px', borderRadius: '50%',
                                backgroundColor: currentPageId === page.id ? '#e7f1ff' : '#f8f9fa',
                                border: currentPageId === page.id ? '2px solid #0d6efd' : '1px solid #dee2e6',
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onMouseDown={() => handlePressStart(page.id)}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchStart={() => handlePressStart(page.id)}
                            onTouchEnd={handlePressEnd}
                            onTouchCancel={handlePressEnd}
                            onClick={() => handleTabClick(page.id)}
                        >
                            {page.icon === 'profile-img' ? (
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                    style={{
                                        width: '40px', height: '40px',
                                        backgroundColor: '#0d6efd',
                                        fontWeight: 'bold', fontSize: '1.1rem',
                                        cursor: 'pointer', overflow: 'hidden'
                                    }}
                                >
                                    {/* 🟢 បង្ហាញរូបភាព ឬអក្សរកាត់ដោយផ្អែកលើ userProfile ពី Prop ទាំងស្រុង */}
                                    {userProfile && userProfile.profilePictureUrl ? (
                                        <img
                                            src={userProfile.profilePictureUrl}
                                            alt="User profile"
                                            className="rounded-circle"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                            {firstLetter}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <i className={`bi ${page.icon} fs-4 ${currentPageId === page.id ? 'text-primary' : 'text-secondary'}`}></i>
                            )}
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

                            {!isLoggedIn && !isPageOpened('user-login') && (
                                <li>
                                    <button className="dropdown-item py-2 d-flex align-items-center" onClick={() => handleTabClick('user-login')}>
                                        <i className="bi bi-person-lock text-success me-3"></i> គណនីអ្នកប្រើប្រាស់
                                    </button>
                                </li>
                            )}

                            {isLoggedIn && (
                                <li>
                                    <button
                                        className="dropdown-item py-2 d-flex align-items-center text-danger"
                                        onClick={() => {
                                            // 🟢 ហៅមុខងារ handleLogout ពី App.tsx មកប្រើ ដើម្បីឱ្យប្រព័ន្ធទាំងមូលឡុកអ៊ោតដោយរលូន (SPA)
                                            if (handleLogout) {
                                                handleLogout();
                                            } else {
                                                localStorage.clear();
                                                window.location.href = '/';
                                            }
                                        }}
                                    >
                                        <i className="bi bi-box-arrow-right me-3"></i> ចាកចេញ (Logout)
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div style={{ width: '100px' }}></div>
            </div>
        </nav>
    );
};

export default Navbar;
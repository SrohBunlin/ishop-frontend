// src/components/Navbar.tsx
import React, { useRef, useEffect } from 'react';
import LandingPage from '../pages/LandingPage';
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { useNavigate } from 'react-router-dom';
import AccountOverviewPage from "../pages/account/AccountOverviewPage";
import ThemeToggle from './common/ThemeToggle';
import LanguageToggle from './common/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import '../styles/shop-ui.css';

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
    handleLogout?: () => void;
}

const AVAILABLE_PAGES: Record<string, { titleKey: string, component: React.ReactNode, icon: string }> = {
    'home-page': { titleKey: 'nav.home', component: <LandingPage />, icon: 'bi-house-door' },
    'user-login': { titleKey: 'nav.account', component: <LoginPage />, icon: 'bi-person-lock' },
    'user-register': { titleKey: 'nav.register', component: <RegisterPage />, icon: 'bi-person-plus' },
    'user-profile': { titleKey: 'nav.myAccount', component: <AccountOverviewPage />, icon: 'profile-img' }
};

const Navbar: React.FC<NavbarProps> = ({ openedPages, currentPageId, onOpenTab, onClosePage, userProfile, handleLogout }) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navRef = useRef<HTMLElement | null>(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    // 📏 វាស់កម្ពស់ Navbar ជាក់ស្តែង ហើយផ្ទុកវាទុកជា CSS variable
    // ដើម្បីឱ្យ Sidebar និងប៊ូតុងលាក់/បង្ហាញរបស់វា គណនាទីតាំងបានត្រឹមត្រូវនៅក្រោម Navbar
    useEffect(() => {
        const updateNavbarHeight = () => {
            if (navRef.current) {
                document.documentElement.style.setProperty('--navbar-height', `${navRef.current.offsetHeight}px`);
            }
        };

        updateNavbarHeight();

        let resizeObserver: ResizeObserver | null = null;
        if (navRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateNavbarHeight);
            resizeObserver.observe(navRef.current);
        }

        window.addEventListener('resize', updateNavbarHeight);
        return () => {
            window.removeEventListener('resize', updateNavbarHeight);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, []);


    // ឆែកស្ថានភាព Login
    const isLoggedIn = !!localStorage.getItem('token');
    const userProfileString = localStorage.getItem('user_profile');
    const localUserProfile = userProfileString ? JSON.parse(userProfileString) : null;

    // 🟢 រួមបញ្ចូលគ្នាទាំងទិន្នន័យពី Prop និង LocalStorage ដើម្បីកុំឱ្យគាំងទិន្នន័យចាស់
    const currentUser = userProfile || localUserProfile;
    const firstLetter = currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U';

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handlePressEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleTabClick = (id: string) => {
        const page = AVAILABLE_PAGES[id];

        // ប្រើទិន្នន័យពី AVAILABLE_PAGES មកបើក Tab
        if (page) {
            onOpenTab(id, t(page.titleKey), page.component, page.icon);
        } else {
            onOpenTab(id, t('nav.page'), null, 'bi-window');
        }

        // រុញ Route ទៅតាម ID
        if (id === 'home-page') {
            navigate('/');
        } else if (id === 'user-login') {
            navigate('/login');
        } else if (id === 'user-register') {
            navigate('/register');
        } else if (id === 'user-profile') {
            navigate('/account');
        } else {
            navigate(`/${id}`);
        }
    };
    const isPageOpened = (id: string) => openedPages.some(page => page.id === id);

    /// នៅក្នុង Navbar.tsx
    const handlePressStart = (id: string) => {
        timerRef.current = setTimeout(() => {
            // ១. ពេលសង្កត់យូរ ឱ្យវាកត់ត្រាទុកក្នុង localStorage ថា "Tab នេះត្រូវលាក់"
            if (id === 'user-login' || id === 'user-profile') {
                localStorage.setItem('hidden_account_tab', 'true');
            }
            // ២. បន្ទាប់មកលុប Tab នេះចេញ
            onClosePage(id);
        }, 1000);
    };

// ៣. នៅក្នុង visiblePages៖ ឆែកមើលថាតើវាត្រូវបានលាក់ដោយអ្នកប្រើឬនៅ?
    const visiblePages = openedPages.filter(page => {
        if (isLoggedIn && (page.id === 'user-login' || page.id === 'user-register')) return false;
        if (!isLoggedIn && (page.id === 'user-profile' || page.icon === 'profile-img')) return false;
        return true;
    });

// ៤. លុប "hidden_account_tab" ចោលវិញពេល Logout (ដើម្បីឱ្យវាលោតមកវិញពេល Logout)
// បើ !isLoggedIn គឺត្រូវកែ localStorage ឱ្យទៅជា false
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem('hidden_account_tab', 'false');
        }
    }, [isLoggedIn]);

// ៥. បង្ហាញ Icon តែបើវាមិនទាន់ត្រូវបានលាក់
    const isHidden = localStorage.getItem('hidden_account_tab') === 'true';

    if (!isLoggedIn && !isHidden && !visiblePages.some(p => p.id === 'user-login')) {
        visiblePages.push({ id: 'user-login', icon: 'bi-person-lock' });
    }
    // បង្កើត Function ឡុកអ៊ោតរួមមួយ
    const executeLogout = () => {
        if (handleLogout) {
            handleLogout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('user_profile');
            localStorage.removeItem('role'); // 🟢 សម្អាត role ចាស់ចោលផងដែរ
            localStorage.removeItem('profileImage');
            window.location.href = '/';
        }
    };

    return (
        <nav ref={navRef as React.RefObject<HTMLElement>} className="app-navbar navbar navbar-expand-lg navbar-light sticky-top py-2 px-4">
            <div className="container-fluid flex-grow-1">
                {/* ផ្នែកខាងឆ្វេង៖ Logo iShop */}
                <div className="d-flex align-items-center" style={{ width: '130px' }}>
                    <span
                        className="navbar-brand-mark"
                        onClick={() => handleTabClick('home-page')}
                    >
                        <span className="brand-icon"><i className="bi bi-shop"></i></span>
                        <span className="brand-name">iShop</span>
                    </span>
                </div>

                {/* ផ្នែកកណ្តាល៖ កន្លែង Tabs រត់ផ្លាស់ប្តូរ */}
                <div className="d-flex align-items-center justify-content-center flex-grow-1">
                    {visiblePages.map((page) => (
                        <div
                            key={page.id}
                            className={`tab-chip mx-2 ${currentPageId === page.id ? 'is-active' : ''}`}
                            onMouseDown={() => handlePressStart(page.id)}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchStart={() => handlePressStart(page.id)}
                            onTouchEnd={handlePressEnd}
                            onTouchCancel={handlePressEnd}
                            onClick={() => handleTabClick(page.id)}
                            title={t('nav.tabHint')}
                        >
                            {page.icon === 'profile-img' ? (
                                <div className="tab-chip__avatar">
                                    {currentUser?.profilePictureUrl ? (
                                        <img
                                            src={currentUser.profilePictureUrl}
                                            alt="User profile"
                                        />
                                    ) : (
                                        <span>{firstLetter}</span>
                                    )}
                                </div>
                            ) : (
                                <i className={`bi ${page.icon} fs-5`}></i>
                            )}
                        </div>
                    ))}

                    <div className="dropdown mx-2">
                        <button className="add-tab-btn dropdown-toggle custom-dropdown-btn border-0" type="button" id="navbarDropdownAdd" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-plus-lg fs-5 fw-bold"></i>
                        </button>
                        <ul className="dropdown-menu border-0 p-2 mt-2 shadow-lg" aria-labelledby="navbarDropdownAdd" style={{ minWidth: '220px' }}>
                            <li className="px-3 py-2 fw-bold text-muted" style={{ fontSize: '11px' }}>{t('nav.inDevelopment')}</li>

                            {Object.keys(AVAILABLE_PAGES).map((key) => {
                                const page = AVAILABLE_PAGES[key];

                                // 🟢 កំណត់លក្ខខណ្ឌបង្ហាញ (Visibility Logic)
                                const isAlreadyOpened = isPageOpened(key);
                                const isGuestOnlyTab = key === 'user-login' || key === 'user-register';
                                const isProfileTab = key === 'user-profile';

                                // ១. បើមិនទាន់បើក Tab នោះ
                                // ២. បើបាន Login ហើយ ហាមបង្ហាញ 'user-login' / 'user-register'
                                // ៣. បើមិនទាន់ Login ហាមបង្ហាញ 'user-profile'
                                const shouldShow = !isAlreadyOpened &&
                                    (isLoggedIn ? !isGuestOnlyTab : !isProfileTab);

                                if (shouldShow) {
                                    return (
                                        <li key={key}>
                                            <button className="dropdown-item py-2 d-flex align-items-center" onClick={() => handleTabClick(key)}>
                                                <i className={`bi ${page.icon} me-3`}></i> {t(page.titleKey)}
                                            </button>
                                        </li>
                                    );
                                }
                                return null;
                            })}

                            {isLoggedIn && (
                                <li>
                                    <hr className="dropdown-divider" />
                                    <button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={executeLogout}>
                                        <i className="bi bi-box-arrow-right me-3"></i> {t('nav.logout')}
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* ផ្នែកខាងស្តាំ៖ ប៊ូតុងប្តូរភាសា & Night Mode */}
                <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: '190px' }}>
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

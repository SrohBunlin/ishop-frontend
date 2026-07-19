// src/App.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import InvoiceDetail from './pages/InvoiceDetail';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Navbar from './components/Navbar';
import OrderTracking from './pages/OrderTracking';
import OrdersPage from './pages/OrdersPage';
import InvoicesPage from './pages/InvoicesPage';
import ReturnsPage from './pages/ReturnsPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import ReviewsPage from './pages/ReviewsPage';
import EmployeesPage from './pages/EmployeesPage';
import AccountOverviewPage from './pages/account/AccountOverviewPage';
import AccountSecurityPage from './pages/account/AccountSecurityPage';
import AccountOrdersPage from './pages/account/AccountOrdersPage';
import AccountWishlistPage from './pages/account/AccountWishlistPage';
import AccountAddressesPage from './pages/account/AccountAddressesPage';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from "./components/Sidebar";
import {
    canViewOrders,
    canViewInvoices,
    canViewReturns,
    canViewProducts,
    canViewInventory,
    canViewCategories,
    canViewCustomers,
    canViewEmployees,
    canViewOrderTracking,
} from './utils/auth';

import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL=process.env.REACT_APP_API_URL;
interface OpenedPageItem {
    id: string;
    title: string;
    icon: string;
}

interface MainLayoutProps {
    children: ReactNode;
    userProfile?: {
        firstName: string;
        lastName: string;
        profilePictureUrl: string;
        avatar?: string;
    };
    setUser?: React.Dispatch<React.SetStateAction<{
        firstName: string;
        lastName: string;
        profilePictureUrl: string;
    }>>;
}

const MainLayout: React.FC<MainLayoutProps & { handleLogout: () => void }> = ({ children, handleLogout, userProfile, setUser }) => {
    const location = useLocation();
    const isAdminPath = ['/admin', '/products', '/orders-tracking'].some(path => location.pathname.startsWith(path));
    const isAccountPath = location.pathname.startsWith('/account');
    const showSidebar = isAdminPath || isAccountPath;

    // មុខងារលាក់/បង្ហាញ Sidebar (សំខាន់សម្រាប់អេក្រង់ទូរស័ព្ទ - off-canvas)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    // មុខងារលាក់/បង្ហាញ Sidebar សម្រាប់អេក្រង់កុំព្យូទ័រ (Desktop) - ចងចាំតម្លៃចុងក្រោយទុកក្នុង localStorage
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(
        () => localStorage.getItem('ishop_sidebar_collapsed') === 'true'
    );
    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('ishop_sidebar_collapsed', String(next));
            return next;
        });
    };

    // បិទ Sidebar ដោយស្វ័យប្រវត្តិរាល់ពេលប្តូរទំព័រ (សម្រាប់ទូរស័ព្ទ)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
            {showSidebar && (
                <>
                    {/* ប៊ូតុង Hamburger សម្រាប់លាក់/បង្ហាញ Sidebar - លេចឡើងតែលើទូរស័ព្ទប៉ុណ្ណោះ (ក្រោម Navbar) */}
                    <button
                        type="button"
                        className="sidebar-toggle-btn"
                        aria-label="Toggle sidebar"
                        onClick={toggleSidebar}
                    >
                        <i className={`bi ${isSidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
                    </button>

                    {/* ផ្ទាំងខ្មៅពីក្រោយ Sidebar លើទូរស័ព្ទ - ចុចដើម្បីបិទ */}
                    {isSidebarOpen && (
                        <div className="sidebar-backdrop" onClick={closeSidebar}></div>
                    )}

                    <div className={`admin-sidebar-wrap ${isSidebarOpen ? 'is-open' : ''} ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
                        <Sidebar handleLogout={handleLogout} userProfile={userProfile as any} setUser={setUser as any}/>
                    </div>

                    {/* ប៊ូតុងលាក់/បង្ហាញ Sidebar សម្រាប់អេក្រង់កុំព្យូទ័រ - ជាប់នៅគែម Sidebar ជានិច្ច */}
                    <button
                        type="button"
                        className="sidebar-collapse-btn"
                        aria-label="Hide or show sidebar"
                        title={isSidebarCollapsed ? 'បង្ហាញ Sidebar' : 'លាក់ Sidebar'}
                        onClick={toggleSidebarCollapse}
                    >
                        <i className={`bi ${isSidebarCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}></i>
                    </button>
                </>
            )}
            <div className="flex-grow-1 admin-content-area" style={{ overflowY: 'auto', backgroundColor: 'var(--shop-bg, #f8f9fa)' }}>
                {children}
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_profile');
        return savedUser ? JSON.parse(savedUser) : {
            firstName: 'គោត្តនាម',
            lastName: 'នាម',
            profilePictureUrl: ''
        };
    });

    const isAuthenticated = () => localStorage.getItem('token') !== null;

    const [openedPages, setOpenedPages] = useState<OpenedPageItem[]>(() => {
        try {
            const saved = localStorage.getItem('ishop_opened_pages');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [currentPageId, setCurrentPageId] = useState<string | null>(() => {
        return localStorage.getItem('ishop_current_page_id');
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('role'); // 🟢 សម្អាត role ចាស់ចោល ដើម្បីកុំឱ្យ session បន្ទាប់ទទួល role មិនត្រូវ
        localStorage.removeItem('username');
        localStorage.removeItem('profileImage');
        localStorage.removeItem('ishop_current_page_id'); // សម្អាត ID ទំព័រចាស់ចោល

        // Reset state គណនីមកលំនាំដើមវិញភ្លាមៗ
        setUser({
            firstName: 'គោត្តនាម',
            lastName: 'នាម',
            profilePictureUrl: ''
        });

        navigate('/login', { replace: true });
    };

    const [isLoaded, setIsLoaded] = useState(false);

    // ១. Load ទិន្នន័យដំបូង
    useEffect(() => {
        const saved = localStorage.getItem('ishop_opened_pages');
        if (saved) {
            setOpenedPages(JSON.parse(saved));
        }
        setIsLoaded(true);
    }, []);

    // ២. Save ទិន្នន័យចំណងជើងទំព័រ (Opened Pages)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ishop_opened_pages', JSON.stringify(openedPages));
        }
    }, [openedPages, isLoaded]);

    // ➕ ៣. បន្ថែម useEffect នេះដើម្បីរក្សាទុក currentPageId ទៅក្នុង LocalStorage រាល់ពេលវាផ្លាស់ប្តូរ
    useEffect(() => {
        if (isLoaded) {
            if (currentPageId) {
                localStorage.setItem('ishop_current_page_id', currentPageId);
            } else {
                localStorage.removeItem('ishop_current_page_id');
            }
        }
    }, [currentPageId, isLoaded]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/users`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const text = await response.text();
                    console.log("Response ពី Server:", text);

                    if (text.trim().startsWith('{')) {
                        const data = JSON.parse(text);
                        setUser(data);
                    } else {
                        console.warn("Server មិនបានបញ្ជូនទិន្នន័យ JSON មកទេ:", text);
                    }
                } catch (error) {
                    console.error("កំហុសក្នុងការទាញយក Profile:", error);
                }
            }
        };
        fetchUserProfile();
    }, []);

    const handleLoginSuccess = () => {
        setOpenedPages(prevPages => {
            const filtered = prevPages.filter(page => page.id !== 'user-login');
            if (!filtered.some(page => page.id === 'user-profile')) {
                return [...filtered, { id: 'user-profile', title: t('nav.myAccount'), icon: 'profile-img' }];
            }
            return filtered;
        });
        setCurrentPageId('user-profile');
    };

    const handleRegisterSuccess = () => {
        setOpenedPages(prevPages => {
            const filtered = prevPages.filter(page => page.id !== 'user-register');
            if (!filtered.some(page => page.id === 'user-login')) {
                return [...filtered, { id: 'user-login', title: t('nav.account'), icon: 'bi-person-lock' }];
            }
            return filtered;
        });
        setCurrentPageId('user-login');
    };

    const getComponentById = (id: string | null): React.ReactNode => {
        switch (id) {
            case 'home-page': return <LandingPage />;
            case 'user-login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            case 'user-register': return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;
            // 🌟 🛠️ ដំណោះស្រាយគន្លឹះ៖ បន្ថែម Case នេះដើម្បីកុំឱ្យចេញផ្ទាំងទទេរពណ៌ស ពេល Login រួច
            case 'user-profile': return <AccountOverviewPage userProfile={user} setUser={setUser} />;
            case 'dashboard': return <DashboardPage />;
            case 'cart': return <CartPage />;
            case 'invoice': return <InvoiceDetail />;
            default: return null;
        }
    };

    const handleNavbarOpenTab = (id: string, title: string, _component: React.ReactNode, iconClass: string) => {
        setCurrentPageId(id);

        const isExist = openedPages.some(page => page.id === id);
        if (!isExist) {
            setOpenedPages([...openedPages, { id, title: title || id, icon: iconClass || 'bi-window' }]);
        }
    };

    const handleClosePage = (idToClose: string) => {
        // ត្រូវប្រាកដថា state ត្រូវបាន update ពិតប្រាកដ
        setOpenedPages(prev => prev.filter(page => page.id !== idToClose));

        // សម្អាត currentPageId បើទំព័រនោះជាទំព័រដែលកំពុងបើក
        if (currentPageId === idToClose) {
            setCurrentPageId(null);
        }
    };

    return (
        <div className="d-flex flex-column vh-100">
            <Navbar
                openedPages={openedPages}
                currentPageId={currentPageId}
                onOpenTab={handleNavbarOpenTab}
                onClosePage={handleClosePage}
                userProfile={user}
                handleLogout={handleLogout}
            />

            <MainLayout handleLogout={handleLogout} userProfile={user as any} setUser={setUser as any}>
                <Routes>
                    <Route path="/" element={
                        <div className="container-fluid p-0">
                            {currentPageId ? (
                                getComponentById(currentPageId)
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
                                    <div className="text-center p-5 rounded-3 bg-white shadow-sm border" style={{ maxWidth: '450px' }}>
                                        <i className="bi bi-folder-plus text-primary" style={{ fontSize: '3.5rem' }}></i>
                                        <h4 className="fw-bold mt-3 text-dark">{t('nav.welcome')}</h4>
                                        <p className="text-muted small px-3">{t('nav.openTabHint')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    } />
                    <Route path="/admin/orders" element={<ProtectedRoute requiredCheck={canViewOrders}><OrdersPage /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute requiredCheck={canViewProducts}><ProductsPage /></ProtectedRoute>} />
                    <Route path="/admin/inventory" element={<ProtectedRoute requiredCheck={canViewInventory}><InventoryPage /></ProtectedRoute>} />
                    <Route path="/admin/invoices" element={<ProtectedRoute requiredCheck={canViewInvoices}><InvoicesPage /></ProtectedRoute>} />
                    <Route path="/admin/returns" element={<ProtectedRoute requiredCheck={canViewReturns}><ReturnsPage /></ProtectedRoute>} />
                    <Route path="/admin/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
                    <Route path="/admin/categories" element={<ProtectedRoute requiredCheck={canViewCategories}><CategoriesPage /></ProtectedRoute>} />
                    <Route path="/admin/customers" element={<ProtectedRoute requiredCheck={canViewCustomers}><CustomersPage /></ProtectedRoute>} />
                    <Route path="/admin/employees" element={<ProtectedRoute requiredCheck={canViewEmployees}><EmployeesPage /></ProtectedRoute>} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/account" element={isAuthenticated() ? <AccountOverviewPage userProfile={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
                    <Route path="/account/orders" element={isAuthenticated() ? <AccountOrdersPage userProfile={user} /> : <Navigate to="/login" replace />} />
                    <Route path="/account/wishlist" element={isAuthenticated() ? <AccountWishlistPage /> : <Navigate to="/login" replace />} />
                    <Route path="/account/addresses" element={isAuthenticated() ? <AccountAddressesPage /> : <Navigate to="/login" replace />} />
                    <Route path="/account/security" element={isAuthenticated() ? <AccountSecurityPage /> : <Navigate to="/login" replace />} />
                    <Route path="/admin/orders-tracking" element={<ProtectedRoute requiredCheck={canViewOrderTracking}><OrderTracking /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<RegisterPage onRegisterSuccess={handleRegisterSuccess} />} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/invoice/:id" element={<InvoiceDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </MainLayout>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <CartProvider>
                    <WishlistProvider>
                        <Router>
                            <AppContent />
                        </Router>
                    </WishlistProvider>
                </CartProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default App;
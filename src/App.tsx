// src/App.tsx
import React, {ReactNode, useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import InvoiceDetail from './pages/InvoiceDetail';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from "./components/Sidebar";

import 'bootstrap/dist/css/bootstrap.min.css';

interface OpenedPageItem {
    id: string;
    title: string;
    icon: string;
}

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();
    const isAdminPath = ['/admin', '/products', '/orders-tracking'].some(path => location.pathname.startsWith(path));

    return (
        <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
            {isAdminPath && <Sidebar handleLogout={() => { localStorage.clear(); window.location.href = '/login'; }} />}
            <div className="flex-grow-1" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                {children}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const isAuthenticated = () => localStorage.getItem('token') !== null;

    // ១. កែសម្រួល State ដើម្បីអានពី localStorage
    const [openedPages, setOpenedPages] = useState<OpenedPageItem[]>(() => {
        const saved = localStorage.getItem('ishop_opened_pages');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentPageId, setCurrentPageId] = useState<string | null>(() => {
        return localStorage.getItem('ishop_current_page_id');
    });

    useEffect(() => {
        localStorage.setItem('ishop_opened_pages', JSON.stringify(openedPages));
        if (currentPageId) {
            localStorage.setItem('ishop_current_page_id', currentPageId);
        } else {
            localStorage.removeItem('ishop_current_page_id');
        }
    }, [openedPages, currentPageId]);

    const getComponentById = (id: string | null): React.ReactNode => {
        switch (id) {
            case 'home-page': return <LandingPage />;
            case 'user-login': return <LoginPage />;
            case 'dashboard': return <DashboardPage />;
            case 'cart': return <CartPage />;
            case 'invoice': return <InvoiceDetail />;
            default: return null;
        }
    };

    const handleNavbarOpenTab = (id: string, title: string, component: React.ReactNode, iconClass: string) => {
        setCurrentPageId(id);
        const isExist = openedPages.some(page => page.id === id);
        if (!isExist) {
            setOpenedPages([...openedPages, { id, title, icon: iconClass }]);
        }
    };

    const handleClosePage = (idToClose: string) => {
        const filtered = openedPages.filter(page => page.id !== idToClose);
        setOpenedPages(filtered);

        if (currentPageId === idToClose) {
            if (filtered.length > 0) {
                const lastPage = filtered[filtered.length - 1];
                setCurrentPageId(lastPage.id);
            } else {
                setCurrentPageId(null);
            }
        }
    };

    return (
        <CartProvider>
            <Router>
                <Navbar
                    openedPages={openedPages}
                    currentPageId={currentPageId}
                    onOpenTab={handleNavbarOpenTab}
                    onClosePage={handleClosePage}
                />

                <MainLayout>
                    <Routes>
                        <Route path="/" element={
                            <div className="container-fluid p-0">
                                {currentPageId ? (
                                    getComponentById(currentPageId)
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
                                        <div className="text-center p-5 rounded-3 bg-white shadow-sm border" style={{ maxWidth: '450px' }}>
                                            <i className="bi bi-folder-plus text-primary" style={{ fontSize: '3.5rem' }}></i>
                                            <h4 className="fw-bold mt-3 text-dark">សូមស្វាគមន៍មកកាន់ iShop</h4>
                                            <p className="text-muted small px-3">សូមចុចលើប៊ូតុងសញ្ញាបូក <strong className="text-dark">(+)</strong> នៅលើរបារខាងលើ ដើម្បីជ្រើសរើសបើកទំព័រការងាររបស់អ្នក។</p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        } />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/orders-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/admin/dashboard" element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" replace />} />
                        <Route path="/invoice/:id" element={<InvoiceDetail />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </MainLayout>
            </Router>
        </CartProvider>
    );
};

export default App;
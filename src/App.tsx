// src/App.tsx
import React, { ReactNode, useState } from 'react';
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

    // 🌟 ពេលបើកដំបូង មិនទាន់មាន Icon ណាបង្ហាញលើ Navbar ឡើយ
    const [openedPages, setOpenedPages] = useState<OpenedPageItem[]>([]);
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);

    // 🌟 កែប្រែត្រង់នេះ៖ ពេលបើកមកដំបូង គឺមិនទាន់បង្ហាញទំព័រណាទាំងអស់ (ទុកជា null) ទាល់តែ User ជាអ្នក Add
    const [globalOpenTab, setGlobalOpenTab] = useState<React.ReactNode>(null);

    // អនុគមន៍ពេល User ចុចជ្រើសរើសបើកទំព័រពី Dropdown List Add
    const handleNavbarOpenTab = (id: string, title: string, component: React.ReactNode, iconClass: string) => {
        // ១. បើកបង្ហាញផ្ទាំងការងារ (Active Page) ដែល User បានចុចជ្រើសរើស
        setGlobalOpenTab(component);
        setCurrentPageId(id);

        // ២. រុញ Icon ទៅបង្ហាញនៅលើដង Navbar (ប្រសិនបមិនទាន់មាន)
        const isExist = openedPages.some(page => page.id === id);
        if (!isExist) {
            setOpenedPages([...openedPages, { id, title, icon: iconClass }]);
        }
    };

    // អនុគមន៍ពេលចុចសញ្ញាខ្វែង ✕ ដើម្បីបិទ Tab Icon លើ Navbar
    const handleClosePage = (idToClose: string) => {
        const filtered = openedPages.filter(page => page.id !== idToClose);
        setOpenedPages(filtered);

        if (currentPageId === idToClose) {
            if (filtered.length > 0) {
                const lastPage = filtered[filtered.length - 1];
                setCurrentPageId(lastPage.id);

                // បើកបង្ហាញ Component នៃ Tab ចុងក្រោយដែលនៅសល់នៅលើរបារ
                if (lastPage.id === 'home-page') setGlobalOpenTab(<LandingPage />);
                // ប្រសិនបើចង់ឱ្យវាបើកទំព័រផ្សេងទៀតដែលសល់ ប្អូនអាចថែមលក្ខខណ្ឌនៅត្រង់នេះបាន
            } else {
                // 🌟 បើ User ចុចបិទ Icon អស់រលីងពីលើ Navbar ហើយ គឺត្រឡប់ទៅជាផ្ទាំងទំនេរ (null) វិញដដែល
                setCurrentPageId(null);
                setGlobalOpenTab(null);
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

                                {/* 🌟 បង្ហាញផ្ទាំងការងារតាមសកម្មភាពរបស់ User */}
                                {globalOpenTab ? (
                                    globalOpenTab
                                ) : (
                                    /* 🎨 នេះជាផ្ទាំងទទេរ ឬផ្ទាំងស្វាគមន៍ដែលបង្ហាញមុនគេ ពេលទើបតែបើក Web មកភ្លាម */
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
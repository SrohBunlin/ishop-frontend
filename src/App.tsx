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
import { useNavigate } from 'react-router-dom'; // ១. Import useNavigate
interface OpenedPageItem {
    id: string;
    title: string;
    icon: string;
}

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps & { handleLogout: () => void }> = ({ children, handleLogout }) => {
    const location = useLocation();
    const isAdminPath = ['/admin', '/products', '/orders-tracking'].some(path => location.pathname.startsWith(path));

    return (
        <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
                {/* ៤. បញ្ជូន handleLogout ទៅឱ្យ Sidebar */}
                {isAdminPath && <Sidebar handleLogout={handleLogout} />}
                <div className="flex-grow-1" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    {children}
                </div>
        </div>
    );
};

const AppContent: React.FC=() =>{
    const navigate = useNavigate();


    const isAuthenticated = () => localStorage.getItem('token') !== null;

    const [openedPages, setOpenedPages] = useState<OpenedPageItem[]>(() => {
        const saved = localStorage.getItem('ishop_opened_pages');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentPageId, setCurrentPageId] = useState<string | null>(() => {
        return localStorage.getItem('ishop_current_page_id');
    });

    const handleLogout = () => {
        localStorage.clear();       // លុប Token និងទិន្នន័យទាំងអស់
        setOpenedPages([]);         // លុប Tab ទាំងអស់ចេញ
        setCurrentPageId(null);     // Reset Tab ដែលកំពុងបើក

        // ៣. ប្តូរពី window.location.href មកប្រើ navigate
        navigate('/login', { replace: true });
    };
    useEffect(() => {
        localStorage.setItem('ishop_opened_pages', JSON.stringify(openedPages));
        if (currentPageId) {
            localStorage.setItem('ishop_current_page_id', currentPageId);
        } else {
            localStorage.removeItem('ishop_current_page_id');
        }
    }, [openedPages, currentPageId]);

    // 🌟 មុខងារថ្មី៖ ដំណើរការពេល Login ជោគជ័យ
    const handleLoginSuccess = () => {
        setOpenedPages(prevPages => {
            // ១. លុប Tab Login ចេញ
            const filtered = prevPages.filter(page => page.id !== 'user-login');
            // ២. ឆែកមើលបើមិនទាន់មាន Tab Dashboard ទេ គឺបន្ថែមវាចូល
            if (!filtered.some(page => page.id === 'user-profile')) {
                return [...filtered, { id: 'user-profile', title: 'គណនីខ្ញុំ', icon: 'profile-img' }];
            }
            return filtered;
        });
        // ៣. ប្តូរ Focus ទៅកាន់ Tab Dashboard ភ្លាមៗ
        setCurrentPageId('user-profile');
    };

    const getComponentById = (id: string | null): React.ReactNode => {
        switch (id) {
            case 'home-page': return <LandingPage />;
            // 🌟 បញ្ជូន onLoginSuccess ទៅ LoginPage
            case 'user-login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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
        <MainLayout handleLogout={handleLogout}>
            <Navbar
                openedPages={openedPages}
                currentPageId={currentPageId}
                onOpenTab={handleNavbarOpenTab}
                onClosePage={handleClosePage}
            />
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
                    <Route path="/admin/orders-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                    {/* 🌟 បញ្ជូន onLoginSuccess ទៅ LoginPage ទី២ (ករណីចូលតាម URL ផ្ទាល់) */}
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/admin/profile" element={isAuthenticated() ? <div>នេះជាទំព័រ User Profile របស់ប្អូន</div> : <Navigate to="/login" replace />} />
                    <Route path="/admin/dashboard" element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" replace />} />
                    <Route path="/invoice/:id" element={<InvoiceDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
        </MainLayout>
    );
};
const App: React.FC = () => {
    return (

        <CartProvider>
            <Router>
                <AppContent />
            </Router>
        </CartProvider>
    );
};

export default App;
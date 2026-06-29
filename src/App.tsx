// src/App.tsx
import React, { ReactNode, useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
            {isAdminPath && (
                <div style={{ width: '260px', flexShrink: 0, backgroundColor: '#124F9C', overflowY: 'auto' }}>
                    <Sidebar handleLogout={handleLogout} userProfile={userProfile as any} setUser={setUser as any}/>
                </div>
            )}
            <div className="flex-grow-1" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                {children}
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const navigate = useNavigate();
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
                    const response = await fetch('https://api.i-knet.com/api/users', {
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
                return [...filtered, { id: 'user-profile', title: 'គណនីខ្ញុំ', icon: 'profile-img' }];
            }
            return filtered;
        });
        setCurrentPageId('user-profile');
    };

    const getComponentById = (id: string | null): React.ReactNode => {
        switch (id) {
            case 'home-page': return <LandingPage />;
            case 'user-login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            // 🌟 🛠️ ដំណោះស្រាយគន្លឹះ៖ បន្ថែម Case នេះដើម្បីកុំឱ្យចេញផ្ទាំងទទេរពណ៌ស ពេល Login រួច
            case 'user-profile': return <DashboardPage />;
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
                                        <h4 className="fw-bold mt-3 text-dark">សូមស្វាគមន៍មកកាន់ iShop</h4>
                                        <p className="text-muted small px-3">សូមចុចលើប៊ូតុងសញ្ញាបូក <strong className="text-dark">(+)</strong> នៅលើរបារខាងលើ ដើម្បីជ្រើសរើសបើកទំព័រការងាររបស់អ្នក។</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    } />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/admin/orders-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/admin/dashboard" element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" replace />} />
                    <Route path="/invoice/:id" element={<InvoiceDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </MainLayout>
        </div>
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
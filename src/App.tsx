import React, { ReactNode } from 'react';
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

// លែងត្រូវការ @ts-ignore លើ bootstrap ទៀតហើយ ព្រោះ CSS មិនទាមទារ types ឡើយ
import 'bootstrap/dist/css/bootstrap.min.css';

// ១. កំណត់ប្រភេទ Props សម្រាប់ MainLayout (ត្រូវមាន children ជា ReactNode)
interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();

    // បង្កើតបញ្ជីផ្លូវដែលត្រូវបង្ហាញ Sidebar (Admin Paths)
    const isAdminPath = ['/admin', '/products', '/orders-tracking'].some(path =>
        location.pathname.startsWith(path)
    );

    // បង្កើតអនុគមន៍ Logout គំរូផ្ញើទៅឱ្យ Sidebar (ដើម្បីកុំឱ្យវាទទួលបាន undefined)
    const handleSidebarLogout = (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login'; // បង្ខំឱ្យទៅទំព័រ Login និង Refresh ទំព័រ
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
            {/* ផ្ញើ handleSidebarLogout ទៅឱ្យ Sidebar តាមច្បាប់ TypeScript Interface */}
            {isAdminPath && <Sidebar handleLogout={handleSidebarLogout} />}

            {/* Content Area */}
            <div className="flex-grow-1" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                {children}
            </div>
        </div>
    );
};

// ២. ប្រកាសប្រភេទ Component App ជា React.FC
const App: React.FC = () => {
    const isAuthenticated = (): boolean => {
        return localStorage.getItem('token') !== null;
    };

    return (
        <CartProvider>
            <Router>
                <Navbar />
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/orders-tracking" element={
                            <ProtectedRoute>
                                <OrderTracking />
                            </ProtectedRoute>
                        } />
                        <Route path="/login" element={<LoginPage />} />

                        {/* ទំព័រ Admin */}
                        <Route
                            path="/admin/dashboard"
                            element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" replace />}
                        />

                        <Route path="/invoice/:id" element={<InvoiceDetail />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </MainLayout>
            </Router>
        </CartProvider>
    );
};

export default App;
import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import InvoiceDetail from './pages/InvoiceDetail'; // ប្រាកដថា Path ត្រឹមត្រូវ
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage'; // ប្រសិនបើប្អូនមានទំព័រ Login
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import OrderTracking from './pages/OrderTracking';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from "./components/Sidebar";
const MainLayout = ({ children }) => {
    const location = useLocation();
    // បញ្ជាក់ថា បើ Path ផ្តើមដោយ /admin ទើបបង្ហាញ Sidebar
    const isAdminPath = ['/admin', '/orders-tracking'].some(path =>
        location.pathname.startsWith(path)
    );

    return (
        <div className="d-flex align-items-start">
            {/* បង្ហាញ Sidebar តែនៅលើទំព័រ Admin ប៉ុណ្ណោះ */}
            {isAdminPath && <Sidebar />}

            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                {children}
            </div>
        </div>
    );
};
function App() {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    return (
        <CartProvider>
            <Router>
                <Navbar />
                {/* ដាក់ MainLayout នៅទីនេះ */}
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
                            element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/login" />}
                        />

                        <Route path="/invoice/:id" element={<InvoiceDetail />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </MainLayout>

            </Router>
        </CartProvider>
    );
}

export default App;
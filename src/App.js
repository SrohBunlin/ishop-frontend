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
    const isAdminPath = ['/admin', '/products', '/orders-tracking'].some(path =>
        location.pathname.startsWith(path)
    );

    return (
        <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden'}}>
            {/* Sidebar: វានឹងនៅជាប់មួយកន្លែង ទោះ scroll content ក៏ដោយ */}
            {isAdminPath && <Sidebar />}

            {/* Content Area: កំណត់ឱ្យវាមាន Scroll ដាច់ដោយឡែក ឬឱ្យវារីកតាម Content */}
            <div className="flex-grow-1" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
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
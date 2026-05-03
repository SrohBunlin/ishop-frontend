import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // ប្រសិនបើគ្មាន Token (មិនទាន់ Login) ឬ Role មិនមែនជា ADMIN
    if (!token || role !== 'ROLE_ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
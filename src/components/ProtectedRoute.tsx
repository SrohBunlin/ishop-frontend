import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// ១. កំណត់ប្រភេទ Props សម្រាប់ ProtectedRoute (ត្រូវមាន children ជា ReactNode)
interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // ប្រសិនបើគ្មាន Token (មិនទាន់ Login) ឬ Role មិនមែនជា ADMIN
    if (!token || role !== 'ROLE_ADMIN') {
        return <Navigate to="/login" replace />;
    }

    // ប្រសិនបើមានសិទ្ធិត្រឹមត្រូវ អនុញ្ញាតឱ្យចូលមើល Component កូនៗបាន
    return <>{children}</>;
};

export default ProtectedRoute;
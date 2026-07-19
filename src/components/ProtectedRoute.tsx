import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

// ១. កំណត់ប្រភេទ Props សម្រាប់ ProtectedRoute (ត្រូវមាន children ជា ReactNode)
interface ProtectedRouteProps {
    children: ReactNode;
    // សិទ្ធិលម្អិតបន្ថែម (ឧ. canViewProducts, canViewEmployees...) សម្រាប់ទំព័រណាមួយដែលមិនមែនគ្រប់ Role
    // ក្នុងក្រុម Admin ទាំងអស់អាចចូលមើលបាន (ឧ. Staff មិនអាចមើលទំនិញ/បុគ្គលិកបានទេ)
    requiredCheck?: () => boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredCheck }) => {
    const token = localStorage.getItem('token');

    // ប្រសិនបើគ្មាន Token (មិនទាន់ Login) នាំទៅ Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ប្រសិនបើ Login ហើយ ប៉ុន្តែ Role មិនមែនអ្នកគ្រប់គ្រង (ឧ. អតិថិជនធម្មតា) នាំទៅគណនីផ្ទាល់ខ្លួនវិញ
    if (!isAdmin()) {
        return <Navigate to="/account" replace />;
    }

    // ប្រសិនបើមានការកំណត់សិទ្ធិលម្អិត ហើយ Role បច្ចុប្បន្នមិនមានសិទ្ធិគ្រប់គ្រាន់
    // (ឧ. Staff ព្យាយាមចូលទំព័រ /admin/products) បញ្ជូនត្រឡប់ទៅ Dashboard វិញ
    if (requiredCheck && !requiredCheck()) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // ប្រសិនបើមានសិទ្ធិត្រឹមត្រូវ អនុញ្ញាតឱ្យចូលមើល Component កូនៗបាន
    return <>{children}</>;
};

export default ProtectedRoute;

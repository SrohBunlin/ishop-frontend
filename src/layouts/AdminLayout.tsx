// ឧទាហរណ៍បង្កើត File ថ្មីមួយឈ្មោះ: src/layouts/AdminLayout.tsx
import React from 'react';
import Header from '../components/Header'; // ➕ ហៅ Header មកប្រើ
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
    return (
        <div className="admin-layout">
            {/* បើមាន Sidebar អាចដាក់នៅទីនេះ */}
            <div className="admin-main-content">
                {/* ➕ ដាក់ Header ឱ្យបង្ហាញតែនៅក្នុងទំព័ររបស់ Admin */}
                <Header />
                <div className="admin-page-body" style={{ padding: '20px' }}>
                    {/* Outlet នេះជាកន្លែងដែលទំព័រដូចជា Profile ឬ Dashboard នឹងលោតមកបង្ហាញ */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
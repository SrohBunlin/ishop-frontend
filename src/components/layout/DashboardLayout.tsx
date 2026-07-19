import React from 'react';
import Topbar from './Topbar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    title: string;
    onExportReport: () => void;
    children: React.ReactNode;
}

// Note: navigation is provided by App.tsx's MainLayout (real Sidebar with
// logout / user profile) for every /admin/* route, DashboardPage included.
// This layout only owns the topbar + content area so we don't render two
// sidebars side by side.
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, onExportReport, children }) => {
    return (
        <div className="dashboard-content">
            <Topbar title={title} onExportReport={onExportReport} />
            {children}
        </div>
    );
};

export default DashboardLayout;


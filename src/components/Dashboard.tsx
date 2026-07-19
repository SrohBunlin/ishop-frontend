import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/apiService';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        getDashboardStats().then(res => setStats(res.data));
    }, []);

    return (
        <div>
            <p>Order សរុប: {stats?.totalOrders || 0}</p>
        </div>
    );
};

export default Dashboard;
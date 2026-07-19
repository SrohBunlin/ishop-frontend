import { useCallback, useState } from 'react';
import axios from 'axios';
import { ReportStats } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export function useReportStats() {
    const [reportData, setReportData] = useState<ReportStats>({ totalRevenue: 0, totalOrders: 0 });

    const fetchReportStats = useCallback(async (): Promise<void> => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get<ReportStats>(`${API_BASE_URL}/api/orders/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    }, []);

    return { reportData, fetchReportStats };
}

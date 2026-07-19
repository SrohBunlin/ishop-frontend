import { useCallback, useState } from 'react';
import axios from 'axios';
import { Order } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = useCallback(async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Order[]>(`${API_BASE_URL}/api/orders/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Fetch orders error:', error);
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId: number, newStatus: string): Promise<boolean> => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            await fetchOrders();
            return true;
        } catch (error) {
            console.error('Update order status error:', error);
            return false;
        }
    }, [fetchOrders]);

    return { orders, fetchOrders, updateOrderStatus };
}

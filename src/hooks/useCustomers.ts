import { useCallback, useState } from 'react';
import axios from 'axios';
import { Customer } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);

    const fetchCustomers = useCallback(async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Customer[]>(`${API_BASE_URL}/api/customers/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Fetch customers error:', error);
        }
    }, []);

    const deleteCustomer = useCallback(async (id: number): Promise<void> => {
        if (!window.confirm('តើអ្នកពិតជាចង់លុបអតិថិជននេះមែនទេ?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('លុបបានជោគជ័យ!');
            await fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('មិនអាចលុបបានទេ!');
        }
    }, [fetchCustomers]);

    return { customers, fetchCustomers, deleteCustomer };
}

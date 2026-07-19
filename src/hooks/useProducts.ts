import { useCallback, useState } from 'react';
import axios from 'axios';
import { Product } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProducts = useCallback(async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }, []);

    const deleteProduct = useCallback(async (id: number): Promise<void> => {
        if (!window.confirm('តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ? ')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('លុបបានជោគជ័យ!');
            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('មិនអាចលុបបានទេ!');
        }
    }, [fetchProducts]);

    return { products, fetchProducts, deleteProduct };
}

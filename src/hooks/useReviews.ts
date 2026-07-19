import { useCallback, useState } from 'react';
import axios from 'axios';
import { Review } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export function useReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);

    const fetchReviews = useCallback(async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Review[]>(`${API_BASE_URL}/api/reviews/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReviews(response.data);
        } catch (error) {
            console.error('Fetch reviews error:', error);
        }
    }, []);

    const deleteReview = useCallback(async (id: number): Promise<void> => {
        if (!window.confirm('តើអ្នកពិតជាចង់លុបមតិវាយតម្លៃនេះមែនទេ?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('លុបបានជោគជ័យ!');
            await fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('មិនអាចលុបបានទេ!');
        }
    }, [fetchReviews]);

    /** អតិថិជនផ្ញើមតិវាយតម្លៃទំនិញថ្មី (ប្រើនៅ Account > My Orders) */
    const submitReview = useCallback(async (payload: {
        productId?: number;
        productName?: string;
        customerName: string;
        rating: number;
        comment: string;
    }): Promise<boolean> => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/api/reviews`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            await fetchReviews();
            return true;
        } catch (error) {
            console.error('Error submitting review:', error);
            return false;
        }
    }, [fetchReviews]);

    return { reviews, fetchReviews, deleteReview, submitReview };
}

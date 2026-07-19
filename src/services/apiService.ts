// src/services/apiService.ts
import axios from 'axios';
import {Product, Order, DashboardStats} from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Gateway URL
});

export const getProducts = () => api.get<Product[]>('/products');
export const createOrder = (orderData: Order) => api.post<Order>('/orders', orderData);
export const getDashboardStats = () => api.get<DashboardStats>('/stats');
// src/types/index.ts

export interface Product {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
}

export interface OrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id?: number; // ពេលបង្កើតថ្មី id អាចនឹងមិនទាន់មាន
    customer_name: string;
    userId: number;
    total_amount: number;
    items: OrderItem[];
}

export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
}
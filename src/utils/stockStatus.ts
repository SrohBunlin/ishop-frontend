import { StockStatus } from '../types/dashboard.types';

export function getStockStatus(quantity: number): StockStatus {
    if (quantity === 0) return { key: 'outOfStock', text: 'អស់ពីស្តុក', color: '#ff4d4f', bg: '#fff2f0' };
    if (quantity <= 5) return { key: 'low', text: 'ជិតអស់', color: '#faad14', bg: '#fffbe6' };
    return { key: 'inStock', text: 'មានក្នុងស្តុក', color: '#52c41a', bg: '#f6ffed' };
}

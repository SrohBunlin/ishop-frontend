export interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    image?: string;
    categoryId?: number;
    // ១. ព័ត៌មានទូទៅ
    description?: string;
    shortDescription?: string;
    // ២. តម្លៃ និងការគ្រប់គ្រងស្តុក
    salePrice?: number;
    sku?: string;
    // ៣. ការចាត់ថ្នាក់
    subCategoryId?: number;
    tags?: string[];
    // ៤. រូបភាព
    gallery?: string[];
    // ៥. ព័ត៌មានលម្អិតផ្សេងៗ
    status?: string; // PUBLISHED / DRAFT / HIDDEN
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
}

export interface NewProductState {
    name: string;
    price: string;
    stockQuantity: string;
    categoryId: string;
    // ១. ព័ត៌មានទូទៅ
    description: string;       // Rich Text (HTML) - ការពិពណ៌នាពេញលេញ
    shortDescription: string;  // ការពិពណ៌នាសង្ខេប
    // ២. តម្លៃ និងការគ្រប់គ្រងស្តុក
    salePrice: string;         // តម្លៃបញ្ចុះ (ជាជម្រើស)
    sku: string;               // លេខកូដទំនិញ
    // ៣. ការចាត់ថ្នាក់
    subCategoryId: string;
    tags: string[];            // ស្លាក / ម៉ាក
    // ៥. ព័ត៌មានលម្អិតផ្សេងៗ
    status: string;            // PUBLISHED / DRAFT / HIDDEN
    weight: string;
    length: string;
    width: string;
    height: string;
}

export interface OrderItem {
    product_name: string;
    quantity: number;
    price: number;
    productId?: number;
}

export interface Order {
    id: number;
    customer_name: string;
    customerId?: number;
    order_date?: string;
    status: string;
    total_amount: number;
    items?: OrderItem[];
}

export interface ReportStats {
    totalRevenue: number;
    totalOrders: number;
}

export interface StockStatus {
    key: 'outOfStock' | 'low' | 'inStock';
    text: string;
    color: string;
    bg: string;
}

export interface Customer {
    id: number;
    customerName: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    totalOrders?: number;
    totalSpent?: number;
    createdAt?: string;
    status?: string; // ACTIVE / INACTIVE / BLOCKED
}

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string; // 🟢 គណនាបញ្ចូលគ្នា (firstName + lastName) នៅខាង Frontend សម្រាប់បង្ហាញ/ស្វែងរក — មិនមែនមកពី Backend ទេ
    email?: string;
    phoneNumber?: string;
    position?: string; // ឧ. Cashier, Warehouse Staff, Sales, Manager
    address?: string;
    hireDate?: string;
    salary?: number;
    status?: string; // ACTIVE / INACTIVE
    role?: string;
}

export interface NewEmployeeState {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    position: string;
    address: string;
    hireDate: string;
    salary: string;
    status: string;
    role: string;
}

export interface CustomerAddress {
    id: string;
    label: string; // ឧ. ផ្ទះ, ការិយាល័យ
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    isDefault: boolean;
}

export interface Review {
    id: number;
    customerId?: number;
    customerName: string;
    productId?: number;
    productName?: string;
    rating: number; // 1 ដល់ 5
    comment: string;
    createdAt?: string;
    status?: string; // PENDING / APPROVED / HIDDEN
}

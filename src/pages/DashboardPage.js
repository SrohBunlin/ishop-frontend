/* eslint-disable no-template-curly-in-string */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar, Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
    ArcElement
);

const API_BASE_URL = 'https://api.i-knet.com';

const DashboardPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const [currentId, setCurrentId] = useState(null);
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stockQuantity: '' });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [reportData, setReportData] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [productPage, setProductPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const recordsPerPage = 10;
    const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23aaaaaa'>No Image</text></svg>";

    // 💡 គ្រប់គ្រងការបង្កើត និងសម្អាត Object URL សម្រាប់រូបភាព Preview ដើម្បីការពារ Memory Leak
    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl('');
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const lowStockProducts = products.filter(p => p.stockQuantity < 5);

    const fetchReportStats = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/products/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/orders/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Fetch orders error:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
        fetchReportStats();
    }, []);

    useEffect(() => {
        setProductPage(1);
    }, [searchQuery]);

    useEffect(() => {
        setOrderPage(1);
    }, [searchTerm]);

    const totalItems = products.length;
    const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stockQuantity), 0);
    const lowStockItems = products.filter(p => p.stockQuantity < 5).length;

    const deleteProduct = async (id) => {
        if (window.confirm("តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ? ")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("លុបបានជោគជ័យ!");
                await fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("មិនអាចលុបបានទេ!");
            }
        }
    };

    const filteredProducts = products.filter((product) => {
        const searchTermLower = searchQuery.toLowerCase().trim();
        if (!searchTermLower) return true;
        return (
            product.name?.toLowerCase().includes(searchTermLower) ||
            product.price?.toString().includes(searchTermLower) ||
            product.stockQuantity?.toString().includes(searchTermLower) ||
            product.id?.toString().includes(searchTermLower)
        );
    });

    const totalProductPages = Math.ceil(filteredProducts.length / recordsPerPage) || 1;
    const safeProductPage = Math.min(productPage, totalProductPages);

    const lastProductIndex = safeProductPage * recordsPerPage;
    const firstProductIndex = lastProductIndex - recordsPerPage;
    const currentProductRecords = filteredProducts.slice(firstProductIndex, lastProductIndex);

    const handleEditClick = (product) => {
        setIsEditing(true);
        setCurrentId(product.id);
        setNewProduct({
            name: product.name,
            price: product.price,
            stockQuantity: product.stockQuantity
        });
        // ✅ បានកែប្រែ៖ ប្តូរមកប្រើ Key 'image' និងលក្ខខណ្ឌត្រឹមត្រូវដើម្បីបង្ហាញរូបភាពចាស់ក្នុង Form ពេលចុច Edit
        setPreviewUrl(product.image && product.image !== "undefined" ? `${API_BASE_URL}${product.image}` : '');
        setImageFile(null);
    };

    const resetForm = () => {
        setNewProduct({ name: '', price: '', stockQuantity: '' });
        setImageFile(null);
        setPreviewUrl('');
        setIsEditing(false);
        setCurrentId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('stockQuantity', newProduct.stockQuantity);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/products/${currentId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("កែសម្រួលបានជោគជ័យ!");
            } else {
                await axios.post(`${API_BASE_URL}/api/products/add`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("បន្ថែមបានជោគជ័យ!");
            }
            resetForm();
            await fetchProducts();
        }
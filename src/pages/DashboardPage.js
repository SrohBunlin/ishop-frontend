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
        // បង្ហាញរូបភាពចាស់ជាមុនសិន លុះត្រាតែមានការជ្រើសរើស File ថ្មី
        setPreviewUrl(product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`) : '');
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
        } catch (error) {
            console.error("Error operations:", error);
            alert("ប្រតិបត្តិការបរាជ័យ! សូមពិនិត្យមើលប្រព័ន្ធតភ្ជាប់ឡើងវិញ។");
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const tableRows = [];
        doc.setFontSize(18);
        doc.text("iShop Management System - Sales Report", 14, 22);

        doc.setFontSize(12);
        doc.text(`Total Revenue: $${reportData.totalRevenue}`, 14, 32);
        doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 40);
        doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 48);

        const tableColumn = ["Order ID", "Customer", "Date", "Status", "Amount"];

        orders.forEach(order => {
            const orderData = [
                order.id,
                order.customer_name,
                order.order_date ? order.order_date.split('T')[0] : 'N/A',
                order.status,
                `$${order.total_amount}`
            ];
            tableRows.push(orderData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'striped'
        });

        doc.save(`Sales_Report_${new Date().getTime()}.pdf`);
    };

    const stockLabels = products.map(p => p.name);
    const stockData = products.map(p => p.stockQuantity);

    const barChartData = {
        labels: stockLabels,
        datasets: [
            {
                label: 'ចំនួនក្នុងស្តុក',
                data: stockData,
                backgroundColor: 'rgba(18, 79, 156, 0.6)',
                borderColor: 'rgba(18, 79, 156, 1)',
                borderWidth: 1,
            },
        ],
    };

    const revenueByCustomer = (orders || []).reduce((acc, order) => {
        if (!order || !order.customer_name) return acc;
        const name = order.customer_name;
        acc[name] = (acc[name] || 0) + (order.total_amount || 0);
        return acc;
    }, {});

    const pieLabels = Object.keys(revenueByCustomer);
    const pieData = Object.values(revenueByCustomer);

    const pieChartData = {
        labels: pieLabels,
        datasets: [
            {
                data: pieData,
                backgroundColor: ['#FF6384', '#124F9C', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            },
        ],
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'អស់ពីស្តុក', color: '#ff4d4f', bg: '#fff2f0' };
        if (quantity <= 5) return { text: 'ជិតអស់', color: '#faad14', bg: '#fffbe6' };
        return { text: 'មានក្នុងស្តុក', color: '#52c41a', bg: '#f6ffed' };
    };

    const revenueByDate = (orders || []).reduce((acc, order) => {
        if (!order || !order.order_date) return acc;
        const date = order.order_date.split('T')[0];
        acc[date] = (acc[date] || 0) + (order.total_amount || 0);
        return acc;
    }, {});

    const rawLineLabels = Object.keys(revenueByDate).sort();
    const lineLabels = rawLineLabels.map(date =>
        new Date(date).toLocaleDateString('km-KH', { month: 'short', day: 'numeric' })
    );
    const lineChartDataValues = rawLineLabels.map(date => revenueByDate[date]);

    const lineData = {
        labels: lineLabels.length > 0 ? lineLabels : ['គ្មានទិន្នន័យ'],
        datasets: [
            {
                label: 'ចំណូលសរុប ($)',
                data: lineChartDataValues.length > 0 ? lineChartDataValues : [0],
                borderColor: '#124F9C',
                backgroundColor: 'rgba(18, 79, 162, 0.2)',
                tension: 0.4,
            },
        ],
    };

    const isAdmin = () => localStorage.getItem('role') === 'ROLE_ADMIN';

    const filteredOrders = orders.filter(order => {
        const search = (searchTerm || "").toLowerCase();
        const customerName = (order?.customer_name || "").toLowerCase();
        const orderId = (order?.id || "").toString();
        return customerName.includes(search) || orderId.includes(search);
    });

    const totalOrderPages = Math.ceil(filteredOrders.length / recordsPerPage) || 1;
    const safeOrderPage = Math.min(orderPage, totalOrderPages);

    const lastOrderIndex = safeOrderPage * recordsPerPage;
    const firstOrderIndex = lastOrderIndex - recordsPerPage;
    const currentOrderRecords = filteredOrders.slice(firstOrderIndex, lastOrderIndex);

    // 💡 Helper Function សម្រាប់បង្កើត Pagination កាត់បន្ថយកូដស្ទួន (DRY)
    const renderPagination = (currentPage, totalPages, setPageAction) => {
        const pageNumbers = [...Array(totalPages + 1).keys()].slice(1);
        return (
            <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button type="button" className="page-link rounded-pill me-2" onClick={() => setPageAction(currentPage - 1)}>ថយក្រោយ</button>
                    </li>
                    {pageNumbers.map((n) => (
                        <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                            <button type="button" className="page-link rounded-circle me-2" onClick={() => setPageAction(n)}>{n}</button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button type="button" className="page-link rounded-pill" onClick={() => setPageAction(currentPage + 1)}>បន្ទាប់</button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex align-items-start">
                <main className="container-fluid flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>

                    {/* Header Component */}
                    <div className="d-flex container-fluid justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
                        <div style={{ width: '300px' }}></div>
                        <button onClick={exportPDF} className="btn btn-primary rounded-pill" style={{ backgroundColor: '#124F9C' }}>
                            <i className="bi bi-file-earmark-pdf me-2"></i> Report
                        </button>
                    </div>

                    {/* Stats Summary Cards */}
                    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3 mb-4">
                        <div className="col"><div className="stat-card"><h3>មុខទំនិញសរុប</h3><p>{totalItems}</p></div></div>
                        <div className="col"><div className="stat-card"><h3>តម្លៃក្នុងស្តុកសរុប</h3><p>${totalValue.toLocaleString()}</p></div></div>
                        <div className="col"><div className="stat-card" style={{ borderLeft: '5px solid #dc3545' }}><h3>ទំនិញជិតអស់</h3><p style={{ color: '#dc3545' }}>{lowStockItems}</p></div></div>
                        <div className="col"><div className="stat-card"><h3>ចំនួនការកុម្ម៉ង់</h3><p>{reportData.totalOrders} វិក្កយបត្រ</p></div></div>
                        <div className="col"><div className="stat-card"><h3>ចំណូលសរុប</h3><p>${reportData.totalRevenue.toLocaleString()}</p></div></div>
                    </div>

                    {/* Warning Alert Banner */}
                    {lowStockProducts.length > 0 && (
                        <div className="container-fluid" style={alertContainerStyle}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#842029' }}>⚠️ ព្រមាន៖ ទំនិញជិតអស់ពីស្តុក!</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {lowStockProducts.map(p => (
                                    <li key={p.id} style={{ color: '#842029', fontSize: '14px' }}>
                                        {p.name} (នៅសល់ត្រឹមតែ {p.stockQuantity} គ្រឿង)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Charts Grid */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-6 d-flex flex-column gap-3">
                            <div className="stat-card w-100"><h3>📊 ស្ថិតិចំនួនស្តុកទំនិញ</h3><Bar data={barChartData} /></div>
                            <div className="stat-card w-100"><h3>📊 ក្រាបចំណូលតាមកាលបរិច្ឆេទ</h3><Line data={lineData} /></div>
                        </div>
                        <div className="col-md-6">
                            <div className="stat-card h-100"><h3>🍕 ចំណែកតម្លៃសរុបតាមអតិថិជន</h3><Pie data={pieChartData} /></div>
                        </div>
                    </div>

                    {/* Admin Add/Edit Product Form */}
                    {isAdmin() && (
                        <div className="mb-4" style={{ padding: '25px', backgroundColor: '#fff', color: '#124F9C', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{isEditing ? '📝 កែសម្រួលព័ត៌មានទំនិញ' : '➕ បន្ថែមទំនិញថ្មី'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3 align-items-end">
                                    <div className="col-sm-6 col-md-2">
                                        <label className="form-label fw-bold">ឈ្មោះទំនិញ</label>
                                        <input className="w-100" placeholder="ឈ្មោះទំនិញ" value={newProduct.name} style={inputStyle} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                                    </div>
                                    <div className="col-sm-6 col-md-2">
                                        <label className="form-label fw-bold">តម្លៃ ($)</label>
                                        <input className="w-100" type="number" placeholder="តម្លៃ ($)" value={newProduct.price} style={inputStyle} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                    </div>
                                    <div className="col-sm-6 col-md-2">
                                        <label className="form-label fw-bold">ចំនួនក្នុងស្តុក</label>
                                        <input className="w-100" type="number" placeholder="ចំនួនក្នុងស្តុក" value={newProduct.stockQuantity} style={inputStyle} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} required />
                                    </div>
                                    <div className="col-sm-6 col-md-3 d-flex flex-column">
                                        <label className="form-label fw-bold">រូបភាពផលិតផល</label>
                                        <input type="file" accept="image/*" style={inputStyle} ref={fileInputRef} onChange={handleFileChange} required={!isEditing} />
                                        {previewUrl && (
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <img src={previewUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                <span style={{ fontSize: '12px', color: '#666' }}>{isEditing && !imageFile ? '📷 រូបភាពបច្ចុប្បន្ន' : '✨ រូបភាពជ្រើសរើសថ្មី'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-3 d-flex gap-2">
                                        <button type="submit" style={saveBtnStyle}>{isEditing ? 'រក្សាទុក' : 'បន្ថែមថ្មី'}</button>
                                        {isEditing && (
                                            <button type="button" onClick={resetForm} style={cancelBtnStyle}>បោះបង់</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Live Search Input for Table */}
                    <div className="search-container mb-3" style={searchBarStyle}>
                        <input type="text" placeholder="🔍 ស្វែងរកទំនិញនៅទីនេះ..." className="search-input border-0 bg-transparent w-100" style={{ outline: 'none' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    {/* Products Data Table */}
                    <div className="table-responsive" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <table className="table table-hover align-middle mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="table-light text-nowrap">
                            <tr>
                                <th scope="col" style={tableHeaderStyle}>ID</th>
                                <th scope="col" style={tableHeaderStyle}>ឈ្មោះទំនិញ</th>
                                <th scope="col" style={tableHeaderStyle}>តម្លៃ</th>
                                <th scope="col" style={tableHeaderStyle}>ចំនួនក្នុងស្តុក</th>
                                <th scope="col" style={tableHeaderStyle}>រូបភាព</th>
                                <th scope="col" style={tableHeaderStyle}>សកម្មភាព</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentProductRecords.map((product) => {
                                const status = getStockStatus(product.stockQuantity);
                                return (
                                    <tr className="text-nowrap" key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{product.id}</td>
                                        <td className="fw-bold" style={{ padding: '12px', textAlign: 'left' }}>{product.name}</td>
                                        <td className="text-success" style={{ padding: '12px', textAlign: 'left' }}>${product.price}</td>
                                        <td>
                                                <span style={{ color: status.color, backgroundColor: status.bg, padding: '8px 8px', borderRadius: '4px', fontWeight: 'bold', border: `1px solid ${status.color}` }}>
                                                    {product.stockQuantity} ({status.text})
                                                </span>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <img
                                                src={`${API_BASE_URL}${product.image}`}
                                                alt={product.name}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                onError={(e) => {
                                                    // បន្ថែមការពារ បើរកដៅរូបភាពមិនឃើញ ឱ្យវាចេញរូបភាព Placeholder ជំនួស
                                                    e.target.src = "https://via.placeholder.com/50";
                                                }}
                                            />
                                        </td>
                                        <td style={tableCellStyle}>
                                            {isAdmin() ? (
                                                <>
                                                    <button onClick={() => handleEditClick(product)} style={{ marginRight: '10px', backgroundColor: '#ffc107', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>កែសម្រួល</button>
                                                    <button onClick={() => deleteProduct(product.id)} style={{ color: '#dc3545', background: 'none', border: '1px solid #dc3545', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>លុប</button>
                                                </>
                                            ) : <span className="badge bg-secondary">មើលបានតែប៉ុណ្ណោះ</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Navigation for Products */}
                    {renderPagination(safeProductPage, totalProductPages, setProductPage)}

                    {/* Orders Management Table with Pagination */}
                    <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '15px' }}>📋 បញ្ជីការកុម្ម៉ង់ទិញ (Orders)</h3>
                        <div className="search-container" style={searchBarStyle}>
                            <input type="text" className="search-input border-0 bg-transparent w-100" style={{ outline: 'none' }} placeholder="🔍 ស្វែងរកតាមឈ្មោះ ឬលេខ ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', marginTop: '15px' }}>
                            <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={tHeader}>ID</th>
                                <th style={tHeader}>អតិថិជន</th>
                                <th style={tHeader}>កាលបរិច្ឆេទ</th>
                                <th style={tHeader}>ស្ថានភាព</th>
                                <th style={tHeader}>សរុប</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentOrderRecords.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tCell}>{order.id}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>{order.customer_name}</td>
                                    <td style={tCell}>{order.order_date ? new Date(order.order_date).toLocaleDateString('km-KH') : 'មិនមានទិន្នន័យ'}</td>
                                    <td style={tCell}><span style={{ color: '#52c41a', fontWeight: 'bold' }}>{order.status}</span></td>
                                    <td style={tCell}>${order.total_amount?.toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Pagination Navigation for Orders */}
                        {renderPagination(safeOrderPage, totalOrderPages, setOrderPage)}
                    </div>

                </main>
            </div>
        </div>
    );
};

const tHeader = { border: '1px solid #ddd', padding: '12px', textAlign: 'center', backgroundColor: '#124F9C', color: '#f8f9fa' };
const tCell = { border: '1px solid #ddd', padding: '12px', textAlign: 'center' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' };
const tableHeaderStyle = { backgroundColor: '#124F9C', color: '#f8f9fa', fontWeight: '600', padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' };
const tableCellStyle = { padding: '15px', borderBottom: '1px solid #eee', color: '#555' };
const searchBarStyle = { width: '100%', padding: '12px 20px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff' };
const saveBtnStyle = { padding: '10px 20px', backgroundColor: '#124F9C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flexGrow: 1, maxWidth: '150px' };
const cancelBtnStyle = { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flexGrow: 1, maxWidth: '150px' };
const alertContainerStyle = { backgroundColor: '#f8d7da', color: '#842029', padding: '15px', borderRadius: '8px', border: '1px solid #f5c2c7', marginBottom: '20px' };

export default DashboardPage;
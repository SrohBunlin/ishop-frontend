import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import {Bar, Pie, Line} from "react-chartjs-2";
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

// Register Components ជៀសវាង Error "category is not a registered scale"
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
//import { BarChart,PieChart,Pie, Bar,Cell, XAxis, YAxis, CartesianGrid, Tooltip,Legend, ResponsiveContainer } from 'recharts';
const DashboardPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [products, setProducts] = useState([]);
    // State សម្រាប់ទុកទិន្នន័យពី Form
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stockQuantity: '',imageUrl: '' });
    const lowStockProducts = products.filter(p => p.stockQuantity < 5);
    // បន្ថែមពណ៌សម្រាប់ Pie Chart (ដាក់នៅខាងលើបង្អស់នៃកូដ)


    const [reportData, setReportData] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [orders, setOrders] = useState([]);

    const fetchReportStats = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('https://practical-light-production-55fd.up.railway.app/api/orders/stats', {
                headers: {
                    'Authorization': `Bearer ${token}` // ត្រូវតែមាន Token ដើម្បីកុំឱ្យជាប់ 403
                }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
        }
    };

    useEffect(() => {
        fetchReportStats();
    }, []);

    // ១. រាប់ចំនួនមុខទំនិញសរុប
    const totalItems = products.length;

    // ២. គណនាតម្លៃសរុបនៃទំនិញទាំងអស់ក្នុងស្តុក (Inventory Value)
    const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stockQuantity), 0);

    // ៣. រកទំនិញដែលជិតអស់ពីស្តុក (ឧទាហរណ៍៖ តិចជាង ៥ គ្រាប់)
    const lowStockItems = products.filter(p => p.stockQuantity < 5).length;

    // ៤. មុខងារទាញទិន្នន័យ
    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://practical-light-production-55fd.up.railway.app/api/products/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) { console.error("Fetch error:", error); }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://practical-light-production-55fd.up.railway.app/api/orders/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data); // ✅ ទុកទិន្នន័យក្នុង Orders State
        } catch (error) {
            console.error("Fetch orders error:", error);
        }
    };


    useEffect(() => {
        fetchOrders();
        fetchProducts();

        }, []);


    // ៦.បន្ថែម Function សម្រាប់លុប
    const deleteProduct = async (id) => {
        if (window.confirm("តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?")) {
            try {
                const token = localStorage.getItem('token'); // ទាញ Token មកប្រើ
                await axios.delete(`https://practical-light-production-55fd.up.railway.app/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` } // បញ្ជូនទៅកាន់ Backend
                });
                alert("លុបបានជោគជ័យ!");
                await fetchProducts(); // ហៅមកវិញដើម្បី Update បញ្ជីលើ Screen
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("មិនអាចលុបបានទេ!");
            }
        }
    };


     // បង្កើតតម្រង (Filter) សម្រាប់ទិន្នន័យក្នុងតារាង
    const filteredProducts = products.filter((product) => {
        // បង្កើត Search Term តែម្តងគត់ដើម្បីសន្សំកម្លាំងម៉ាស៊ីន
        const searchTerm = searchQuery.toLowerCase().trim();

        // បើអត់មានវាយអក្សរទេ ឱ្យបង្ហាញទំនិញទាំងអស់
        if (!searchTerm) return true;

        return (
            // ១. រកតាមឈ្មោះ (ប្រើ Optional Chaining ?. ដើម្បីការពារ Error បើគ្មានឈ្មោះ)
            product.name?.toLowerCase().includes(searchTerm) ||

            // ២. រកតាមតម្លៃ (ប្តូរលេខទៅជា String)
            product.price?.toString().includes(searchTerm) ||

            // ៣. រកតាមចំនួនស្តុក
            product.stockQuantity?.toString().includes(searchTerm) ||

            // ៤. រកតាម ID
            product.id?.toString().includes(searchTerm)
        );
    });

    // កន្លែងចុចប៊ូតុងកែសម្រួលក្នុងតារាង
    const handleEditClick = (product) => {
        setIsEditing(true);
        setCurrentId(product.id);
        // ត្រូវប្រើ setNewProduct ឱ្យត្រូវតាម State ដែលអ្នកបានបង្កើតសម្រាប់ Form
        setNewProduct({
            name: product.name,
            price: product.price,
            stockQuantity: product.stockQuantity,
            imageUrl: product.imageUrl || '' // ចាប់យក Link រូបភាពពីទិន្នន័យចាស់
        });

        //window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (isEditing) {
                // ប្រើ currentId នៅទីនេះ ដើម្បីប្រាប់ API ថាត្រូវកែទំនិញមួយណា
                await axios.put(`https://practical-light-production-55fd.up.railway.app/api/products/${currentId}`, newProduct, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("កែសម្រួលបានជោគជ័យ!");
            } else {
                // សម្រាប់បន្ថែមថ្មី
                await axios.post('https://practical-light-production-55fd.up.railway.app/api/products/add', newProduct, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("បន្ថែមបានជោគជ័យ!");
            }

            // បន្ទាប់ពីជោគជ័យ ត្រូវលុបតម្លៃក្នុង Form និងប្តូរមកស្ថានភាពធម្មតាវិញ
            setNewProduct({ name: '', price: '', stockQuantity: '' ,imageUrl: ''});
            setIsEditing(false);
            setCurrentId(null); // Reset currentId
            await fetchProducts(); // ទាញយកទិន្នន័យថ្មីមកបង្ហាញក្នុងតារាង
        } catch (error) {
            console.error("Error:", error);
            alert("ប្រតិបត្តិការបរាជ័យ!");
        }
    };



    const exportPDF = () => {
        const doc = new jsPDF();
        const tableRows = [];
        // ១. បន្ថែមចំណងជើងរបាយការណ៍
        doc.setFontSize(18);
        doc.text("iShop Management System - Sales Report", 14, 22);

        // ២. បន្ថែមព័ត៌មានសង្ខេប (យកលេខពី Dashboard ប្អូនមកដាក់)
        doc.setFontSize(12);
        doc.text(`Total Revenue: $${reportData.totalRevenue}`, 14, 32);
        doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 40);
        doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 48);

        // ៣. បង្កើតតារាងទិន្នន័យ (ទាញចេញពី List Orders ដែលប្អូនមានស្រាប់)
        const tableColumn = ["Order ID", "Customer", "Date", "Status", "Amount"];

        orders.forEach(order => {
            const orderData = [
                order.id,
                order.customer_name,
                order.order_date.split('T')[0],
                order.status,
                `$${order.total_amount}` // ប្រើ totalAmount ឱ្យត្រូវតាម Database
            ];
            tableRows.push(orderData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'striped'
        });

        // ៤. Save ជា File PDF
        doc.save(`Sales_Report_${new Date().getTime()}.pdf`);
    };

    const stockLabels = products.map(p => p.name); // យកឈ្មោះផលិតផលមកធ្វើជា Label
    const stockData = products.map(p => p.stockQuantity); // យកចំនួនក្នុងស្តុកមកធ្វើជាទិន្នន័យ

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

    // បូកសរុបប្រាក់ចំណូលតាមឈ្មោះអតិថិជន ឬតាមប្រភេទផលិតផល (ឧទាហរណ៍តាម Customer Name ក្នុង Order)
    const revenueByCustomer = orders.reduce((acc, order) => {
        const name = order.customer_name;
        acc[name] = (acc[name] || 0) + order.total_amount;
        return acc;
    }, {});

    const pieLabels = Object.keys(revenueByCustomer);
    const pieData = Object.values(revenueByCustomer);

    const pieChartData = {
        labels: pieLabels,
        datasets: [
            {
                data: pieData,
                backgroundColor: [
                    '#FF6384', '#124F9C', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
            },
        ],
    };

    // បង្កើត Function ជំនួយដើម្បីកំណត់ពណ៌ និងអត្ថបទ Status
    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'អស់ពីស្តុក', color: '#ff4d4f', bg: '#fff2f0' }; // ពណ៌ក្រហម
        if (quantity <= 5) return { text: 'ជិតអស់', color: '#faad14', bg: '#fffbe6' };  // ពណ៌ទឹកក្រូច
        return { text: 'មានក្នុងស្តុក', color: '#52c41a', bg: '#f6ffed' };              // ពណ៌បៃតង
    };

    const lineData = {
        labels: ['15-Apr', '25-Apr', '26-Apr'], // ទាញចេញពី PDF
        datasets: [
            {
                label: 'ចំណូលសរុប ($)',
                data: [42740, 26720, 13260], // ឧទាហរណ៍តម្លៃសរុបតាមថ្ងៃ
                borderColor: '#124F9C',
                backgroundColor: 'rgba(18, 79, 162, 0.2)',
                tension: 0.4, // ធ្វើឱ្យខ្សែកោងស្អាត
            },
        ],
    };
// --- UI Helpers ---
    const isAdmin = () => localStorage.getItem('role') === 'ROLE_ADMIN';
    // eslint-disable-next-line no-restricted-globals
    //សម្រាប់រក្សាទុកពាក្យដែលត្រូវស្វែងរក (String)
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOrders = orders.filter(order => {
        // ១. បំប្លែងពាក្យដែលប្អូនវាយ (searchTerm) ឱ្យទៅជាអក្សរតូចទាំងអស់ជាមុន
        const search = (searchTerm || "").toLowerCase();

        // ២. បំប្លែងឈ្មោះអតិថិជនពី Database ឱ្យទៅជាអក្សរតូចដែរ
        const customerName = (order?.customer_name || "").toLowerCase();

        // ៣. បំប្លែង ID ទៅជា String
        const orderId = (order?.id || "").toString();

        // ៤. ធ្វើការប្រៀបធៀប (ប្រើអក្សរតូចដូចគ្នា ទើបវាស្គាល់)
        return customerName.includes(search) || orderId.includes(search);
    });
    // ១. បង្កើត State សម្រាប់ទំព័របច្ចុប្បន្ន
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10; // បង្ហាញតែ ៥ ជួរក្នុងមួយទំព័រ

    // ២. គណនាដើម្បីទាញយកទិន្នន័យតាមចំណែក
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    // ៣. កាត់យកទិន្នន័យពី filteredOrders មកបង្ហាញតាមទំព័រ
    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);
    const npage = Math.ceil(filteredOrders.length / recordsPerPage); // ចំនួនទំព័រសរុប
    const numbers = [...Array(npage + 1).keys()].slice(1); // បង្កើតលេខ ១, ២, ៣...
    return (
        <div className="container-fluid p-0">
            {/* 2. MAIN CONTENT AREA */}
            <div className="d-flex align-items-start">
            <main className="container-fluid flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>

                {/* Header with Search (Facebook Style) */}
                <div className="d-flex container-fluid justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
                    <div className="search-pill d-flex container-fluid align-items-center px-3 py-2" style={{ backgroundColor: '#f0f2f5', borderRadius: '20px', width: '300px' }}>
                        <i className="bi bi-search text-muted me-2"></i>
                        <input
                            type="text"
                            placeholder="ស្វែងរកទំនិញ..."
                            className="border-0 bg-transparent outline-none w-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={exportPDF} className="btn btn-primary rounded-pill" style={{backgroundColor:'#124F9C'}}>
                        <i className="bi bi-file-earmark-pdf me-2"></i> Report
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="row row-cols-3 row-cols-md-4 row-cols-lg-5 g-3 mb-3">
                    <div className="col">
                <div className="stat-card">
                    <h3>មុខទំនិញសរុប</h3>
                    <p>{totalItems}</p>
                </div>
                    </div>
                    <div className="col">
                <div className="stat-card">
                    <h3>តម្លៃក្នុងស្តុកសរុប</h3>
                    <p>${totalValue.toLocaleString()}</p>
                </div>
                    </div>
                    <div className="col">
                <div className="stat-card" style={{ borderLeft: '5px solid #dc3545' }}>
                    <h3>ទំនិញជិតអស់</h3>
                    <p style={{ color: '#dc3545' }}>{lowStockItems}</p>
                </div>
                    </div>
                    <div className="col">
                <div className="stat-card" >
                    <h3>ចំនួនការកម៉្មង់</h3>
                    <p>{reportData.totalOrders} វិក្កយបត្រ</p>
                </div>
                    </div>
                    <div className="col">
                <div className="stat-card">
                    <h3>ចំណូលសរុប</h3>
                    <p>${reportData.totalRevenue.toLocaleString()}</p>
                </div>
            </div>
                </div>
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



            <div className="d-flex g-3 mb-3" >
                {/* Bar Chart ដែលប្អូនមានស្រាប់ */}
                <div className="d-flex flex-column flex-grow-1 me-3" style={{flex:1, width: '100%', maxWidth: '100%'}}>
                <div className="stat-card mb-3" style={{ backgroundColor: '#fff',color: '#124F9C', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '100%' }}>
                    <h3>📊 ស្ថិតិចំនួនស្តុកទំនិញ</h3>
                    <Bar data={barChartData} />
                </div>
                <div className="stat-card" style={{ backgroundColor: '#fff',color: '#124F9C', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '100%' }}>
                    <h3>📊 ក្រាបចំណូល</h3>
                    <Line data={lineData} />
                </div>
            </div>
                {/* បន្ថែម Pie Chart ថ្មីនៅទីនេះ */}
                <div className="stat-card flex" style={{ backgroundColor: '#fff',color:'#124F9C', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '50%' }}>
                    <h3>🍕 ចំណែកតម្លៃសរុបតាមផលិតផល</h3>
                   <Pie data={pieChartData} />
                </div>
            </div>

            {/* Form បន្ថែមទំនិញ */}
            {isAdmin() && (
                <div className="mb-3" style={{ marginBottom: '40px', padding: '25px', backgroundColor: '#fff',color:'#124F9C', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>បន្ថែមទំនិញថ្មី</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div className="row row-cols-5 row-cols-md-6 row-cols-lg-6 g-3 mb-3 gap-3">
                        <input className="col" placeholder="ឈ្មោះទំនិញ" value={newProduct.name} style={inputStyle}
                               onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />

                        <input className="col" type="number" placeholder="តម្លៃ ($)" value={newProduct.price} style={inputStyle}
                               onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />

                        <input className="col" type="number" placeholder="ចំនួនក្នុងស្តុក" value={newProduct.stockQuantity} style={inputStyle}
                               onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})} required />
                        <input className="col"
                            style={inputStyle}
                            type="text"
                            placeholder="Link រូបភាព (URL)"
                            value={newProduct.imageUrl}
                            onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        />

                        <button type="submit" className="btn-add" style={saveBtnStyle}>
                            {isEditing ? 'រក្សាទុកការកែសម្រួល' : 'រក្សាទុកទំនិញ'}
                        </button>

                        {/* ប្រសិនបើកំពុង Edit គួរមានប៊ូតុងបោះបង់ (Cancel) មួយទៀត */}
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setNewProduct({ name: '', price: '', stockQuantity: '',imageUrl: '' });
                                }}
                                className="btn-cancel"
                            >
                                បោះបង់
                            </button>
                        )}
                        </div>
                    </form>
                </div>
            )}

            <div className="search-container" style={searchBarStyle}>
                <input
                    type="text"
                    placeholder="ស្វែងរកទំនិញនៅទីនេះ..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {/* តារាងបង្ហាញទំនិញ */}
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
                    {filteredProducts.map((product) => {
                        const status = getStockStatus(product.stockQuantity);
                        return (
                            <tr className="text-nowrap" key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{product.id}</td>
                                <td className="fw-bold" style={{ padding: '12px', textAlign: 'left' }}>{product.name}</td>
                                <td className="text-success" style={{ padding: '12px', textAlign: 'left' }}>${product.price}</td>
                                <td>
                <span style={{
                    color: status.color,
                    backgroundColor: status.bg,
                    padding: '8px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    border: `1px solid ${status.color}`
                }}>
                    {product.stockQuantity} ({status.text})
                </span>
                                </td>
                                <td style={tableCellStyle}>
                                <img
                                src={product.imageUrl || 'https://via.placeholder.com/50'}
                                alt={product.name}
                                style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}}
                                />
                                </td>

                                <td style={tableCellStyle}>
                            {/* ប៊ូតុងកែសម្រួលដែលទើបថែមថ្មី */}
                            {isAdmin() ? (
                                <>
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        style={{
                                            marginRight: '10px',
                                            backgroundColor: '#ffc107',
                                            color: '#000',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        កែសម្រួល
                                    </button>
                                    <button onClick={() => deleteProduct(product.id)}
                                            style={{
                                                color: '#dc3545',
                                                background: 'none',
                                                border: '1px solid #dc3545',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}>
                                        លុប
                                    </button>
                                </>
                                 ) : (<span className="badge bg-secondary">មើលបានតែប៉ុណ្ណោះ</span>
                                 )}
                                 </td>
                             </tr>
                            );
                    })}
                    </tbody>
                </table>
            </div>
            {/* ផ្នែកតារាងបញ្ជីការកុម្ម៉ង់ */}
            <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px' }}>📋 បញ្ជីការកុម្ម៉ង់ទិញ (Orders)</h3>
                <div className="search-container" style={searchBarStyle}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខ ID..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' ,borderRadius: '8px'}}>
                        <th style={tHeader}>ID</th>
                        <th style={tHeader}>អតិថិជន</th>
                        <th style={tHeader}>កាលបរិច្ឆេទ</th>
                        <th style={tHeader}>ស្ថានភាព</th>
                        <th style={tHeader}>សរុប</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentRecords.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tCell}>{order.id}</td>
                            <td style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>{order.customer_name}</td>
                            <td style={tCell}>{order.price}
                                {order.order_date ? new Date(order.order_date).toLocaleDateString('km-KH') : 'មិនមានទិន្នន័យ'}</td>
                            <td style={tCell}>
                                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{order.status}</span>
                            </td>
                            <td style={tCell}>${order.total_amount?.toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div>
                <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination ">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link rounded-pill me-2" onClick={() => setCurrentPage(currentPage - 1)}>ថយក្រោយ</button>
                    </li>
                    {numbers.map((n, i) => (
                        <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                            <button className="page-link rounded-circle me-2" onClick={() => setCurrentPage(n)}>{n}</button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
                        <button className="page-link rounded-pill" onClick={() => setCurrentPage(currentPage + 1)}>បន្ទាប់</button>
                    </li>
                </ul>
            </nav>
            </div>
            </div>
        </main>
            </div>
    </div>
);
};

const tHeader = { border: '1px solid #ddd', padding: '12px', textAlign: 'center',backgroundColor:'#124F9C' ,color:'#f8f9fa'};
const tCell = { border: '1px solid #ddd', padding: '12px', textAlign: 'center' };
const inputStyle = {
    padding: '12px 15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    // minWidth: '200px',
    outline: 'none'
};

const tableHeaderStyle = {
    backgroundColor: '#124F9C',
    color: '#f8f9fa',
    fontWeight: '600',
    padding: '15px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6'
};

const tableCellStyle = {
    padding: '15px',
    borderBottom: '1px solid #eee',
    color: '#555'
};

const searchBarStyle = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
};
const saveBtnStyle = {
    padding: '12px 30px',
    backgroundColor: '#124F9C',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const alertContainerStyle = {
    backgroundColor: '#f8d7da',
    color: '#842029',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #f5c2c7',
    marginBottom: '20px'
};

export default DashboardPage;
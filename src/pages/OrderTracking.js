import React, {useEffect, useState, useCallback, //useRef
 } from 'react';
import axios from 'axios';
import AddOrderForm from '../components/AddOrderForm';
import './OrderTracking.css';
import 'jspdf-autotable';

//import {useReactToPrint} from "react-to-print";
//import html2canvas from 'html2canvas';
const OrderTracking = () => {
    //const componentRef = useRef();
    const [selectedOrder,setSelectedOrder] = useState(null);
    // មុខងារសម្រាប់ Print
    // ២. បង្កើត Trigger សម្រាប់បោះពុម្ព
    // កែត្រង់ចំណុចនេះក្នុង OrderTracking.js
    // const handlePrint = useReactToPrint({
    //     contentRef: componentRef, // ប្តូរពី content មកជា contentRef សម្រាប់ Version 3
    //     documentTitle: 'វិក្កយបត្រ iShop',
    //     onAfterPrint: () => setSelectedOrder(null),
    // });
    // ១. សម្រាប់រក្សាទុកបញ្ជីការបញ្ជាទិញ (Array)
    const [orders, setOrders] = useState([]);

    // ២. សម្រាប់រក្សាទុកពាក្យដែលត្រូវស្វែងរក (String)
    const [searchTerm, setSearchTerm] = useState("");

    // ✅ ១. បង្កើត Function សម្រាប់ទាញទិន្នន័យ (ដើម្បីកុំឱ្យលោត Error fetchOrders is not defined)
    const fetchOrders = useCallback( async () => {
        try {
            // ១. ទាញយក Token ពី localStorage
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/api/orders/all', {
                headers: {
                    // ២. បញ្ជូន Token ទៅកាន់ Backend តាមរយៈ Header
                    'Authorization': `Bearer ${token}`
                }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    },[setOrders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-warning text-dark'; // ពណ៌លឿង
            case 'SHIPPED':
                return 'bg-info text-white';   // ពណ៌ខៀវខ្ចី
            case 'COMPLETED':
                return 'bg-success';           // ពណ៌បៃតង
            case 'CANCELLED':
                return 'bg-danger';            // ពណ៌ក្រហម
            default:
                return 'bg-secondary';         // ពណ៌ប្រផេះ
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem('token');

        // បន្ថែម Log ដើម្បីឆែកមើលថាមាន Token ឬអត់ក្នុង Console
        console.log("Sending token:", token);

        try {
            await axios.put(`http://localhost:8081/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`, // ត្រូវមានពាក្យ Bearer និងដកឃ្លា
                        'Content-Type': 'application/json'
                    }
                }
            );
            fetchOrders();
        } catch (error) {
            console.error("Error 403 Detail:", error.response);
            alert("សិទ្ធិរបស់អ្នកត្រូវបានបដិសេធ (403 Forbidden)");
        }
    };

    // ១. គណនាទិន្នន័យចេញពី State orders
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const totalRevenue = orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);


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



    // Component សម្រាប់រចនាវិក្កយបត្រ (Industry Standard)
    const PrintableComponent = ({ order }) => {
        if (!order) return null; // បង្ការ Error ប្រសិនបើ order មិនទាន់មានទិន្នន័យ

        return (
            <div style={{ padding: '40px', fontFamily: "'Khmer OS Battambang', sans-serif", color: 'black', backgroundColor: 'white' }}>
                {/* ផ្នែកក្បាលវិក្កយបត្រ និង Logo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#2980b9' }}>iShop</h1>
                        <p style={{ fontSize: '12px', margin: 0 }}>អាសយដ្ឋាន៖ ភ្នំពេញ, កម្ពុជា</p>
                        <p style={{ fontSize: '12px', margin: 0 }}>ទូរស័ព្ទ៖ 012 345 678</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0 }}>វិក្កយបត្រ</h2>
                        <p style={{ margin: 0 }}>លេខ៖ #00{order?.id}</p>
                    </div>
                </div>

                {/* ព័ត៌មានអតិថិជន */}
                <div style={{ margin: '20px 0', fontSize: '14px' }}>
                    <p>អតិថិជន៖ <strong>{order?.customer_name || 'មិនស្គាល់ឈ្មោះ'}</strong></p>
                    <p>កាលបរិច្ឆេទ៖ {order?.order_date ? new Date(order.order_date).toLocaleString('kh-KH') : '---'}</p>
                </div>

                {/* តារាងទំនិញលម្អិត */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ color: '#f2f2f2' }}>
                        <th style={tHeader}>ល.រ</th>
                        <th style={tHeader}>មុខទំនិញ</th>
                        <th style={tHeader}>ចំនួន</th>
                        <th style={tHeader}>តម្លៃរាយ</th>
                        <th style={tHeader}>សរុប</th>
                    </tr>
                    </thead>
                    <tbody>
                    {order?.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                            <tr key={index}>
                                <td style={tCell}>{index + 1}</td>
                                <td style={tCell}>{item.product_name}</td> {/* ត្រូវប្រើ product_name តាម @JsonProperty */}
                                <td style={tCell}>{item.quantity}</td>
                                <td style={tCell}>${Number(item.price).toLocaleString()}</td>
                                <td style={{ ...tCell, textAlign: 'right' }}>
                                    ${(item.quantity * item.price).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={tCell}>មិនមានទិន្នន័យទំនិញ (Items: {order?.items?.length || 0})</td></tr>
                    )}
                    </tbody>
                </table>

                {/* ផ្នែកបូកសរុប និង QR Code */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <div>
                        <p style={{ fontSize: '12px', marginBottom: '5px' }}>ស្កេនដើម្បីទូទាត់ (Scan to Pay):</p>
                        {/* ប្តូរ URL រូបភាព QR របស់ប្អូននៅទីនេះ */}
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=iShop-Payment"
                            alt="QR Code"
                            style={{ width: '100px', height: '100px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: 0 }}>សរុបទឹកប្រាក់៖ ${Number(order?.total_amount || 0).toLocaleString()}</h3>
                        <p style={{ marginTop: '40px', fontSize: '12px' }}>ហត្ថលេខាអ្នកលក់</p>
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '12px', fontStyle: 'italic' }}>
                    សូមអរគុណ! សូមអញ្ជើញមកម្តងទៀត។
                </p>
            </div>
        );
    };



    const handlePrintInvoice = () => {
        const printContent = document.getElementById("invoice-to-print").innerHTML;
        const printWindow = window.open('', '_blank', 'height=800,width=900');

        printWindow.document.write(`
        <html>
            <head>
                <title>វិក្កយបត្រ iShop</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                <style>
                    body { font-family: "Khmer OS Battambang", sans-serif; padding: 30px; background: white !important; }
                    #invoice-to-print { width: 100%; border: none !important; }
                    /* បង្ហាញរូបភាព និងពណ៌ពេលព្រីន */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${printContent}
                </div>
            </body>
        </html>
    `);

        printWindow.document.close();

        // ប្រើ onload ដើម្បីឱ្យប្រាកដថា CSS និងរូបភាពត្រូវបាន Load ចប់ ១០០%
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                // បិទ window វិញបន្ទាប់ពីអ្នកប្រើចុច "Print" ឬ "Cancel"
                printWindow.onafterprint = () => printWindow.close();
            }, 800); // រង់ចាំ ០.៨ វិនាទី ដើម្បីបង្ការការបិទលឿនពេក
        };
    };


    // ១. បង្កើត State សម្រាប់ទំព័របច្ចុប្បន្ន
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5; // បង្ហាញតែ ៥ ជួរក្នុងមួយទំព័រ

    // ២. គណនាដើម្បីទាញយកទិន្នន័យតាមចំណែក
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    // ៣. កាត់យកទិន្នន័យពី filteredOrders មកបង្ហាញតាមទំព័រ
    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);
    const npage = Math.ceil(filteredOrders.length / recordsPerPage); // ចំនួនទំព័រសរុប
    const numbers = [...Array(npage + 1).keys()].slice(1); // បង្កើតលេខ ១, ២, ៣...


    const handleShareLink = (orderId) => {
        // បង្កើត Link (ឧទាហរណ៍៖ http://localhost:3000/invoice/0028)[cite: 1]
        const fullLink = `${window.location.origin}/invoice/${orderId}`;

        // បង្កើត Telegram Share Link[cite: 1]
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent("សូមពិនិត្យវិក្កយបត្ររបស់អ្នក!")}`;

        window.open(telegramUrl, '_blank'); // បើក Telegram ទៅកាន់កន្លែង Share ភ្លាម[cite: 1]
    };
    return (
        <div className="container mt-5">
            <h2 style={{color:'#124F9C'}}>តាមដានការបញ្ជាទិញ (Order Tracking)</h2>
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="stat-container">
                        <div className="stat-card">
                            <h5>ការបញ្ជាទិញសរុប</h5>
                            <p>{totalOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-container">
                        <div className="stat-card">
                            <h5>ចំណូលសរុប (ដែលជោគជ័យ)</h5>
                            <p>${totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-container">
                        <div className="stat-card">
                            <h5>នៅសល់ {pendingOrders} ទៀត</h5>
                            <p>កំពុងរង់ចាំ...</p>
                        </div>
                    </div>
                </div>
            </div>
            <AddOrderForm onOrderAdded={fetchOrders}
            />
            <input
                type="text"
                className="form-control w-25 shadow-sm"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខ ID..."
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="table-responsive">
            <table className="table table-hover shadow-sm mt-4">
                <thead className="table-dark">
                <tr>
                    <th style={tHeader}>ល.រ</th>
                    <th style={tHeader}>លេខវិក្កយបត្រ</th>
                    <th style={tHeader}>ឈ្មោះអតិថិជន</th>
                    <th style={tHeader}>កាលបរិច្ឆេទ</th>
                    <th style={tHeader}>សរុបទឹកប្រាក់</th>
                    <th style={tHeader}>ស្ថានភាព</th>
                    <th style={tHeader}>ទំនិញ</th>
                    <th style={tHeader} colSpan={2}>ផ្សេងៗ</th>
                </tr>
                </thead>
                <tbody>
                {currentRecords.map((order,index) => (
                    <tr key={order.id}>
                        <td style={tableCellStyle}>{firstIndex + index + 1}</td>
                        <td style={tableCellStyle}>#{order.id}</td>
                        <td>{order.customer_name}</td>
                        <td style={tableCellStyle}>
                            {order.order_date ? new Date(order.order_date).toLocaleString('kh-KH') : 'អត់មានថ្ងៃខែ'}
                            {/* ប្រើលក្ខខណ្ឌឆែកបើគ្មានតម្លៃ ឱ្យចេញអក្សរជំនួស */}
                        </td>
                        <td style={tableCellStyle}>${order.total_amount}</td>
                        <td style={tableCellStyle}>
                            <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}
                            </span>
                        </td>
                        <td style={tableCellStyle}>
                            <ul>
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                        {item.product_name} (x{item.quantity})
                                    </li>
                                ))}
                            </ul>
                        </td>
                        <td style={tableCellStyle}>
                            {order.status === 'PENDING' ? (
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                >
                                    ✅ បញ្ចប់ការលក់
                                </button>
                            ) : (
                                <span className="text-muted" >រួចរាល់</span>
                            )}
                        </td>
                        <td style={tableCellStyle}>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#previewModal"
                                onClick={() => setSelectedOrder(order)} // កំណត់ទិន្នន័យទៅឱ្យ Preview
                            >
                                មើលវិក្កយបត្រ
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
                {/* ផ្ទាំង Modal សម្រាប់បង្ហាញវិក្កយបត្រមុនបោះពុម្ព */}
                <div className="modal fade" id="previewModal" tabIndex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg modal-dialog-centered"> {/* modal-lg ដើម្បីឱ្យធំងាយមើល */}
                        <div className="modal-content">

                            {/* ១. ផ្នែកក្បាល Modal */}
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title" id="previewModalLabel">
                                    <i className="bi bi-eye-fill me-2"></i>ពិនិត្យវិក្កយបត្រមុនបោះពុម្ព
                                </h5>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>

                            {/* ២. ផ្នែកតួ Modal (នេះគឺជាកន្លែងដែលប្អូន "រុំ" PrintableComponent) */}
                            <div className="modal-body bg-light shadow-inner" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="d-flex justify-content-center">
                                    {/* ផ្នែកដែលត្រូវបោះពុម្ព[cite: 1] */}
                                    <div id="invoice-to-print" className="bg-white p-4 shadow-sm border rounded">
                                        {selectedOrder ? (
                                            <PrintableComponent order={selectedOrder} />
                                        ) : (
                                            <div className="text-center p-5 text-muted">កំពុងទាញយកទិន្នន័យ...</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ៣. ផ្នែកបាត Modal (ប៊ូតុងបញ្ជា)[cite: 1] */}
                            <div className="modal-footer justify-content-between">
                                <div className="text-muted small">
                                    <i className="bi bi-info-circle me-1"></i>សូមពិនិត្យព័ត៌មានឱ្យបានច្បាស់សិន ចាំបោះពុម្ព[cite: 1]
                                </div>
                                <div>
                                    <button type="button" className="btn btn-secondary rounded-pill me-3 px-3" data-bs-dismiss="modal" ><i className="bi bi-x-lg me-2"></i>បោះបង់</button>
                                    <button
                                        type="button"
                                        className="btn btn-primary rounded-pill me-3 px-3"
                                        onClick={() => handleShareLink(selectedOrder.id)} // បោះ ID ទៅឱ្យ Function
                                        //style={{ backgroundColor: '#0088cc', border: 'none' }}
                                    >
                                        <i className="bi bi-link-45deg me-2"></i> ចែករំលែក
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success rounded-pill px-3"
                                        onClick={handlePrintInvoice} // 👈 ហៅ function ថ្មីដែលយើងទើបបង្កើត
                                    >
                                        <i className="bi bi-printer-fill me-2"></i>បោះពុម្ពឥឡូវនេះ
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
        </div>
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

    );
};

// បន្ថែម Style ជំនួយឱ្យមើលទៅស្អាត

const tableCellStyle = {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'center'
};

const tHeader = { border: '1px solid #ddd', padding: '12px', textAlign: 'center',backgroundColor:'#124F9C' };
const tCell = { border: '1px solid #ddd', padding: '12px', textAlign: 'center' };
export default OrderTracking;




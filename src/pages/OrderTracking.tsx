import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AddOrderForm from '../components/AddOrderForm';
import './OrderTracking.css';
import 'jspdf-autotable';
const API_BASE_URL=process.env.REACT_APP_API_URL;
// ១. កំណត់ Interface សម្រាប់ធាតុនីមួយៗនៅក្នុង Order
interface OrderItem {
    product_name: string;
    quantity: number;
    price: number;
}

// ២. កំណត់ Interface សម្រាប់ទិន្នន័យ Order ទាំងមូលពី Backend
interface Order {
    id: number;
    customer_name: string;
    order_date: string;
    total_amount: number;
    status: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
    items: OrderItem[];
}

// ៣. កំណត់ Interface សម្រាប់ Props របស់ PrintableComponent
interface PrintableComponentProps {
    order: Order | null;
}

const OrderTracking: React.FC = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // ទាញយកទិន្នន័យ (Fetch Orders) ជាមួយ useCallback រួមទាំងការប្រើប្រាស់ Generic Type ជាមួយ Axios
    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Order[]>(`${API_BASE_URL}/api/orders/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // កំណត់ប្រភេទ Status Badge
    const getStatusBadge = (status: Order['status']): string => {
        switch (status) {
            case 'PENDING':
                return 'bg-warning text-dark';
            case 'SHIPPED':
                return 'bg-info text-white';
            case 'COMPLETED':
                return 'bg-success';
            case 'CANCELLED':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    // មុខងារកែប្រែស្ថានភាព Order
    const handleUpdateStatus = async (orderId: number, newStatus: Order['status']): Promise<void> => {
        const token = localStorage.getItem('token');
        console.log("Sending token:", token);

        try {
            await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            fetchOrders();
        } catch (error: any) {
            console.error("Error 403 Detail:", error.response);
            alert("សិទ្ធិរបស់អ្នកត្រូវបានបដិសេធ (403 Forbidden)");
        }
    };

    // គណនាទិន្នន័យសរុបចេញពី State
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const totalRevenue = orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // មុខងារស្វែងរកទិន្នន័យ (Search/Filter Logic)
    const filteredOrders = orders.filter(order => {
        const search = (searchTerm || "").toLowerCase();
        const customerName = (order?.customer_name || "").toLowerCase();
        const orderId = (order?.id || "").toString();
        return customerName.includes(search) || orderId.includes(search);
    });

    // Component សម្រាប់រចនាវិក្កយបត្រ (PrintableComponent)
    const PrintableComponent: React.FC<PrintableComponentProps> = ({ order }) => {
        if (!order) return null;

        return (
            <div style={{ padding: '40px', fontFamily: "'Khmer OS Battambang', sans-serif", color: 'black', backgroundColor: 'white' }}>
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

                <div style={{ margin: '20px 0', fontSize: '14px' }}>
                    <p>អតិថិជន៖ <strong>{order?.customer_name || 'មិនស្គាល់ឈ្មោះ'}</strong></p>
                    <p>កាលបរិច្ឆេទ៖ {order?.order_date ? new Date(order.order_date).toLocaleString('kh-KH') : '---'}</p>
                </div>

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
                                <td style={tCell}>{item.product_name}</td>
                                <td style={tCell}>{item.quantity}</td>
                                <td style={tCell}>${Number(item.price).toLocaleString()}</td>
                                <td style={{ ...tCell, textAlign: 'right' }}>
                                    ${(item.quantity * item.price).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={5} style={tCell}>មិនមានទិន្នន័យទំនិញ</td></tr>
                    )}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <div>
                        <p style={{ fontSize: '12px', marginBottom: '5px' }}>ស្កេនដើម្បីទូទាត់ (Scan to Pay):</p>
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

    // មុខងារបោះពុម្ព (Print Logic)
    const handlePrintInvoice = (): void => {
        const element = document.getElementById("invoice-to-print");
        if (!element) return;
        const printContent = element.innerHTML;
        const printWindow = window.open('', '_blank', 'height=800,width=900');

        if (printWindow) {
            printWindow.document.write(`
                <
                html>
                    <head>
                        <title>វិក្កយបត្រ iShop</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                        <style>
                            body { font-family: "Khmer OS Battambang", sans-serif; padding: 30px; background: white !important; }
                            #invoice-to-print { width: 100%; border: none !important; }
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        </style>
                    </head>
                    <body>
                        <div class="container">${printContent}</div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = function () {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.onafterprint = () => printWindow.close();
                }, 800);
            };
        }
    };

    // ផ្នែកគ្រប់គ្រងទំព័រ (Pagination Logic)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const recordsPerPage = 5;

    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const currentRecords = filteredOrders.slice(firstIndex, lastIndex);
    const npage = Math.ceil(filteredOrders.length / recordsPerPage);
    const numbers: number[] = Array.from({ length: npage }, (_, index) => index + 1);

    // មុខងារចែករំលែកទៅកាន់ Telegram
    const handleShareLink = (orderId: number): void => {
        const fullLink = `${window.location.origin}/invoice/${orderId}`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent("សូមពិនិត្យវិក្កយបត្ររបស់អ្នក!")}`;
        window.open(telegramUrl, '_blank');
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex align-items-start">
                <main className="container-fluid flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div>
                        <h2 style={{ color: '#124F9C' }}>តាមដានការបញ្ជាទិញ (Order Tracking)</h2>
                        <div className="row row-cols-md-3 row-cols-lg-3 g-3 mb-3">
                            <div className="col">
                                <div className="stat-card">
                                    <h3>ការបញ្ជាទិញសរុប</h3>
                                    <p>{totalOrders}</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="stat-card">
                                    <h3>ចំណូលសរុប (ដែលជោគជ័យ)</h3>
                                    <p>${totalRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="stat-card">
                                    <h3>នៅសល់ {pendingOrders} ទៀត</h3>
                                    <p>កំពុងរង់ចាំ...</p>
                                </div>
                            </div>
                        </div>
                        <AddOrderForm onOrderAdded={fetchOrders} />
                        <div className="search-container" style={searchBarStyle}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខ ID..."
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                                {currentRecords.map((order: Order, index: number) => (
                                    <tr key={order.id}>
                                        <td style={tableCellStyle}>{firstIndex + index + 1}</td>
                                        <td style={tableCellStyle}>#{order.id}</td>
                                        <td>{order.customer_name}</td>
                                        <td style={tableCellStyle}>
                                            {order.order_date ? new Date(order.order_date).toLocaleString('kh-KH') : 'អត់មានថ្ងៃខែ'}
                                        </td>
                                        <td style={tableCellStyle}>${order.total_amount}</td>
                                        <td style={tableCellStyle}>
                                            <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <ul>
                                                {order.items.map((item: OrderItem, idx: number) => (
                                                    <li key={idx}>
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
                                                <span className="text-muted">រួចរាល់</span>
                                            )}
                                        </td>
                                        <td style={tableCellStyle}>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#previewModal"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                មើលវិក្កយបត្រ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* ផ្ទាំង Modal សម្រាប់បង្ហាញវិក្កយបត្រមុនបោះពុម្ព */}
                            <div className="modal fade" id="previewModal" tabIndex={-1} aria-labelledby="previewModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-lg modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header bg-primary text-white">
                                            <h5 className="modal-title" id="previewModalLabel">
                                                <i className="bi bi-eye-fill me-2"></i>ពិនិត្យវិក្កយបត្រមុនបោះពុម្ព
                                            </h5>
                                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>

                                        <div className="modal-body bg-light shadow-inner" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                            <div className="d-flex justify-content-center">
                                                <div id="invoice-to-print" className="bg-white p-4 shadow-sm border rounded">
                                                    {selectedOrder ? (
                                                        <PrintableComponent order={selectedOrder} />
                                                    ) : (
                                                        <div className="text-center p-5 text-muted">កំពុងទាញយកទិន្នន័យ...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal-footer justify-content-between">
                                            <div className="text-muted small">
                                                <i className="bi bi-info-circle me-1"></i>សូមពិនិត្យព័ត៌មានឱ្យបានច្បាស់សិន ចាំបោះពុម្ព
                                            </div>
                                            <div>
                                                <button type="button" className="btn btn-secondary rounded-pill me-3 px-3" data-bs-dismiss="modal"><i className="bi bi-x-lg me-2"></i>បោះបង់</button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded-pill me-3 px-3"
                                                    onClick={() => selectedOrder && handleShareLink(selectedOrder.id)}
                                                >
                                                    <i className="bi bi-link-45deg me-2"></i> ចែករំលែក
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-success rounded-pill px-3"
                                                    onClick={handlePrintInvoice}
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
                            <ul className="pagination">
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
                </main>
            </div>
        </div>
    );
};

// --- Styles (ប្រើប្រាស់ React.CSSProperties ទាំងអស់) ---
const tableCellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'center'
};

const tHeader: React.CSSProperties = { border: '1px solid #ddd', padding: '12px', textAlign: 'center', backgroundColor: '#124F9C' };
const tCell: React.CSSProperties = { border: '1px solid #ddd', padding: '12px', textAlign: 'center' };

const searchBarStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
};

export default OrderTracking;
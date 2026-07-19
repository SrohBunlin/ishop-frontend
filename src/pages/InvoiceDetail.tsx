import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useLanguage } from '../context/LanguageContext';

type InvoiceParams = {
    id: string;
};

const tHeader: React.CSSProperties = { border: '1px solid #ddd', padding: '12px', textAlign: 'center', backgroundColor: '#124F9C', color: '#fff' };
const tCell: React.CSSProperties = { border: '1px solid #ddd', padding: '12px', textAlign: 'center' };

const InvoiceDetail: React.FC = () => {
    const { id } = useParams<InvoiceParams>();
    const { orders, fetchOrders } = useOrders();
    const { t, language } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders().finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const order = orders.find((o) => o.id === Number(id));

    const handlePrint = (): void => window.print();

    const handleShare = (): void => {
        const fullLink = `${window.location.origin}/invoice/${id}`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(t('invoice.shareText'))}`;
        window.open(telegramUrl, '_blank');
    };

    if (isLoading) {
        return <div className="text-center p-5 text-muted">{t('invoice.loading')}</div>;
    }

    if (!order) {
        return <div className="text-center p-5 text-muted">{t('invoice.notFound')}</div>;
    }

    return (
        <div className="container my-4">
            <div className="d-flex justify-content-center mb-3 no-print">
                <button className="btn btn-primary rounded-pill me-2" onClick={handlePrint}>
                    <i className="bi bi-printer-fill me-2"></i>{t('invoice.print')}
                </button>
                <button className="btn btn-outline-primary rounded-pill" onClick={handleShare}>
                    <i className="bi bi-link-45deg me-2"></i>{t('invoice.share')}
                </button>
            </div>

            <div
                id="invoice-to-print"
                className="bg-white shadow-sm border rounded mx-auto"
                style={{ maxWidth: '700px', padding: '40px', fontFamily: "'Khmer OS Battambang', sans-serif", color: 'black' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#2980b9' }}>iShop</h1>
                        <p style={{ fontSize: '12px', margin: 0 }}>{t('invoice.address')}</p>
                        <p style={{ fontSize: '12px', margin: 0 }}>{t('invoice.phone')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0 }}>{t('invoice.title')}</h2>
                        <p style={{ margin: 0 }}>{t('invoice.number')}: #00{order.id}</p>
                    </div>
                </div>

                <div style={{ margin: '20px 0', fontSize: '14px' }}>
                    <p>{t('invoice.customer')}: <strong>{order.customer_name || t('invoice.unknownCustomer')}</strong></p>
                    <p>
                        {t('invoice.date')}:{' '}
                        {order.order_date ? new Date(order.order_date).toLocaleString(language === 'en' ? 'en-US' : 'km-KH') : '---'}
                    </p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tHeader}>{t('invoice.colNo')}</th>
                            <th style={tHeader}>{t('invoice.colItem')}</th>
                            <th style={tHeader}>{t('invoice.colQty')}</th>
                            <th style={tHeader}>{t('invoice.colUnitPrice')}</th>
                            <th style={tHeader}>{t('invoice.colTotal')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <tr key={index}>
                                    <td style={tCell}>{index + 1}</td>
                                    <td style={tCell}>{item.product_name}</td>
                                    <td style={tCell}>{item.quantity}</td>
                                    <td style={tCell}>${Number(item.price).toLocaleString()}</td>
                                    <td style={{ ...tCell, textAlign: 'right' }}>${(item.quantity * item.price).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={tCell}>{t('invoice.noItems')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <div>
                        <p style={{ fontSize: '12px', marginBottom: '5px' }}>{t('invoice.scanToPay')}</p>
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=iShop-Payment"
                            alt="QR Code"
                            style={{ width: '100px', height: '100px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: 0 }}>{t('invoice.grandTotal')}: ${Number(order.total_amount || 0).toLocaleString()}</h3>
                        <p style={{ marginTop: '40px', fontSize: '12px' }}>{t('invoice.signature')}</p>
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '12px', fontStyle: 'italic' }}>{t('invoice.thankYou')}</p>
            </div>
        </div>
    );
};

export default InvoiceDetail;

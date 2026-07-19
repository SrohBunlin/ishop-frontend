import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types/dashboard.types';

export function exportInvoicePdf(order: Order): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('iShop - Invoice', 14, 22);

    doc.setFontSize(12);
    doc.text(`Invoice #: 00${order.id}`, 14, 32);
    doc.text(`Customer: ${order.customer_name || 'N/A'}`, 14, 40);
    doc.text(`Date: ${order.order_date ? new Date(order.order_date).toLocaleString() : 'N/A'}`, 14, 48);
    doc.text(`Status: ${order.status || 'N/A'}`, 14, 56);

    const tableColumn = ['#', 'Item', 'Qty', 'Unit Price', 'Total'];
    const tableRows: any[][] = (order.items || []).map((item, index) => [
        index + 1,
        item.product_name,
        item.quantity,
        `$${Number(item.price).toLocaleString()}`,
        `$${(item.quantity * item.price).toLocaleString()}`,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 64,
        theme: 'striped',
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 70;
    doc.setFontSize(13);
    doc.text(`Grand Total: $${Number(order.total_amount || 0).toLocaleString()}`, 14, finalY + 12);

    doc.save(`Invoice_${order.id}.pdf`);
}

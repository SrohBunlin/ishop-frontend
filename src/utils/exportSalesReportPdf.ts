import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, ReportStats } from '../types/dashboard.types';

export function exportSalesReportPdf(reportData: ReportStats, orders: Order[]): void {
    const doc = new jsPDF();
    const tableRows: any[][] = [];

    doc.setFontSize(18);
    doc.text('iShop Management System - Sales Report', 14, 22);

    doc.setFontSize(12);
    doc.text(`Total Revenue: $${reportData.totalRevenue}`, 14, 32);
    doc.text(`Total Orders: ${reportData.totalOrders}`, 14, 40);
    doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 48);

    const tableColumn = ['Order ID', 'Customer', 'Date', 'Status', 'Amount'];

    orders.forEach((order: Order) => {
        tableRows.push([
            order.id,
            order.customer_name,
            order.order_date ? order.order_date.split('T')[0] : 'N/A',
            order.status,
            `$${order.total_amount}`,
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
    });

    doc.save(`Sales_Report_${new Date().getTime()}.pdf`);
}

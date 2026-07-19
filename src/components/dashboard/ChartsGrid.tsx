import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { Order, Product } from '../../types/dashboard.types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ChartsGridProps {
    products: Product[];
    orders: Order[];
}

const CUSTOMER_COLORS = ['#4f8fe0', '#3B82F6', '#F2A922', '#33c774', '#f26b6f', '#9966FF'];

const ChartsGrid: React.FC<ChartsGridProps> = ({ products, orders }) => {
    const { isDark } = useTheme();
    const { t, language } = useLanguage();
    const textColor = isDark ? '#9aa5b8' : '#6b7280';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.06)';

    const baseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { boxWidth: 10, font: { size: 11 }, color: textColor },
            },
        },
        scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { boxWidth: 10, font: { size: 11 }, color: textColor },
            },
        },
    };

    const barChartData = {
        labels: products.map((p) => p.name),
        datasets: [
            {
                label: t('charts.stockQuantity'),
                data: products.map((p) => p.stockQuantity),
                backgroundColor: isDark ? 'rgba(79, 143, 224, 0.55)' : 'rgba(18, 79, 156, 0.6)',
                borderColor: isDark ? 'rgba(79, 143, 224, 1)' : 'rgba(18, 79, 156, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const revenueByCustomer = (orders || []).reduce((acc: Record<string, number>, order) => {
        if (!order || !order.customer_name) return acc;
        acc[order.customer_name] = (acc[order.customer_name] || 0) + (order.total_amount || 0);
        return acc;
    }, {});

    const pieChartData = {
        labels: Object.keys(revenueByCustomer),
        datasets: [
            {
                data: Object.values(revenueByCustomer),
                backgroundColor: CUSTOMER_COLORS,
                borderWidth: 0,
            },
        ],
    };

    const revenueByDate = (orders || []).reduce((acc: Record<string, number>, order) => {
        if (!order || !order.order_date) return acc;
        const date = order.order_date.split('T')[0];
        acc[date] = (acc[date] || 0) + (order.total_amount || 0);
        return acc;
    }, {});

    const rawLineLabels = Object.keys(revenueByDate).sort();
    const lineLabels = rawLineLabels.map((date) =>
        new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH', { month: 'short', day: 'numeric' })
    );
    const lineChartDataValues = rawLineLabels.map((date) => revenueByDate[date]);

    const lineData = {
        labels: lineLabels.length > 0 ? lineLabels : [t('charts.noData')],
        datasets: [
            {
                label: t('charts.totalRevenue'),
                data: lineChartDataValues.length > 0 ? lineChartDataValues : [0],
                borderColor: isDark ? '#4f8fe0' : '#124F9C',
                backgroundColor: isDark ? 'rgba(79, 143, 224, 0.18)' : 'rgba(18, 79, 162, 0.15)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <div className="row g-3">
            <div className="col-lg-4">
                <div className="db-panel h-100">
                    <div className="db-panel__header">
                        <p className="db-panel__title">
                            <span className="db-panel__title-icon">
                                <i className="bi bi-bar-chart-fill"></i>
                            </span>
                            {t('charts.stockStats')}
                        </p>
                    </div>
                    <div className="db-chart-box">
                        <Bar data={barChartData} options={baseChartOptions} />
                    </div>
                </div>
            </div>
            <div className="col-lg-4">
                <div className="db-panel h-100">
                    <div className="db-panel__header">
                        <p className="db-panel__title">
                            <span className="db-panel__title-icon">
                                <i className="bi bi-graph-up"></i>
                            </span>
                            {t('charts.revenueByDate')}
                        </p>
                    </div>
                    <div className="db-chart-box">
                        <Line data={lineData} options={baseChartOptions} />
                    </div>
                </div>
            </div>
            <div className="col-lg-4">
                <div className="db-panel h-100">
                    <div className="db-panel__header">
                        <p className="db-panel__title">
                            <span className="db-panel__title-icon">
                                <i className="bi bi-pie-chart-fill"></i>
                            </span>
                            {t('charts.revenueByCustomer')}
                        </p>
                    </div>
                    <div className="db-chart-box">
                        <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartsGrid;

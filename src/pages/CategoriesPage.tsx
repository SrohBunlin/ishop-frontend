import React, { useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useReportStats } from '../hooks/useReportStats';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { CATEGORY_OPTIONS } from '../constants/productCategories';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const CategoriesPage: React.FC = () => {
    const { t } = useLanguage();
    const { products, fetchProducts } = useProducts();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const totalSubCategories = useMemo(
        () => CATEGORY_OPTIONS.reduce((sum, cat) => sum + cat.subCategories.length, 0),
        []
    );

    const countForCategory = (categoryId: number) => products.filter((p) => p.categoryId === categoryId).length;
    const countForSubCategory = (subCategoryId: number) => products.filter((p) => p.subCategoryId === subCategoryId).length;

    return (
        <DashboardLayout title={t('categories.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-tags-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('categories.totalCategories')}</p>
                                    <p className="db-stat-value">{CATEGORY_OPTIONS.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-diagram-3-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('categories.totalSubCategories')}</p>
                                    <p className="db-stat-value">{totalSubCategories}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-box-seam-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('stats.totalProducts')}</p>
                                    <p className="db-stat-value">{products.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <div className="row g-3">
                        {CATEGORY_OPTIONS.map((category) => (
                            <div className="col-12 col-lg-6" key={category.id}>
                                <div className="db-panel h-100">
                                    <div className="db-panel__header">
                                        <p className="db-panel__title">
                                            <span className="db-panel__title-icon">
                                                <i className="bi bi-tag-fill"></i>
                                            </span>
                                            {category.name}
                                            <span className="db-panel__count">
                                                {countForCategory(category.id)} {t('categories.productsCount')}
                                            </span>
                                        </p>
                                    </div>

                                    {category.subCategories.length === 0 ? (
                                        <div className="db-empty">
                                            <i className="bi bi-inbox"></i>
                                            <p>{t('categories.noProducts')}</p>
                                        </div>
                                    ) : (
                                        <div className="db-table-wrap">
                                            <table className="db-table">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">{t('categories.subCategories')}</th>
                                                        <th scope="col">{t('categories.productsCount')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {category.subCategories.map((sub) => (
                                                        <tr key={sub.id}>
                                                            <td className="db-cell-name">{sub.name}</td>
                                                            <td>
                                                                <span className="db-pill db-status-success">{countForSubCategory(sub.id)}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CategoriesPage;

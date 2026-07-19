import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import ProductForm from '../components/products/ProductForm';
import ProductsTable from '../components/products/ProductsTable';
import { useProducts } from '../hooks/useProducts';
import { useProductForm } from '../hooks/useProductForm';
import { useReportStats } from '../hooks/useReportStats';
import { useOrders } from '../hooks/useOrders';
import { exportSalesReportPdf } from '../utils/exportSalesReportPdf';
import { canManageProducts } from '../utils/auth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const ProductsPage: React.FC = () => {
    const { t } = useLanguage();
    const { products, fetchProducts, deleteProduct } = useProducts();
    const { orders, fetchOrders } = useOrders();
    const { reportData, fetchReportStats } = useReportStats();
    const productForm = useProductForm(fetchProducts);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchReportStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportReport = () => exportSalesReportPdf(reportData, orders);

    const { totalStockValue, lowStockCount, outOfStockCount } = useMemo(() => {
        let value = 0;
        let low = 0;
        let out = 0;
        products.forEach((p) => {
            value += (p.price || 0) * (p.stockQuantity || 0);
            if (p.stockQuantity === 0) out += 1;
            else if (p.stockQuantity <= 5) low += 1;
        });
        return { totalStockValue: value, lowStockCount: low, outOfStockCount: out };
    }, [products]);

    return (
        <DashboardLayout title={t('products.title')} onExportReport={handleExportReport}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-4 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-box-seam-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('stats.totalProducts')}</p>
                                    <p className="db-stat-value">{products.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-wallet2"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('stats.totalStockValue')}</p>
                                    <p className="db-stat-value">${totalStockValue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('stats.lowStock')}</p>
                                    <p className="db-stat-value">{lowStockCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--danger">
                                    <i className="bi bi-x-octagon-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('products.outOfStock')}</p>
                                    <p className="db-stat-value db-stat-value--danger">{outOfStockCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <LowStockAlert products={products} />

                {canManageProducts() && (
                    <div className="dashboard-section">
                        <ProductForm
                            isEditing={productForm.isEditing}
                            currentId={productForm.currentId}
                            newProduct={productForm.newProduct}
                            setNewProduct={productForm.setNewProduct}
                            previewUrl={productForm.previewUrl}
                            imageFile={productForm.imageFile}
                            fileInputRef={productForm.fileInputRef}
                            onFileChange={productForm.handleFileChange}
                            galleryPreviewUrls={productForm.galleryPreviewUrls}
                            galleryInputRef={productForm.galleryInputRef}
                            onGalleryChange={productForm.handleGalleryChange}
                            onRemoveGalleryFile={productForm.removeGalleryFile}
                            onToggleTag={productForm.toggleTag}
                            onSubmit={productForm.handleSubmit}
                            onCancel={productForm.resetForm}
                        />
                    </div>
                )}

                <div className="dashboard-section">
                    <ProductsTable
                        products={products}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onEdit={productForm.handleEditClick}
                        onDelete={deleteProduct}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProductsPage;

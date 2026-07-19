import React, { useEffect, useMemo, useRef } from 'react';
import { NewProductState } from '../../types/dashboard.types';
import { inputStyle, saveBtnStyle, cancelBtnStyle } from '../../styles/sharedStyles';
import { CATEGORY_OPTIONS, TAG_OPTIONS, TAG_LABEL_KEYS, STATUS_OPTIONS } from '../../constants/productCategories';
import { useLanguage } from '../../context/LanguageContext';

interface ProductFormProps {
    isEditing: boolean;
    currentId: number | null;
    newProduct: NewProductState;
    setNewProduct: (value: NewProductState) => void;
    previewUrl: string;
    imageFile: File | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    galleryPreviewUrls: string[];
    galleryInputRef: React.RefObject<HTMLInputElement | null>;
    onGalleryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveGalleryFile: (index: number) => void;
    onToggleTag: (tag: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

const fieldWrapStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '18px',
};

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    width: '100%',
    resize: 'vertical',
    minHeight: '70px',
    fontFamily: 'inherit',
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    width: '100%',
};

// ✨ Rich Text Editor តូចមួយ (ដិត / ទ្រេត / បញ្ជីចំណុច / ពណ៌អក្សរ) - គ្មានតម្រូវការ Library ខាងក្រៅ
interface RichTextEditorProps {
    initialValue: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = initialValue || '';
        }
        // ត្រូវការតែពេល mount ដំបូងប៉ុណ្ណោះ (ប្រើ key នៅខាងក្រៅ ដើម្បីបង្ខំ remount ពេលប្តូរទំនិញកែសម្រួល)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const exec = (command: string, arg?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, arg);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    return (
        <div>
            <div className="rte-toolbar">
                <button type="button" title={t('productForm.rte.bold')} onClick={() => exec('bold')}>
                    <i className="bi bi-type-bold"></i>
                </button>
                <button type="button" title={t('productForm.rte.italic')} onClick={() => exec('italic')}>
                    <i className="bi bi-type-italic"></i>
                </button>
                <button type="button" title={t('productForm.rte.underline')} onClick={() => exec('underline')}>
                    <i className="bi bi-type-underline"></i>
                </button>
                <button type="button" title={t('productForm.rte.bulletList')} onClick={() => exec('insertUnorderedList')}>
                    <i className="bi bi-list-ul"></i>
                </button>
                <button type="button" title={t('productForm.rte.numberedList')} onClick={() => exec('insertOrderedList')}>
                    <i className="bi bi-list-ol"></i>
                </button>
                <input
                    type="color"
                    title={t('productForm.rte.textColor')}
                    defaultValue="#124F9C"
                    onChange={(e) => exec('foreColor', e.target.value)}
                />
                <button type="button" title={t('productForm.rte.clearFormat')} onClick={() => exec('removeFormat')}>
                    <i className="bi bi-eraser"></i>
                </button>
            </div>
            <div
                ref={editorRef}
                className="rte-editor"
                contentEditable
                data-placeholder={placeholder}
                onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
                suppressContentEditableWarning
            />
        </div>
    );
};

const ProductForm: React.FC<ProductFormProps> = ({
    isEditing,
    currentId,
    newProduct,
    setNewProduct,
    previewUrl,
    imageFile,
    fileInputRef,
    onFileChange,
    galleryPreviewUrls,
    galleryInputRef,
    onGalleryChange,
    onRemoveGalleryFile,
    onToggleTag,
    onSubmit,
    onCancel,
}) => {
    const { t } = useLanguage();
    const subCategoryOptions = useMemo(() => {
        const selectedCategory = CATEGORY_OPTIONS.find((c) => c.id.toString() === newProduct.categoryId);
        return selectedCategory ? selectedCategory.subCategories : [];
    }, [newProduct.categoryId]);

    return (
        <div
            className="mb-4 product-form-card"
            style={{
                padding: '25px',
                backgroundColor: 'var(--db-surface, #fff)',
                color: 'var(--db-text, #124F9C)',
                borderRadius: '10px',
                boxShadow: 'var(--db-shadow, 0 2px 10px rgba(0,0,0,0.1))',
            }}
        >
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--db-primary, #124F9C)' }}>
                {isEditing ? t('productForm.editTitle') : t('productForm.addTitle')}
            </h3>

            <form onSubmit={onSubmit}>
                {/* ១. ព័ត៌មានទូទៅ (Basic Information) */}
                <div className="product-form-section">
                    <p className="product-form-section__title">
                        <i className="bi bi-card-text"></i> {t('productForm.generalInfo')}
                    </p>
                    <div className="product-form-grid">
                        <div style={fieldWrapStyle} className="product-form-grid__full">
                            <label className="form-label fw-bold">{t('productForm.productName')}</label>
                            <input
                                className="w-100"
                                placeholder={t('productForm.productNamePlaceholder')}
                                value={newProduct.name}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                        </div>

                        <div style={fieldWrapStyle} className="product-form-grid__full">
                            <label className="form-label fw-bold">
                                {t('productForm.fullDescription')} <span className="product-form-hint">{t('productForm.fullDescriptionHint')}</span>
                            </label>
                            <RichTextEditor
                                key={currentId ?? 'new'}
                                initialValue={newProduct.description}
                                placeholder={t('productForm.fullDescriptionPlaceholder')}
                                onChange={(html) => setNewProduct({ ...newProduct, description: html })}
                            />
                        </div>

                        <div style={fieldWrapStyle} className="product-form-grid__full">
                            <label className="form-label fw-bold">
                                {t('productForm.shortDescription')} <span className="product-form-hint">{t('productForm.shortDescriptionHint')}</span>
                            </label>
                            <textarea
                                placeholder={t('productForm.shortDescriptionPlaceholder')}
                                value={newProduct.shortDescription}
                                style={textareaStyle}
                                maxLength={160}
                                onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* ២. តម្លៃ និងការគ្រប់គ្រងស្តុក (Pricing & Inventory) */}
                <div className="product-form-section">
                    <p className="product-form-section__title">
                        <i className="bi bi-cash-coin"></i> {t('productForm.pricingInventory')}
                    </p>
                    <div className="product-form-grid">
                        <div style={fieldWrapStyle}>
                            <label className="form-label fw-bold">{t('productForm.originalPrice')}</label>
                            <input
                                className="w-100"
                                type="number"
                                step="0.01"
                                placeholder={t('productForm.originalPricePlaceholder')}
                                value={newProduct.price}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                required
                            />
                        </div>

                        <div style={fieldWrapStyle}>
                            <label className="form-label fw-bold">
                                {t('productForm.salePrice')} <span className="product-form-hint">{t('productForm.optional')}</span>
                            </label>
                            <input
                                className="w-100"
                                type="number"
                                step="0.01"
                                placeholder={t('productForm.salePricePlaceholder')}
                                value={newProduct.salePrice}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                            />
                        </div>

                        <div style={fieldWrapStyle}>
                            <label className="form-label fw-bold">{t('productForm.sku')}</label>
                            <input
                                className="w-100"
                                placeholder={t('productForm.skuPlaceholder')}
                                value={newProduct.sku}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                            />
                        </div>

                        <div style={fieldWrapStyle}>
                            <label className="form-label fw-bold">{t('productForm.stockQty')}</label>
                            <input
                                className="w-100"
                                type="number"
                                placeholder={t('productForm.stockQtyPlaceholder')}
                                value={newProduct.stockQuantity}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* ៣. ការចាត់ថ្នាក់ (Categorization) */}
                <div className="product-form-section">
                    <p className="product-form-section__title">
                        <i className="bi bi-tags-fill"></i> {t('productForm.categorization')}
                    </p>
                    <div className="product-form-grid">
                        <div style={fieldWrapStyle}>
                            <label className="form-label fw-bold">{t('productForm.category')}</label>
                            <select
                                style={selectStyle}
                                value={newProduct.categoryId}
                                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value, subCategoryId: '' })}
                                required
                            >
                                <option value="">{t('productForm.selectCategory')}</option>
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={fieldWrapStyle}>
                            <label className="form-label fw-bold">{t('productForm.subCategory')}</label>
                            <select
                                style={selectStyle}
                                value={newProduct.subCategoryId}
                                onChange={(e) => setNewProduct({ ...newProduct, subCategoryId: e.target.value })}
                                disabled={subCategoryOptions.length === 0}
                            >
                                <option value="">
                                    {subCategoryOptions.length === 0 ? t('productForm.selectCategoryFirst') : t('productForm.selectSubCategory')}
                                </option>
                                {subCategoryOptions.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={fieldWrapStyle} className="product-form-grid__full">
                            <label className="form-label fw-bold">{t('productForm.tags')}</label>
                            <div className="tag-checkbox-group">
                                {TAG_OPTIONS.map((tag) => (
                                    <label key={tag} className="tag-checkbox-chip">
                                        <input
                                            type="checkbox"
                                            checked={newProduct.tags.includes(tag)}
                                            onChange={() => onToggleTag(tag)}
                                        />
                                        {TAG_LABEL_KEYS[tag] ? t(TAG_LABEL_KEYS[tag], tag) : tag}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ៤. រូបភាព (Media) */}
                <div className="product-form-section">
                    <p className="product-form-section__title">
                        <i className="bi bi-images"></i> {t('productForm.media')}
                    </p>
                    <div className="product-form-grid">
                        <div style={fieldWrapStyle} className="product-form-grid__full">
                            <label className="form-label fw-bold">{t('productForm.mainImage')}</label>
                            <input
                                type="file"
                                accept="image/*"
                                style={inputStyle}
                                ref={fileInputRef}
                                onChange={onFileChange}
                                required={!isEditing}
                            />
                            {previewUrl && (
                                <div className="mt-2 d-flex align-items-center gap-2">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <span style={{ fontSize: '12px', color: 'var(--db-text-muted, #666)' }}>
                                        {isEditing && !imageFile ? t('productForm.currentImage') : t('productForm.newImageSelected')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={fieldWrapStyle} className="product-form-grid__full">
                            <label className="form-label fw-bold">
                                {t('productForm.gallery')} <span className="product-form-hint">{t('productForm.galleryHint')}</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={inputStyle}
                                ref={galleryInputRef}
                                onChange={onGalleryChange}
                            />
                            {galleryPreviewUrls.length > 0 && (
                                <div className="gallery-preview-grid">
                                    {galleryPreviewUrls.map((url, index) => (
                                        <div key={url} className="gallery-preview-item">
                                            <img src={url} alt={`Gallery ${index + 1}`} />
                                            <button type="button" onClick={() => onRemoveGalleryFile(index)} title={t('productForm.removeImage')}>
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ៥. ព័ត៌មានលម្អិតផ្សេងៗ (Additional Settings) */}
                <div className="product-form-section">
                    <p className="product-form-section__title">
                        <i className="bi bi-gear-fill"></i> {t('productForm.additionalSettings')}
                    </p>

                    <div style={fieldWrapStyle}>
                        <label className="form-label fw-bold">{t('productForm.status')}</label>
                        <div className="status-radio-group">
                            {STATUS_OPTIONS.map((opt) => (
                                <label key={opt.value} className="status-radio-option">
                                    <input
                                        type="radio"
                                        name="productStatus"
                                        value={opt.value}
                                        checked={newProduct.status === opt.value}
                                        onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                                    />
                                    <i className={`bi ${opt.icon}`}></i> {t(`productForm.status${opt.value.charAt(0)}${opt.value.slice(1).toLowerCase()}`, opt.label)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={fieldWrapStyle}>
                        <label className="form-label fw-bold">
                            {t('productForm.weightDimensions')} <span className="product-form-hint">{t('productForm.weightDimensionsHint')}</span>
                        </label>
                        <div className="product-form-grid">
                            <input
                                type="number" step="0.01"
                                placeholder={t('productForm.weightPlaceholder')}
                                value={newProduct.weight}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                            />
                            <input
                                type="number" step="0.1"
                                placeholder={t('productForm.lengthPlaceholder')}
                                value={newProduct.length}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, length: e.target.value })}
                            />
                            <input
                                type="number" step="0.1"
                                placeholder={t('productForm.widthPlaceholder')}
                                value={newProduct.width}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, width: e.target.value })}
                            />
                            <input
                                type="number" step="0.1"
                                placeholder={t('productForm.heightPlaceholder')}
                                value={newProduct.height}
                                style={inputStyle}
                                onChange={(e) => setNewProduct({ ...newProduct, height: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-2">
                    <button type="submit" style={saveBtnStyle}>
                        {isEditing ? t('productForm.save') : t('productForm.addNew')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={onCancel} style={cancelBtnStyle}>
                            {t('productForm.cancel')}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProductForm;

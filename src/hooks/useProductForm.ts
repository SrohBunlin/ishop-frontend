import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { NewProductState, Product } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const emptyForm: NewProductState = {
    name: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    salePrice: '',
    sku: '',
    subCategoryId: '',
    tags: [],
    status: 'PUBLISHED',
    weight: '',
    length: '',
    width: '',
    height: '',
};

export function useProductForm(fetchProducts: () => Promise<void>) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [newProduct, setNewProduct] = useState<NewProductState>(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // ✨ បណ្ដុំរូបភាពបន្ថែម (Product Gallery) - អាចជ្រើសរើសបានច្រើន
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl('');
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    useEffect(() => {
        if (galleryFiles.length === 0) {
            setGalleryPreviewUrls([]);
            return;
        }
        const urls = galleryFiles.map((file) => URL.createObjectURL(file));
        setGalleryPreviewUrls(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [galleryFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
        // អនុញ្ញាតឱ្យជ្រើសរើសរូបភាពដដែលម្តងទៀតបាន
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const removeGalleryFile = (index: number) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleTag = (tag: string) => {
        setNewProduct((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
        }));
    };

    const handleEditClick = (product: Product) => {
        setIsEditing(true);
        setCurrentId(product.id);
        setNewProduct({
            name: product.name,
            price: product.price.toString(),
            stockQuantity: product.stockQuantity.toString(),
            categoryId: product.categoryId ? product.categoryId.toString() : '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            salePrice: product.salePrice !== undefined ? product.salePrice.toString() : '',
            sku: product.sku || '',
            subCategoryId: product.subCategoryId ? product.subCategoryId.toString() : '',
            tags: product.tags || [],
            status: product.status || 'PUBLISHED',
            weight: product.weight !== undefined ? product.weight.toString() : '',
            length: product.length !== undefined ? product.length.toString() : '',
            width: product.width !== undefined ? product.width.toString() : '',
            height: product.height !== undefined ? product.height.toString() : '',
        });
        setPreviewUrl(product.image && product.image !== 'undefined' ? `${API_BASE_URL}${product.image}` : '');
        setImageFile(null);
        setGalleryFiles([]);
    };

    const resetForm = () => {
        setNewProduct(emptyForm);
        setImageFile(null);
        setPreviewUrl('');
        setGalleryFiles([]);
        setIsEditing(false);
        setCurrentId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        // ១. ព័ត៌មានទូទៅ
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description);
        formData.append('shortDescription', newProduct.shortDescription);
        // ២. តម្លៃ និងការគ្រប់គ្រងស្តុក
        formData.append('price', newProduct.price);
        if (newProduct.salePrice) formData.append('salePrice', newProduct.salePrice);
        formData.append('sku', newProduct.sku);
        formData.append('stockQuantity', newProduct.stockQuantity);
        // ៣. ការចាត់ថ្នាក់
        formData.append('categoryId', newProduct.categoryId);
        if (newProduct.subCategoryId) formData.append('subCategoryId', newProduct.subCategoryId);
        newProduct.tags.forEach((tag) => formData.append('tags', tag));
        // ៤. រូបភាព
        if (imageFile) {
            formData.append('image', imageFile);
        }
        galleryFiles.forEach((file) => formData.append('gallery', file));
        // ៥. ព័ត៌មានលម្អិតផ្សេងៗ
        formData.append('status', newProduct.status);
        if (newProduct.weight) formData.append('weight', newProduct.weight);
        if (newProduct.length) formData.append('length', newProduct.length);
        if (newProduct.width) formData.append('width', newProduct.width);
        if (newProduct.height) formData.append('height', newProduct.height);

        try {
            if (isEditing && currentId !== null) {
                await axios.put(`${API_BASE_URL}/api/products/${currentId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('កែសម្រួលបានជោគជ័យ!');
            } else {
                await axios.post(`${API_BASE_URL}/api/products`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('បន្ថែមបានជោគជ័យ!');
            }
            resetForm();
            await fetchProducts();
        } catch (error) {
            console.error('Error operations:', error);
            alert('ប្រតិបត្តិការបរាជ័យ! សូមពិនិត្យមើលប្រព័ន្ធតភ្ជាប់ឡើងវិញ។');
        }
    };

    return {
        isEditing,
        currentId,
        newProduct,
        setNewProduct,
        imageFile,
        previewUrl,
        fileInputRef,
        handleFileChange,
        galleryFiles,
        galleryPreviewUrls,
        galleryInputRef,
        handleGalleryChange,
        removeGalleryFile,
        toggleTag,
        handleEditClick,
        resetForm,
        handleSubmit,
    };
}

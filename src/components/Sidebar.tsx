import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    getRoleLabel,
    getRoleLabelKey,
    isSuperAdmin,
    isAdmin,
    canViewInvoices,
    canViewReturns,
    canViewProducts,
    canViewCategories,
    canViewEmployees,
} from '../utils/auth';
import { resolveAvatarUrl } from '../utils/avatar';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './common/ThemeToggle';
import LanguageToggle from './common/LanguageToggle';
import '../styles/shop-ui.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return 'IS';
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return `${f}${l}`.toUpperCase();
};
interface UserProfile {
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
}

interface SidebarProps {
    handleLogout: () => void;
    userProfile: UserProfile | null; // ត្រូវប្រាកដថាមានផ្ទុក profilePictureUrl
    setUser: (user: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleLogout, userProfile, setUser }) => {
    const { t } = useLanguage();
    const location = useLocation();
    const isActive = (path: string): boolean => location.pathname === path;

    // State សម្រាប់គ្រប់គ្រង Modal
    const [showModal, setShowModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // មុខងារបើក Modal
    const handleOpenModal = () => {
        setEditFirstName(userProfile?.firstName || '');
        setEditLastName(userProfile?.lastName || '');
        setEditAvatar(userProfile?.profilePictureUrl || '');
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('first_name', editFirstName);
            formData.append('last_name', editLastName);
            if (selectedFile) formData.append('avatar', selectedFile);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`},
                body: formData
            });

            if (response.ok) {
                const updatedUser = {
                    firstName: editFirstName,
                    lastName: editLastName,
                    profilePictureUrl: selectedFile ? editAvatar : (userProfile?.profilePictureUrl || '')
                };

                setUser(updatedUser);
                localStorage.setItem('user_profile', JSON.stringify(updatedUser));

                alert(t('sidebar.updateSuccess'));
                setShowModal(false);

                // ➕ បន្ថែមបន្ទាត់នេះ ដើម្បីឱ្យ Navbar និងផ្ទៃកម្មវិធីទាំងមូលរត់ទិន្នន័យថ្មីឡើងវិញភ្លាមៗ
               // window.location.reload();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(t('sidebar.updateFail'));
        }
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file); // 🌟 រក្សាទុក File ពិតប្រាកដត្រៀមបញ្ជូនទៅ API
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatar(reader.result as string); // សម្រាប់ Preview លើអេក្រង់
            };
            reader.readAsDataURL(file);
        }
    };

    const avatarSrc = resolveAvatarUrl(userProfile?.profilePictureUrl || editAvatar || '');

    const modalAvatarSrc = resolveAvatarUrl(editAvatar || userProfile?.profilePictureUrl || '');

    return (
        <>
            <aside className="sidebar-container side-nav" style={{ width: '290px', flexShrink: 0 }}>
                <div className="flex-grow-1">

                    {/* 🌟 ប៊ូតុង Profile ដែលអាចចុចបាន */}
                    <button onClick={handleOpenModal} className="side-nav__profile">
                        <div className="side-nav__avatar-wrap">
                            {(userProfile?.profilePictureUrl || editAvatar) ? (
                                <img
                                    src={avatarSrc}
                                    alt="Profile"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('d-none');
                                    }}
                                />
                            ) : (
                                <span>{getInitials(editFirstName || userProfile?.firstName || '', editLastName || userProfile?.lastName || '')}</span>
                            )}
                            {/* សម្រាប់ Fallback ពេលរូបភាព Error (លាក់ទុកសិន) */}
                            <span className="d-none">{getInitials(editFirstName || userProfile?.firstName || '', editLastName || userProfile?.lastName || '')}</span>
                        </div>
                        <div className="side-nav__name">
                            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'iShop Admin'}
                        </div>
                        <span
                            className={`db-pill ${isSuperAdmin() ? 'db-status-success' : 'db-status-warning'}`}
                            style={{ marginTop: '4px', display: 'inline-block' }}
                        >
                            <i className="bi bi-shield-lock-fill "></i> {t(getRoleLabelKey(), getRoleLabel())}
                        </span>
                        <small className="side-nav__edit-hint"><i className="bi bi-pencil-square"></i> {t('sidebar.edit')}</small>
                    </button>

                    <hr className="side-nav__divider" />

                    <nav className="side-nav__links">
                        {isAdmin() ? (
                            <Link to="/admin/dashboard" className={`side-nav__link ${isActive('/admin/dashboard') ? 'is-active' : ''}`}>
                                <i className="bi bi-speedometer2"></i> {t('sidebar.dashboard')}
                            </Link>
                        ) : (
                            <Link to="/account" className={`side-nav__link ${isActive('/account') ? 'is-active' : ''}`}>
                                <i className="bi bi-speedometer2"></i> {t('sidebar.myDashboard')}
                            </Link>
                        )}
                        {isAdmin() && (
                        <div className="side-nav__dropdown">
                            <div
                                className="side-nav__link d-flex justify-content-between align-items-center w-100"
                                data-bs-toggle="collapse"
                                data-bs-target="#salesCollapse"
                                role="button"
                                aria-expanded="false"
                                style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                            >
                                <div>
                                    <i className="bi bi-shop me-2"></i> {t('sidebar.salesManagement')}
                                </div>
                                <i className="bi bi-chevron-down" style={{ fontSize: '0.8rem' }}></i>
                            </div>

                            {/* ផ្ទាំង Menu រងដែលនឹងលេចចេញមក (Sub-menu) */}
                            <div className="collapse" id="salesCollapse">
                                {/* ប្រើ ms-4 (Margin Start) ដើម្បីរុញវាចូលក្នុងបន្តិច ឱ្យដឹងថាជា Sub-menu */}
                                <div className="ms-4 border-start ps-2 mb-2">
                                    <Link to="/admin/orders" className={`side-nav__link ${isActive('/admin/orders') ? 'is-active' : ''}`}>
                                        <i className="bi bi-cart-check"></i> {t('sidebar.orders')}
                                    </Link>
                                    {canViewInvoices() && (
                                        <Link to="/admin/invoices" className={`side-nav__link ${isActive('/admin/invoices') ? 'is-active' : ''}`}>
                                            <i className="bi bi-receipt"></i> {t('sidebar.invoices')}
                                        </Link>
                                    )}
                                    {canViewReturns() && (
                                        <Link to="/admin/returns" className={`side-nav__link ${isActive('/admin/returns') ? 'is-active' : ''}`}>
                                            <i className="bi bi-arrow-return-left"></i> {t('sidebar.returns')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        )}

                        {isAdmin() && (
                        <div className="side-nav__dropdown">
                            <div
                                className="side-nav__link d-flex justify-content-between align-items-center w-100"
                                data-bs-toggle="collapse"
                                data-bs-target="#productCollapse"
                                role="button"
                                aria-expanded="false"
                                style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                            >
                                <div>
                                    <i className="bi bi-box me-2"> </i> {t('sidebar.product')}
                                </div>
                                <i className="bi bi-chevron-down" style={{ fontSize: '0.8rem' }}></i>
                            </div>

                            {/* ផ្ទាំង Menu រងដែលនឹងលេចចេញមក (Sub-menu) */}
                            <div className="collapse" id="productCollapse">
                                {/* ប្រើ ms-4 (Margin Start) ដើម្បីរុញវាចូលក្នុងបន្តិច ឱ្យដឹងថាជា Sub-menu */}
                                <div className="ms-4 border-start ps-2 mb-2">
                                    {canViewProducts() && (
                                        <Link to="/admin/products" className={`side-nav__link ${isActive('/admin/products') ? 'is-active' : ''}`}>
                                            <i className="bi bi-box-seam"></i> {t('sidebar.product')}
                                        </Link>
                                    )}
                                    <Link to="/admin/inventory" className={`side-nav__link ${isActive('/admin/inventory') ? 'is-active' : ''}`}>
                                        <i className="bi bi-box-seam"></i> {t('sidebar.inventory')}
                                    </Link>
                                    {canViewCategories() && (
                                        <Link to="/admin/categories" className={`side-nav__link ${isActive('/admin/categories') ? 'is-active' : ''}`}>
                                            <i className="bi bi-tags"></i> {t('sidebar.categories')}
                                        </Link>
                                    )}
                                    <Link to="/admin/orders-tracking" className={`side-nav__link ${isActive('/admin/orders-tracking') ? 'is-active' : ''}`}>
                                        <i className="bi bi-truck"></i> {t('sidebar.orderTracking')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        )}

                        {isAdmin() && (
                        <div className="side-nav__dropdown">
                            <div
                                className="side-nav__link d-flex justify-content-between align-items-center w-100"
                                data-bs-toggle="collapse"
                                data-bs-target="#customerCollapse"
                                role="button"
                                aria-expanded="false"
                                style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                            >
                                <div>
                                    <i className="bi bi-person me-2"></i> {t('sidebar.customer')}
                                </div>
                                <i className="bi bi-chevron-down" style={{ fontSize: '0.8rem' }}></i>
                            </div>

                            {/* ផ្ទាំង Menu រងដែលនឹងលេចចេញមក (Sub-menu) */}
                            <div className="collapse" id="customerCollapse">
                                {/* ប្រើ ms-4 (Margin Start) ដើម្បីរុញវាចូលក្នុងបន្តិច ឱ្យដឹងថាជា Sub-menu */}
                                <div className="ms-4 border-start ps-2 mb-2">
                                    <Link to="/admin/customers" className={`side-nav__link ${isActive('/admin/customers') ? 'is-active' : ''}`}>
                                        <i className="bi bi-people"></i> {t('sidebar.customers')}
                                    </Link>
                                    <Link to="/admin/reviews" className={`side-nav__link ${isActive('/admin/reviews') ? 'is-active' : ''}`}>
                                        <i className="bi bi-star"></i> {t('sidebar.reviews')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        )}

                        {isSuperAdmin() && (
                            <div className="side-nav__dropdown">
                                <div
                                    className="side-nav__link d-flex justify-content-between align-items-center w-100"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#employeeCollapse"
                                    role="button"
                                    aria-expanded="false"
                                    style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                                >
                                    <div>
                                        <i className="bi bi-person-badge me-2"></i> {t('sidebar.employeeManagement')}
                                    </div>
                                    <i className="bi bi-chevron-down" style={{ fontSize: '0.8rem' }}></i>
                                </div>

                                {/* ផ្ទាំង Menu រងដែលនឹងលេចចេញមក (Sub-menu) */}
                                <div className="collapse" id="employeeCollapse">
                                    <div className="ms-4 border-start ps-2 mb-2">
                                        {canViewEmployees() && (
                                        <Link to="/admin/employees" className={`side-nav__link ${isActive('/admin/employees') ? 'is-active' : ''}`}>
                                            <i className="bi bi-person-badge-fill"></i> {t('sidebar.employees')}
                                        </Link>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🌟 គណនីរបស់ខ្ញុំ (My Account) - បង្ហាញសម្រាប់អ្នកប្រើប្រាស់ដែល Login ហើយទាំងអស់ (Admin ក៏ដូចជា User ធម្មតា) */}
                        <div className="side-nav__dropdown">
                            <div
                                className="side-nav__link d-flex justify-content-between align-items-center w-100"
                                data-bs-toggle="collapse"
                                data-bs-target="#myAccountCollapse"
                                role="button"
                                aria-expanded="false"
                                style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                            >
                                <div>
                                    <i className="bi bi-person-circle me-2"></i> {t('sidebar.myAccount')}
                                </div>
                                <i className="bi bi-chevron-down" style={{ fontSize: '0.8rem' }}></i>
                            </div>

                            <div className="collapse" id="myAccountCollapse">
                                <div className="ms-4 border-start ps-2 mb-2">
                                    <Link to="/account" className={`side-nav__link ${isActive('/account') ? 'is-active' : ''}`}>
                                        <i className="bi bi-person-vcard"></i> {t('account.personalInfo')}
                                    </Link>
                                    <Link to="/account/orders" className={`side-nav__link ${isActive('/account/orders') ? 'is-active' : ''}`}>
                                        <i className="bi bi-cart-check"></i> {t('account.myOrders')}
                                    </Link>
                                    <Link to="/account/wishlist" className={`side-nav__link ${isActive('/account/wishlist') ? 'is-active' : ''}`}>
                                        <i className="bi bi-heart"></i> {t('account.wishlist')}
                                    </Link>
                                    <Link to="/account/addresses" className={`side-nav__link ${isActive('/account/addresses') ? 'is-active' : ''}`}>
                                        <i className="bi bi-geo-alt"></i> {t('sidebar.addresses')}
                                    </Link>
                                    <Link to="/account/security" className={`side-nav__link ${isActive('/account/security') ? 'is-active' : ''}`}>
                                        <i className="bi bi-shield-lock"></i> {t('sidebar.security')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="side-nav__footer">
                    <hr className="side-nav__divider" style={{ margin: '0 6px 10px' }} />
                    <button onClick={() => setShowSettingsModal(true)} className="side-nav__link">
                        <i className="bi bi-gear"></i> {t('sidebar.settings')}
                    </button>
                    <button onClick={handleLogout} className="side-nav__link side-nav__logout">
                        <i className="bi bi-box-arrow-right"></i> {t('sidebar.logout')}
                    </button>
                </div>
            </aside>

            {/* 🌟 ផ្ទាំង Modal សម្រាប់កែសម្រួល Profile */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow" style={{ borderRadius: '18px', border: 'none' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold" style={{ color: 'var(--shop-primary, #124F9C)' }}>{t('sidebar.editAccount')}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* លក្ខខណ្ឌថ្មី៖ បង្ហាញរូបទាល់តែ editAvatar ឬ profilePictureUrl ពិតជាមានទិន្នន័យ (មិនមែនទទេរ) */}
                                {(editAvatar || (userProfile?.profilePictureUrl && userProfile.profilePictureUrl !== '')) ? (
                                    <img
                                        src={modalAvatarSrc}
                                        alt="Preview"
                                        className="rounded-circle border"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block', margin: '0 auto 18px' }}
                                        // បន្ថែមមុខងារ onError ដើម្បីប្តូរទៅ Initials វិញបើ Link រូបភាពខូចពី Server
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('d-none');
                                        }}
                                    />
                                ) : (
                                    /* បើអត់មានរូប គឺបង្ហាញ Initials */
                                    <div className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                                         style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 18px', fontWeight: 'bold', color: 'var(--shop-primary, #124F9C)' }}>
                                        {getInitials(editFirstName || userProfile?.firstName || '', editLastName || userProfile?.lastName || '')}
                                    </div>
                                )}

                                {/* សម្រាប់ Fallback ពេលរូបភាព Error (លាក់ទុកសិន) */}
                                <div className="rounded-circle border align-items-center justify-content-center bg-light d-none"
                                     style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 18px', fontWeight: 'bold', color: 'var(--shop-primary, #124F9C)', display: 'flex' }}>
                                    {getInitials(editFirstName || userProfile?.firstName || '', editLastName || userProfile?.lastName || '')}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">{t('sidebar.firstName')}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">{t('sidebar.lastName')}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">{t('sidebar.photo')}</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />

                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>{t('sidebar.cancel')}</button>
                                <button type="button" className="btn px-4 text-white" style={{ backgroundColor: 'var(--shop-primary, #124F9C)' }} onClick={handleSave}>{t('sidebar.save')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 ផ្ទាំង Modal សម្រាប់ការកំណត់ (ភាសា & Night Mode) */}
            {showSettingsModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow" style={{ borderRadius: '18px', border: 'none' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold" style={{ color: 'var(--shop-primary, #124F9C)' }}>
                                    <i className="bi bi-gear"></i> {t('settings.title')}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowSettingsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <label className="form-label text-muted mb-0">{t('settings.language')}</label>
                                    <LanguageToggle />
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <label className="form-label text-muted mb-0">{t('settings.darkMode')}</label>
                                    <ThemeToggle />
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light" onClick={() => setShowSettingsModal(false)}>{t('settings.close')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;

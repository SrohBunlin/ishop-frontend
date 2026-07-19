// src/pages/account/AccountAddressesPage.tsx
// សៀវភៅអាសយដ្ឋាន (Address Book)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CustomerAddress } from '../../types/dashboard.types';
import '../../styles/shop-ui.css';

const AccountAddressesPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // 🟢 សៀវភៅអាសយដ្ឋាន (Address Book) - រក្សាទុកក្នុង localStorage ដាច់ដោយឡែកតាម username
    const addressStorageKey = `iShop_addresses_${localStorage.getItem('username') || 'guest'}`;
    const [addresses, setAddresses] = useState<CustomerAddress[]>(() => {
        try {
            const raw = localStorage.getItem(addressStorageKey);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addrLabel, setAddrLabel] = useState('');
    const [addrRecipient, setAddrRecipient] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrLine, setAddrLine] = useState('');

    useEffect(() => {
        localStorage.setItem(addressStorageKey, JSON.stringify(addresses));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addresses]);

    const resetAddressForm = () => {
        setEditingAddressId(null);
        setAddrLabel('');
        setAddrRecipient('');
        setAddrPhone('');
        setAddrLine('');
        setShowAddressForm(false);
    };

    const handleEditAddress = (addr: CustomerAddress) => {
        setEditingAddressId(addr.id);
        setAddrLabel(addr.label);
        setAddrRecipient(addr.recipientName);
        setAddrPhone(addr.phoneNumber);
        setAddrLine(addr.addressLine);
        setShowAddressForm(true);
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAddressId) {
            setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? { ...a, label: addrLabel, recipientName: addrRecipient, phoneNumber: addrPhone, addressLine: addrLine } : a)));
        } else {
            const newAddr: CustomerAddress = {
                id: `addr_${Date.now()}`,
                label: addrLabel,
                recipientName: addrRecipient,
                phoneNumber: addrPhone,
                addressLine: addrLine,
                isDefault: addresses.length === 0,
            };
            setAddresses((prev) => [...prev, newAddr]);
        }
        resetAddressForm();
    };

    const handleDeleteAddress = (id: string) => {
        if (!window.confirm(t('account.confirmDeleteAddress'))) return;
        setAddresses((prev) => {
            const filtered = prev.filter((a) => a.id !== id);
            // បើលុប Address លំនាំដើមចោល កំណត់លំនាំដើមថ្មីទៅ Address ដំបូងបំផុតដែលនៅសល់
            if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
                filtered[0] = { ...filtered[0], isDefault: true };
            }
            return filtered;
        });
    };

    const handleSetDefaultAddress = (id: string) => {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    };

    return (
        <div className="cart-page">
            <div className="cart-page__inner">
                <button className="cart-back-btn" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('account.backToShop')}
                </button>

                <h2 className="cart-title">
                    <span className="cart-title__icon"><i className="bi bi-geo-alt"></i></span>
                    {t('sidebar.addresses')}
                </h2>

                <div className="account-section">
                    <h3 className="account-section__title">
                        <i className="bi bi-geo-alt"></i> {t('account.addressBook')}
                        <span className="db-panel__count">{addresses.length}</span>
                    </h3>

                    {addresses.length === 0 && (
                        <div className="shop-empty-state" style={{ backgroundColor: 'var(--shop-bg)', borderRadius: '14px' }}>
                            <i className="bi bi-geo-alt"></i>
                            <p className="mb-0">{t('account.noAddress')}</p>
                        </div>
                    )}

                    {addresses.length > 0 && (
                        <div className="account-order-list" style={{ marginBottom: '12px' }}>
                            {addresses.map((addr) => (
                                <div key={addr.id} className="account-order-item" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
                                    <div>
                                        <p className="account-order-item__id">
                                            {addr.label} {addr.isDefault && <span className="db-pill db-status-success" style={{ marginLeft: '6px' }}>{t('account.defaultAddress')}</span>}
                                        </p>
                                        <p className="account-order-item__date">{addr.recipientName} · {addr.phoneNumber}</p>
                                        <p className="account-order-item__date">{addr.addressLine}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                                        {!addr.isDefault && (
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleSetDefaultAddress(addr.id)}>
                                                {t('account.setAsDefault')}
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditAddress(addr)}>
                                            <i className="bi bi-pencil-square"></i> {t('account.edit')}
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAddress(addr.id)}>
                                            <i className="bi bi-trash"></i> {t('account.delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showAddressForm ? (
                        <button className="auth-submit-btn" style={{ maxWidth: '240px' }} onClick={() => setShowAddressForm(true)}>
                            <i className="bi bi-plus-circle"></i> {t('account.addAddress')}
                        </button>
                    ) : (
                        <form onSubmit={handleSaveAddress}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="auth-field" style={{ flex: 1 }}>
                                    <label>{t('account.addressLabel')}</label>
                                    <div className="auth-input-wrap">
                                        <i className="bi bi-tag"></i>
                                        <input type="text" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="auth-field" style={{ flex: 1 }}>
                                    <label>{t('account.recipientName')}</label>
                                    <div className="auth-input-wrap">
                                        <i className="bi bi-person"></i>
                                        <input type="text" value={addrRecipient} onChange={(e) => setAddrRecipient(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>{t('account.phone')}</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-telephone"></i>
                                    <input type="text" value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} required />
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>{t('account.addressLine')}</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-geo-alt"></i>
                                    <input type="text" value={addrLine} onChange={(e) => setAddrLine(e.target.value)} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="auth-submit-btn">
                                    <i className="bi bi-check2-circle"></i> {t('account.saveChanges')}
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={resetAddressForm}>
                                    {t('account.cancel')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountAddressesPage;

// src/pages/account/AccountOverviewPage.tsx
// ព័ត៌មានផ្ទាល់ខ្លួន (Personal Information) - ទំព័រដើមរបស់ផ្នែក "គណនីរបស់ខ្ញុំ"
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getRoleLabel, getRoleLabelKey } from '../../utils/auth';
import { resolveAvatarUrl } from '../../utils/avatar';
import '../../styles/shop-ui.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return 'U';
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return `${f}${l}`.toUpperCase();
};

interface UserProfile {
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
    phoneNumber?: string;
    email?: string;
}

interface AccountOverviewPageProps {
    userProfile?: UserProfile | null;
    setUser?: (user: any) => void;
}

const AccountOverviewPage: React.FC<AccountOverviewPageProps> = ({ userProfile, setUser }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // 🟢 បើមិនទទួល props មកតាមផ្លូវធម្មតា (ឧ. បើកទំព័រនេះផ្ទាល់តាម URL) ទាញយកពី localStorage ជំនួស
    const storedProfile: UserProfile | null = (() => {
        try {
            const raw = localStorage.getItem('user_profile');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();
    const profile = userProfile || storedProfile;

    const [firstName, setFirstName] = useState(profile?.firstName || '');
    const [lastName, setLastName] = useState(profile?.lastName || '');
    const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
    const [email, setEmail] = useState(profile?.email || '');
    const [avatarPreview, setAvatarPreview] = useState(profile?.profilePictureUrl || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const username = localStorage.getItem('username') || '';
    const fullName = `${firstName} ${lastName}`.trim();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        setIsSavingProfile(true);
        try {
            const formData = new FormData();
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('phone_number', phoneNumber);
            formData.append('email', email);
            if (selectedFile) formData.append('avatar', selectedFile);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                const updatedUser = {
                    firstName,
                    lastName,
                    phoneNumber,
                    email,
                    profilePictureUrl: selectedFile ? avatarPreview : (profile?.profilePictureUrl || ''),
                };
                if (setUser) setUser(updatedUser);
                localStorage.setItem('user_profile', JSON.stringify(updatedUser));
                setProfileMessage({ type: 'success', text: t('account.saveSuccess') });
            } else {
                setProfileMessage({ type: 'error', text: t('account.saveFail') });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setProfileMessage({ type: 'error', text: t('account.saveFail') });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const avatarSrc = resolveAvatarUrl(avatarPreview);

    return (
        <div className="cart-page">
            <div className="cart-page__inner">
                <button className="cart-back-btn" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('account.backToShop')}
                </button>

                <h2 className="cart-title">
                    <span className="cart-title__icon"><i className="bi bi-person-circle"></i></span>
                    {t('account.title')}
                </h2>

                <div className="account-header">
                    <div className="account-avatar-wrap">
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('d-none');
                                }}
                            />
                        ) : null}
                        <span className={avatarSrc ? 'd-none' : ''}>{getInitials(firstName, lastName)}</span>
                    </div>
                    <div>
                        <p className="account-header__name">{fullName || t('account.unnamed')}</p>
                        {username && <p className="account-header__username">@{username}</p>}
                        <span className="db-pill db-status-success" style={{ marginTop: '4px', display: 'inline-block' }}>
                            <i className="bi bi-shield-check"></i> {t(getRoleLabelKey(), getRoleLabel())}
                        </span>
                    </div>
                </div>

                {/* ព័ត៌មានផ្ទាល់ខ្លួន */}
                <div className="account-section">
                    <h3 className="account-section__title">
                        <i className="bi bi-person-vcard"></i> {t('account.personalInfo')}
                    </h3>

                    {profileMessage && (
                        <div className={profileMessage.type === 'success' ? 'account-banner account-banner--success' : 'auth-error'}>
                            <i className={`bi ${profileMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                            <span>{profileMessage.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile}>
                        <div className="account-field">
                            <label>{t('account.photo')}</label>
                            <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div className="auth-field" style={{ flex: 1 }}>
                                <label htmlFor="acc-firstName">{t('account.firstName')}</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-person"></i>
                                    <input
                                        id="acc-firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="auth-field" style={{ flex: 1 }}>
                                <label htmlFor="acc-lastName">{t('account.lastName')}</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-person"></i>
                                    <input
                                        id="acc-lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="acc-phone">{t('account.phone')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-telephone"></i>
                                <input
                                    id="acc-phone"
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="acc-email">{t('account.email')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-envelope"></i>
                                <input
                                    id="acc-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isSavingProfile}>
                            {isSavingProfile ? (
                                <>
                                    <span className="auth-spinner"></span> {t('account.saving')}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle"></i> {t('account.saveChanges')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountOverviewPage;

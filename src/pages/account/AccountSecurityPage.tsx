// src/pages/account/AccountSecurityPage.tsx
// ប្តូរពាក្យសម្ងាត់ (Change Password)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/shop-ui.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AccountSecurityPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: t('account.passwordTooShort') });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: t('account.passwordMismatch') });
            return;
        }

        setIsSavingPassword(true);
        try {
            const token = localStorage.getItem('token');
            // 🟢 ត្រូវប្រាកដថា endpoint នេះត្រូវគ្នានឹង Backend ជាក់ស្តែងរបស់អ្នក (Auth Service)
            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                setPasswordMessage({ type: 'success', text: t('account.passwordSaveSuccess') });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: t('account.passwordSaveFail') });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordMessage({ type: 'error', text: t('account.passwordSaveFail') });
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-page__inner">
                <button className="cart-back-btn" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left"></i> {t('account.backToShop')}
                </button>

                <h2 className="cart-title">
                    <span className="cart-title__icon"><i className="bi bi-shield-lock"></i></span>
                    {t('sidebar.security')}
                </h2>

                <div className="account-section">
                    <h3 className="account-section__title">
                        <i className="bi bi-shield-lock"></i> {t('account.changePassword')}
                    </h3>

                    {passwordMessage && (
                        <div className={passwordMessage.type === 'success' ? 'account-banner account-banner--success' : 'auth-error'}>
                            <i className={`bi ${passwordMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                            <span>{passwordMessage.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                        <div className="auth-field">
                            <label htmlFor="acc-current-password">{t('account.currentPassword')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-lock"></i>
                                <input
                                    id="acc-current-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label htmlFor="acc-new-password">{t('account.newPassword')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-lock-fill"></i>
                                <input
                                    id="acc-new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label htmlFor="acc-confirm-password">{t('account.confirmNewPassword')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-lock-fill"></i>
                                <input
                                    id="acc-confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isSavingPassword}>
                            {isSavingPassword ? (
                                <>
                                    <span className="auth-spinner"></span> {t('account.saving')}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-key"></i> {t('account.updatePassword')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountSecurityPage;

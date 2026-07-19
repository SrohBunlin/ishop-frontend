import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLanguage } from '../context/LanguageContext';
import { isAdmin, extractRoleFromLoginResponse } from '../utils/auth';
import '../styles/shop-ui.css';
const API_BASE_URL=process.env.REACT_APP_API_URL;
// ➕ បន្ថែម fields ថ្មី បើសិនជាអនាគត Backend របស់អ្នកមានបោះឈ្មោះពេញ និងរូបមក
interface LoginResponse {
    token: string;
    roles?: string[];          // អាចមិនមាន អាស្រ័យលើ Backend
    role?: string;             // ទ្រង់ទ្រាយផ្សេង ដែល Backend អាចប្រើ
    authorities?: Array<string | { authority: string }>; // ទ្រង់ទ្រាយ Spring Security default
    username?: string;     // អាចមាន ឬអត់
    profileImage?: string; // អាចមាន ឬអត់
}

interface LoginPageProps {
    onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const { t } = useLanguage();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            // 🟢 បន្ថែម Parameter ទី៣ { withCredentials: true } ចូលទៅក្នុង axios.post
            const response = await axios.post<LoginResponse>(
                `${API_BASE_URL}/api/auth/login`,
                credentials,
                {
                    withCredentials: true // ចំណុចនេះសំខាន់សម្រាប់ដោះស្រាយ CORS ពេល Gateway បើក allowCredentials
                }
            );

            localStorage.setItem('token', response.data.token);

            // 🟢 ស្វែងរក role ដោយស៊ើបតាមរាងទិន្នន័យផ្សេងៗគ្នា (roles[] / role / authorities[] / JWT payload)
            // ដើម្បីធានាថាដំណើរការត្រឹមត្រូវ ទោះបី Backend ផ្ញើ role មកតាមទ្រង់ទ្រាយណាក៏ដោយ
            const resolvedRole = extractRoleFromLoginResponse(response.data, response.data.token);
            console.log('🔍 LOGIN RESPONSE:', response.data, '→ Role ដែលកំណត់បាន:', resolvedRole);

            if (resolvedRole) {
                localStorage.setItem('role', resolvedRole);
            } else {
                // រកមិនឃើញ role ណាមួយឡើយ → សម្អាត role ចាស់ចោល (កុំទុកឲ្យ session មុនសេសសល់)
                localStorage.removeItem('role');
            }
            const loggedInName = response.data.username || credentials.username;
            localStorage.setItem('username', loggedInName);
            if (response.data.profileImage) {
                localStorage.setItem('profileImage', response.data.profileImage);
            } else {
                localStorage.removeItem('profileImage');
            }

            Swal.fire({
                title: t('login.successTitle'),
                text: t('login.successText'),
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
                navigate(isAdmin() ? '/admin/dashboard' : '/account', { replace: true });
            });

        } catch (err) {
            setError(t('login.errorMessage'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo"><i className="bi bi-shop"></i></div>
                <h2 className="auth-title">iShop Admin</h2>
                <p className="auth-subtitle">{t('login.subtitle')}</p>

                {error && (
                    <div className="auth-error">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="auth-field">
                        <label htmlFor="username">{t('login.username')}</label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-person"></i>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder={t('login.usernamePlaceholder')}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">{t('login.password')}</label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-lock"></i>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder={t('login.passwordPlaceholder')}
                                onChange={handleChange}
                                autoComplete="current-password"
                                style={{ paddingRight: '40px' }}
                                required
                            />
                            <button
                                type="button"
                                className="auth-toggle-pass"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                                tabIndex={-1}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="auth-spinner"></span> {t('login.loggingIn')}
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i> {t('login.signIn')}
                            </>
                        )}
                    </button>
                </form>
                <button onClick={() => navigate('/')} className="auth-back-btn">
                    <i className="bi bi-arrow-left"></i> {t('login.backHome')}
                </button>

                <p className="text-center mt-3 mb-0" style={{ fontSize: '0.85rem' }}>
                    {t('register.noAccount')}{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="btn btn-link p-0"
                        style={{ fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}
                    >
                        {t('register.signUpLink')}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

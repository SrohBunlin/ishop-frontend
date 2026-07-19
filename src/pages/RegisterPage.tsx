import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLanguage } from '../context/LanguageContext';
import '../styles/shop-ui.css';
const API_BASE_URL = process.env.REACT_APP_API_URL;

interface RegisterPageProps {
    onRegisterSuccess?: () => void;
}

interface RegisterFormState {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
    const { t } = useLanguage();
    const [form, setForm] = useState<RegisterFormState>({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError(t('register.passwordMismatch'));
            return;
        }

        setIsSubmitting(true);
        try {
            // 🟢 ត្រូវប្រាកដថា endpoint នេះត្រូវគ្នានឹង Backend ជាក់ស្តែងរបស់អ្នក (Auth Service)
            await axios.post(
                `${API_BASE_URL}/api/auth/register`,
                {
                    first_name: form.firstName,
                    last_name: form.lastName,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                },
                { withCredentials: true }
            );

            Swal.fire({
                title: t('register.successTitle'),
                text: t('register.successText'),
                icon: 'success',
                timer: 1800,
                showConfirmButton: false,
            }).then(() => {
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
                navigate('/login', { replace: true });
            });
        } catch (err) {
            setError(t('register.errorMessage'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo"><i className="bi bi-person-plus-fill"></i></div>
                <h2 className="auth-title">iShop Admin</h2>
                <p className="auth-subtitle">{t('register.subtitle')}</p>

                {error && (
                    <div className="auth-error">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="auth-field" style={{ flex: 1 }}>
                            <label htmlFor="firstName">{t('register.firstName')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-person"></i>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    placeholder={t('register.firstNamePlaceholder')}
                                    value={form.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    required
                                />
                            </div>
                        </div>
                        <div className="auth-field" style={{ flex: 1 }}>
                            <label htmlFor="lastName">{t('register.lastName')}</label>
                            <div className="auth-input-wrap">
                                <i className="bi bi-person"></i>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    placeholder={t('register.lastNamePlaceholder')}
                                    value={form.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="username">{t('register.username')}</label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-person-badge"></i>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder={t('register.usernamePlaceholder')}
                                value={form.username}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">{t('register.email')}</label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-envelope"></i>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder={t('register.emailPlaceholder')}
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">{t('register.password')}</label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-lock"></i>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder={t('register.passwordPlaceholder')}
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={{ paddingRight: '40px' }}
                                required
                                minLength={6}
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

                    <div className="auth-field">
                        <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-lock-fill"></i>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder={t('register.confirmPasswordPlaceholder')}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={{ paddingRight: '40px' }}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="auth-toggle-pass"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? t('login.hidePassword') : t('login.showPassword')}
                                tabIndex={-1}
                            >
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="auth-spinner"></span> {t('register.submitting')}
                            </>
                        ) : (
                            <>
                                <i className="bi bi-person-plus"></i> {t('register.signUp')}
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-3 mb-0" style={{ fontSize: '0.85rem' }}>
                    {t('register.alreadyHaveAccount')}{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="btn btn-link p-0"
                        style={{ fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}
                    >
                        {t('register.signInLink')}
                    </button>
                </p>

                <button onClick={() => navigate('/')} className="auth-back-btn">
                    <i className="bi bi-arrow-left"></i> {t('login.backHome')}
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;

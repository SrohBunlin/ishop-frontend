import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// ➕ បន្ថែម fields ថ្មី បើសិនជាអនាគត Backend របស់អ្នកមានបោះឈ្មោះពេញ និងរូបមក
interface LoginResponse {
    token: string;
    roles: string[];
    username?: string;     // អាចមាន ឬអត់
    profileImage?: string; // អាចមាន ឬអត់
}

interface LoginPageProps {
    onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            const response = await axios.post<LoginResponse>('https://api.i-knet.com/api/auth/login', credentials);

            // ១. រក្សាទុក Token និង Role
            localStorage.setItem('token', response.data.token);
            if (response.data.roles && response.data.roles.length > 0) {
                localStorage.setItem('role', response.data.roles[0]);
            }

            // ➕ ២. រក្សាទុកឈ្មោះចូល LocalStorage (យកពី API បើអត់មាន យកអាវាយបញ្ចូល)
            const loggedInName = response.data.username || credentials.username;
            localStorage.setItem('username', loggedInName);

            // ➕ ៣. រក្សាទុករូបភាព Profile (បើ Backend មានបោះមកឱ្យ)
            if (response.data.profileImage) {
                localStorage.setItem('profileImage', response.data.profileImage);
            } else {
                // បើអត់ទាន់មានរូបទេ អាចលុបរបស់ចាស់ចោល ការពារកុំឱ្យច្រឡំរូប User មុន
                localStorage.removeItem('profileImage');
            }

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            Swal.fire({
                title: 'ជោគជ័យ!',
                text: 'អ្នកបានចូលប្រើប្រាស់ក្នុងប្រព័ន្ធហើយ',
                icon: 'success',
                confirmButtonText: 'ទៅកាន់ Profile'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/admin/profile');
                }
            });
        } catch (err) {
            setError("រវល់តែនឹកគេម្នាក់ឯងបានជាភ្លេច Password!😂");
        }
    };

    return (
        <div style={loginPageStyle}>
            <div style={loginCardStyle}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>📦 iShop Admin</h2>
                <p style={{ textAlign: 'center', color: '#666' }}>សូមបញ្ចូលគណនីដើម្បីគ្រប់គ្រងប្រព័ន្ធ</p>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleLogin}>
                    <div style={inputGroup}>
                        <label>ឈ្មោះអ្នកប្រើប្រាស់</label>
                        <input type="text" name="username" onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div style={inputGroup}>
                        <label>លេខសម្ងាត់</label>
                        <input type="password" name="password" onChange={handleChange} style={inputStyle} required />
                    </div>
                    <button type="submit" style={loginBtnStyle}>ចូលប្រើប្រាស់</button>
                </form>
                <button onClick={() => navigate('/')} style={backBtnStyle}>ត្រឡប់ទៅទំព័រមុខ</button>
            </div>
        </div>
    );
};

// --- Styles ---
const loginPageStyle: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const loginCardStyle: React.CSSProperties = { width: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' };
const inputGroup: React.CSSProperties = { marginBottom: '20px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const loginBtnStyle: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const backBtnStyle: React.CSSProperties = { width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', color: '#666', border: 'none', cursor: 'pointer' };

export default LoginPage;
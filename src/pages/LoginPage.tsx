import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// ១. បង្កើត Interface សម្រាប់កំណត់ប្រភេទ Type នៃទិន្នន័យដែលបានមកពី API
interface LoginResponse {
    token: string;
    roles: string[];
}

const LoginPage: React.FC = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    // ២. កំណត់ប្រភេទ Change Event ឱ្យត្រូវតាមស្តង់ដារ HTML Input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    // ៣. កំណត់ប្រភេទ Form Submit Event និងការត្រឡប់មកវិញជា Promise<void>
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            // ភ្ជាប់ Interface <LoginResponse> ជាមួយ axios.post ដើម្បីឱ្យស្គាល់ response.data ច្បាស់លាស់
            const response = await axios.post<LoginResponse>('https://api.i-knet.com/api/auth/login', credentials);

            // រក្សាទុក Token និង Role ទៅក្នុង LocalStorage
            localStorage.setItem('token', response.data.token);

            if (response.data.roles && response.data.roles.length > 0) {
                localStorage.setItem('role', response.data.roles[0]);
            }

            Swal.fire({
                title: 'ជោគជ័យ!',
                text: 'អ្នកបានចូលប្រើប្រាស់ក្នុងប្រព័ន្ធហើយ',
                icon: 'success',
                confirmButtonText: 'ទៅកាន់ Dashboard'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/admin/dashboard');
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

// --- Styles (ប្រើប្រាស់ React.CSSProperties ដើម្បីផ្ដល់ភាពម៉ឺងម៉ាត់ និងទប់ស្កាត់ Typo) ---
const loginPageStyle: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const loginCardStyle: React.CSSProperties = { width: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' };
const inputGroup: React.CSSProperties = { marginBottom: '20px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const loginBtnStyle: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const backBtnStyle: React.CSSProperties = { width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', color: '#666', border: 'none', cursor: 'pointer' };

export default LoginPage;
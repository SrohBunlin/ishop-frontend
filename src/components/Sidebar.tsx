import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    handleLogout: () => void;
    // ទទួលទិន្នន័យ Profile ពី App.tsx
    userProfile?: { name: string; avatar: string };
    setUser?: React.Dispatch<React.SetStateAction<{ name: string; avatar: string }>>;
}

const Sidebar: React.FC<SidebarProps> = ({ handleLogout, userProfile, setUser }) => {
    const location = useLocation();
    const isActive = (path: string): boolean => location.pathname === path;

    // State សម្រាប់គ្រប់គ្រង Modal
    const [showModal, setShowModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // មុខងារបើក Modal
    const handleOpenModal = () => {
        setEditName(userProfile?.name || '');
        setEditAvatar(userProfile?.avatar || '');
        setShowModal(true);
    };

    // មុខងាររក្សាទុកទិន្នន័យថ្មី
    const handleSave = async () => {
        try {
            // ១. រៀបចំទិន្នន័យជាទម្រង់ FormData (ដើម្បីអាចបញ្ជូន File បាន)
            const formData = new FormData();
            formData.append('name', editName);

            // បើមានរើសរូបថតថ្មី ទើបបញ្ជូនទៅ
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            // ២. បញ្ជូនទិន្នន័យទៅកាន់ API (ឧទាហរណ៍: /api/users/profile)
            const token = localStorage.getItem('token');
            const response = await fetch('https://api.i-knet.com/api/profile', {
                method: 'PUT', // ឬ POST អាស្រ័យលើ Backend របស់ប្អូន
                headers: {
                    'Authorization': `Bearer ${token}`
                    // ⚠️ កុំដាក់ 'Content-Type': 'application/json' ព្រោះយើងប្រើ FormData
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();

                // ៣. បើជោគជ័យ Update State ក្នុង React ដើម្បីឱ្យវាប្តូរភ្លាមៗ
                if (setUser) {
                    // data.avatarUrl គឺជា Link រូបថតថ្មីដែល Backend ឆ្លើយតបមកវិញ
                    setUser({ name: data.name, avatar: data.avatarUrl });
                }

                setShowModal(false);
                alert("រក្សាទុកជោគជ័យ!");
            } else {
                alert("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ");
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
    return (
        <>
            <aside
                className="d-none d-md-block shadow-sm"
                style={{
                    width: '260px',
                    backgroundColor: '#124F9C',
                    height: '100%',
                    position: 'relative',
                    overflowY: 'auto',
                    flexShrink: 0
                }}
            >
                <div className="flex-grow-1 pt-3">

                    {/* 🌟 ប៊ូតុង Profile ដែលអាចចុចបាន */}
                    <button
                        onClick={handleOpenModal}
                        className="btn btn-link text-decoration-none text-center px-3 mb-4 w-100"
                    >
                        <img
                            src={userProfile?.avatar || 'https://via.placeholder.com/80'}
                            alt="Profile"
                            className="rounded-circle mb-2 shadow-sm"
                            style={{ width: '70px', height: '70px', objectFit: 'cover', border: '2px solid white' }}
                        />
                        <div className="text-white fw-bold">{userProfile?.name || 'iShop Admin'}</div>
                        <small className="text-white-50"><i className="bi bi-pencil-square"></i> កែសម្រួល</small>
                    </button>

                    <hr className="mx-3 text-white opacity-50" />

                    <Link to="/admin/dashboard" className={`sidebar-link d-flex align-items-center p-3 text-white text-decoration-none ${isActive('/admin/dashboard') ? 'bg-white bg-opacity-25' : ''}`}>
                        <i className="bi bi-speedometer2 me-3"></i> Dashboard
                    </Link>
                    <Link to="/products" className={`sidebar-link d-flex align-items-center p-3 text-white text-decoration-none ${isActive('/products') ? 'bg-white bg-opacity-25' : ''}`}>
                        <i className="bi bi-box-seam me-3"></i> Inventory
                    </Link>
                    <Link to="/orders-tracking" className={`sidebar-link d-flex align-items-center p-3 text-white text-decoration-none ${isActive('/admin/orders-tracking') ? 'bg-white bg-opacity-25' : ''}`}>
                        <i className="bi bi-truck me-3"> </i> Order Tracking
                    </Link>

                    <hr className="mx-3 text-white opacity-50" />

                    <button onClick={handleLogout} className="sidebar-link d-flex align-items-center p-3 bg-transparent border-0 w-100 text-warning text-start">
                        <i className="bi bi-box-arrow-right me-3"></i> Logout
                    </button>
                </div>
            </aside>

            {/* 🌟 ផ្ទាំង Modal សម្រាប់កែសម្រួល Profile */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">កែសម្រួលគណនី</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label text-muted">ឈ្មោះបង្ហាញ</label>
                                    {/* 🌟 កន្លែងនេះហើយដែល editAvatar ត្រូវប្រើប្រាស់ (ដើម្បីបង្ហាញរូបដែលទើប Upload) */}
                                    <img
                                        src={editAvatar || userProfile?.avatar || 'https://via.placeholder.com/60'}
                                        alt="Preview"
                                        className="rounded-circle border"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />

                                    {/* 🌟 ត្រូវប្រាកដថាអត់មាន value={editAvatar} នៅលើ input file ទេ */}
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">រូបថត (Image)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageUpload} // 🌟 នេះហើយជាកន្លែងដែលប្អូនត្រូវភ្ជាប់វា!
                                    />
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>បោះបង់</button>
                                <button type="button" className="btn btn-primary px-4" onClick={handleSave}>រក្សាទុក</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
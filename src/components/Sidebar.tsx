import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const isActive = (path: string): boolean => location.pathname === path;

    // State សម្រាប់គ្រប់គ្រង Modal
    const [showModal, setShowModal] = useState(false);
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

            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            const token = localStorage.getItem('token');
            const response = await fetch('https://api.i-knet.com/api/users', {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`},
                body: formData
            });

            const responseText = await response.text();

            if (!response.ok) {
                console.error("Error Response:", responseText);
                throw new Error(`Server Error: ${response.status}`);
            }

            // 🌟 ដំណោះស្រាយ៖ ដោយសារ Server បញ្ជូនមកជា Text (មិនមែន JSON)
            // យើងឈប់ប្រើ JSON.parse ទៀតហើយ។ យើង Update State ដោយប្រើទិន្នន័យលើសំបកក្រៅ (Local) តែម្ដង។

            const updatedUser = {
                firstName: editFirstName, // យកពី input ផ្ទាល់
                lastName: editLastName,   // យកពី input ផ្ទាល់
                // ប្រើរូប Preview សិន បើអត់មានរូបថ្មី ប្រើរូបចាស់
                profilePictureUrl: selectedFile ? editAvatar : (userProfile?.profilePictureUrl || '')
            };

            setUser(updatedUser);
            localStorage.setItem('user_profile', JSON.stringify(updatedUser));

            // បង្ហាញសារដែល Server ផ្ញើមក ("ទិន្នន័យ User ទទួលបានជោគជ័យ!")
            alert(responseText);
            setShowModal(false);

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("មិនអាចរក្សាទុកបានទេ! សូមពិនិត្យមើល Console។");
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
                        {(editAvatar || userProfile?.profilePictureUrl) ? (
                            <img
                                src={
                                    editAvatar.startsWith('data:')
                                        ? editAvatar
                                        : `https://api.i-knet.com${editAvatar || userProfile?.profilePictureUrl}`
                                }
                                alt="Preview"
                                className="rounded-circle border"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                        ) : (
                            /* បើអត់មានរូប គឺបង្ហាញ Initials */
                            <div className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                                 style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto', fontWeight: 'bold', color: '#124F9C' }}>
                                {getInitials(editFirstName, editLastName)}
                            </div>
                        )}
                        <div className="text-white fw-bold">
                            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'iShop Admin'}
                        </div>
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
                                {(editAvatar || userProfile?.profilePictureUrl) ? (
                                    <img
                                        src={
                                            editAvatar.startsWith('data:')
                                                ? editAvatar
                                                : `https://api.i-knet.com${editAvatar || userProfile?.profilePictureUrl}`
                                        }
                                        alt="Preview"
                                        className="rounded-circle border"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    /* បើអត់មានរូប គឺបង្ហាញ Initials */
                                    <div className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                                         style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto', fontWeight: 'bold', color: '#124F9C' }}>
                                        {getInitials(editFirstName, editLastName)}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label text-muted">នាមត្រកូល</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">នាមខ្លួន</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">រូបថត (Image)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageUpload}
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
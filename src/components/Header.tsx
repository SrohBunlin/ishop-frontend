import React, { useEffect, useState } from 'react';

const Header = () => {
    const [username, setUsername] = useState<string>('');
    const [profileImg, setProfileImg] = useState<string | null>(null);

    useEffect(() => {
        // ទាញទិន្នន័យពី LocalStorage ពេល Component បង្ហាញខ្លួន
        const storedName = localStorage.getItem('username');
        const storedImg = localStorage.getItem('profileImage');

        if (storedName) setUsername(storedName);
        if (storedImg) setProfileImg(storedImg);
    }, []);

    // Function កាត់យកអក្សរដំបូង (ឧទាហរណ៍ "Admin" យកអក្សរ "A")
    const getInitial = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <div className="header-profile-section">
            {profileImg ? (
                // បើមានរូបភាព បង្ហាញរូប
                <img src={profileImg} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            ) : (
                // បើអត់មានរូបទេ បង្ហាញរង្វង់អក្សរដំបូងនៃឈ្មោះ
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getInitial(username)}
                </div>
            )}

            <span style={{ marginLeft: '10px' }}>{username}</span>
        </div>
    );
};

export default Header;
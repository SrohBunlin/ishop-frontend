// src/utils/avatar.ts
// មុខងារជំនួយសម្រាប់បង្កើតតំណរូបភាព Profile (Avatar) ត្រឹមត្រូវ
// ប្រើរួមគ្នារវាង Sidebar, Navbar, និង Account Page ដើម្បីកុំឱ្យតំណរូបភាពខុសគ្នា

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * បំប្លែង URL រូបភាព Profile ដែលទទួលពី Server ឱ្យក្លាយជាតំណពេញលេញ។
 * - បើជា Base64 preview (data:) ឬ URL ពេញលេញរួចហើយ (http/https) បញ្ជូនត្រឡប់ដូចដើម
 * - បើជា Path សាមញ្ញ (ឧ. /uploads/avatar.png) បន្ថែម API_BASE_URL ខាងមុខ
 */
export const resolveAvatarUrl = (url?: string | null): string => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${API_BASE_URL}${url}`;
};

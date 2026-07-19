// src/utils/auth.ts
// ប្រព័ន្ធគ្រប់គ្រងសិទ្ធិអ្នកគ្រប់គ្រង (Admin Roles & Permissions)
//
// កម្រិតសិទ្ធិដែលគាំទ្រ៖
// - ROLE_SUPER_ADMIN : សិទ្ធិពេញលេញ (មើល + កែសម្រួល + លុប ទាំងទំនិញ/ការកម្ម៉ង់/អតិថិជន + គ្រប់គ្រងអ្នកប្រើប្រាស់)
// - ROLE_ADMIN       : ដូច Super Admin (រក្សាទុកសម្រាប់ភាពត្រូវគ្នាជាមួយទិន្នន័យចាស់)
// - ROLE_MANAGER     : មើលបានតែប៉ុណ្ណោះ (ការកម្ម៉ង់/ទំនិញ/អតិថិជន) មិនអាចលុប ឬកែសម្រួលបានទេ
// - ROLE_STAFF       : មើលបានតែ ការកម្ម៉ង់/វិក្កយបត្រ/ស្តុក/តាមដានការដឹកជញ្ជូន/អតិថិជន/ការវាយតម្លៃ
//                      អាចកែប្រែស្ថានភាពការកម្ម៉ង់បាន ប៉ុន្តែលុបមិនបាន និងមិនអាចចូលមើលទំនិញ/ប្រភេទ/ត្រឡប់ទំនិញ/បុគ្គលិកបានទេ
// - ROLE_USER        : អតិថិជនធម្មតា (មិនមែនអ្នកគ្រប់គ្រង)

export type AppRole = 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_STAFF' | 'ROLE_USER' | string;

export const ROLE_LABELS: Record<string, string> = {
    ROLE_SUPER_ADMIN: 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់',
    ROLE_ADMIN: 'អ្នកគ្រប់គ្រង',
    ROLE_MANAGER: 'អ្នកគ្រប់គ្រងកម្រិតមធ្យម',
    ROLE_STAFF: 'បុគ្គលិក',
    ROLE_USER: 'អតិថិជន',
};

/** កូនសោបកប្រែសម្រាប់ role នីមួយៗ (ប្រើជាមួយ t() ដើម្បីបង្ហាញតាមភាសាដែលបានជ្រើសរើស) */
export const ROLE_LABEL_KEYS: Record<string, string> = {
    ROLE_SUPER_ADMIN: 'role.superAdmin',
    ROLE_ADMIN: 'role.admin',
    ROLE_MANAGER: 'role.manager',
    ROLE_STAFF: 'role.staff',
    ROLE_USER: 'role.user',
};

/** ទាញយក Role ដែលបានរក្សាទុកនៅពេល Login (localStorage key: 'role') */
export const getRole = (): string | null => localStorage.getItem('role');

/** កូនសោបកប្រែសម្រាប់ role បច្ចុប្បន្ន (ប្រើជាមួយ t() ក្នុង Component ដែលអាចប្តូរភាសាបាន) */
export const getRoleLabelKey = (): string => {
    const role = getRole();
    if (!role) return ROLE_LABEL_KEYS.ROLE_USER;
    return ROLE_LABEL_KEYS[role] || ROLE_LABEL_KEYS.ROLE_USER;
};

/** ឈ្មោះសិទ្ធិសម្រាប់បង្ហាញលើ UI (ex. Sidebar, Profile) - Khmer fallback ប្រើពេល key រកមិនឃើញ */
export const getRoleLabel = (): string => {
    const role = getRole();
    if (!role) return ROLE_LABELS.ROLE_USER;
    return ROLE_LABELS[role] || role;
};

/** សិទ្ធិពេញលេញ - អាចលុប/កែសម្រួលទំនិញ, ការកម្ម៉ង់, អតិថិជន, និងគ្រប់គ្រង Role របស់អ្នកគ្រប់គ្រងផ្សេងទៀត */
export const isSuperAdmin = (): boolean => {
    const role = getRole();
    return role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN';
};

/** សិទ្ធិកម្រិតមធ្យម - មើលបានប៉ុណ្ណោះ (Read-only) */
export const isManager = (): boolean => getRole() === 'ROLE_MANAGER';

/** បុគ្គលិកទូទៅ (Staff) - មើលបានតែ ការកម្ម៉ង់/វិក្កយបត្រ/ស្តុក/តាមដានការដឹកជញ្ជូន/អតិថិជន/ការវាយតម្លៃ
 * អាចកែប្រែស្ថានភាពការកម្ម៉ង់បាន (ប៉ុន្តែលុបមិនបាន) និងគ្មានសិទ្ធិចូលមើលទំនិញ/ប្រភេទ/ត្រឡប់ទំនិញ/បុគ្គលិកទេ
 */
export const isStaff = (): boolean => getRole() === 'ROLE_STAFF';

// ------------------------------------------------------------------
// ស្វែងរក Role ពី Login Response ដោយស៊ើបតាមរាងទិន្នន័យផ្សេងៗគ្នា
// (Backend អាចផ្ញើ role មកតាមរាងណាមួយ៖ roles[], role, authorities[], ឬកប់ក្នុង JWT payload)
// ------------------------------------------------------------------

/** បំបែក JWT payload (មិនផ្ទៀងផ្ទាត់ signature ទេ គ្រាន់តែអានទិន្នន័យសម្រាប់កំណត់ role) */
const decodeJwtPayload = (token: string): any | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;
        const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(normalized)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

/** ទាញយក Role មួយ (string) ចេញពី candidate ណាមួយ ដែលអាចជា string / string[] / {authority}[] / "A B C" */
const normalizeRoleCandidate = (candidate: any): string | null => {
    if (!candidate) return null;
    if (typeof candidate === 'string') {
        return candidate.split(' ')[0] || null; // ឧ. scope claim "ROLE_ADMIN ROLE_USER"
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
        const first = candidate[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object') return first.authority || first.role || first.name || null;
    }
    return null;
};

/**
 * ស្វែងរក Role ពី Login Response តាមរាងទិន្នន័យដែលអាចកើតមាន (តាមលំដាប់អាទិភាព)៖
 * 1) roles: string[]         2) role: string
 * 3) authorities: {authority}[] (Spring Security default)
 * 4) claim ក្នុង JWT token payload (role / roles / authorities / scope)
 * ត្រឡប់ null ប្រសិនបើរកមិនឃើញ role ណាមួយឡើយ។
 */
export const extractRoleFromLoginResponse = (data: any, token?: string): string | null => {
    const fromRoles = normalizeRoleCandidate(data?.roles);
    if (fromRoles) return fromRoles;

    const fromRole = normalizeRoleCandidate(data?.role);
    if (fromRole) return fromRole;

    const fromAuthorities = normalizeRoleCandidate(data?.authorities);
    if (fromAuthorities) return fromAuthorities;

    if (token) {
        const payload = decodeJwtPayload(token);
        if (payload) {
            const fromToken =
                normalizeRoleCandidate(payload.role) ||
                normalizeRoleCandidate(payload.roles) ||
                normalizeRoleCandidate(payload.authorities) ||
                normalizeRoleCandidate(payload.scope);
            if (fromToken) return fromToken;
        }
    }

    return null;
};

/**
 * អ្នកគ្រប់គ្រង (Admin area) - ត្រូវការសម្រាប់ចូលមើលទំព័រ /admin/* ទាំងអស់។
 * រួមទាំង Super Admin, Manager និង Staff (សិទ្ធិលម្អិតលើទំព័រនីមួយៗ ត្រូវពិនិត្យដោយ canView* ខាងក្រោម)
 */
export const isAdmin = (): boolean => isSuperAdmin() || isManager() || isStaff();

// ------------------------------------------------------------------
// សិទ្ធិលម្អិតតាមមុខងារ (Fine-grained permissions)
// ប្រើមុខងារទាំងនេះជំនួសការពិនិត្យ Role ដោយផ្ទាល់ ដើម្បីងាយស្រួលបន្ថែមកម្រិតសិទ្ធិថ្មីនាពេលអនាគត
// ------------------------------------------------------------------

/** មើលបញ្ជីការកម្ម៉ង់ - Super Admin, Manager និង Staff អាចមើលបាន */
export const canViewOrders = (): boolean => isSuperAdmin() || isManager() || isStaff();

/** មើលបញ្ជីវិក្កយបត្រ - Super Admin, Manager និង Staff អាចមើលបាន */
export const canViewInvoices = (): boolean => isSuperAdmin() || isManager() || isStaff();

/** មើលការត្រឡប់ទំនិញ - Super Admin & Manager ប៉ុណ្ណោះ (Staff មិនអាចមើលបាន) */
export const canViewReturns = (): boolean => isSuperAdmin() || isManager();

/** មើលការតាមដានការដឹកជញ្ជូន (ផ្នែកមួយនៃស្តុក) - Super Admin, Manager និង Staff អាចមើលបាន */
export const canViewOrderTracking = (): boolean => isSuperAdmin() || isManager() || isStaff();

/** មើលបញ្ជីស្តុកទំនិញ - Super Admin, Manager និង Staff អាចមើលបាន */
export const canViewInventory = (): boolean => isSuperAdmin() || isManager() || isStaff();

/** មើលបញ្ជីទំនិញ - Super Admin & Manager ប៉ុណ្ណោះ (Staff មិនអាចមើលបាន) */
export const canViewProducts = (): boolean => isSuperAdmin() || isManager();

/** មើលបញ្ជីប្រភេទទំនិញ - Super Admin & Manager ប៉ុណ្ណោះ (Staff មិនអាចមើលបាន) */
export const canViewCategories = (): boolean => isSuperAdmin() || isManager();

/** មើលបញ្ជីអតិថិជន - Super Admin, Manager និង Staff អាចមើលបាន */
export const canViewCustomers = (): boolean => isSuperAdmin() || isManager() || isStaff();

/** បន្ថែម/កែសម្រួល/លុប ទំនិញ - Super Admin ប៉ុណ្ណោះ */
export const canManageProducts = (): boolean => isSuperAdmin();
export const canDeleteProduct = (): boolean => isSuperAdmin();
export const canEditProduct = (): boolean => isSuperAdmin();

/** លុប ឬកែសម្រួល អតិថិជន - Super Admin ប៉ុណ្ណោះ */
export const canDeleteCustomer = (): boolean => isSuperAdmin();
export const canEditCustomer = (): boolean => isSuperAdmin();

/** លុប ការកម្ម៉ង់ - Super Admin ប៉ុណ្ណោះ */
export const canDeleteOrder = (): boolean => isSuperAdmin();

/** កែសម្រួលព័ត៌មានលម្អិតការកម្ម៉ង់ទាំងស្រុង (ឧ. អាសយដ្ឋាន/ទំនិញក្នុងបញ្ជីទិញ) - Super Admin ប៉ុណ្ណោះ */
export const canEditOrder = (): boolean => isSuperAdmin();

/** កែប្រែស្ថានភាពការកម្ម៉ង់ (ឧ. កំណត់ថាបានផ្ញើ/បានដឹកជញ្ជូន) - Super Admin និង Staff អាចធ្វើបាន */
export const canEditOrderStatus = (): boolean => isSuperAdmin() || isStaff();

/** លុប ឬលាក់ ការវាយតម្លៃ/មតិអតិថិជន - Super Admin ប៉ុណ្ណោះ */
export const canModerateReviews = (): boolean => isSuperAdmin();

/** មើលការវាយតម្លៃ/មតិអតិថិជន - Super Admin, Manager និង Staff អាចមើលបាន */
export const canViewReviews = (): boolean => isSuperAdmin() || isManager() || isStaff();

/** គ្រប់គ្រងសិទ្ធិ/Role របស់អ្នកគ្រប់គ្រងផ្សេងទៀត - Super Admin ប៉ុណ្ណោះ */
export const canManageUserRoles = (): boolean => isSuperAdmin();

/** មើលបញ្ជីបុគ្គលិក - Super Admin ប៉ុណ្ណោះ (ទិន្នន័យបុគ្គលិកជាព័ត៌មានឯកជន, Staff មិនអាចមើលបាន) */
export const canViewEmployees = (): boolean => isSuperAdmin();

/** បន្ថែម/កែសម្រួល/លុប បុគ្គលិក - Super Admin ប៉ុណ្ណោះ */
export const canManageEmployees = (): boolean => isSuperAdmin();

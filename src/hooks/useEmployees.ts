import { useCallback, useState } from 'react';
import axios from 'axios';
import { Employee } from '../types/dashboard.types';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);

    const fetchEmployees = useCallback(async (): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get<Employee[]>(`${API_BASE_URL}/api/employees/all`, { headers });

            // 🟢 /api/employees/all ត្រឡប់តែព័ត៌មាន User (id, firstName, lastName, roles...)
            // Position / Phone Number / Hire Date ស្ថិតនៅក្នុង UserProfile ដាច់ដោយឡែក
            // ត្រូវទាញម្នាក់ៗពី GET /api/profile/{id} ព្រោះមិនមាន endpoint ទាញជាបាច់ (bulk)
            const withProfile = await Promise.all(
                response.data.map(async (emp) => {
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                    try {
                        const profileRes = await axios.get<any>(`${API_BASE_URL}/api/profile/${emp.id}`, { headers });
                        const profile = profileRes.data || {};

                        // 🔍 DEBUG បណ្តោះអាសន្ន៖ សូមឆែក Console (F12) មើលថា UserProfile ពិតជាមាន field អ្វីខ្លះ
                        console.log(`🔍 UserProfile សម្រាប់ employee #${emp.id}:`, profile);

                        return {
                            ...emp,
                            fullName,
                            phoneNumber: profile.phoneNumber ?? emp.phoneNumber,
                            position: profile.position ?? emp.position,
                            hireDate: profile.hireDate ?? emp.hireDate,
                            address: profile.address ?? emp.address,
                        };
                    } catch (profileError) {
                        // 🟡 បើគ្មាន Profile សម្រាប់ user នេះ (ឧ. 404) ទុកជាទទេ មិនបង្ខំឲ្យបញ្ហាឆក់ការទាញទាំងអស់
                        console.warn(`⚠️ គ្មាន UserProfile សម្រាប់ employee #${emp.id}`, profileError);
                        return { ...emp, fullName };
                    }
                })
            );
            setEmployees(withProfile);
        } catch (error) {
            console.error('Fetch employees error:', error);
        }
    }, []);

    // 🟢 រក្សាទុក Position / Phone Number / Hire Date / Address ទៅ UserProfile ដាច់ដោយឡែក
    // (ព្រោះ /api/employees/... ជា User endpoint មិនមាន column ទាំងនេះទេ)
    const saveProfile = async (userId: number, employee: Partial<Employee>, token: string | null) => {
        try {
            await axios.put(`${API_BASE_URL}/api/profile/${userId}`, {
                phoneNumber: employee.phoneNumber,
                position: employee.position,
                hireDate: employee.hireDate,
                address: employee.address,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Save profile error:', error);
        }
    };

    const addEmployee = useCallback(async (employee: Partial<Employee>): Promise<boolean> => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post<Employee>(`${API_BASE_URL}/api/employees/add`, employee, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            // 🟢 Backend ត្រូវត្រឡប់ User ដែលទើបបង្កើត (មាន id) ដើម្បីអាចផ្ញើ Profile ភ្ជាប់ជាមួយបាន
            const newUserId = res.data?.id;
            if (newUserId) {
                await saveProfile(newUserId, employee, token);
            }
            await fetchEmployees();
            return true;
        } catch (error) {
            console.error('Add employee error:', error);
            return false;
        }
    }, [fetchEmployees]);

    const updateEmployee = useCallback(async (id: number, employee: Partial<Employee>): Promise<boolean> => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/employees/${id}`, employee, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            await saveProfile(id, employee, token);
            await fetchEmployees();
            return true;
        } catch (error) {
            console.error('Update employee error:', error);
            return false;
        }
    }, [fetchEmployees]);

    const deleteEmployee = useCallback(async (id: number): Promise<void> => {
        if (!window.confirm('តើអ្នកពិតជាចង់លុបបុគ្គលិកនេះមែនទេ?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('លុបបានជោគជ័យ!');
            await fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('មិនអាចលុបបានទេ!');
        }
    }, [fetchEmployees]);

    return { employees, fetchEmployees, addEmployee, updateEmployee, deleteEmployee };
}

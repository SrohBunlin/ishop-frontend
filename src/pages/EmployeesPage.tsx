import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmployeesTable from '../components/employees/EmployeesTable';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';
import { useEmployees } from '../hooks/useEmployees';
import { Employee, NewEmployeeState } from '../types/dashboard.types';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard-theme.css';

const EmployeesPage: React.FC = () => {
    const { t } = useLanguage();
    const { employees, fetchEmployees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await fetchEmployees();
            console.log("Employees data:", data); // បន្ថែមចំណុចនេះ ដើម្បីឆែកមើលក្នុង Console
        };
        loadEmployees();
    }, [fetchEmployees]);

    const { activeCount, inactiveCount } = useMemo(() => {
        let active = 0;
        let inactive = 0;
        employees.forEach((e) => {
            if ((e.status || 'ACTIVE').toUpperCase() === 'ACTIVE') active += 1;
            else inactive += 1;
        });
        return { activeCount: active, inactiveCount: inactive };
    }, [employees]);

    const handleAddClick = () => {
        setEditingEmployee(null);
        setShowModal(true);
    };

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
    };

    const handleFormSubmit = async (form: NewEmployeeState) => {
        // 🟢 Backend ផ្ទុកជា firstName + lastName ដាច់ដោយឡែក ដូច្នេះផ្ញើដាច់ដោយឡែកទៅតាមដើម មិនបញ្ចូលគ្នាទៀតទេ
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email,
            phoneNumber: form.phoneNumber,
            position: form.position,
            address: form.address,
            hireDate: form.hireDate || undefined,
            salary: form.salary ? Number(form.salary) : undefined,
            status: form.status,
            role: form.role,
        };

        const success = editingEmployee
            ? await updateEmployee(editingEmployee.id, payload)
            : await addEmployee(payload);

        if (success) {
            alert(t('employeeForm.saveSuccess'));
            await fetchEmployees();
            handleCloseModal();
        } else {
            alert(t('employeeForm.saveFail'));
        }
    };

    return (
        <DashboardLayout title={t('employees.title')} onExportReport={() => {}}>
            <div className="dashboard-page">
                <div className="dashboard-section">
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon">
                                    <i className="bi bi-person-badge-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('employees.total')}</p>
                                    <p className="db-stat-value">{employees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--success">
                                    <i className="bi bi-person-check-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('employees.active')}</p>
                                    <p className="db-stat-value">{activeCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="db-stat-card">
                                <div className="db-stat-icon db-stat-icon--warning">
                                    <i className="bi bi-person-dash-fill"></i>
                                </div>
                                <div className="db-stat-body">
                                    <p className="db-stat-label">{t('employees.inactive')}</p>
                                    <p className="db-stat-value">{inactiveCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <EmployeesTable
                        employees={employees}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onEdit={handleEditClick}
                        onDelete={deleteEmployee}
                        onAdd={handleAddClick}
                    />
                </div>
            </div>

            <EmployeeFormModal
                show={showModal}
                employee={editingEmployee}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
            />
        </DashboardLayout>
    );
};

export default EmployeesPage;

import React, { useEffect, useState } from 'react';
import { Employee, NewEmployeeState } from '../../types/dashboard.types';
import { useLanguage } from '../../context/LanguageContext';
import { ROLE_LABELS } from '../../utils/auth';

const EMPTY_FORM: NewEmployeeState = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    address: '',
    hireDate: '',
    salary: '',
    status: 'ACTIVE',
    role: 'ROLE_STAFF',
};

interface EmployeeFormModalProps {
    show: boolean;
    employee: Employee | null;
    onClose: () => void;
    onSubmit: (form: NewEmployeeState) => Promise<void> | void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ show, employee, onClose, onSubmit }) => {
    const { t } = useLanguage();
    const [form, setForm] = useState<NewEmployeeState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (employee) {
            setForm({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                email: employee.email || '',
                phoneNumber: employee.phoneNumber || '',
                position: employee.position || '',
                address: employee.address || '',
                hireDate: employee.hireDate ? employee.hireDate.substring(0, 10) : '',
                salary: employee.salary !== undefined ? String(employee.salary) : '',
                status: employee.status || 'ACTIVE',
                // @ts-ignore - ក្នុងករណី TypeScript នៅតែមិនស្គាល់ role
                role: employee.role || 'ROLE_STAFF',
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [employee, show]);

    const handleChange = (field: keyof NewEmployeeState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.firstName.trim()) {
            alert(t('employeeForm.nameRequired'));
            return;
        }
        setSaving(true);
        try {
            await onSubmit(form);
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow" style={{ borderRadius: '18px', border: 'none' }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ color: 'var(--shop-primary, #124F9C)' }}>
                            <i className="bi bi-person-badge"></i> {employee ? t('employeeForm.editTitle') : t('employeeForm.addTitle')}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.firstName')}</label>
                                <input type="text" className="form-control" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.lastName')}</label>
                                <input type="text" className="form-control" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.phone')}</label>
                                <input type="text" className="form-control" value={form.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.email')}</label>
                                <input type="email" className="form-control" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.position')}</label>
                                <input type="text" className="form-control" value={form.position} onChange={(e) => handleChange('position', e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.hireDate')}</label>
                                <input type="date" className="form-control" value={form.hireDate} onChange={(e) => handleChange('hireDate', e.target.value)} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.salary')}</label>
                                <input type="number" className="form-control" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted">តួនាទី (Role)</label>
                                <select className="form-select" value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
                                    <option value="ROLE_SUPER_ADMIN">{ROLE_LABELS.ROLE_SUPER_ADMIN}</option>
                                    <option value="ROLE_MANAGER">{ROLE_LABELS.ROLE_MANAGER}</option>
                                    <option value="ROLE_STAFF">{ROLE_LABELS.ROLE_STAFF}</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label text-muted">{t('employeeForm.status')}</label>
                                <select className="form-select" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                                    <option value="ACTIVE">{t('employeesTable.statusActive')}</option>
                                    <option value="INACTIVE">{t('employeesTable.statusInactive')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-2">
                            <label className="form-label text-muted">{t('employeeForm.address')}</label>
                            <input type="text" className="form-control" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
                        </div>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>{t('employeeForm.cancel')}</button>
                        <button type="button" className="btn px-4 text-white" style={{ backgroundColor: 'var(--shop-primary, #124F9C)' }} onClick={handleSubmit} disabled={saving}>
                            {saving ? t('employeeForm.saving') : t('employeeForm.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
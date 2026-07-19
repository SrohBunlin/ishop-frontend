import React from 'react';
import { Employee } from '../../types/dashboard.types';
import { canManageEmployees } from '../../utils/auth';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../context/LanguageContext';

const RECORDS_PER_PAGE = 10;

const STATUS_CLASS: Record<string, string> = {
    'ACTIVE': 'db-status-success',
    'INACTIVE': 'db-status-warning',
};

const STATUS_LABEL_KEY: Record<string, string> = {
    'ACTIVE': 'employeesTable.statusActive',
    'INACTIVE': 'employeesTable.statusInactive',
};

interface EmployeesTableProps {
    employees: Employee[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onEdit: (employee: Employee) => void;
    onDelete: (id: number) => void;
    onAdd: () => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, searchQuery, onSearchChange, onEdit, onDelete, onAdd }) => {
    const { t } = useLanguage();

    const filteredEmployees = employees.filter((employee) => {
        const searchTermLower = searchQuery.toLowerCase().trim();
        if (!searchTermLower) return true;
        return (
            employee.fullName?.toLowerCase().includes(searchTermLower) ||
            employee.email?.toLowerCase().includes(searchTermLower) ||
            employee.phoneNumber?.toLowerCase().includes(searchTermLower) ||
            employee.position?.toLowerCase().includes(searchTermLower) ||
            employee.id?.toString().includes(searchTermLower)
        );
    });

    const { page, setPage, totalPages, currentRecords } = usePagination(filteredEmployees, RECORDS_PER_PAGE, searchQuery);

    const canManage = canManageEmployees();

    return (
        <div className="db-panel">
            <div className="db-panel__header">
                <p className="db-panel__title">
                    <span className="db-panel__title-icon">
                        <i className="bi bi-person-badge-fill"></i>
                    </span>
                    {t('employeesTable.title')}
                    <span className="db-panel__count">{filteredEmployees.length}</span>
                </p>
                <div className="d-flex align-items-center gap-2">
                    <div className="db-search">
                        <i className="bi bi-search"></i>
                        <SearchBar value={searchQuery} placeholder={t('employeesTable.searchPlaceholder')} onChange={onSearchChange} />
                    </div>
                    {canManage && (
                        <button type="button" className="btn text-white" style={{ backgroundColor: 'var(--shop-primary, #124F9C)' }} onClick={onAdd}>
                            <i className="bi bi-plus-lg"></i> {t('employeesTable.addEmployee')}
                        </button>
                    )}
                </div>
            </div>

            {currentRecords.length === 0 ? (
                <div className="db-empty">
                    <i className="bi bi-inbox"></i>
                    <p>{t('employeesTable.emptySearch')}</p>
                </div>
            ) : (
                <div className="db-table-wrap">
                    <table className="db-table">
                        <thead>
                            <tr>
                                <th scope="col">{t('employeesTable.colId')}</th>
                                <th scope="col">{t('employeesTable.colName')}</th>
                                <th scope="col">{t('employeesTable.colPosition')}</th>
                                <th scope="col">{t('employeesTable.colPhone')}</th>
                                <th scope="col">{t('employeesTable.colEmail')}</th>
                                <th scope="col">{t('employeesTable.colHireDate')}</th>
                                <th scope="col">{t('employeesTable.colStatus')}</th>
                                {canManage && <th scope="col">{t('employeesTable.colAction')}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="db-cell-id">#{employee.id}</td>
                                    <td className="db-cell-name">{employee.fullName}</td>
                                    <td>{employee.position || t('employeesTable.noData')}</td>
                                    <td>{employee.phoneNumber || t('employeesTable.noData')}</td>
                                    <td>{employee.email || t('employeesTable.noData')}</td>
                                    <td>{employee.hireDate ? employee.hireDate.substring(0, 10) : t('employeesTable.noData')}</td>
                                    <td>
                                        <span className={`db-pill ${STATUS_CLASS[employee.status || 'ACTIVE'] || 'db-status-success'}`}>
                                            {t(STATUS_LABEL_KEY[employee.status || 'ACTIVE'], employee.status)}
                                        </span>
                                    </td>
                                    {canManage && (
                                        <td>
                                            <div className="db-actions">
                                                <button className="db-btn-edit" onClick={() => onEdit(employee)}>
                                                    <i className="bi bi-pencil-square"></i> {t('employeesTable.edit')}
                                                </button>
                                                <button className="db-btn-delete" onClick={() => onDelete(employee.id)}>
                                                    <i className="bi bi-trash3"></i> {t('employeesTable.delete')}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

export default EmployeesTable;

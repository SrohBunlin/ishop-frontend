import React from 'react';

export const tHeader: React.CSSProperties = {
    border: '1px solid var(--db-border, #ddd)',
    padding: '12px',
    textAlign: 'center',
    backgroundColor: 'var(--db-primary, #124F9C)',
    color: '#f8f9fa',
};

export const tCell: React.CSSProperties = {
    border: '1px solid var(--db-border, #ddd)',
    padding: '12px',
    textAlign: 'center',
};

export const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid var(--db-border, #ddd)',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'var(--db-surface, #fff)',
    color: 'var(--db-text, #1f2937)',
};

export const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: 'var(--db-primary, #124F9C)',
    color: '#f8f9fa',
    fontWeight: '600',
    padding: '15px',
    textAlign: 'left',
    borderBottom: '2px solid var(--db-border, #dee2e6)',
};

export const tableCellStyle: React.CSSProperties = {
    padding: '15px',
    borderBottom: '1px solid var(--db-border, #eee)',
    color: 'var(--db-text-muted, #555)',
};

export const searchBarStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid var(--db-border, #ddd)',
    fontSize: '16px',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
    backgroundColor: 'var(--db-surface, #fff)',
    color: 'var(--db-text, #1f2937)',
};

export const saveBtnStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: 'var(--db-primary, #124F9C)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flexGrow: 1,
    maxWidth: '150px',
    textAlign: 'center',
};

export const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flexGrow: 1,
    maxWidth: '150px',
    textAlign: 'center',
};

export const alertContainerStyle: React.CSSProperties = {
    backgroundColor: 'var(--db-danger-bg, #f8d7da)',
    color: 'var(--db-danger, #842029)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid var(--db-danger-bg, #f5c2c7)',
    marginBottom: '20px',
};

export const LOCAL_PLACEHOLDER =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23aaaaaa'>No Image</text></svg>";

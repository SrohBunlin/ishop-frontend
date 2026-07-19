import React from 'react';

interface SearchBarProps {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, placeholder, onChange }) => {
    return (
        <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default SearchBar;

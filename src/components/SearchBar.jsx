import React from "react";

/**
 * Reusable SearchBar component for filtering content.
 * 
 * Props:
 *  - value: Current search query string
 *  - onChange: Callback function when search input changes
 *  - placeholder: Placeholder text for the input
 */
export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
    const handleClear = () => {
        onChange("");
    };

    return (
        <div className="search-bar-container">
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label="Search"
                />
                {value && (
                    <button
                        type="button"
                        className="search-clear-btn"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}

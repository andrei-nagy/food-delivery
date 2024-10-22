import { useState } from 'react';

const ThemeToggleButton = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark', !isDarkMode); // Adaugă sau elimină clasa "dark"
    };

    return (
        <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded transition-all duration-300 
                ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
                border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}
                hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `}
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default ThemeToggleButton

import { useTheme } from './ThemeContext'; // Ajustează calea în funcție de structura ta

const ThemeToggleButton = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    console.log(isDarkMode, toggleTheme);
    
    return (
        <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded transition-all duration-300 
                ${isDarkMode ? 'bg-white text-white' : 'bg-white text-gray-800'}
                border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}
                hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `}
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default ThemeToggleButton;

import { useTheme } from './ThemeContext'; // Ajustează calea în funcție de structura ta

const ThemeToggleButton = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    console.log(isDarkMode, toggleTheme);
    
    return (
        <button
            onClick={toggleTheme}
            style={{
                backgroundColor: isDarkMode ? '#ffffff' : '#ffffff', // Fundal alb pentru ambele moduri
                color: isDarkMode ? '#4B5563' : '#4B5563', // Textul de culoare gri închis
                borderColor: isDarkMode ? '#D1D5DB' : '#D1D5DB', // Culoarea bordurii
            }}
            className={`px-4 py-2 rounded transition-all duration-300 
                border-2 
                hover:bg-gray-200
            `}
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default ThemeToggleButton;

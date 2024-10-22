import React, { createContext, useContext, useState } from 'react';

// Creează contextul
const ThemeContext = createContext();

// Creează providerul
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
        document.documentElement.classList.toggle('dark', !isDarkMode); // Adaugă sau elimină clasa "dark"
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook pentru a utiliza contextul
export const useTheme = () => {
    return useContext(ThemeContext);
};

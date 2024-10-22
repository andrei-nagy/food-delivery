import React, { createContext, useContext, useState } from 'react';

// Creăm contextul temei
const ThemeContext = createContext();

// Providerul temei
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
        document.documentElement.classList.toggle('dark', !isDarkMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook pentru a utiliza contextul temei
export const useTheme = () => {
    return useContext(ThemeContext);
};

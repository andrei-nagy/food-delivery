import React, { createContext, useContext, useState, useEffect } from 'react';

// Creează contextul
const ThemeContext = createContext();

// Creează providerul
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Verifică localStorage pentru tema anterioară
        const savedTheme = localStorage.getItem('isDarkMode');
        return savedTheme === 'true'; // Dacă există, folosește valoarea salvată
    });

    const toggleTheme = () => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;
            localStorage.setItem('isDarkMode', newMode); // Salvează tema curentă în localStorage
            document.documentElement.classList.toggle('dark', newMode); // Adaugă sau elimină clasa "dark"
            return newMode; // Returnează noua valoare
        });
    };

    // Asigură-te că aplicația aplică tema corectă la încărcare
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

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

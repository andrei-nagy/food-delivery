// UrlContext.js
import React, { createContext, useContext, useState } from 'react';

// Creează contextul
const UrlContext = createContext();

// Creează providerul
export const UrlProvider = ({ children }) => {
    const [url, setUrl] = useState('http://localhost:4000'); // Verifică numele variabilei

    return (
        <UrlContext.Provider value={{ url, setUrl }}> {/* Folosește 'url' nu 'apiUrl' */}
            {children}
        </UrlContext.Provider>
    );
};

// Hook pentru a utiliza contextul
export const useUrl = () => {
    return useContext(UrlContext);
};

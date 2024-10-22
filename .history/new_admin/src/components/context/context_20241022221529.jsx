// UrlContext.js
import React, { createContext, useContext, useState } from 'react';

// Creează contextul
const UrlContext = createContext();

// Creează providerul
export const UrlProvider = ({ children }) => {
    const [apiUrl, setApiUrl] = useState('http://localhost:4000'); // Setează valoarea inițială pentru URL

    return (
        <UrlContext.Provider value={{ apiUrl, setApiUrl }}>
            {children}
        </UrlContext.Provider>
    );
};

// Hook pentru a utiliza contextul
export const useUrl = () => {
    return useContext(UrlContext);
};

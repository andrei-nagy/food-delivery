// UrlContext.js
import React, { createContext, useContext, useState } from 'react';

// Creează contextul
const AppVersionContext = createContext();

// Creează providerul
export const UrlProvider = ({ children }) => {
    const [appVersion, setAppVersion] = useState('1.0.0'); // Verifică numele variabilei

    return (
        <AppVersionContext.Provider value={{ appVersion, setAppVersion }}> {/* Folosește 'url' nu 'apiUrl' */}
            {children}
        </AppVersionContext.Provider>
    );
};

// Hook pentru a utiliza contextul
export const setAppVersion = () => {
    return useContext(AppVersionContext);
};

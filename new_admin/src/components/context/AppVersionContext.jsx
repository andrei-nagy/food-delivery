// UrlContext.js
import React, { createContext, useContext, useState } from 'react';

// Creează contextul
const AppVersionContext = createContext();

// Creează providerul
export const AppVersionProvider = ({ children }) => {
    const appVersion = '1.0.0';

    return (
        <AppVersionContext.Provider value={appVersion}> {/* Folosește 'url' nu 'apiUrl' */}
            {children}
        </AppVersionContext.Provider>
    );
};

// Hook pentru a utiliza contextul
export const setAppVersion = () => {
    return useContext(AppVersionContext);
};

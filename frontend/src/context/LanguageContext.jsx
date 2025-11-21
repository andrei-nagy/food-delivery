// src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('ro');

  // Sync with i18n and sessionStorage on initial load
  useEffect(() => {
    const savedLanguage = sessionStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n]);

  const updateLanguage = (lng) => {
    setCurrentLanguage(lng);
    i18n.changeLanguage(lng);
    sessionStorage.setItem('language', lng);
  };

  const value = {
    currentLanguage,
    setCurrentLanguage: updateLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
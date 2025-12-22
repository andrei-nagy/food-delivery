import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreContext } from './StoreContext';

export const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Încearcă să citești din sessionStorage, altfel folosește engleza ca fallback
    return sessionStorage.getItem("language") || 'en';
  });

  // 🔥 SINCRONIZEAZĂ I18N CU STARE LOCALĂ
  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  // 🔥 MONITORIZEAZĂ SCHIMBĂRILE ÎN SESSION STORAGE (pentru sincronizare între tab-uri)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLanguage = sessionStorage.getItem("language");
      if (savedLanguage && savedLanguage !== currentLanguage) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentLanguage, i18n]);

  const changeLanguage = (lng) => {
    setCurrentLanguage(lng);
    sessionStorage.setItem("language", lng);
    i18n.changeLanguage(lng);
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setCurrentLanguage: changeLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
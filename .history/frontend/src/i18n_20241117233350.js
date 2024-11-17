import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json'; // Fișier pentru engleză
import ro from './locales/ro/translation.json'; // Fișier pentru română

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ro: { translation: ro },
  },
  lng: 'en', // Limba implicită
  fallbackLng: 'en', // Limba de rezervă dacă cheia nu e găsită
  interpolation: { escapeValue: false }, // Nu scăpa caractere HTML
});

export default i18n;

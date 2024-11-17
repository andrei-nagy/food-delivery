import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // Pentru încărcarea traducerilor din fișiere
  .use(LanguageDetector) // Pentru detectarea automată a limbii
  .use(initReactI18next) // Integrarea cu React
  .init({
    supportedLngs: ['en', 'ro'], // Limbile suportate
    fallbackLng: 'en', // Limba implicită
    debug: true, // Dezactivare pentru producție
    interpolation: {
      escapeValue: false, // React deja scăpa automat datele
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Locația fișierelor de traducere
    },
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Pentru încărcarea traducerilor din fișiere JSON
  .use(initReactI18next) // Integrează i18next cu React
  .init({
    lng: 'en', // Limba implicită
    fallbackLng: 'en', // Limba de rezervă
    interpolation: {
      escapeValue: false, // React gestionează deja protecția XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Calea către fișierele JSON
    },
    debug: true, // Activează debug-ul pentru dezvoltare
  });

export default i18n;

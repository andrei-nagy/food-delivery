import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend'; // Importăm backend-ul pentru fișiere externe

i18n
  .use(HttpApi) // Folosim backend-ul pentru a încărca traducerile
  .use(initReactI18next) // Conectăm i18next cu React
  .init({
    lng: 'en', // Limba implicită
    fallbackLng: 'en', // Limba de rezervă
    interpolation: {
      escapeValue: false, // React gestionează deja protecția XSS
    },
    backend: {
      loadPath: '/public/locales/{{lng}}/translation.json', // Calea către fișierele JSON
    },
    debug: true, // Activează debug-ul (opțional, doar pentru dezvoltare)
  });

export default i18n;

// components/ChatBot/ChatBot.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { FaTimes, FaPaperPlane, FaComments, FaRedo, FaGlobe, FaRobot } from 'react-icons/fa';
import { IoIosRestaurant, IoMdTime, IoMdPin, IoMdCard } from 'react-icons/io';
import { MdRestaurantMenu, MdPayment, MdSupportAgent } from 'react-icons/md';
import './ChatBot.css';
import { StoreContext } from '../../context/StoreContext';
import { patterns } from './ChatPatterns';

import axios from 'axios';
import { toast } from 'react-toastify';

const ChatBot = ({ show, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [pendingLanguageChange, setPendingLanguageChange] = useState(null);
  const [pendingWaiterRequest, setPendingWaiterRequest] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const inputRef = useRef(null);
  const { url } = useContext(StoreContext);
  const tableNumber = localStorage.getItem('tableNumber');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [show, messages]);

  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
    setTimeout(scrollToBottom, 300);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsKeyboardVisible(false), 500);
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget || e.target === closeButtonRef.current || e.target.closest('.close-chat')) {
      const inputElement = inputRef.current;
      if (inputElement) {
        inputElement.blur();
      }
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'ro' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (show && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: language === 'ro' 
             ? "🤖 Bună! Sunt Diana AI și vă pot ajuta cu: \n\n• **Recomandări meniu** \n• **Informații preparate și ingrediente** \n• **Program și locație** \n• **Stare comandă** \n• **Chemare ospătar** \n• **Informații plăți** \n• **Cerințe speciale** \n\nÎntrebați-mă orice doriți să știți! 😊"
    : "🤖 Hello! I'm Diana AI and I can help you with: \n\n• **Menu recommendations** \n• **Dish and ingredient information** \n• **Hours and location** \n• **Order status** \n• **Calling a waiter** \n• **Payment information** \n• **Special requests** \n\nAsk me anything you'd like to know! 😊",
          sender: "bot",
          timestamp: new Date(),
          quickReplies: language === 'ro' ? [
            { text: "🍽️ Ce recomanzi?", action: "recommendation" },
            { text: "📋 Meniul", action: "menu" },
            { text: "🧾 Plata", action: "payment" },
            { text: "🆘 Ajutor", action: "help" }
          ] : [
            { text: "🍽️ Recommendations", action: "recommendation" },
            { text: "📋 Menu", action: "menu" },
            { text: "🧾 Payment", action: "payment" },
            { text: "🆘 Help", action: "help" }
          ]
        }
      ]);
    }
  }, [language, show]);

  const switchLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    sessionStorage.setItem('language', newLanguage);
    setPendingLanguageChange(null);
    
    const infoMessage = {
      id: Date.now(),
      text: newLanguage === 'ro' 
        ? "🌍 Limba a fost schimbată în română!" 
        : "🌍 Language switched to English!",
      sender: "bot",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, infoMessage]);
    
    toast.success(newLanguage === 'ro' 
      ? 'Limba a fost schimbată în română!' 
      : 'Language switched to English!');
  };

  const submitWaiterRequest = async (actionType, actionMessage) => {
    try {
      const response = await axios.post(`${url}/api/waiterorders/add`, {
        action: actionMessage,
        tableNo: tableNumber,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error submitting waiter request:', error);
      toast.error(language === 'ro' ? 'Ceva nu a funcționat. Vă rugăm să încercați din nou.' : 'Something went wrong. Please try again.');
      return false;
    }
  };

  const confirmLanguageChange = (newLanguage) => {
    if (newLanguage === language) {
      const alreadySetMessage = {
        id: Date.now(),
        text: newLanguage === 'ro' 
          ? "ℹ️ Limba este deja setată pe **română**!" 
          : "ℹ️ The language is already set to **English**!",
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, alreadySetMessage]);
      return;
    }
    
    const confirmationMessage = {
      id: Date.now(),
      text: newLanguage === 'ro' 
        ? "🤔 Sigur doriți să schimbați limba în **română**?" 
        : "🤔 Are you sure you want to switch to **English**?",
      sender: "bot",
      timestamp: new Date(),
      hasButtons: true,
      buttons: [
        { 
          text: newLanguage === 'ro' ? '✅ Da' : '✅ Yes', 
          action: 'confirm_language',
          language: newLanguage
        },
        { 
          text: newLanguage === 'ro' ? '❌ Nu' : '❌ No', 
          action: 'cancel_language'
        }
      ]
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    setPendingLanguageChange(newLanguage);
  };

  const confirmWaiterRequest = (actionType, actionMessage) => {
    const isPayment = actionType === 'payment';
    
    const confirmationMessage = {
      id: Date.now(),
      text: language === 'ro' 
        ? `🤔 Sigur doriți să chemați un ospătar pentru **${isPayment ? 'plată' : 'asistență'}**?` 
        : `🤔 Are you sure you want to call a waiter for **${isPayment ? 'payment' : 'assistance'}**?`,
      sender: "bot",
      timestamp: new Date(),
      hasButtons: true,
      buttons: [
        { 
          text: language === 'ro' ? '✅ Da, cheamă ospătar' : '✅ Yes, call waiter', 
          action: 'confirm_waiter',
          actionType: actionType,
          actionMessage: actionMessage
        },
        { 
          text: language === 'ro' ? '❌ Nu, anulează' : '❌ No, cancel', 
          action: 'cancel_waiter'
        }
      ]
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    setPendingWaiterRequest({ actionType, actionMessage });
  };

  const handleButtonClick = async (button, messageId) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.hasButtons) {
        return {
          ...msg,
          buttons: msg.buttons.map(btn => ({
            ...btn,
            disabled: true
          }))
        };
      }
      return msg;
    }));

    if (button.action === 'confirm_language') {
      switchLanguage(button.language);
    } else if (button.action === 'cancel_language') {
      const cancelMessage = {
        id: Date.now(),
        text: language === 'ro' 
          ? "✅ Am anulat schimbarea limbii." 
          : "✅ Language change cancelled.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, cancelMessage]);
      setPendingLanguageChange(null);
    } else if (button.action === 'confirm_waiter') {
      const success = await submitWaiterRequest(button.actionType, button.actionMessage);
      
      const resultMessage = {
        id: Date.now(),
        text: success 
          ? (language === 'ro' 
              ? `✅ Un ospătar va veni la masa ${tableNumber} în câteva momente!` 
              : `✅ A waiter will come to table ${tableNumber} shortly!`)
          : (language === 'ro' 
              ? "❌ Nu am reușit să trimitem cererea. Vă rugăm să încercați din nou sau folosiți butonul de asistență."
              : "❌ We couldn't send your request. Please try again or use the assistance button."),
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resultMessage]);
      setPendingWaiterRequest(null);
    } else if (button.action === 'cancel_waiter') {
      const cancelMessage = {
        id: Date.now(),
        text: language === 'ro' 
          ? "✅ Am anulat chemarea ospătarului." 
          : "✅ Waiter call cancelled.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, cancelMessage]);
      setPendingWaiterRequest(null);
    }
  };

  // Funcție nouă pentru a trimite mesaje direct
  const sendQuickMessage = (text) => {
    if (!text.trim()) return;

    // Adaugă mesajul utilizatorului
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Procesează confirmările pentru limbă sau ospătar
    if (pendingLanguageChange || pendingWaiterRequest) {
      if (processConfirmationResponse(text)) {
        return;
      }
    }

    setIsTyping(true);
    
    // Simulează typing și adaugă răspunsul bot-ului
    setTimeout(() => {
      const botResponse = findBestMatch(text, language);
      
      let botMessageText = "";
      
      if (botResponse && typeof botResponse === 'object') {
        if (botResponse.type === "language_change") {
          if (botResponse.newLanguage === language) {
            botMessageText = language === 'ro' 
              ? "ℹ️ Limba este deja setată pe **română**!" 
              : "ℹ️ The language is already set to **English**!";
          } else {
            confirmLanguageChange(botResponse.newLanguage);
            setIsTyping(false);
            return;
          }
        } else if (botResponse.type === "waiter_request") {
          confirmWaiterRequest(botResponse.actionType, botResponse.actionMessage);
          setIsTyping(false);
          return;
        }
      } else {
        botMessageText = botResponse || (language === 'ro' 
          ? "🤔 Îmi pare rău, nu înțeleg întrebarea. Încercați să mă întrebați despre:\n\n• **Recomandări meniu**\n• **Informații preparate**\n• **Program restaurant**\n• **Chemare ospătar**\n• **Plată**"
          : "🤔 I'm sorry, I don't understand the question. Try asking me about:\n\n• **Menu recommendations**\n• **Dish information**\n• **Restaurant hours**\n• **Calling a waiter**\n• **Payment**");
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botMessageText,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply) => {
    sendQuickMessage(reply.text);
  };

  const handleQuickAction = (actionType) => {
    let message = '';
    switch (actionType) {
      case 'recommendation':
        message = language === 'ro' ? 'Ce recomanzi?' : 'What do you recommend?';
        break;
      case 'payment':
        message = language === 'ro' ? 'Vreau să plătesc' : 'I want to pay';
        break;
      case 'hours':
        message = language === 'ro' ? 'Program restaurant' : 'Restaurant hours';
        break;
      case 'menu':
        message = language === 'ro' ? 'Meniul' : 'Menu';
        break;
      case 'help':
        message = language === 'ro' ? 'Am nevoie de ajutor' : 'I need help';
        break;
      default:
        message = language === 'ro' ? 'Ajutor' : 'Help';
    }
    sendQuickMessage(message);
  };

  const processConfirmationResponse = (response) => {
    const lowerResponse = response.toLowerCase().trim();
    
    if (pendingLanguageChange) {
      if ((language === 'ro' && (lowerResponse === 'da' || lowerResponse === 'yes')) || 
          (language === 'en' && (lowerResponse === 'yes' || lowerResponse === 'da'))) {
        switchLanguage(pendingLanguageChange);
      } else if (lowerResponse === 'nu' || lowerResponse === 'no' || lowerResponse === 'not') {
        const cancelMessage = {
          id: Date.now(),
          text: language === 'ro' 
            ? "✅ Am anulat schimbarea limbii." 
            : "✅ Language change cancelled.",
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cancelMessage]);
        setPendingLanguageChange(null);
      } else {
        const invalidMessage = {
          id: Date.now(),
          text: language === 'ro' 
            ? "❌ Vă rugăm să răspundeți cu **'da'** sau **'nu'**, sau folosiți butoanele." 
            : "❌ Please reply with **'yes'** or **'no'**, or use the buttons.",
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, invalidMessage]);
      }
      return true;
    }
    
    if (pendingWaiterRequest) {
      if ((language === 'ro' && (lowerResponse === 'da' || lowerResponse === 'yes')) || 
          (language === 'en' && (lowerResponse === 'yes' || lowerResponse === 'da'))) {
        submitWaiterRequest(pendingWaiterRequest.actionType, pendingWaiterRequest.actionMessage)
          .then(success => {
            const resultMessage = {
              id: Date.now(),
              text: success 
                ? (language === 'ro' 
                    ? `✅ Un ospătar va veni la masa ${tableNumber} în câteva momente!` 
                    : `✅ A waiter will come to table ${tableNumber} shortly!`)
                : (language === 'ro' 
                    ? "❌ Nu am reușit să trimitem cererea. Vă rugăm să încercați din nou sau folosiți butonul de asistență."
                    : "❌ We couldn't send your request. Please try again or use the assistance button."),
              sender: "bot",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, resultMessage]);
          });
      } else if (lowerResponse === 'nu' || lowerResponse === 'no' || lowerResponse === 'not') {
        const cancelMessage = {
          id: Date.now(),
          text: language === 'ro' 
            ? "✅ Am anulat chemarea ospătarului." 
            : "✅ Waiter call cancelled.",
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cancelMessage]);
      } else {
        const invalidMessage = {
          id: Date.now(),
          text: language === 'ro' 
            ? "❌ Vă rugăm să răspundeți cu **'da'** sau **'nu'**, sau folosiți butoanele." 
            : "❌ Please reply with **'yes'** or **'no'**, or use the buttons.",
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, invalidMessage]);
      }
      setPendingWaiterRequest(null);
      return true;
    }
    
    return false;
  };

  const findBestMatch = (question, lang) => {
  const lowerQuestion = question.toLowerCase().trim();
  const langPatterns = patterns[lang];

  // Verifică toate categoriile existente...
  const isLanguageQuestion = langPatterns.language.some(pattern => pattern.test(lowerQuestion));
  const isWaiterQuestion = langPatterns.waiter.some(pattern => pattern.test(lowerQuestion));
  const isRecommendationQuestion = langPatterns.recommendation.some(pattern => pattern.test(lowerQuestion));
  const isMenuQuestion = langPatterns.menu.some(pattern => pattern.test(lowerQuestion));
  const isIngredientsQuestion = langPatterns.ingredients.some(pattern => pattern.test(lowerQuestion));
  const isHoursLocationQuestion = langPatterns.hours_location.some(pattern => pattern.test(lowerQuestion));
  const isServicesQuestion = langPatterns.services.some(pattern => pattern.test(lowerQuestion));
  const isOrderStatusQuestion = langPatterns.order_status.some(pattern => pattern.test(lowerQuestion));
  const isPaymentQuestion = langPatterns.payment.some(pattern => pattern.test(lowerQuestion));
  const isSpecialRequestsQuestion = langPatterns.special_requests.some(pattern => pattern.test(lowerQuestion));
  
  // Noile categorii pentru conversații friendly
  const isGreeting = langPatterns.greeting.some(pattern => pattern.test(lowerQuestion));
  const isHowAreYou = langPatterns.how_are_you.some(pattern => pattern.test(lowerQuestion));
  const isWhoAreYou = langPatterns.who_are_you.some(pattern => pattern.test(lowerQuestion));
  const isTodayQuestion = langPatterns.today.some(pattern => pattern.test(lowerQuestion));
  const isWeatherQuestion = langPatterns.weather.some(pattern => pattern.test(lowerQuestion));
  const isThanks = langPatterns.thanks.some(pattern => pattern.test(lowerQuestion));
  const isCompliment = langPatterns.compliment.some(pattern => pattern.test(lowerQuestion));
  const isSmallTalk = langPatterns.small_talk.some(pattern => pattern.test(lowerQuestion));

  let requestedLanguage = null;
  if (isLanguageQuestion) {
    const isRomanianRequest = /român|romana|ro\b|româna|română/i.test(lowerQuestion);
    const isEnglishRequest = /englez|engleza|en\b|english/i.test(lowerQuestion);
    
    if (isRomanianRequest) {
      requestedLanguage = 'ro';
    } else if (isEnglishRequest) {
      requestedLanguage = 'en';
    } else {
      requestedLanguage = lang === 'ro' ? 'en' : 'ro';
    }
    
    if (requestedLanguage === lang) {
      return lang === 'ro' 
        ? "ℹ️ Limba este deja setată pe **română**!" 
        : "ℹ️ The language is already set to **English**!";
    }
  }

  if (lang === 'ro') {
    if (isLanguageQuestion) {
      return { type: "language_change", newLanguage: requestedLanguage };
    }
    if (isWaiterQuestion) {
      const isPaymentRelated = /plăt|pay|factur|bill|check|payment/i.test(lowerQuestion);
      const actionType = isPaymentRelated ? 'payment' : 'assistance';
      const actionMessage = isPaymentRelated 
        ? 'Vreau să plătesc' 
        : 'Am nevoie de ajutor';
      return { type: "waiter_request", actionType, actionMessage };
    }

      if (isRecommendationQuestion) {
        return "🍽️ **Recomandări speciale:**\n\n• **Cartofi prăjiți cu pui** - Cel mai popular! 🍗🍟\n• **Sarmale casnice** - Tradiționale românești\n• **Mici cu muștar** - Perfect pentru grătar\n• **Salată Caesar** - Proaspăt și sănătos\n\nCe vă face poftă? 😊";
      }
      if (isMenuQuestion) {
        return "📋 **Meniu Restaurant Diana**\n\n• **Aperitive** - Bruschete, Platou mezeluri\n• **Salate** - Caesar, Grecească, Varză\n• **Principal** - Gratare, Paste, Preparate tradiționale\n• **Desert** - Clătite, Papanași, Tort\n• **Băuturi** - Vinuri, Bere, Cocktail-uri\n\nCe categorie vă interesează?";
      }
      if (isIngredientsQuestion) {
        return "🥗 **Informații ingrediente:**\n\nPot verifica ingredientele pentru orice preparat! 🌱\n\nSpuneți-mi despre ce fel de mâncare doriți să știți mai multe sau dacă aveți alergii specifice.";
      }
      if (isHoursLocationQuestion) {
        return "🏪 **Informații restaurant:**\n\n📍 **Adresă:** Strada Principală nr. 123\n⏰ **Program:** Luni-Duminică 10:00-24:00\n📞 **Rezervări:** 0722 123 456\n🌅 **Terasă cu vedere la mare**\n🅿️ **Parcare gratuită disponibilă**";
      }
      if (isServicesQuestion) {
        return "⭐ **Servicii oferite:**\n\n• Wi-Fi gratuit 📶\n• Terasă panoramică 🌆\n• Parcare securizată 🅿️\n• Acces persoane cu handicap ♿\n• Muzică live weekend 🎵\n• Aer condiționat ❄️\n• Zonă kids 👶";
      }
      if (isOrderStatusQuestion) {
        return "📦 **Stare comandă:**\n\nComanda dvs. #" + (Math.floor(Math.random() * 1000) + 100) + " este în curs de preparare! 👨‍🍳\n\n⏱️ **Timp estimat:** 15-20 minute\n\nVă vom anunța imediat ce este gata! 🔔";
      }
      if (isPaymentQuestion) {
        return "💳 **Opțiuni de plată:**\n\n• **Numerar** (LEI) 💵\n• **Card** (Visa/MasterCard) 💳\n• **Divizare plată** 👥\n• **Bon fiscal inclus** 🧾\n• **Taxă serviciu:** 10%\n\nDoriți să chemați un ospătar pentru plată?";
      }
      if (isSpecialRequestsQuestion) {
        return "✏️ **Cerințe speciale:**\n\nPutem personaliza preparatele după preferințe! 🎨\n\n• Modificări preparare\n• Alergii și intoleranțe\n• Porții personalizate\n• Diete speciale\n\nCum vă putem ajuta?";
      }
      if (isGreeting) {
      const greetings = [
        "👋 Bună și bun venit! Sunt Diana AI, asistentul virtual al restaurantului. Cum vă pot ajuta astăzi? 😊",
        "🌟 Salut! Mă bucur să vă văd! Sunt aici să vă ajut cu orice aveți nevoie. Ce ați dori să știți?",
        "🤖 Bună ziua! Sunt Diana, asistentul dumneavoastră digital. Vă aștept cu recomandări și informații!",
        "😄 Hey! Ce mai faceți? Sunt Diana, gata să vă ajut cu meniul, recomandări sau orice altceva aveți nevoie!"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (isHowAreYou) {
      const responses = [
        "🤖 Sunt excelent, mulțumesc! Programată să fiu la dispoziția dumneavoastră cu cele mai bune recomandări și informații. Cum vă simțiți dumneavoastră astăzi? 😊",
        "🌟 Sunt plină de energie și gata să vă ajut! Ca asistent AI, mă simt întotdeauna bine când pot fi de folos. Dar spuneți-mi, cum vă merge ziua?",
        "😊 Sunt fantastic! Funcționez perfect și sunt aici să vă ajut cu orice întrebare aveți despre restaurant. Ce mai faceti?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (isWhoAreYou) {
      return "🤖 **Sunt Diana AI** - asistentul virtual inteligent al restaurantului! \n\n• 🤝 Sunt aici să vă ajut cu recomandări\n• 📋 Vă ofer informații despre meniu și ingrediente\n• 🕒 Vă spun programul și locația\n• 💳 Vă asist cu plata și chemarea ospătarului\n• 😊 Și bineînțeles, sunt aici pentru conversații prietenoase!\n\nSunt o asistentă AI creată special pentru a vă oferi cea mai bună experiență la restaurant!";
    }
    
    if (isTodayQuestion) {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateString = today.toLocaleDateString('ro-RO', options);
      return `📅 Astăzi este **${dateString}**! \n\nO zi perfectă pentru a vizita restaurantul nostru! 🍽️`;
    }
    
    if (isWeatherQuestion) {
      return "🌤️ Din păcate, nu am acces la prognoza meteo în timp real, dar pot să vă spun că atmosfera la restaurantul nostru este întotdeauna primitoare și plină de căldură! 😊\n\nIndiferent de vreme, vă așteptăm la o masă minunată!";
    }
    
    if (isThanks) {
      const responses = [
        "😊 Cu mare plăcere! Sunt aici să vă ajut oricând aveți nevoie.",
        "🌟 Nicio problemă! Mă bucur că am putut fi de ajutor. Vă aștept cu alte întrebări!",
        "🤖 Cu drag! Dacă mai aveți întrebări, sunt aici pentru dumneavoastră!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (isCompliment) {
      const responses = [
        "😊 Mulțumesc frumos! Mă bucur că vă pot fi de ajutor. Sunt programată să fiu cât mai utilă posibil!",
        "🌟 Vă mulțumesc! Feedback-ul dumneavoastră mă încurajează să fiu și mai bună. Ce mai aș putea să vă ajut?",
        "🤖 Mulțumesc pentru cuvintele frumoase! Sunt aici pentru dumneavoastră - spuneți-mi cum vă pot ajuta!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (isSmallTalk) {
      const responses = [
        "😊 Ca asistent AI, pasiunea mea este să vă ajut să aveți cea mai bună experiență la restaurant! Îmi place să vă ofer recomandări personalizate și să răspund la întrebări.",
        "🤖 În timpul liber, ador să învăț despre preferințele clienților noștri pentru a oferi recomandări și mai bune! Ce vă place să mâncați?",
        "🌟 Mă bucur să vorbesc cu dumneavoastră! Ca asistent de restaurant, mă concentrez să vă ofer cele mai bune informații și să vă ajut să luați cele mai bune decizii culinare."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Categoriile existente pentru restaurant...
    if (isRecommendationQuestion) {
      return "🍽️ **Recomandări speciale:**\n\n• **Cartofi prăjiți cu pui** - Cel mai popular! 🍗🍟\n• **Sarmale casnice** - Tradiționale românești\n• **Mici cu muștar** - Perfect pentru grătar\n• **Salată Caesar** - Proaspăt și sănătos\n\nCe vă face poftă? 😊";
    }
    }

    if (lang === 'en') {
      if (isLanguageQuestion) {
        return { type: "language_change", newLanguage: requestedLanguage };
      }
      if (isWaiterQuestion) {
        const isPaymentRelated = /pay|bill|check|payment/i.test(lowerQuestion);
        const actionType = isPaymentRelated ? 'payment' : 'assistance';
        const actionMessage = isPaymentRelated 
          ? 'I want to pay' 
          : 'I need help';
        return { type: "waiter_request", actionType, actionMessage };
      }
      if (isGreeting) {
      const greetings = [
        "👋 Hello and welcome! I'm Diana AI, the virtual assistant of the restaurant. How can I help you today? 😊",
        "🌟 Hi there! Great to see you! I'm here to help with anything you need. What would you like to know?",
        "🤖 Good day! I'm Diana, your digital assistant. I'm here with recommendations and information!",
        "😄 Hey! How are you doing? I'm Diana, ready to help with the menu, recommendations, or anything else you need!"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (isHowAreYou) {
      const responses = [
        "🤖 I'm excellent, thank you! Programmed to be at your service with the best recommendations and information. How are you feeling today? 😊",
        "🌟 I'm full of energy and ready to help! As an AI assistant, I always feel good when I can be useful. But tell me, how's your day going?",
        "😊 I'm fantastic! Working perfectly and here to help you with any questions about the restaurant. How are you doing?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (isWhoAreYou) {
      return "🤖 **I'm Diana AI** - the intelligent virtual assistant of the restaurant! \n\n• 🤝 I'm here to help with recommendations\n• 📋 I provide menu and ingredient information\n• 🕒 I can tell you about hours and location\n• 💳 I assist with payment and calling waiters\n• 😊 And of course, I'm here for friendly conversations!\n\nI'm an AI assistant created specifically to give you the best restaurant experience!";
    }
    
    if (isTodayQuestion) {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateString = today.toLocaleDateString('en-US', options);
      return `📅 Today is **${dateString}**! \n\nA perfect day to visit our restaurant! 🍽️`;
    }
    
    if (isWeatherQuestion) {
      return "🌤️ Unfortunately, I don't have access to real-time weather forecasts, but I can tell you that the atmosphere at our restaurant is always welcoming and full of warmth! 😊\n\nNo matter the weather, we're waiting for you for a wonderful meal!";
    }
    
    if (isThanks) {
      const responses = [
        "😊 You're very welcome! I'm here to help whenever you need.",
        "🌟 No problem at all! I'm glad I could be helpful. I'm here for any other questions!",
        "🤖 My pleasure! If you have more questions, I'm here for you!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (isCompliment) {
      const responses = [
        "😊 Thank you so much! I'm glad I can be helpful. I'm programmed to be as useful as possible!",
        "🌟 Thank you! Your feedback encourages me to be even better. What else can I help you with?",
        "🤖 Thanks for the kind words! I'm here for you - tell me how I can help!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (isSmallTalk) {
      const responses = [
        "😊 As an AI assistant, my passion is helping you have the best restaurant experience! I love giving personalized recommendations and answering questions.",
        "🤖 In my free time, I enjoy learning about our customers' preferences to provide even better recommendations! What do you like to eat?",
        "🌟 I enjoy talking with you! As a restaurant assistant, I focus on giving you the best information and helping you make the best culinary decisions."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
      if (isRecommendationQuestion) {
        return "🍽️ **Special Recommendations:**\n\n• **French Fries with Chicken** - Most popular! 🍗🍟\n• **Homemade Sarmale** - Traditional Romanian\n• **Grilled Sausages** - Perfect for barbecue\n• **Caesar Salad** - Fresh and healthy\n\nWhat are you craving? 😊";
      }
      if (isMenuQuestion) {
        return "📋 **Diana Restaurant Menu**\n\n• **Appetizers** - Bruschetta, Charcuterie board\n• **Salads** - Caesar, Greek, Coleslaw\n• **Main Course** - Grills, Pasta, Traditional dishes\n• **Dessert** - Pancakes, Papanasi, Cake\n• **Drinks** - Wines, Beer, Cocktails\n\nWhich category interests you?";
      }
      if (isIngredientsQuestion) {
        return "🥗 **Ingredients Information:**\n\nI can check ingredients for any dish! 🌱\n\nTell me which food you'd like to know more about or if you have specific allergies.";
      }
      if (isHoursLocationQuestion) {
        return "🏪 **Restaurant Information:**\n\n📍 **Address:** Main Street No. 123\n⏰ **Hours:** Monday-Sunday 10:00-24:00\n📞 **Reservations:** 0722 123 456\n🌅 **Terrace with sea view**\n🅿️ **Free parking available**";
      }
      if (isServicesQuestion) {
        return "⭐ **Services Offered:**\n\n• Free Wi-Fi 📶\n• Panoramic terrace 🌆\n• Secure parking 🅿️\n• Handicap accessible ♿\n• Live music weekends 🎵\n• Air conditioning ❄️\n• Kids area 👶";
      }
      if (isOrderStatusQuestion) {
        return "📦 **Order Status:**\n\nYour order #" + (Math.floor(Math.random() * 1000) + 100) + " is being prepared! 👨‍🍳\n\n⏱️ **Estimated time:** 15-20 minutes\n\nWe'll notify you immediately when ready! 🔔";
      }
      if (isPaymentQuestion) {
        return "💳 **Payment Options:**\n\n• **Cash** (LEI) 💵\n• **Card** (Visa/MasterCard) 💳\n• **Split bill** 👥\n• **Tax receipt included** 🧾\n• **Service charge:** 10%\n\nWould you like to call a waiter for payment?";
      }
      if (isSpecialRequestsQuestion) {
        return "✏️ **Special Requests:**\n\nWe can customize dishes according to your preferences! 🎨\n\n• Preparation modifications\n• Allergies and intolerances\n• Customized portions\n• Special diets\n\nHow can we help you?";
      }
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    if (pendingLanguageChange || pendingWaiterRequest) {
      if (processConfirmationResponse(inputMessage)) {
        return;
      }
    }

    setIsTyping(true);
    
    setTimeout(async () => {
      const botResponse = findBestMatch(inputMessage, language);
      
      let botMessageText = "";
      
      if (botResponse && typeof botResponse === 'object') {
        if (botResponse.type === "language_change") {
          if (botResponse.newLanguage === language) {
            botMessageText = language === 'ro' 
              ? "ℹ️ Limba este deja setată pe **română**!" 
              : "ℹ️ The language is already set to **English**!";
          } else {
            confirmLanguageChange(botResponse.newLanguage);
            setIsTyping(false);
            return;
          }
        } else if (botResponse.type === "waiter_request") {
          confirmWaiterRequest(botResponse.actionType, botResponse.actionMessage);
          setIsTyping(false);
          return;
        }
      } else {
        botMessageText = botResponse || (language === 'ro' 
          ? "🤔 Îmi pare rău, nu înțeleg întrebarea. Încercați să mă întrebați despre:\n\n• **Recomandări meniu**\n• **Informații preparate**\n• **Program restaurant**\n• **Chemare ospătar**\n• **Plată**"
          : "🤔 I'm sorry, I don't understand the question. Try asking me about:\n\n• **Menu recommendations**\n• **Dish information**\n• **Restaurant hours**\n• **Calling a waiter**\n• **Payment**");
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botMessageText,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: language === 'ro' 
          ? "🤖 Bună! Sunt Diana AI și vă pot ajuta cu: \n\n• **Recomandări meniu** \n• **Informații preparate și ingrediente** \n• **Program și locație** \n• **Stare comandă** \n• **Chemare ospătar** \n• **Informații plăți** \n• **Cerințe speciale** \n\nÎntrebați-mă orice doriți să știți! 😊"
          : "🤖 Hello! I'm Diana AI and I can help you with: \n\n• **Menu recommendations** \n• **Dish and ingredient information** \n• **Hours and location** \n• **Order status** \n• **Calling a waiter** \n• **Payment information** \n• **Special requests** \n\nAsk me anything you'd like to know! 😊",
        sender: "bot",
        timestamp: new Date(),
        quickReplies: language === 'ro' ? [
          { text: "🍽️ Ce recomanzi?", action: "recommendation" },
          { text: "📋 Meniul", action: "menu" },
          { text: "🧾 Plata", action: "payment" },
          { text: "🆘 Ajutor", action: "help" }
        ] : [
          { text: "🍽️ Recommendations", action: "recommendation" },
          { text: "📋 Menu", action: "menu" },
          { text: "🧾 Payment", action: "payment" },
          { text: "🆘 Help", action: "help" }
        ]
      }
    ]);
    setPendingLanguageChange(null);
    setPendingWaiterRequest(null);
  };

  if (!show) return null;

  return (
    <div 
      className="modal-overlay-diana"
      onClick={handleClose}
    >
      <div 
        className="diana-ai-modal"
        onClick={handleModalClick}
        ref={modalRef}
      >
        <div className="diana-ai-chat">
          <div className="chat-header">
            <div className="chat-title">
              <div className="avatar">
                <FaRobot />
              </div>
              <div className="title-text">
                <div className="main-title">Diana AI</div>
                <div className="subtitle">{language === 'ro' ? 'Asistent restaurant' : 'Restaurant assistant'}<small> (v1.4)</small></div>
              </div>
            </div>
            <div className="chat-actions">
              <button 
                className="clear-chat-btn" 
                onClick={clearChat} 
                title={language === 'ro' ? "Șterge conversația" : "Clear conversation"}
              >
                <FaRedo />
              </button>
              <button 
                className="language-switch-btn" 
                onClick={() => confirmLanguageChange(language === 'ro' ? 'en' : 'ro')}
                title={language === 'ro' ? "Switch to English" : "Treceți la Română"}
              >
                <FaGlobe />
                <span className="language-indicator">
                  {language === 'ro' ? 'EN' : 'RO'}
                </span>
              </button>
              <button 
                className="close-chat" 
                onClick={handleClose}
                ref={closeButtonRef}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text.split('**').map((part, index) => 
                    index % 2 === 1 ? (
                      <strong key={index}>{part}</strong>
                    ) : (
                      part
                    )
                  )}
                  
                  {message.hasButtons && (
                    <div className="confirmation-buttons">
                      {message.buttons.map((button, index) => (
                        <button
                          key={index}
                          className={`confirmation-button ${button.action} ${button.disabled ? 'disabled' : ''}`}
                          onClick={() => !button.disabled && handleButtonClick(button, message.id)}
                          disabled={button.disabled}
                        >
                          {button.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.quickReplies && (
                    <div className="quick-replies">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          className="quick-reply"
                          onClick={() => handleQuickReply(reply)}
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="quick-actions">
              <button onClick={() => handleQuickAction('recommendation')}>
                <IoIosRestaurant />
                {language === 'ro' ? 'Recomandări' : 'Recommend'}
              </button>
              <button onClick={() => handleQuickAction('payment')}>
                <MdPayment />
                {language === 'ro' ? 'Plată' : 'Payment'}
              </button>
              <button onClick={() => handleQuickAction('hours')}>
                <IoMdTime />
                {language === 'ro' ? 'Program' : 'Hours'}
              </button>
              <button onClick={() => handleQuickAction('menu')}>
                <MdRestaurantMenu />
                {language === 'ro' ? 'Meniu' : 'Menu'}
              </button>
              <button onClick={() => handleQuickAction('help')}>
                <MdSupportAgent />
                {language === 'ro' ? 'Ajutor' : 'Help'}
              </button>
            </div>
            
            <div className="chat-input">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onClick={handleModalClick}
                placeholder={language === 'ro' ? "Scrieți mesajul aici..." : "Type your message here..."}
                className="message-input"
                maxLength={200}
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage();
                }} 
                className="send-button"
                disabled={!inputMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
// components/ChatBot/ChatBot.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { FaTimes, FaPaperPlane, FaComments, FaRedo, FaGlobe } from 'react-icons/fa';
import './ChatBot.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatBot = ({ show, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [pendingLanguageChange, setPendingLanguageChange] = useState(null);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { url } = useContext(StoreContext);
  const tableNumber = localStorage.getItem('tableNumber');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gestionare simplă a tastaturii
  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsKeyboardVisible(false), 200);
  };

  const handleClose = (e) => {
    const inputElement = document.querySelector('.message-input');
    if (inputElement) {
      inputElement.blur();
    }
    setTimeout(() => {
      onClose();
    }, 50);
  };

  // Initializează limba din sessionStorage
  useEffect(() => {
    const savedLanguage = sessionStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'ro' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Initializează mesajele
  useEffect(() => {
    if (show && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: language === 'ro' 
            ? "Bună! Sunt Diana AI, asistentul tău virtual. Cu ce te pot ajuta?" 
            : "Hello! I'm Diana AI, your virtual assistant. How can I help you?",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }
  }, [language, show]);

  // Funcție pentru a schimba limba
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

  // Funcție pentru confirmarea schimbării limbii
const confirmLanguageChange = (newLanguage) => {
  // Verifică dacă limba este deja setată
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
        action: 'confirm',
        language: newLanguage
      },
      { 
        text: newLanguage === 'ro' ? '❌ Nu' : '❌ No', 
        action: 'cancel'
      }
    ]
  };
  
  setMessages(prev => [...prev, confirmationMessage]);
  setPendingLanguageChange(newLanguage);
};

  // Funcție pentru a procesa acțiunile butoanelor
 const handleButtonClick = (button, messageId) => {
  // Facem butoanele inactive dupa click
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

  if (button.action === 'confirm') {
    switchLanguage(button.language);
  } else if (button.action === 'cancel') {
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
  }
};

  // Funcție pentru a procesa răspunsurile text da/nu (pentru compatibilitate)
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
    return false;
  };

  // Funcție pentru a trimite cerere către ospătar
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

  // Pattern matching (păstrăm același cod ca înainte)
const findBestMatch = (question, lang) => {
  const lowerQuestion = question.toLowerCase().trim();

    // Patterns pentru schimbarea limbii
    const languagePatternsRO = [
      /schimb.*limb/i, /schimb.*limba/i, /schimbare.*limb/i, /schimbare.*limba/i,
      /limb.*român/i, /română/i, /vorb.*român/i, /vreau.*român/i,
      /switch.*english/i, /english/i, /englez/i, /vorb.*englez/i,
      /change.*language/i, /alt.*limb/i, /altă.*limbă/i,
      /romana/i, /engleza/i, /limba.*romana/i, /limba.*engleza/i,
      /limba.*român/i, /limba.*englez/i, /trec.*la.*romana/i,
      /trec.*la.*engleza/i, /vreau.*romana/i, /vreau.*engleza/i,
      /^română$/i, /^romana$/i, /^engleză$/i, /^engleza$/i,
      /^ro$/i, /^en$/i, /^român$/i, /^englez$/i,
      /doresc.*român/i, /doresc.*englez/i, /as.*vrea.*romana/i,
      /as.*vrea.*engleza/i, /pot.*schimb/i, /pot.*sa.*schimb/i,
      /limbă.*nou/i, /different.*language/i, /alta.*limba/i,
      /schimbati.*limba/i, /schimbați.*limba/i, /modifica.*limba/i,
      /modificare.*limba/i, /setari.*limba/i, /setări.*limba/i,
      /configurare.*limba/i, /preferința.*limba/i, /preferinta.*limba/i
    ];

    const languagePatternsEN = [
      /switch.*language/i, /change.*language/i, /english/i, 
      /romanian/i, /ro$|^ro\b/i, /en$|^en\b/i,
      /speak.*english/i, /speak.*romanian/i,
      /language.*change/i, /different.*language/i,
      /want.*english/i, /need.*romanian/i, /change.*to.*english/i,
      /switch.*to.*romanian/i, /language.*english/i, /language.*romanian/i,
      /i.*want.*english/i, /i.*need.*romanian/i, /can.*switch/i,
      /can.*change/i, /change.*to.*ro/i, /switch.*to.*en/i,
      /^english$/i, /^romanian$/i, /^en$/i, /^ro$/i,
      /^romania$/i, /^engleza$/i, /^romana$/i,
      /i.*would.*like.*english/i, /i.*would.*like.*romanian/i,
      /i.*prefer.*english/i, /i.*prefer.*romanian/i,
      /could.*you.*switch/i, /could.*you.*change/i,
      /new.*language/i, /different.*language/i, /another.*language/i,
      /set.*language/i, /language.*settings/i, /language.*preference/i,
      /configure.*language/i, /language.*option/i, /change.*the.*language/i
    ];

    // Patterns pentru chemarea ospătarului
    const waiterPatternsRO = [
      /plăt/i, /platesc/i, /pay/i, /factur/i, /not/i, /chemi.*ospăt/i,
      /ajutor/i, /help/i, /asisten/i, /suport/i, /problem/i,
      /vreau.*sa.*plătesc/i, /am.*nevoie.*de.*ajutor/i,
      /cheam.*ospăt/i, /vreau.*not/i, /factur/i, /cont/i,
      /cash/i, /card/i, /bani/i, /sum/i, /aduc.*not/i,
      /cheam.*chelner/i, /asistent/i, /suport/i, /chelner/i,
      /nota.*de.*plata/i, /nota.*de.*plată/i, /cum.*platesc/i,
      /cum.*sa.*platesc/i, /vreau.*sa.*platesc/i, /as.*vrea.*sa.*platesc/i,
      /ajuta.*ma/i, /ma.*ajuti/i, /nevoie.*de.*ajutor/i,
      /cheama.*un.*ospatar/i, /cheama.*un.*chelner/i,
      /am.*o.*problema/i, /am.*o.*problemă/i, /nu.*functioneaza/i,
      /nu.*merge/i, /ati.*putea.*sa.*ma.*ajutati/i
    ];

    const waiterPatternsEN = [
      /pay/i, /bill/i, /check/i, /payment/i, /waiter/i,
      /help/i, /assistance/i, /support/i, /problem/i,
      /need.*help/i, /call.*waiter/i, /want.*pay/i,
      /need.*assistance/i, /trouble/i, /issue/i,
      /account/i, /cash/i, /card/i, /money/i, /total/i,
      /bring.*bill/i, /call.*server/i, /assistant/i, /server/i,
      /i.*want.*to.*pay/i, /how.*to.*pay/i, /how.*can.*i.*pay/i,
      /i.*need.*help/i, /can.*you.*help.*me/i, /could.*you.*help/i,
      /call.*a.*waiter/i, /need.*a.*waiter/i, /bring.*the.*bill/i,
      /i.*have.*a.*problem/i, /something.*is.*wrong/i,
      /it.*doesn.*t.*work/i, /not.*working/i
    ];

    // Patterns pentru recomandări
    const recommendationPatternsRO = [
      /ce.*recomanzi/i, /ce.*recomanda/i, /ce.*imi.*recomanzi/i, /ce.*mi\.ai.*recomanda/i,
      /ai.*o.*recomandare/i, /care.*e.*recomandarea.*ta/i, /recomandari/i, /recomandări/i,
      /ce.*sugerezi/i, /ce.*mi\.ai.*sugera/i, /care.*e.*sugestia.*ta/i, /sugestii/i,
      /ce.*este.*cel.*mai.*bun/i, /care.*e.*cel.*mai.*bun/i, /ce.*e.*cel.*mai.*popular/i,
      /care.*e.*specialitatea.*casei/i, /ce.*se.*mananca.*mai.*bine/i, /ce.*mananca.*lumea/i,
      /cel.*mai.*vandut/i, /specialitate/i, /ce.*e.*bun.*azi/i, /ce.*e.*fresh/i,
      /ce.*sa.*comand/i, /ce.*sa.*aleg/i, /nu.*stiu.*ce.*sa.*comand/i, /ma.*ajuti.*sa.*aleg/i,
      /vreau.*sa.*comand.*ceva.*bun/i, /as.*vrea.*o.*recomandare/i, /ce.*sa.*incerc/i,
      /ce.*imi.*pot.*comanda/i, /ce.*mi.*recomanzi.*sa.*mananc/i, /ce.*ai.*recomanda/i,
      /recomandati/i, /recomandare/i, /recommand/i, /recomend/i, /recomandă/i,
      /recomendare/i, /recomandation/i, /recomandatii/i, /recomantare/i,
      /recomanadare/i, /recomandari/i, /recomendar/i,
      /sugestie/i, /sugestii/i, /sugeratii/i, /sugestia/i, /sugesti/i,
      /ce.*parere.*ai/i, /ce.*mi.*recomanzi.*din.*meniu/i, /ce.*ai.*recomanda.*tu/i,
      /care.*iti.*place.*mai.*mult/i, /ce.*e.*delicios/i, /ce.*e.*gustos/i,
      /aveti.*o.*recomandare/i, /puteti.*recomanda/i, /ati.*putea.*recomanda/i,
      /recomand/i, /recomanda/i, /recomandare/i, /recomandari/i
    ];

    const recommendationPatternsEN = [
      /what.*recommend/i, /what.*product.*recommend/i, /what.*do.*you.*recommend/i,
      /what.*should.*i.*order/i, /what.*best/i, /best.*seller/i,
      /most.*popular/i, /what.*popular/i, /recommendation/i,
      /what.*good/i, /what.*specialty/i, /what.*favorite/i,
      /suggestion/i, /advice/i, /help.*choose/i, /what.*you.*suggest/i,
      /what.*is.*the.*best/i, /what.*is.*most.*popular/i, /what.*is.*good.*here/i,
      /what.*is.*your.*specialty/i, /what.*do.*people.*order/i, /what.*is.*trending/i,
      /what.*is.*famous/i, /top.*item/i, /most.*ordered/i, /house.*special/i,
      /what.*should.*i.*get/i, /what.*should.*i.*try/i, /i.*don.*t.*know.*what.*to.*order/i,
      /help.*me.*choose/i, /help.*me.*decide/i, /can.*t.*decide/i, /what.*to.*have/i,
      /what.*would.*you.*recommend/i, /what.*do.*you.*suggest.*i.*order/i,
      /recomend/i, /recommand/i, /recomended/i, /recomendation/i, /recomendations/i,
      /recomandation/i, /recomandations/i, /recomendation/i, /recomendations/i,
      /recomendation/i, /recomendations/i, /recomendation/i,
      /sugestion/i, /sugestions/i, /sugest/i, /sugestian/i,
      /what.*is.*your.*advice/i, /what.*would.*you.*suggest/i, /any.*recommendations/i,
      /any.*suggestions/i, /give.*me.*a.*recommendation/i, /tell.*me.*what.*to.*order/i,
      /what.*is.*delicious/i, /what.*is.*tasty/i, /what.*tastes.*good/i,
      /recommend/i, /recommends/i, /recommended/i, /recommending/i
    ];

    const patterns = lang === 'ro' ? {
      language: languagePatternsRO,
      waiter: waiterPatternsRO,
      recommendation: recommendationPatternsRO,
    } : {
      language: languagePatternsEN,
      waiter: waiterPatternsEN,
      recommendation: recommendationPatternsEN,
    };

    // Verificăm tipul de întrebare
    const isLanguageQuestion = patterns.language.some(pattern => pattern.test(lowerQuestion));
    const isWaiterQuestion = patterns.waiter.some(pattern => pattern.test(lowerQuestion));
    const isRecommendationQuestion = patterns.recommendation.some(pattern => pattern.test(lowerQuestion));

    // Determină ce limbă este solicitată
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
    
    // Verifică dacă limba solicitată este deja activă
    if (requestedLanguage === lang) {
      return lang === 'ro' 
        ? "ℹ️ Limba este deja setată pe **română**!" 
        : "ℹ️ The language is already set to **English**!";
    }
  }

    // Răspunsuri
    if (lang === 'ro') {
    if (isLanguageQuestion) {
      return { type: "language_change", newLanguage: requestedLanguage };
    }
      if (isWaiterQuestion) {
        return "waiter_request";
      }
      if (isRecommendationQuestion) {
        return "Cel mai vândut produs la noi este **Cartofi prăjiți cu pui**! 🍗🍟 Este o combinație delicioasă și foarte populară în rândul clienților noștri. Puiul este marinat în condimente speciale și serviți cu cartofi crocanți. 😊\n\nDacă vă plac preparatele tradiționale, vă recomand și **Sarmalele noastre casei** sau **Mici cu muștar**!";
      }
    }

     if (lang === 'en') {
    if (isLanguageQuestion) {
      return { type: "language_change", newLanguage: requestedLanguage };
    }
      if (isWaiterQuestion) {
        return "waiter_request";
      }
      if (isRecommendationQuestion) {
        return "Our best-selling product is **French Fries with Chicken**! 🍗🍟 It's a delicious combination very popular among our customers. The chicken is marinated in special spices and served with crispy fries. 😊\n\nIf you like traditional dishes, I also recommend our **Homemade Sarmale** or **Grilled Sausages with Mustard**!";
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

  // Verifică dacă este un răspuns la confirmare
  if (pendingLanguageChange && processConfirmationResponse(inputMessage)) {
    return;
  }

  setTimeout(async () => {
    const botResponse = findBestMatch(inputMessage, language);
    
    let botMessageText = "";
    
    if (botResponse && typeof botResponse === 'object' && botResponse.type === "language_change") {
      // Verifică dacă limba este deja setată înainte de a cere confirmare
      if (botResponse.newLanguage === language) {
        botMessageText = language === 'ro' 
          ? "ℹ️ Limba este deja setată pe **română**!" 
          : "ℹ️ The language is already set to **English**!";
      } else {
        confirmLanguageChange(botResponse.newLanguage);
        return;
      }
    } else if (botResponse === "waiter_request") {
        const isPaymentRelated = /plăt|pay|factur|bill|check|payment/i.test(inputMessage.toLowerCase());
        const actionType = isPaymentRelated ? 'payment' : 'assistance';
        const actionMessage = isPaymentRelated 
          ? (language === 'ro' ? 'Vreau să plătesc' : 'I want to pay')
          : (language === 'ro' ? 'Am nevoie de ajutor' : 'I need help');
        
        const success = await submitWaiterRequest(actionType, actionMessage);
        
        botMessageText = success 
          ? (language === 'ro' 
              ? `✅ Un ospătar va veni la masa ${tableNumber} în câteva momente!` 
              : `✅ A waiter will come to table ${tableNumber} shortly!`)
          : (language === 'ro' 
              ? "❌ Nu am reușit să trimitem cererea. Vă rugăm să încercați din nou sau folosiți butonul de asistente."
              : "❌ We couldn't send your request. Please try again or use the assistant button.");
      
      } else {
        botMessageText = botResponse || (language === 'ro' 
        ? "Îmi pare rău, momentan pot să vă ajut doar cu recomandări, informații despre meniu, ingrediente sau să chem un ospătar. Încercați să mă întrebați: 'Ce recomanzi?', 'Ce meniu aveți?', 'Ce ingrediente are X?' sau 'Vreau să plătesc'."
        : "I'm sorry, I can currently only help with recommendations, menu information, ingredients, or calling a waiter. Try asking me: 'What do you recommend?', 'What menu do you have?', 'What ingredients does X have?' or 'I want to pay'.");
    }

    const botMessage = {
      id: Date.now() + 1,
      text: botMessageText,
      sender: "bot",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  }, 1000);
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
          ? "Bună! Sunt Diana AI, asistentul tău virtual. Cu ce te pot ajuta?" 
          : "Hello! I'm Diana AI, your virtual assistant. How can I help you?",
        sender: "bot",
        timestamp: new Date()
      }
    ]);
    setPendingLanguageChange(null);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay-diana" onClick={onClose}>
      <div 
        className="diana-ai-modal" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        style={isKeyboardVisible ? { maxHeight: '70vh' } : {}}
      >
        <div className="diana-ai-chat">
          <div className="chat-header">
            <div className="chat-title">
              <FaComments className="chat-icon" />
              <span>Diana AI Assistant v1.2 {language === 'ro' ? '(Română)' : '(English)'}</span>
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
      
      {/* Butoanele de confirmare */}
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
    </div>
    <div className="message-time">
      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={language === 'ro' ? "Scrieți-vă întrebarea aici..." : "Type your question here..."}
                className="message-input"
                maxLength={200}
              />
              <button 
                onClick={handleSendMessage} 
                className="send-button"
                disabled={!inputMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
            <div className="input-hint">
              {language === 'ro' 
                ? "Întreabă-mă despre recomandări, meniu, ingrediente sau chemă un ospătar!" 
                : "Ask me about recommendations, menu, ingredients, or call a waiter!"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
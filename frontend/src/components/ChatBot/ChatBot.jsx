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
  const messagesEndRef = useRef(null);
  const { url } = useContext(StoreContext);
  const tableNumber = localStorage.getItem('tableNumber');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          id: Date.now(), // Folosește timestamp pentru ID unic
          text: language === 'ro' 
            ? "Bună! Sunt Diana AI, asistentul tău virtual. Cu ce te pot ajuta?" 
            : "Hello! I'm Diana AI, your virtual assistant. How can I help you?",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }
  }, [language, show]);

  // Funcție pentru a schimba limba fără a traduce mesajele existente
  const switchLanguage = () => {
    const newLanguage = language === 'ro' ? 'en' : 'ro';
    
    // Schimbă doar limba, fără a modifica mesajele existente
    setLanguage(newLanguage);
    sessionStorage.setItem('language', newLanguage);
    
    // Adaugă un mesaj informativ despre schimbarea limbii
    const infoMessage = {
      id: Date.now(), // ID unic
      text: newLanguage === 'ro' 
        ? "🌍 Limba a fost schimbată în română. Noile mesaje vor fi în această limbă." 
        : "🌍 Language switched to English. New messages will be in this language.",
      sender: "bot",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, infoMessage]);
    
    toast.success(newLanguage === 'ro' 
      ? 'Limba a fost schimbată în română!' 
      : 'Language switched to English!');
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

  // Pattern matching extins și completat
  const findBestMatch = (question, lang) => {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Patterns pentru schimbarea limbii
    const languagePatternsRO = [
      /schimb.*limb/i, /limb.*român/i, /română/i, /vorb.*român/i,
      /switch.*english/i, /english/i, /englez/i, /vorb.*englez/i,
      /change.*language/i, /alt.*limb/i, /altă.*limbă/i,
      /doresc.*român/i, /vreau.*englez/i, /limba.*român/i,
      /trec.*la.*român/i, /trec.*la.*englez/i, /limbă.*englez/i,
      /romana/i, /engleza/i, /limba.*engleza/i, /limba.*romana/i
    ];

    const languagePatternsEN = [
      /switch.*language/i, /change.*language/i, /english/i, 
      /romanian/i, /ro$|^ro\b/i, /en$|^en\b/i,
      /speak.*english/i, /speak.*romanian/i,
      /language.*change/i, /different.*language/i,
      /want.*english/i, /need.*romanian/i, /change.*to.*english/i,
      /switch.*to.*romanian/i, /language.*english/i, /language.*romanian/i,
      /i.*want.*english/i, /i.*need.*romanian/i
    ];

    // Patterns pentru chemarea ospătarului (extinse)
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

    // Patterns pentru recomandări (COMPLET EXTINSE)
    const recommendationPatternsRO = [
      // Forme directe și corecte
      /ce.*recomanzi/i, /ce.*recomanda/i, /ce.*imi.*recomanzi/i, /ce.*mi\.ai.*recomanda/i,
      /ai.*o.*recomandare/i, /care.*e.*recomandarea.*ta/i, /recomandari/i, /recomandări/i,
      /ce.*sugerezi/i, /ce.*mi\.ai.*sugera/i, /care.*e.*sugestia.*ta/i, /sugestii/i,
      
      // Popularitate și "cel mai bun"
      /ce.*este.*cel.*mai.*bun/i, /care.*e.*cel.*mai.*bun/i, /ce.*e.*cel.*mai.*popular/i,
      /care.*e.*specialitatea.*casei/i, /ce.*se.*mananca.*mai.*bine/i, /ce.*mananca.*lumea/i,
      /cel.*mai.*vandut/i, /specialitate/i, /ce.*e.*bun.*azi/i, /ce.*e.*fresh/i,
      
      // Client indecis
      /ce.*sa.*comand/i, /ce.*sa.*aleg/i, /nu.*stiu.*ce.*sa.*comand/i, /ma.*ajuti.*sa.*aleg/i,
      /vreau.*sa.*comand.*ceva.*bun/i, /as.*vrea.*o.*recomandare/i, /ce.*sa.*incerc/i,
      /ce.*imi.*pot.*comanda/i, /ce.*mi.*recomanzi.*sa.*mananc/i, /ce.*ai.*recomanda/i,
      
      // Greșeli comune și variații
      /recomandati/i, /recomandare/i, /recommand/i, /recomend/i, /recomandă/i,
      /recomendare/i, /recomandation/i, /recomandatii/i, /recomantare/i,
      /recomanadare/i, /recomandari/i, /recomendar/i,
      
      // Variații cu "sugestie"
      /sugestie/i, /sugestii/i, /sugeratii/i, /sugestia/i, /sugesti/i,
      
      // Alte formulări
      /ce.*parere.*ai/i, /ce.*mi.*recomanzi.*din.*meniu/i, /ce.*ai.*recomanda.*tu/i,
      /care.*iti.*place.*mai.*mult/i, /ce.*e.*delicios/i, /ce.*e.*gustos/i,
      /aveti.*o.*recomandare/i, /puteti.*recomanda/i, /ati.*putea.*recomanda/i,
      
      // Căutări generale
      /recomand/i, /recomanda/i, /recomandare/i, /recomandari/i
    ];

    const recommendationPatternsEN = [
      // Direct questions
      /what.*recommend/i, /what.*product.*recommend/i, /what.*do.*you.*recommend/i,
      /what.*should.*i.*order/i, /what.*best/i, /best.*seller/i,
      /most.*popular/i, /what.*popular/i, /recommendation/i,
      /what.*good/i, /what.*specialty/i, /what.*favorite/i,
      /suggestion/i, /advice/i, /help.*choose/i, /what.*you.*suggest/i,
      
      // Popularity and best items
      /what.*is.*the.*best/i, /what.*is.*most.*popular/i, /what.*is.*good.*here/i,
      /what.*is.*your.*specialty/i, /what.*do.*people.*order/i, /what.*is.*trending/i,
      /what.*is.*famous/i, /top.*item/i, /most.*ordered/i, /house.*special/i,
      
      // Indecisive customer
      /what.*should.*i.*get/i, /what.*should.*i.*try/i, /i.*don.*t.*know.*what.*to.*order/i,
      /help.*me.*choose/i, /help.*me.*decide/i, /can.*t.*decide/i, /what.*to.*have/i,
      /what.*would.*you.*recommend/i, /what.*do.*you.*suggest.*i.*order/i,
      
      // Common misspellings and variations
      /recomend/i, /recommand/i, /recomended/i, /recomendation/i, /recomendations/i,
      /recomandation/i, /recomandations/i, /recomendation/i, /recomendations/i,
      /recomendation/i, /recomendations/i, /recomendation/i,
      
      // Suggestion variations
      /sugestion/i, /sugestions/i, /sugest/i, /sugestian/i,
      
      // Other formulations
      /what.*is.*your.*advice/i, /what.*would.*you.*suggest/i, /any.*recommendations/i,
      /any.*suggestions/i, /give.*me.*a.*recommendation/i, /tell.*me.*what.*to.*order/i,
      /what.*is.*delicious/i, /what.*is.*tasty/i, /what.*tastes.*good/i,
      
      // General searches
      /recommend/i, /recommends/i, /recommended/i, /recommending/i
    ];

    // Patterns pentru meniu (EXTINSE)
    const menuPatternsRO = [
      /ce.*meniu/i, /ce.*aveti.*meniu/i, /care.*este.*meniul/i,
      /ce.*preparate/i, /ce.*mancaruri/i, /lista.*produse/i,
      /ce.*aveti.*de.*mancare/i, /ce.*optiuni.*aveti/i, /ce.*feluri.*de.*mancare/i,
      /meniu.*complet/i, /carte.*de.*bauturi/i, /lista.*bauturi/i,
      /ce.*aveti.*de.*baut/i, /bauturi/i, /aperitive/i, /deserturi/i,
      /ce.*se.*serveste/i, /ce.*oferiti/i, /ce.*gatiți/i,
      /meniul.*zilei/i, /oferta.*zilei/i, /preparate.*disponibile/i,
      /ce.*pot.*comanda/i, /ce.*exista.*in.*meniu/i, /ce.*aveti.*in.*meniu/i,
      /carte.*alimentara/i, /lista.*preparate/i, /produse.*oferite/i
    ];

    const menuPatternsEN = [
      /menu/i, /what.*menu/i, /what.*dishes/i,
      /what.*food/i, /list.*products/i, /what.*you.*have/i,
      /offer/i, /serve/i, /what.*options.*do.*you.*have/i,
      /what.*kind.*of.*food/i, /complete.*menu/i, /drinks.*menu/i,
      /beverages/i, /appetizers/i, /desserts/i, /main.*courses/i,
      /what.*do.*you.*serve/i, /what.*is.*available/i, /what.*can.*i.*order/i,
      /daily.*menu/i, /today.*special/i, /available.*dishes/i,
      /food.*options/i, /what.*is.*on.*the.*menu/i, /what.*is.*in.*the.*menu/i,
      /dishes.*you.*have/i, /food.*you.*serve/i, /offerings/i
    ];

    // Patterns pentru ingrediente (EXTINSE)
    const ingredientsPatternsRO = [
      /ce.*ingrediente/i, /din.*ce.*este.*facut/i, /contine.*gluten/i,
      /este.*vegetarian/i, /are.*lactoza/i, /alergeni/i, /contine.*alergeni/i,
      /ingredientele.*sunt/i, /din.*ce.*se.*face/i, /ce.*contin/i,
      /are.*oua/i, /contine.*lactate/i, /este.*vegan/i, /fara.*gluten/i,
      /fara.*lactoza/i, /alergie/i, /intoleranta/i, /ingrediente.*principal/i,
      /ce.*este.*in/i, /compizitie/i, /continut/i, /elemente/i,
      /componente/i, /ce.*mai.*are/i, /ce.*altceva.*contine/i,
      /ingrediente.*utilizate/i, /materiale/i, /compus/i
    ];

    const ingredientsPatternsEN = [
      /ingredients/i, /what.*in.*it/i, /contains/i,
      /gluten/i, /vegetarian/i, /vegan/i,
      /lactose/i, /dairy/i, /allergens/i, /what.*is.*it.*made.*of/i,
      /what.*does.*it.*contain/i, /what.*is.*inside/i,
      /does.*it.*have/i, /has.*eggs/i, /contains.*dairy/i,
      /gluten.*free/i, /dairy.*free/i, /allergy/i, /intolerance/i,
      /main.*ingredients/i, /what.*is.*in.*it/i, /composition/i,
      /content/i, /elements/i, /components/i, /what.*else.*does.*it.*have/i,
      /ingredients.*used/i, /materials/i, /made.*of/i, /what.*it.*contains/i
    ];

    const patterns = lang === 'ro' ? {
      language: languagePatternsRO,
      waiter: waiterPatternsRO,
      recommendation: recommendationPatternsRO,
      menu: menuPatternsRO,
      ingredients: ingredientsPatternsEN
    } : {
      language: languagePatternsEN,
      waiter: waiterPatternsEN,
      recommendation: recommendationPatternsEN,
      menu: menuPatternsEN,
      ingredients: ingredientsPatternsEN
    };

    // Verificăm tipul de întrebare
    const isLanguageQuestion = patterns.language.some(pattern => pattern.test(lowerQuestion));
    const isWaiterQuestion = patterns.waiter.some(pattern => pattern.test(lowerQuestion));
    const isRecommendationQuestion = patterns.recommendation.some(pattern => pattern.test(lowerQuestion));
    const isMenuQuestion = patterns.menu.some(pattern => pattern.test(lowerQuestion));
    const isIngredientsQuestion = patterns.ingredients.some(pattern => pattern.test(lowerQuestion));

    // Răspunsuri în română
    if (lang === 'ro') {
      if (isLanguageQuestion) {
        return "language_switch";
      }
      if (isWaiterQuestion) {
        return "waiter_request";
      }
      if (isRecommendationQuestion) {
        return "Cel mai vândut produs la noi este **Cartofi prăjiți cu pui**! 🍗🍟 Este o combinație delicioasă și foarte populară în rândul clienților noștri. Puiul este marinat în condimente speciale și serviți cu cartofi crocanți. 😊\n\nDacă vă plac preparatele tradiționale, vă recomand și **Sarmalele noastre casei** sau **Mici cu muștar**!";
      }
      if (isMenuQuestion) {
        return "Avem o **varietate foarte largă de produse**! 🍽️ Meniul nostru include:\n\n• **Aperitive**: Bruschete, Platou mezeluri, Salate proaspete\n• **Feluri principale**: Pizza, Paste, Grill, Preparate românești\n• **Deserturi**: Clătite, Prăjituri, Inghețată\n• **Băuturi**: Sucuri, Apă, Băuturi răcoritoare, Cafea\n\nVă recomand să consultați meniul complet din aplicație pentru toate opțiunile! Dacă doriți o recomandare personalizată, spuneți-mi ce preferințe aveți!";
      }
      if (isIngredientsQuestion) {
        return "**Cartofi prăjiți cu pui** conține: piept de pui, cartofi, ulei de floarea-soarelui, condimente speciale. Poate conține urme de gluten și lactoză. Pentru informații detaliate despre alergeni pentru orice produs, vă rugăm să consultați bucătarul sau să mă întrebați despre un anumit preparat!";
      }
    }

    // Răspunsuri în engleză
    if (lang === 'en') {
      if (isLanguageQuestion) {
        return "language_switch";
      }
      if (isWaiterQuestion) {
        return "waiter_request";
      }
      if (isRecommendationQuestion) {
        return "Our best-selling product is **French Fries with Chicken**! 🍗🍟 It's a delicious combination very popular among our customers. The chicken is marinated in special spices and served with crispy fries. 😊\n\nIf you like traditional dishes, I also recommend our **Homemade Sarmale** or **Grilled Sausages with Mustard**!";
      }
      if (isMenuQuestion) {
        return "We have a **very wide variety of products**! 🍽️ Our menu includes:\n\n• **Appetizers**: Bruschetta, Charcuterie board, Fresh salads\n• **Main courses**: Pizza, Pasta, Grill, Romanian dishes\n• **Desserts**: Pancakes, Cakes, Ice cream\n• **Beverages**: Juices, Water, Soft drinks, Coffee\n\nI recommend checking the full menu in the app for all options! If you'd like a personalized recommendation, tell me your preferences!";
      }
      if (isIngredientsQuestion) {
        return "**French Fries with Chicken** contains: chicken breast, potatoes, sunflower oil, special spices. May contain traces of gluten and lactose. For detailed allergen information about any product, please consult our chef or ask me about a specific dish!";
      }
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(), // ID unic bazat pe timestamp
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(async () => {
      const botResponse = findBestMatch(inputMessage, language);
      
      let botMessageText = "";
      
      if (botResponse === "language_switch") {
        const newLanguage = language === 'ro' ? 'en' : 'ro';
        botMessageText = language === 'ro' 
          ? "Vă voi schimba limba în English! 🇺🇸" 
          : "I'll switch the language to Romanian! 🇷🇴";
        
        // Schimbă efectiv limba după ce afișează mesajul
        setTimeout(() => {
          switchLanguage();
        }, 1500);
        
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
        id: Date.now() + 1, // ID unic diferit de cel al mesajului utilizatorului
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
        id: Date.now(), // ID unic
        text: language === 'ro' 
          ? "Bună! Sunt Diana AI, asistentul tău virtual. Cu ce te pot ajuta?" 
          : "Hello! I'm Diana AI, your virtual assistant. How can I help you?",
        sender: "bot",
        timestamp: new Date()
      }
    ]);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay-diana" onClick={onClose}>
      <div className="diana-ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="diana-ai-chat">
          <div className="chat-header">
            <div className="chat-title">
              <FaComments className="chat-icon" />
              <span>Diana AI Assistant {language === 'ro' ? '(Română)' : '(English)'}</span>
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
                onClick={switchLanguage}
                title={language === 'ro' ? "Switch to English" : "Treceți la Română"}
              >
                <FaGlobe />
                <span className="language-indicator">
                  {language === 'ro' ? 'EN' : 'RO'}
                </span>
              </button>
              <button className="close-chat" onClick={onClose}>
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
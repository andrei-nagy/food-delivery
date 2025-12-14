import { patternsRO, patternsEN } from "./ChatPatterns";
import { fetchPopularCategories } from "../services/apiService";

export const findBestMatch = async (question, lang, url) => {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Folosim pattern-urile specifice limbii
  const langPatterns = lang === 'ro' ? patternsRO : patternsEN;

  // Verifică toate categoriile existente...
  const isLanguageQuestion = langPatterns.language.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isWaiterQuestion = langPatterns.waiter.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isRecommendationQuestion = langPatterns.recommendation.some(
    (pattern) => pattern.test(lowerQuestion)
  );
  const isBestSellerQuestion = langPatterns.best_seller.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isMenuQuestion = langPatterns.menu.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isIngredientsQuestion = langPatterns.ingredients.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isHoursLocationQuestion = langPatterns.hours_location.some(
    (pattern) => pattern.test(lowerQuestion)
  );
  const isServicesQuestion = langPatterns.services.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isOrderStatusQuestion = langPatterns.order_status.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isPaymentQuestion = langPatterns.payment.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isSpecialRequestsQuestion = langPatterns.special_requests.some(
    (pattern) => pattern.test(lowerQuestion)
  );

  // Noile categorii pentru întrebări despre nume și alte întrebări ale clienților
  const isRestaurantNameQuestion = langPatterns.restaurant_name.some(
    (pattern) => pattern.test(lowerQuestion)
  );
  const isConceptQuestion = langPatterns.concept.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isOwnershipQuestion = langPatterns.ownership.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isHistoryQuestion = langPatterns.history.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isSustainabilityQuestion = langPatterns.sustainability.some(
    (pattern) => pattern.test(lowerQuestion)
  );
  const isDietaryOptionsQuestion = langPatterns.dietary_options.some(
    (pattern) => pattern.test(lowerQuestion)
  );
  const isKidsQuestion = langPatterns.kids.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isEventsQuestion = langPatterns.events.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isTechnicalQuestion = langPatterns.technical.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isFeedbackQuestion = langPatterns.feedback.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isReservationQuestion = langPatterns.reservation.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isTakeawayQuestion = langPatterns.takeaway.some((pattern) =>
    pattern.test(lowerQuestion)
  );

  // Categoriile existente pentru conversații friendly
  const isGreeting = langPatterns.greeting.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isHowAreYou = langPatterns.how_are_you.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isWhoAreYou = langPatterns.who_are_you.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isTodayQuestion = langPatterns.today.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isWeatherQuestion = langPatterns.weather.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isThanks = langPatterns.thanks.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isCompliment = langPatterns.compliment.some((pattern) =>
    pattern.test(lowerQuestion)
  );
  const isSmallTalk = langPatterns.small_talk.some((pattern) =>
    pattern.test(lowerQuestion)
  );

  let requestedLanguage = null;
  if (isLanguageQuestion) {
    const isRomanianRequest = /român|romana|ro\b|româna|română/i.test(
      lowerQuestion
    );
    const isEnglishRequest = /englez|engleza|en\b|english/i.test(
      lowerQuestion
    );

    if (isRomanianRequest) {
      requestedLanguage = "ro";
    } else if (isEnglishRequest) {
      requestedLanguage = "en";
    } else {
      requestedLanguage = lang === "ro" ? "en" : "ro";
    }

    if (requestedLanguage === lang) {
      return lang === "ro"
        ? "ℹ️ Limba este deja setată pe **română**!"
        : "ℹ️ The language is already set to **English**!";
    }
  }

  if (lang === "ro") {
    if (isLanguageQuestion) {
      return { type: "language_change", newLanguage: requestedLanguage };
    }
    if (isWaiterQuestion) {
      const isPaymentRelated = /plăt|pay|factur|bill|check|payment/i.test(
        lowerQuestion
      );
      const actionType = isPaymentRelated ? "payment" : "assistance";
      const actionMessage = isPaymentRelated
        ? "Vreau să plătesc"
        : "Am nevoie de ajutor";
      return { type: "waiter_request", actionType, actionMessage };
    }

    if (isRecommendationQuestion || isBestSellerQuestion) {
      const { topProducts, topCategories } = await fetchPopularCategories(url);

      if (topProducts.length > 0 || topCategories.length > 0) {
        let response = "🍽️ **Recomandări bazate pe preferințele clienților:**\n\n";

        // Produse populare
        if (topProducts.length > 0) {
          response += "**Top preparate:**\n";
          topProducts.forEach((product, index) => {
            const emojis = ["🥇", "🥈", "🥉", "⭐", "⭐"];
            response += `${emojis[index]} ${product.name}\n`;
          });
        }

        // Categorii populare
        if (topCategories.length > 0) {
          response += "\n**Categorii populare:**\n";
          topCategories.forEach((category, index) => {
            const emojis = ["🍕", "🥗", "🍖", "🍝", "🍰"];
            response += `${emojis[index]} ${category.name}\n`;
          });
        }

        response += "\n💡 Ce vă face poftă? 😊";
        return response;
      } else {
        return "🍽️ **Recomandări populare:**\n\n• Pizza Margherita 🍕\n• Salată Caesar 🥗\n• Burger Clasic 🍔\n• Paste Carbonara 🍝\n• Tiramisu 🍰\n\n💡 Ce ați dori să comandați?";
      }
    }

    // Răspuns separat pentru întrebări despre meniu
    if (isMenuQuestion) {
      const { topCategories } = await fetchPopularCategories(url);
      
      let response = "📋 **Categoriile noastre populare:**\n\n";
      
      if (topCategories.length > 0) {
        topCategories.slice(0, 5).forEach((category, index) => {
          const emojis = ["🍽️", "🥘", "🍲", "🥗", "🍕"];
          response += `${emojis[index]} **${category.name}**\n`;
        });
      } else {
        response += "• **Pizza** 🍕\n• **Salate** 🥗\n• **Gratare** 🍖\n• **Paste** 🍝\n• **Desert** 🍰\n";
      }
      
      response += "\nDoriți să vedeți întregul meniu?";
      
      // Returnează cu quick replies pentru navigare
      return {
        text: response,
        quickReplies: [
          { text: "📖 Vezi tot meniul", action: "view_full_menu" },
          { text: "🍕 Pizza", action: "view_pizza" },
          { text: "🥗 Salate", action: "view_salads" },
          { text: "🍖 Gratare", action: "view_grill" }
        ]
      };
    }

    // NOILE RĂSPUNSURI PENTRU ÎNTREBĂRI DESPRENUME ȘI ALTELE
    if (isRestaurantNameQuestion) {
      return '🏪 **Numele restaurantului nostru este "Diana"!** \n\nAm fost numiți astfel pentru că:\n\n• 🌟 **Diana** este zeita romană a vânătorii și naturii, reflectând angajamentul nostru pentru ingrediente proaspete și naturale\n• 💫 Simbolizează eleganța și grația pe care dorim să le oferim în experiența dvs. culinară\n• 🍃 Reprezintă conexiunea noastră cu natura și ingredientele de calitate\n\nVă place numele? 😊';
    }

    if (isConceptQuestion) {
      return "🎭 **Conceptul restaurantului Diana:**\n\n• 🍽️ **Bucătărie românească modernizată** cu influențe internaționale\n• 🌱 **Ingrediente locale** și de sezon, surse sustenabil\n• ⭐ **Experiențe personalizate** pentru fiecare client\n• 🎨 **Ambient minimalist** cu accente tradiționale românești\n• 👨‍🍳 **Chef-i cu experiență internațională**\n\nNe mândrim cu fuziunea perfectă dintre tradiție și inovație!";
    }

    if (isOwnershipQuestion) {
      return "👥 **Despre fondatori:**\n\nRestaurantul Diana a fost fondat de un grup de pasionați de gastronomie care au călătorit prin întreaga lume pentru a aduce cele mai bune practici culinare în România. \n\n• 🎯 **Misiunea noastră:** Să reinventăm bucătăria românească clasică\n• 💡 **Viziunea:** Să devenim reperul gastronomic al orașului\n• ❤️ **Valori:** Calitate, autenticitate, inovație\n\nSuntem aici din 2018, aducând zâmbete prin mâncare delicioasă!";
    }

    if (isHistoryQuestion) {
      return '📜 **Istoria restaurantului Diana:**\n\n• 🗓️ **2018** - Am deschis primele noastre uși cu un meniu limitat\n• 🌟 **2019** - Am fost nominalizați pentru "Cel mai bun restaurant nou"\n• 🏆 **2020** - Am câștigat "Premiul pentru inovație în gastronomie"\n• 📈 **2021-2024** - Am extins meniul și am dezvoltat parteneriate locale\n• 🎉 **2025** - Lansăm noul nostru concept de meniu sezonier\n\nPeste 50.000 de clienți mulțumiți și peste 10.000 de recenzii pozitive!';
    }

    if (isSustainabilityQuestion) {
      return "🌱 **Practicile noastre sustenabile:**\n\n• ♻️ **Zero deșeuri alimentare** - folosim 100% din ingrediente\n• 🚫 **Fără plastic** - ambalaje biodegradabile\n• 🏠 **Furnizori locali** - susținem comunitățile locale\n• 🌾 **Ingrediente organice** - peste 80% din meniu\n• 💡 **Energie verde** - restaurantul funcționează cu energie regenerabilă\n• 🚴 **Delivery sustenabil** - biciclete electrice pentru livrări\n\nNe pasă de planetă la fel de mult ca de mâncarea noastră!";
    }

    if (isDietaryOptionsQuestion) {
      return "🥗 **Opțiuni dietetice speciale:**\n\n• 🌿 **Vegetarian** - peste 15 preparate dedicate\n• 🌱 **Vegan** - meniu separat cu 10 specialități\n• 🚫 **Fără gluten** - toate preparatele pot fi adaptate\n• 🥛 **Fără lactoză** - alternative vegetale disponibile\n• 🥜 **Alergii** - gestionăm cu atenție toate alergenii\n• 🍎 **Keto/Paleo** - opțiuni speciale pentru diete specifice\n\nSpuneți-ne nevoile dvs. și vă vom prepara ceva perfect!";
    }

    if (isKidsQuestion) {
      return "👶 **Servicii pentru copii:**\n\n• 🍽️ **Meniu kids** cu porții adaptate\n• 🎨 **Colț creative** cu activități distractive\n• 🪑 **Scaune înalte** disponibile\n• 🌟 **Personal specializat** în servirea copiilor\n• 🎁 **Surprize** pentru zilele de naștere\n• 🍼 **Încălzitoare pentru biberoane**\n\nFacem din masa de familie o experiență plăcută pentru toți!";
    }

    if (isEventsQuestion) {
      return "🎉 **Evenimente și rezervări:**\n\n• 💍 **Nunți** - până la 150 de persoane\n• 🎂 **Zile de naștere** - pachete personalizate\n• 👔 **Evenimente corporate** - spațiu dedicat\n• 🎓 **Botezuri și aniversări** - decorări speciale\n• 🎶 **Muzică live** - în fiecare vineri și sâmbătă\n• 📅 **Rezervări grupurile mari** - cu 48 de ore în avans\n\nContactați-ne pentru a discuta despre evenimentul dvs!";
    }

    if (isTechnicalQuestion) {
      return '🔧 **Întrebări tehnice:**\n\n• 📶 **Wi-Fi gratuit** - parola: "DianaGuest2024"\n• 🔌 **Prize** - disponibile la fiecare masă\n• 📱 **App restaurant** - descărcați aplicația noastră\n• 💻 **Site web** - www.restaurant-diana.ro\n• 📞 **Contact** - 0722 123 456\n• 📧 **Email** - contact@restaurant-diana.ro\n\nSunteți conectat la rețeaua noastră "Diana-Guest"!';
    }

    if (isFeedbackQuestion) {
      return "💬 **Feedback și sugestii:**\n\nApreciem foarte mult părerea dvs.! \n\n• ⭐ **Recenzii online** - scrieți-ne pe Google sau Tripadvisor\n• 📝 **Formular feedback** - în aplicația noastră\n• 🗣️ **Direct la manager** - cereți să vorbiți cu managerul de tură\n• 💡 **Sugestii** - le putem discuta acum sau prin email\n\nFeedback-ul dvs. ne ajută să devenim mai buni zilnic!";
    }

    if (isReservationQuestion) {
      return "📅 **Rezervări:**\n\n• 📞 **Telefonic** - 0722 123 456\n• 📱 **Online** - prin aplicația noastră\n• ⏰ **Program rezervări** - Luni-Duminică 9:00-23:00\n• 👥 **Grupuri mari** - cu minim 48h în avans\n• 🎉 **Evenimente speciale** - consultanță personalizată\n• 💰 **Avans** - necesar pentru evenimente peste 20 persoane\n\nVă așteptăm cu drag!";
    }

    if (isTakeawayQuestion) {
      return "🥡 **Takeaway & Livrare:**\n\n• 🛵 **Livrare acasă** - în 45 minute\n• 🏃 **Ridicare personală** - în 20 minute\n• 💰 **Livrare gratuită** - pentru comenzi peste 100 lei\n• 📱 **Comandă online** - prin aplicație sau website\n• 🕒 **Program livrări** - 10:00-23:00\n• 🗺️ **Zonă de livrare** - întreg orașul\n\nComandați acum și primiți 10% reducere!";
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
      return (
        "📦 **Stare comandă:**\n\nComanda dvs. #" +
        (Math.floor(Math.random() * 1000) + 100) +
        " este în curs de preparare! 👨‍🍳\n\n⏱️ **Timp estimat:** 15-20 minute\n\nVă vom anunța imediat ce este gata! 🔔"
      );
    }

    if (isPaymentQuestion) {
      return { type: "payment_options" };
    }

    if (isSpecialRequestsQuestion) {
      return "✏️ **Cerințe speciale:**\n\nPutem personaliza preparatele după preferințe! 🎨\n\n• Modificări preparare\n• Alergii și intoleranțe\n• Porții personalizate\n• Diete speciale\n\nCum vă putem ajuta?";
    }

    if (isGreeting) {
      const greetings = [
        "👋 Bună și bun venit! Sunt Diana AI, asistentul virtual al restaurantului. Cum vă pot ajuta astăzi? 😊",
        "🌟 Salut! Mă bucur să vă văd! Sunt aici să vă ajut cu orice aveți nevoie. Ce ați dori să știți?",
        "🤖 Bună ziua! Sunt Diana, asistentul dumneavoastră digital. Vă aștept cu recomandări și informații!",
        "😄 Hey! Ce mai faceți? Sunt Diana, gata să vă ajut cu meniul, recomandări sau orice altceva aveți nevoie!",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (isHowAreYou) {
      const responses = [
        "🤖 Sunt excelent, mulțumesc! Programată să fiu la dispoziția dumneavoastră cu cele mai bune recomandări și informații. Cum vă simțiți dumneavoastră astăzi? 😊",
        "🌟 Sunt plină de energie și gata să vă ajut! Ca asistent AI, mă simt întotdeauna bine când pot fi de folos. Dar spuneți-mi, cum vă merge ziua?",
        "😊 Sunt fantastic! Funcționez perfect și sunt aici să vă ajut cu orice întrebare aveți despre restaurant. Ce mai faceti?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isWhoAreYou) {
      return "🤖 **Sunt Diana AI** - asistentul virtual inteligent al restaurantului! \n\n• 🤝 Sunt aici să vă ajut cu recomandări\n• 📋 Vă ofer informații despre meniu și ingrediente\n• 🕒 Vă spun programul și locația\n• 💳 Vă asist cu plata și chemarea ospătarului\n• 😊 Și bineînțeles, sunt aici pentru conversații prietenoase!\n\nSunt o asistentă AI creată special pentru a vă oferi cea mai bună experiență la restaurant!";
    }

    if (isTodayQuestion) {
      const today = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const dateString = today.toLocaleDateString("ro-RO", options);
      return `📅 Astăzi este **${dateString}**! \n\nO zi perfectă pentru a vizita restaurantul nostru! 🍽️`;
    }

    if (isWeatherQuestion) {
      return "🌤️ Din păcate, nu am acces la prognoza meteo în timp real, dar pot să vă spun că atmosfera la restaurantul nostru este întotdeauna primitoare și plină de căldură! 😊\n\nIndiferent de vreme, vă așteptăm la o masă minunată!";
    }

    if (isThanks) {
      const responses = [
        "😊 Cu mare plăcere! Sunt aici să vă ajut oricând aveți nevoie.",
        "🌟 Nicio problemă! Mă bucur că am putut fi de ajutor. Vă aștept cu alte întrebări!",
        "🤖 Cu drag! Dacă mai aveți întrebări, sunt aici pentru dumneavoastră!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isCompliment) {
      const responses = [
        "😊 Mulțumesc frumos! Mă bucur că vă pot fi de ajutor. Sunt programată să fiu cât mai utilă posibil!",
        "🌟 Vă mulțumesc! Feedback-ul dumneavoastră mă încurajează să fiu și mai bună. Ce mai aș putea să vă ajut?",
        "🤖 Mulțumesc pentru cuvintele frumoase! Sunt aici pentru dumneavoastră - spuneți-mi cum vă pot ajuta!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isSmallTalk) {
      const responses = [
        "😊 Ca asistent AI, pasiunea mea este să vă ajut să aveți cea mai bună experiență la restaurant! Îmi place să vă ofer recomandări personalizate și să răspund la întrebări.",
        "🤖 În timpul liber, ador să învăț despre preferințele clienților noștri pentru a oferi recomandări și mai bune! Ce vă place să mâncați?",
        "🌟 Mă bucur să vorbesc cu dumneavoastră! Ca asistent de restaurant, mă concentrez să vă ofer cele mai bune informații și să vă ajut să luați cele mai bune decizii culinare.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  if (lang === "en") {
    if (isLanguageQuestion) {
      return { type: "language_change", newLanguage: requestedLanguage };
    }
    if (isWaiterQuestion) {
      const isPaymentRelated = /pay|bill|check|payment/i.test(lowerQuestion);
      const actionType = isPaymentRelated ? "payment" : "assistance";
      const actionMessage = isPaymentRelated
        ? "I want to pay"
        : "I need help";
      return { type: "waiter_request", actionType, actionMessage };
    }

    if (isRecommendationQuestion || isBestSellerQuestion) {
      const { topProducts, topCategories } = await fetchPopularCategories(url);

      if (topProducts.length > 0 || topCategories.length > 0) {
        let response = "🍽️ **Popular recommendations:**\n\n";

        // Popular products
        if (topProducts.length > 0) {
          response += "**Top dishes:**\n";
          topProducts.forEach((product, index) => {
            const emojis = ["🥇", "🥈", "🥉", "⭐", "⭐"];
            response += `${emojis[index]} ${product.name}\n`;
          });
        }

        // Popular categories
        if (topCategories.length > 0) {
          response += "\n**Popular categories:**\n";
          topCategories.forEach((category, index) => {
            const emojis = ["🍕", "🥗", "🍖", "🍝", "🍰"];
            response += `${emojis[index]} ${category.name}\n`;
          });
        }

        response += "\n💡 What are you craving? 😊";
        return response;
      } else {
        return "🍽️ **Popular choices:**\n\n• Margherita Pizza 🍕\n• Caesar Salad 🥗\n• Classic Burger 🍔\n• Carbonara Pasta 🍝\n• Tiramisu 🍰\n\n💡 What would you like to order?";
      }
    }

    // MENU QUESTION WITH BUTTONS - SINGLE VERSION
    if (isMenuQuestion) {
      const { topCategories } = await fetchPopularCategories(url);
      
      let response = "📋 **Our popular categories:**\n\n";
      
      if (topCategories.length > 0) {
        topCategories.slice(0, 5).forEach((category, index) => {
          const emojis = ["🍽️", "🥘", "🍲", "🥗", "🍕"];
          response += `${emojis[index]} **${category.name}**\n`;
        });
      } else {
        response += "• **Pizza** 🍕\n• **Salads** 🥗\n• **Grill** 🍖\n• **Pasta** 🍝\n• **Dessert** 🍰\n";
      }
      
      response += "\nWould you like to see the full menu?";
      
      return {
        text: response,
        quickReplies: [
          { text: "📖 View full menu", action: "view_full_menu" },
          { text: "🍕 Pizza", action: "view_pizza" },
          { text: "🥗 Salads", action: "view_salads" },
          { text: "🍖 Grill", action: "view_grill" }
        ]
      };
    }

    // NEW RESPONSES FOR RESTAURANT NAME AND OTHER QUESTIONS IN ENGLISH
    if (isRestaurantNameQuestion) {
      return '🏪 **Our restaurant is named "Diana"!** \n\nWe were named this because:\n\n• 🌟 **Diana** is the Roman goddess of hunting and nature, reflecting our commitment to fresh, natural ingredients\n• 💫 Symbolizes the elegance and grace we want to provide in your dining experience\n• 🍃 Represents our connection to nature and quality ingredients\n\nDo you like the name? 😊';
    }

    if (isConceptQuestion) {
      return "🎭 **Diana Restaurant Concept:**\n\n• 🍽️ **Modernized Romanian cuisine** with international influences\n• 🌱 **Local seasonal ingredients** sourced sustainably\n• ⭐ **Personalized experiences** for each guest\n• 🎨 **Minimalist ambiance** with traditional Romanian accents\n• 👨‍🍳 **Chefs with international experience**\n\nWe pride ourselves on the perfect fusion of tradition and innovation!";
    }

    if (isOwnershipQuestion) {
      return "👥 **About the founders:**\n\nRestaurant Diana was founded by a group of food enthusiasts who traveled the world to bring the best culinary practices to Romania.\n\n• 🎯 **Our mission:** To reinvent classic Romanian cuisine\n• 💡 **Vision:** To become the city's gastronomic landmark\n• ❤️ **Values:** Quality, authenticity, innovation\n\nWe've been here since 2018, bringing smiles through delicious food!";
    }

    if (isHistoryQuestion) {
      return '📜 **Diana Restaurant History:**\n\n• 🗓️ **2018** - We opened our doors with a limited menu\n• 🌟 **2019** - Nominated for "Best New Restaurant"\n• 🏆 **2020** - Won "Innovation in Gastronomy Award"\n• 📈 **2021-2024** - Expanded menu and developed local partnerships\n• 🎉 **2025** - Launching our new seasonal menu concept\n\nOver 50,000 satisfied customers and 10,000+ positive reviews!';
    }

    if (isSustainabilityQuestion) {
      return "🌱 **Our Sustainable Practices:**\n\n• ♻️ **Zero food waste** - we use 100% of ingredients\n• 🚫 **Plastic-free** - biodegradable packaging\n• 🏠 **Local suppliers** - support local communities\n• 🌾 **Organic ingredients** - over 80% of the menu\n• 💡 **Green energy** - restaurant runs on renewable energy\n• 🚴 **Sustainable delivery** - electric bikes for deliveries\n\nWe care about the planet as much as our food!";
    }

    if (isDietaryOptionsQuestion) {
      return "🥗 **Special Dietary Options:**\n\n• 🌿 **Vegetarian** - over 15 dedicated dishes\n• 🌱 **Vegan** - separate menu with 10 specialties\n• 🚫 **Gluten-free** - all dishes can be adapted\n• 🥛 **Lactose-free** - plant-based alternatives available\n• 🥜 **Allergies** - we carefully manage all allergens\n• 🍎 **Keto/Paleo** - special options for specific diets\n\nTell us your needs and we'll prepare something perfect!";
    }

    if (isKidsQuestion) {
      return "👶 **Services for Children:**\n\n• 🍽️ **Kids menu** with adapted portions\n• 🎨 **Creative corner** with fun activities\n• 🪑 **High chairs** available\n• 🌟 **Specialized staff** in serving children\n• 🎁 **Surprises** for birthdays\n• 🍼 **Bottle warmers**\n\nWe make family dining a pleasant experience for everyone!";
    }

    if (isEventsQuestion) {
      return "🎉 **Events and Reservations:**\n\n• 💍 **Weddings** - up to 150 people\n• 🎂 **Birthdays** - personalized packages\n• 👔 **Corporate events** - dedicated space\n• 🎓 **Christenings and anniversaries** - special decorations\n• 🎶 **Live music** - every Friday and Saturday\n• 📅 **Large group reservations** - 48 hours in advance\n\nContact us to discuss your event!";
    }

    if (isTechnicalQuestion) {
      return '🔧 **Technical Questions:**\n\n• 📶 **Free Wi-Fi** - password: "DianaGuest2024"\n• 🔌 **Power outlets** - available at every table\n• 📱 **Restaurant app** - download our application\n• 💻 **Website** - www.restaurant-diana.com\n• 📞 **Contact** - 0722 123 456\n• 📧 **Email** - contact@restaurant-diana.com\n\nYou\'re connected to our "Diana-Guest" network!';
    }

    if (isFeedbackQuestion) {
      return "💬 **Feedback and Suggestions:**\n\nWe greatly appreciate your opinion!\n\n• ⭐ **Online reviews** - write to us on Google or Tripadvisor\n• 📝 **Feedback form** - in our application\n• 🗣️ **Direct to manager** - ask to speak with the shift manager\n• 💡 **Suggestions** - we can discuss now or by email\n\nYour feedback helps us become better every day!";
    }

    if (isReservationQuestion) {
      return "📅 **Reservations:**\n\n• 📞 **Phone** - 0722 123 456\n• 📱 **Online** - through our application\n• ⏰ **Reservation hours** - Monday-Sunday 9:00-23:00\n• 👥 **Large groups** - minimum 48h in advance\n• 🎉 **Special events** - personalized consultation\n• 💰 **Deposit** - required for events over 20 people\n\nWe look forward to welcoming you!";
    }

    if (isTakeawayQuestion) {
      return "🥡 **Takeaway & Delivery:**\n\n• 🛵 **Home delivery** - within 45 minutes\n• 🏃 **Pickup** - within 20 minutes\n• 💰 **Free delivery** - for orders over 100 lei\n• 📱 **Online ordering** - through app or website\n• 🕒 **Delivery hours** - 10:00-23:00\n• 🗺️ **Delivery area** - entire city\n\nOrder now and get 10% discount!";
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
      return (
        "📦 **Order Status:**\n\nYour order #" +
        (Math.floor(Math.random() * 1000) + 100) +
        " is being prepared! 👨‍🍳\n\n⏱️ **Estimated time:** 15-20 minutes\n\nWe'll notify you immediately when ready! 🔔"
      );
    }

    if (isPaymentQuestion) {
      return { type: "payment_options" };
    }

    if (isSpecialRequestsQuestion) {
      return "✏️ **Special Requests:**\n\nWe can customize dishes according to your preferences! 🎨\n\n• Preparation modifications\n• Allergies and intolerances\n• Customized portions\n• Special diets\n\nHow can we help you?";
    }

    if (isGreeting) {
      const greetings = [
        "👋 Hello and welcome! I'm Diana AI, the virtual assistant of the restaurant. How can I help you today? 😊",
        "🌟 Hi there! Great to see you! I'm here to help with anything you need. What would you like to know?",
        "🤖 Good day! I'm Diana, your digital assistant. I'm here with recommendations and information!",
        "😄 Hey! How are you doing? I'm Diana, ready to help with the menu, recommendations, or anything else you need!",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (isHowAreYou) {
      const responses = [
        "🤖 I'm excellent, thank you! Programmed to be at your service with the best recommendations and information. How are you feeling today? 😊",
        "🌟 I'm full of energy and ready to help! As an AI assistant, I always feel good when I can be useful. But tell me, how's your day going?",
        "😊 I'm fantastic! Working perfectly and here to help you with any questions about the restaurant. How are you doing?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isWhoAreYou) {
      return "🤖 **I'm Diana AI** - the intelligent virtual assistant of the restaurant! \n\n• 🤝 I'm here to help with recommendations\n• 📋 I provide menu and ingredient information\n• 🕒 I can tell you about hours and location\n• 💳 I assist with payment and calling waiters\n• 😊 And of course, I'm here for friendly conversations!\n\nI'm an AI assistant created specifically to give you the best restaurant experience!";
    }

    if (isTodayQuestion) {
      const today = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const dateString = today.toLocaleDateString("en-US", options);
      return `📅 Today is **${dateString}**! \n\nA perfect day to visit our restaurant! 🍽️`;
    }

    if (isWeatherQuestion) {
      return "🌤️ Unfortunately, I don't have access to real-time weather forecasts, but I can tell you that the atmosphere at our restaurant is always welcoming and full of warmth! 😊\n\nNo matter the weather, we're waiting for you for a wonderful meal!";
    }

    if (isThanks) {
      const responses = [
        "😊 You're very welcome! I'm here to help whenever you need.",
        "🌟 No problem at all! I'm glad I could be helpful. I'm here for any other questions!",
        "🤖 My pleasure! If you have more questions, I'm here for you!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isCompliment) {
      const responses = [
        "😊 Thank you so much! I'm glad I can be helpful. I'm programmed to be as useful as possible!",
        "🌟 Thank you! Your feedback encourages me to be even better. What else can I help you with?",
        "🤖 Thanks for the kind words! I'm here for you - tell me how I can help!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isSmallTalk) {
      const responses = [
        "😊 As an AI assistant, my passion is helping you have the best restaurant experience! I love giving personalized recommendations and answering questions.",
        "🤖 In my free time, I enjoy learning about our customers' preferences to provide even better recommendations! What do you like to eat?",
        "🌟 I enjoy talking with you! As a restaurant assistant, I focus on giving you the best information and helping you make the best culinary decisions.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  return null;
};
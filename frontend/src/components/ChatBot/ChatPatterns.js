// utils/chatPatterns.js

export const languagePatternsRO = [
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

export const languagePatternsEN = [
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

export const waiterPatternsRO = [
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
  /nu.*merge/i, /ati.*putea.*sa.*ma.*ajutati/i,
  
  // ADAUGĂ ACESTE PATTERN-URI NOI pentru "plată"
  /^plata$/i, /^plăt/i, /^platesc$/i, /^plătesc$/i,
  /plată/i, /plata/i, /sa.*platesc/i, /să.*plătesc/i,
  /doresc.*sa.*platesc/i, /doresc.*să.*plătesc/i,
  /vreau.*plata/i, /vreau.*plată/i, /nota.*de.*plata/i,
  /nota.*de.*plată/i, /scoate.*nota/i, /scoate.*nota/i,
  /factura/i, /chitanta/i, /chitanță/i, /bon.*fiscal/i,
  /vreau.*sa.*achit/i, /doresc.*sa.*achit/i,
  /termin.*comanda/i, /finalizez.*comanda/i,
  /gata.*de.*plata/i, /gata.*de.*plată/i,
  /pot.*plati/i, /pot.*plăti/i, /as.*plati/i, /aș.*plăti/i,
  /cheama.*pentru.*plata/i, /cheama.*pentru.*plată/i,
  /ospatar.*plata/i, /ospătar.*plată/i,
  /ajutor.*plata/i, /ajutor.*plată/i
];

export const waiterPatternsEN = [
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

export const recommendationPatternsRO = [
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

export const recommendationPatternsEN = [
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

export const menuPatternsRO = [
  /meniu|meniul|lista|ce.*meniu|ce.*aveți|ce.*serviți|ce.*mâncare|ce.*băutur/i,
  /ce.*găsesc|ce.*oferi|produse|preparate|mâncăruri|băuturi|ce.*se.*mânâncă/i,
  /ce.*au.*în.*meniu|ce.*fel.*de.*mâncare|tipuri.*de.*mâncare|categorie.*meniu/i,
  /ce.*recomanzi.*din.*meniu|ce.*e.*în.*meniu|văd.*meniul|afișează.*meniul/i,
  /ce.*specialități|specialități.*casei|ce.*au.*nou|noutăți.*meniu/i,
  /meniu.*copii|meniu.*vegetarian|meniu.*vegan|opțiuni.*vegetariene/i,
  /meniu.*zilnic|oferta.*zilei|meniu.*business|meniu.*prânz/i,
  /ce.*prețuri|prețuri|cost|cat.*costa|ce.*pret.*are/i,
  /ce.*bere.*aveți|ce.*vinuri|ce.*cocktail|ce.*băuturi.*alcoolice/i,
  /ce.*băuturi.*răcoritoare|sucuri|apa.*minerala|ce.*cafea/i
];

export const menuPatternsEN = [
  /menu|what.*menu|what.*do.*you.*have|what.*do.*you.*serve|what.*food/i,
  /what.*drinks|what.*can.*i.*order|what.*is.*available|products|dishes/i,
  /what.*is.*on.*the.*menu|what.*kind.*of.*food|types.*of.*food|menu.*category/i,
  /what.*do.*you.*recommend.*from.*menu|show.*me.*the.*menu|display.*menu/i,
  /what.*specialties|house.*specialties|what.*is.*new|new.*in.*menu/i,
  /kids.*menu|children.*menu|vegetarian.*menu|vegan.*menu|vegetarian.*options/i,
  /daily.*menu|menu.*of.*the.*day|business.*menu|lunch.*menu/i,
  /what.*prices|prices|cost|how.*much|price.*range/i,
  /what.*beer.*do.*you.*have|what.*wines|what.*cocktails|alcoholic.*drinks/i,
  /what.*soft.*drinks|sodas|mineral.*water|what.*coffee/i
];

export const ingredientsPatternsRO = [
  /ce.*ingrediente|ingredientele|din.*ce.*este.*făcut|conține/i,
  /cum.*este.*preparat|cum.*se.*face|rețetă|recipe/i,
  /are.*alergeni|alergeni|fără.*lactoză|fără.*gluten|vegan/i,
  /vegetarian|picant|iute|spicy|condimente|sosuri/i,
  /proaspăt|fresh|congelat|frozen|de.*casă|home.*made/i,
  /ce.*carne.*folosiți|ce.*pescuit|peste.*proaspăt|legume.*proaspete/i,
  /bio|organic|natural|fără.*conservanți|additive/i
];

export const ingredientsPatternsEN = [
  /what.*ingredients|ingredients|what.*is.*it.*made.*of|contains/i,
  /how.*is.*it.*prepared|how.*do.*you.*make|recipe|preparation/i,
  /does.*it.*have.*allergens|allergens|dairy.*free|gluten.*free|vegan/i,
  /vegetarian|spicy|hot|seasoning|sauces/i,
  /fresh|frozen|home.*made|homemade/i,
  /what.*meat.*do.*you.*use|what.*fish|fresh.*fish|fresh.*vegetables/i,
  /bio|organic|natural|no.*preservatives|additives/i
];

export const hoursLocationPatternsRO = [
  /program|ore|oră.*deschidere|oră.*închidere|când.*sunteți.*deschis/i,
  /locatie|adresă|unde.*sunteți|cum.*ajung|direcții/i,
  /parcare|loc.*parcare|parking|acces|transport/i,
  /închis.*azi|deschis.*duminică|program.*sărbători/i,
  /rezervări|rezervare|masă|table|booking/i,
  /terasă|inside|outside|seating|locuri/i,
  /zona.*fumători|fumători|non.*fumători|smoking/i
];

export const hoursLocationPatternsEN = [
  /hours|opening.*time|closing.*time|when.*are.*you.*open/i,
  /location|address|where.*are.*you|how.*to.*get.*there|directions/i,
  /parking|parking.*space|parking.*lot|access|transportation/i,
  /closed.*today|open.*sunday|holiday.*hours/i,
  /reservations|reservation|table|booking/i,
  /terrace|inside|outside|seating|seats/i,
  /smoking.*area|smoking|non.*smoking/i
];

export const servicesFacilitiesPatternsRO = [
  /wi.*fi|internet|parcare|parking|toaletă|baie|wc/i,
  /acces.*persoane.*cu.*handicap|handicap|accesibilitate/i,
  /terasă|grădină|garden|view|vedere|seafront|malul.*mării/i,
  /muzică.*live|live.*music|eveniment|event|petrecere/i,
  /tv|televizor|sport|meci|game|proiector/i,
  /încălzire|aer.*condiționat|heating|air.*conditioning/i,
  /dressing|vestiar|locker|dus|shower/i,
  /playground|copii|children|kids.*zone/i
];

export const servicesFacilitiesPatternsEN = [
  /wi.*fi|internet|parking|toilet|bathroom|restroom/i,
  /handicap.*accessible|disabled.*access|accessibility/i,
  /terrace|garden|view|seafront|sea.*view/i,
  /live.*music|event|party|entertainment/i,
  /tv|television|sport|game|projector/i,
  /heating|air.*conditioning|ac/i,
  /dressing|locker|shower/i,
  /playground|children|kids.*area/i
];

export const orderStatusPatternsRO = [
  /stare.*comandă|comanda.*mea|unde.*e.*comanda|când.*vine.*comanda/i,
  /status.*comandă|urmărire.*comandă|track.*order/i,
  /comandă.*pierdută|comandă.*întârziată|nu.*am.*primit.*comanda/i,
  /modific.*comandă|schimb.*comandă|anulez.*comandă/i,
  /adăugă.*la.*comandă|mai.*vreau|altceva/i
];

export const orderStatusPatternsEN = [
  /order.*status|my.*order|where.*is.*my.*order|when.*will.*my.*order.*come/i,
  /order.*tracking|track.*my.*order/i,
  /lost.*order|late.*order|didn.*t.*receive.*order/i,
  /modify.*order|change.*order|cancel.*order/i,
  /add.*to.*order|i.*want.*more|something.*else/i
];

export const paymentPatternsRO = [
  /plătesc|plată|cash|card|bani|ceas|cum.*plătesc/i,
  /factură|bon|chitanță|receipt|bill/i,
  /taxă.*serviciu|service.*charge|bacșiș|tip/i,
  /divizare.*plata|split.*bill|pay.*separately/i,
  /voucher|discount|reducere|cupon|promoție/i,
  /tva|tax|invoic|invoice/i,
  
  // ADAUGĂ ACESTE PATTERN-URI NOI
  /^plata$/i, /^plăt/i, /^platesc$/i, /^plătesc$/i,
  /plată/i, /plata/i, /sa.*platesc/i, /să.*plătesc/i,
  /doresc.*sa.*platesc/i, /doresc.*să.*plătesc/i,
  /vreau.*plata/i, /vreau.*plată/i, /nota.*de.*plata/i,
  /nota.*de.*plată/i, /scoate.*nota/i, /scoate.*nota/i,
  /factura/i, /chitanta/i, /chitanță/i, /bon.*fiscal/i,
  /vreau.*sa.*achit/i, /doresc.*sa.*achit/i,
  /termin.*comanda/i, /finalizez.*comanda/i,
  /gata.*de.*plata/i, /gata.*de.*plată/i,
  /pot.*plati/i, /pot.*plăti/i, /as.*plati/i, /aș.*plăti/i,
  /cheama.*pentru.*plata/i, /cheama.*pentru.*plată/i,
  /ospatar.*plata/i, /ospătar.*plată/i,
  /ajutor.*plata/i, /ajutor.*plată/i,
  /metoda.*plata/i, /metodă.*plată/i,
  /modalitate.*plata/i, /modalitate.*plată/i
];

export const paymentPatternsEN = [
  /pay|payment|cash|card|money|how.*do.*i.*pay/i,
  /bill|receipt|check/i,
  /service.*charge|tip|gratuity/i,
  /split.*bill|pay.*separately/i,
  /voucher|discount|coupon|promotion/i,
  /vat|tax|invoice/i
];

export const specialRequestsPatternsRO = [
  /modificare.*comandă|fără.*sare|fără.*ulei|low.*salt|low.*oil/i,
  /extra.*sos|more.*sauce|fără.*ceapă|without.*onion/i,
  /bine.*făcut|well.*done|medium|rare|cum.*doresc.*carnea/i,
  /alergii|allergy|intoleranțe|nu.*mănânc/i,
  /dietă.*specială|special.*diet|diabetic|fără.*zahăr/i,
  /porție.*mare|porție.*mică|portion|size/i
];

export const specialRequestsPatternsEN = [
  /modify.*order|no.*salt|no.*oil|low.*salt|low.*oil/i,
  /extra.*sauce|more.*sauce|no.*onion|without.*onion/i,
  /well.*done|medium|rare|how.*do.*you.*want.*your.*meat/i,
  /allergy|allergies|intolerance|i.*don.*t.*eat/i,
  /special.*diet|diabetic|no.*sugar/i,
  /large.*portion|small.*portion|portion.*size/i
];

export const greetingPatternsRO = [
  /^bună$/i, /^salut$/i, /^ciao$/i, /^hei$/i, /^hey$/i, /^hi$/i, /^hello$/i,
  /bună.*ziua/i, /buna.*ziua/i, /salutare/i, /servus/i, /^salu?t$/i,
  /noroc/i, /ceau/i, /^bc$/i, /^bv$/i, /^bb$/i,
  /bună.*dimineața/i, /buna.*dimineata/i, /bună.*seara/i, /buna.*seara/i,
  /^yo$/i, /^hola$/i, /^ahoy$/i, /^greetings$/i,
  /bun.*venit/i, /bun.*venit/i, /întâmpinare/i, /întâmpinare/i
];

export const greetingPatternsEN = [
  /^hi$/i, /^hello$/i, /^hey$/i, /^hiya$/i, /^heya$/i, /^howdy$/i,
  /^greetings$/i, /^good morning$/i, /^good afternoon$/i, /^good evening$/i,
  /^what's up$/i, /^sup$/i, /^yo$/i, /^ahoy$/i, /^hola$/i, /^ciao$/i,
  /^welcome$/i, /^nice to see you$/i, /^good to see you$/i,
  /^how are you doing$/i, /^how's it going$/i, /^how do you do$/i
];

export const howAreYouPatternsRO = [
  /ce.*fac/i, /cum.*esti/i, /cum.*mai.*esti/i, /ce.*mai.*fac/i,
  /cum.*iti.*merge/i, /cum.*iti.*place/i, /ce.*mai.*e.*nou/i,
  /cum.*te.*simți/i, /cum.*te.*simti/i, /ce.*mai.*zici/i,
  /totul.*bine/i, /esti.*bine/i, /ești.*bine/i,
  /cum.*o.*duci/i, /ce.*mai/i, /ce.*fac/i,
  /how.*are.*you/i, /how.*you.*doing/i, /how.*is.*it.*going/i,
  /what.*are.*you.*up.*to/i, /what's.*new/i, /what's.*up/i
];

export const howAreYouPatternsEN = [
  /how are you/i, /how are you doing/i, /how do you feel/i,
  /how's it going/i, /how's everything/i, /how have you been/i,
  /what's up/i, /what's new/i, /what are you up to/i,
  /how you doing/i, /how is everything/i, /how goes it/i,
  /how's life/i, /how's your day/i, /how's your day going/i,
  /are you ok/i, /are you okay/i, /you good/i, /you alright/i
];

export const whoAreYouPatternsRO = [
  /cine.*esti/i, /cu.*cine.*vorbesc/i, /te.*cunosc/i, /ma.*cunosti/i,
  /cum.*te.*cheama/i, /care.*e.*numele.*tau/i, /esti.*robot/i,
  /esti.*real/i, /esti.*om/i, /esti.*persoană/i, /esti.*persoana/i,
  /ai.*conștiință/i, /ai.*constiinta/i, /ai.*suflet/i,
  /what.*are.*you/i, /who.*are.*you/i, /who.*is.*this/i,
  /are.*you.*real/i, /are.*you.*human/i, /are.*you.*a.*person/i,
  /are.*you.*a.*robot/i, /do.*you.*exist/i, /what.*is.*your.*name/i
];

export const whoAreYouPatternsEN = [
  /who are you/i, /what are you/i, /who is this/i, /who am i talking to/i,
  /what is your name/i, /who created you/i, /who made you/i,
  /are you human/i, /are you a person/i, /are you real/i,
  /are you a robot/i, /are you ai/i, /are you artificial/i,
  /do you have consciousness/i, /do you have feelings/i,
  /what is your purpose/i, /why were you created/i,
  /can you think/i, /are you alive/i, /do you exist/i
];

export const todayPatternsRO = [
  /ce.*zi.*este/i, /ce.*zi.*e.*azi/i, /care.*e.*data.*azi/i,
  /ce.*data.*este/i, /ce.*data.*e.*azi/i, /ziua.*de.*azi/i,
  /what.*day.*is.*it/i, /what.*date.*is.*today/i, /what.*is.*today/i,
  /current.*date/i, /today.*date/i, /which.*day.*today/i,
  /ce.*luna.*este/i, /ce.*an.*este/i, /care.*e.*anul/i
];

export const todayPatternsEN = [
  /what day is it/i, /what date is today/i, /what is today/i,
  /what's today's date/i, /what is the date/i, /current date/i,
  /today's date/i, /which day is today/i, /what day today/i,
  /what month is it/i, /what year is it/i, /what's the year/i,
  /day of the week/i, /what is the day/i
];

export const weatherPatternsRO = [
  /ce.*vreme.*este/i, /ce.*vreme.*e.*afara/i, /cum.*e.*vremea/i,
  /vremea.*azi/i, /prognoza.*meteo/i, /ploua/i, /ninge/i, /soare/i,
  /temperatura/i, /grad/i, /grade/i, /umiditate/i, /vant/i,
  /what.*weather/i, /how.*is.*weather/i, /weather.*today/i,
  /is.*it.*raining/i, /is.*it.*snowing/i, /is.*it.*sunny/i,
  /temperature.*today/i, /weather.*forecast/i, /how.*hot/i, /how.*cold/i
];

export const weatherPatternsEN = [
  /how is the weather/i, /what's the weather/i, /what is the weather/i,
  /weather today/i, /weather forecast/i, /how's weather/i,
  /is it raining/i, /is it sunny/i, /is it snowing/i,
  /what's the temperature/i, /how hot is it/i, /how cold is it/i,
  /temperature today/i, /weather outside/i, /how's outside/i,
  /rain today/i, /snow today/i, /sunny today/i
];

export const thanksPatternsRO = [
  /^mulțumesc$/i, /^multumesc$/i, /^mersi$/i, /^thanks$/i, /^thank you$/i,
  /mulțumesc.*mult/i, /multumesc.*mult/i, /mersi.*mult/i, /mersi.*frumos/i,
  /iti.*multumesc/i, /îți.*mulțumesc/i, /mulțumiri/i, /multumiri/i,
  /foarte.*amabil/i, /esti.*dragut/i, /ești.*drăguț/i,
  /appreciate/i, /grateful/i, /thanks.*a.*lot/i, /thank.*you.*so.*much/i
];

export const thanksPatternsEN = [
  /^thanks$/i, /^thank you$/i, /^thank$/i, /^thx$/i, /^ty$/i,
  /thanks a lot/i, /thank you so much/i, /many thanks/i,
  /much appreciated/i, /i appreciate it/i, /grateful/i,
  /you're awesome/i, /you're the best/i, /you rock/i,
  /thank you very much/i, /thanks a bunch/i, /thanks a million/i
];

export const complimentPatternsRO = [
  /esti.*tare/i, /ești.*tare/i, /esti.*smart/i, /ești.*smart/i,
  /esti.*inteligent/i, /ești.*inteligent/i, /esti.*destept/i, /ești.*deștept/i,
  /esti.*amuzant/i, /ești.*amuzant/i, /esti.*comic/i, /ești.*comic/i,
  /esti.*simpatic/i, /ești.*simpatic/i, /esti.*util/i, /ești.*util/i,
  /imi.*place/i, /îmi.*place/i, /super/i, /excelent/i, /minunat/i,
  /fantastic/i, /extraordinar/i, /uimitor/i, /bravo/i, /felicitări/i,
  /good.*job/i, /well.*done/i, /awesome/i, /great/i, /amazing/i,
  /wonderful/i, /fantastic/i, /excellent/i, /brilliant/i
];

export const complimentPatternsEN = [
  /you're smart/i, /you are smart/i, /you're intelligent/i,
  /you are intelligent/i, /you're clever/i, /you are clever/i,
  /you're funny/i, /you are funny/i, /you're cool/i, /you are cool/i,
  /you're awesome/i, /you are awesome/i, /you're amazing/i,
  /you are amazing/i, /you're great/i, /you are great/i,
  /you're the best/i, /you are the best/i, /good job/i, /well done/i,
  /nice work/i, /excellent/i, /fantastic/i, /wonderful/i,
  /brilliant/i, /outstanding/i, /impressive/i
];

export const smallTalkPatternsRO = [
  /ce.*fac/i, /ce.*mai.*fac/i, /ce.*nou/i, /ce.*mai.*e.*nou/i,
  /cum.*iti.*place/i, /ce.*hobby/i, /ce.*pasiuni/i, /ce.*it.*place/i,
  /vorbesti/i, /poți.*vorbi/i, /poti.*vorbi/i, /stii.*sa.*vorbesti/i,
  /ai.*viata/i, /ai.*prieteni/i, /ai.*familie/i, /unde.*locuiesti/i,
  /ce.*mananci/i, /ce.*bei/i, /iti.*place.*să.*lucrezi/i, /iti.*place.*munca/i,
  /what.*do.*you.*do/i, /what.*are.*your.*hobbies/i, /do.*you.*have.*friends/i,
  /where.*do.*you.*live/i, /what.*do.*you.*eat/i, /do.*you.*sleep/i,
  /do.*you.*dream/i, /can.*you.*love/i, /do.*you.*have.*feelings/i
];

export const smallTalkPatternsEN = [
  /what do you do/i, /what are you doing/i, /what's new/i,
  /what are your hobbies/i, /do you have hobbies/i, /what do you like/i,
  /can you talk/i, /do you speak/i, /can you chat/i,
  /do you have friends/i, /do you have family/i, /where do you live/i,
  /what do you eat/i, /do you sleep/i, /do you dream/i,
  /do you have feelings/i, /can you love/i, /do you get tired/i,
  /what makes you happy/i, /what do you think about/i
];

export const restaurantNamePatternsRO = [
  /cum.*v.*a.*numi/i, /ce.*nume.*ave/i, /de.*ce.*v.*a.*numi/i,
  /care.*e.*numele.*restaurant/i, /numele.*local/i, /semnifica.*nume/i,
  /de.*ce.*diana/i, /cine.*e.*diana/i, /de.*unde.*numele/i,
  /what.*name/i, /why.*name/i, /what.*called/i, /restaurant.*name/i,
  /meaning.*name/i, /story.*behind.*name/i, /how.*get.*name/i,
  /nume.*restaurant/i, /denumire/i, /cum.*se.*cheama.*localul/i,
  /de.*ce.*v.*a.*cheama/i, /explica.*numele/i, /poveste.*nume/i
];

export const restaurantNamePatternsEN = [
  /what.*name/i, /what.*are.*you.*called/i, /why.*name/i,
  /what.*is.*the.*name/i, /restaurant.*name/i, /what.*called/i,
  /meaning.*of.*name/i, /story.*behind.*name/i, /how.*get.*name/i,
  /why.*diana/i, /who.*is.*diana/i, /where.*name.*from/i,
  /what.*does.*name.*mean/i, /name.*significance/i,
  /tell.*about.*name/i, /explain.*name/i, /name.*story/i
];

export const conceptPatternsRO = [
  /ce.*fel.*de.*restaurant/i, /care.*e.*conceptul/i, /ce.*stil.*ave/i,
  /cum.*e.*restaurantul/i, /ce.*tip.*de.*local/i, /atmosfer/i,
  /ce.*faci/i, /ce.*ofe/i, /specialitate/i, /ce.*va.*diferenti/i,
  /concept/i, /stil/i, /tip/i, /filosofie/i, /abordare/i,
  /what.*kind.*restaurant/i, /what.*concept/i, /what.*style/i,
  /what.*type/i, /atmosphere/i, /vibe/i, /theme/i
];

export const conceptPatternsEN = [
  /what.*kind.*of.*restaurant/i, /what.*concept/i, /what.*style/i,
  /what.*type.*of.*place/i, /atmosphere/i, /vibe/i, /theme/i,
  /what.*do.*you.*do/i, /what.*do.*you.*offer/i, /specialty/i,
  /what.*makes.*you.*different/i, /concept/i, /style/i,
  /type/i, /philosophy/i, /approach/i
];

export const ownershipPatternsRO = [
  /cine.*detine/i, /cine.*e.*proprietar/i, /cine.*e.*sef/i,
  /cine.*v.*a.*deschis/i, /fondator/i, /proprietar/i, /detinator/i,
  /who.*owns/i, /who.*is.*owner/i, /who.*is.*boss/i,
  /who.*started/i, /founder/i, /owner/i, /proprietor/i,
  /cine.*conduce/i, /management/i, /administratie/i
];

export const ownershipPatternsEN = [
  /who.*owns/i, /who.*is.*the.*owner/i, /who.*is.*in.*charge/i,
  /who.*started/i, /founder/i, /owner/i, /proprietor/i,
  /who.*runs/i, /management/i, /administration/i
];

export const historyPatternsRO = [
  /cand.*v.*a.*deschis/i, /de.*cand.*exista/i, /istoric/i,
  /istorie/i, /cati.*ani/i, /vechime/i, /an.*infiintare/i,
  /when.*open/i, /how.*long/i, /history/i, /since.*when/i,
  /years.*open/i, /age.*restaurant/i, /established/i,
  /poveste/i, /evolutie/i, /cum.*a.*inceput/i
];

export const historyPatternsEN = [
  /when.*did.*you.*open/i, /how.*long.*have.*you.*been.*open/i,
  /history/i, /since.*when/i, /years.*open/i, /age.*restaurant/i,
  /established/i, /story/i, /evolution/i, /how.*did.*you.*start/i
];

export const sustainabilityPatternsRO = [
  /sustenabil/i, /eco/i, /verde/i, /mediu/i, /reciclare/i,
  /zero.*deseuri/i, /plastic/i, /biodegradabil/i, /organic/i,
  /local/i, /furnizor/i, /energie.*regenerabil/i,
  /sustainability/i, /eco.*friendly/i, /green/i, /environment/i,
  /recycling/i, /zero.*waste/i, /biodegradable/i
];

export const sustainabilityPatternsEN = [
  /sustainability/i, /eco.*friendly/i, /green/i, /environment/i,
  /recycling/i, /zero.*waste/i, /plastic/i, /biodegradable/i,
  /organic/i, /local/i, /supplier/i, /renewable.*energy/i
];

export const dietaryOptionsPatternsRO = [
  /vegetarian/i, /vegan/i, /gluten/i, /lactoza/i, /alergie/i,
  /intoleranta/i, /dieta/i, /regim/i, /restrictie/i,
  /opțiuni.*special/i, /nevoi.*special/i, /fara.*gluten/i,
  /fara.*lactoza/i, /keto/i, /paleo/i,
  /vegetarian/i, /vegan/i, /gluten.*free/i, /lactose.*free/i,
  /allergy/i, /intolerance/i, /diet/i, /restriction/i
];

export const dietaryOptionsPatternsEN = [
  /vegetarian/i, /vegan/i, /gluten.*free/i, /lactose.*free/i,
  /allergy/i, /intolerance/i, /diet/i, /restriction/i,
  /special.*options/i, /special.*needs/i, /keto/i, /paleo/i
];

export const kidsPatternsRO = [
  /copii/i, /children/i, /kids/i, /familie/i, /family/i,
  /meniu.*copii/i, /kids.*menu/i, /scaun.*inalt/i, /high.*chair/i,
  /activitat.*copii/i, /kids.*activities/i, /family.*friendly/i,
  /bebelus/i, /baby/i, /toddler/i, /jucarii/i, /toys/i
];

export const kidsPatternsEN = [
  /children/i, /kids/i, /family/i, /kids.*menu/i,
  /high.*chair/i, /kids.*activities/i, /family.*friendly/i,
  /baby/i, /toddler/i, /toys/i
];

export const eventsPatternsRO = [
  /eveniment/i, /event/i, /nunta/i, /wedding/i, /botez/i,
  /christening/i, /corporate/i, /aniversare/i, /birthday/i,
  /petrecere/i, /party/i, /rezervare/i, /reservation/i,
  /grup.*mare/i, /large.*group/i, /muzica.*live/i, /live.*music/i
];

export const eventsPatternsEN = [
  /event/i, /wedding/i, /christening/i, /corporate/i,
  /birthday/i, /party/i, /reservation/i, /large.*group/i,
  /live.*music/i
];

export const technicalPatternsRO = [
  /wifi/i, /wi.*fi/i, /internet/i, /parola/i, /password/i,
  /priza/i, /outlet/i, /incarcator/i, /charger/i,
  /aplicatie/i, /app/i, /site/i, /website/i, /online/i,
  /contact/i, /telefon/i, /phone/i, /email/i, /adresa/i
];

export const technicalPatternsEN = [
  /wifi/i, /wi.*fi/i, /internet/i, /password/i, /outlet/i,
  /charger/i, /app/i, /website/i, /online/i, /contact/i,
  /phone/i, /email/i, /address/i
];

export const feedbackPatternsRO = [
  /feedback/i, /parere/i, /opinie/i, /sugestie/i,
  /suggestion/i, /reclamatie/i, /complaint/i, /problema/i,
  /problem/i, /manager/i, /seful/i, /boss/i, /review/i,
  /recenzie/i, /rating/i, /nota/i, /grade/i
];

export const feedbackPatternsEN = [
  /feedback/i, /opinion/i, /suggestion/i, /complaint/i,
  /problem/i, /manager/i, /boss/i, /review/i, /rating/i,
  /grade/i
];

export const bestSellerPatternsRO = [
  /best.*seller/i, /cel.*mai.*vandut/i, /cel.*mai.*popular/i,
  /top.*produs/i, /ce.*se.*cumpără.*mai.*mult/i, /ce.*se.*comanda.*mai.*mult/i,
  /cele.*mai.*vandute/i, /produse.*populare/i, /preferinte.*clienti/i,
  /ce.*mananca.*lumea/i, /ce.*comanda.*lumea/i, /trend.*culinar/i,
  /cele.*mai.*comandate/i, /top.*vanzari/i, /statistici.*produse/i
];

export const bestSellerPatternsEN = [
  /best.*seller/i, /most.*popular/i, /top.*product/i,
  /what.*sells.*most/i, /what.*do.*people.*order/i,
  /popular.*items/i, /customer.*favorites/i, /trending.*dishes/i,
  /most.*ordered/i, /sales.*statistics/i, /top.*selling/i,
  /what.*is.*trending/i, /customer.*preferences/i
];

export const patterns = {
  ro: {
    language: languagePatternsRO,
    waiter: waiterPatternsRO,
    recommendation: recommendationPatternsRO,
    best_seller: bestSellerPatternsRO,
    menu: menuPatternsRO,
    ingredients: ingredientsPatternsRO,
    hours_location: hoursLocationPatternsRO,
    services: servicesFacilitiesPatternsRO,
    order_status: orderStatusPatternsRO,
    payment: paymentPatternsRO,
    special_requests: specialRequestsPatternsRO,
    greeting: greetingPatternsRO,
    how_are_you: howAreYouPatternsRO,
    who_are_you: whoAreYouPatternsRO,
    today: todayPatternsRO,
    weather: weatherPatternsRO,
    thanks: thanksPatternsRO,
    compliment: complimentPatternsRO,
    small_talk: smallTalkPatternsRO,
    restaurant_name: restaurantNamePatternsRO,
    concept: conceptPatternsRO,
    ownership: ownershipPatternsRO,
    history: historyPatternsRO,
    sustainability: sustainabilityPatternsRO,
    dietary_options: dietaryOptionsPatternsRO,
    kids: kidsPatternsRO,
    events: eventsPatternsRO,
    technical: technicalPatternsRO,
    feedback: feedbackPatternsRO
  },
  en: {
    language: languagePatternsEN,
    waiter: waiterPatternsEN,
    recommendation: recommendationPatternsEN,
    best_seller: bestSellerPatternsEN,
    menu: menuPatternsEN,
    ingredients: ingredientsPatternsEN,
    hours_location: hoursLocationPatternsEN,
    services: servicesFacilitiesPatternsEN,
    order_status: orderStatusPatternsEN,
    payment: paymentPatternsEN,
    special_requests: specialRequestsPatternsEN,
    greeting: greetingPatternsEN,
    how_are_you: howAreYouPatternsEN,
    who_are_you: whoAreYouPatternsEN,
    today: todayPatternsEN,
    weather: weatherPatternsEN,
    thanks: thanksPatternsEN,
    compliment: complimentPatternsEN,
    small_talk: smallTalkPatternsEN,
    restaurant_name: restaurantNamePatternsEN,
    concept: conceptPatternsEN,
    ownership: ownershipPatternsEN,
    history: historyPatternsEN,
    sustainability: sustainabilityPatternsEN,
    dietary_options: dietaryOptionsPatternsEN,
    kids: kidsPatternsEN,
    events: eventsPatternsEN,
    technical: technicalPatternsEN,
    feedback: feedbackPatternsEN
  }
};
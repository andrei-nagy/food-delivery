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
  /configure.*language/i, /language.*option/i, /change.*the.*language/i,
  /current.*language/i, /default.*language/i, /preferred.*language/i,
  /how.*to.*change.*language/i, /translation/i, /translate/i,
  /do.*you.*speak.*english/i, /do.*you.*speak.*romanian/i
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
  /it.*doesn.*t.*work/i, /not.*working/i,
  /could.*you.*come.*to.*table/i, /can.*you.*come.*to.*table/i,
  /need.*a.*server/i, /call.*attendant/i,
  /assistance.*please/i, /help.*please/i,
  /i.*need.*a.*waiter/i, /i.*would.*like.*to.*pay/i,
  /i.*want.*you.*to.*bring.*the.*bill/i, /bring.*the.*bill.*please/i,
  /i.*am.*ready.*to.*pay/i, /i.*am.*ready.*for.*the.*bill/i,
  /how.*do.*you.*process.*payment/i, /payment.*methods/i,
  /do.*you.*accept.*card/i, /do.*you.*accept.*cash/i
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
  /recommend/i, /recommends/i, /recommended/i, /recommending/i,
  /what.*do.*you.*recommend.*for.*appetizer/i, /what.*recommend.*for.*dessert/i,
  /what.*drinks.*do.*you.*recommend/i, /what.*is.*the.*best.*wine/i,
  /what.*beer.*do.*you.*recommend/i, /recommended.*menu/i, /menu.*recommendation/i,
  /what.*is.*new.*on.*the.*menu/i, /culinary.*news/i,
  /what.*dishes.*are.*special/i, /what.*are.*the.*specialties/i,
  /personalized.*recommendations/i, /based.*on.*preferences/i
];

export const bestSellerPatternsEN = [
  /best.*seller/i, /most.*popular/i, /top.*product/i,
  /what.*sells.*most/i, /what.*do.*people.*order/i,
  /popular.*items/i, /customer.*favorites/i, /trending.*dishes/i,
  /most.*ordered/i, /sales.*statistics/i, /top.*selling/i,
  /what.*is.*trending/i, /customer.*preferences/i,
  /season.*hit/i, /star.*product/i, /house.*specialty/i,
  /customer.*recommendation/i, /customer.*favorites/i,
  /what.*is.*most.*wanted/i, /trending.*dishes/i,
  /most.*appreciated/i, /most.*loved/i,
  /award.*winning.*products/i, /award.*winners/i,
  /award.*winning.*menu/i, /recommended.*specialties/i
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
  /what.*soft.*drinks|sodas|mineral.*water|what.*coffee/i,
  /digital.*menu/i, /online.*menu/i, /menu.*card/i,
  /list.*of.*dishes/i, /list.*of.*drinks/i, /product.*catalog/i,
  /types.*of.*food/i, /menu.*categories/i,
  /dessert.*menu/i, /appetizer.*menu/i, /main.*course.*menu/i,
  /breakfast.*menu/i, /dinner.*menu/i, /supper.*menu/i,
  /current.*prices/i, /cost.*of.*dishes/i, /budget/i,
  /displayed.*menu/i, /where.*can.*i.*see.*the.*menu/i, /how.*to.*access.*menu/i,
  /menu.*pdf/i, /scan.*menu/i, /qr.*code.*menu/i
];

export const ingredientsPatternsEN = [
  /what.*ingredients|ingredients|what.*is.*it.*made.*of|contains/i,
  /how.*is.*it.*prepared|how.*do.*you.*make|recipe|preparation/i,
  /does.*it.*have.*allergens|allergens|dairy.*free|gluten.*free|vegan/i,
  /vegetarian|spicy|hot|seasoning|sauces/i,
  /fresh|frozen|home.*made|homemade/i,
  /what.*meat.*do.*you.*use|what.*fish|fresh.*fish|fresh.*vegetables/i,
  /bio|organic|natural|no.*preservatives|additives/i,
  /fresh.*ingredients/i, /local.*ingredients/i,
  /ingredient.*sources/i, /ingredient.*origin/i,
  /quality.*ingredients/i, /ingredient.*quality/i,
  /natural.*ingredients/i, /organic.*ingredients/i,
  /contains.*eggs/i, /contains.*dairy/i, /contains.*nuts/i,
  /declared.*allergens/i, /allergen.*information/i,
  /preparation.*method/i, /preparation.*time/i,
  /secret.*ingredients/i, /house.*recipe/i,
  /imported.*ingredients/i, /romanian.*ingredients/i
];

export const hoursLocationPatternsEN = [
  /hours|opening.*time|closing.*time|when.*are.*you.*open/i,
  /location|address|where.*are.*you|how.*to.*get.*there|directions/i,
  /parking|parking.*space|parking.*lot|access|transportation/i,
  /closed.*today|open.*sunday|holiday.*hours/i,
  /reservations|reservation|table|booking/i,
  /terrace|inside|outside|seating|seats/i,
  /smoking.*area|smoking|non.*smoking/i,
  /working.*hours/i, /visiting.*hours/i, /when.*can.*you.*come/i,
  /when.*are.*you.*open/i, /what.*time.*do.*you.*open/i,
  /what.*time.*do.*you.*close/i, /weekend.*hours/i,
  /exact.*address/i, /coordinates|gps|google.*maps/i,
  /how.*to.*get.*there.*by.*car/i, /how.*to.*get.*there.*by.*transport/i,
  /subway.*stations|bus|tram|train/i,
  /city.*center.*location|downtown|suburbs/i,
  /free.*parking|paid.*parking/i,
  /available.*parking.*spots/i, /indoor.*parking/i,
  /vehicle.*access|access.*for.*people.*with.*reduced.*mobility/i
];

export const servicesFacilitiesPatternsEN = [
  /wi.*fi|internet|parking|toilet|bathroom|restroom/i,
  /handicap.*accessible|disabled.*access|accessibility/i,
  /terrace|garden|view|seafront|sea.*view/i,
  /live.*music|event|party|entertainment/i,
  /tv|television|sport|game|projector/i,
  /heating|air.*conditioning|ac/i,
  /dressing|locker|shower/i,
  /playground|children|kids.*area/i,
  /free.*wifi|free.*internet|complimentary.*wifi/i,
  /wifi.*password|password.*wifi/i, /internet.*connection/i,
  /public.*restrooms|accessible.*restrooms/i,
  /disabled.*bathroom|handicap.*restroom/i,
  /play.*area|children|playground|kids.*zone/i,
  /air.*conditioning|heating|cooling.*system/i,
  /heating.*in.*winter|cooling.*in.*summer/i,
  /projector.*screen|audio.*system|sound/i,
  /event.*hall|event.*space|corporate.*space/i,
  /private.*space|private.*room|separator/i,
  /panoramic.*view|city.*view|sea.*view/i,
  /roof.*top|roof.*terrace/i,
  /indoor.*garden|courtyard|atrium/i,
  /pet.*friendly|dogs.*allowed|pets.*allowed/i
];

export const orderStatusPatternsEN = [
  /order.*status|my.*order|where.*is.*my.*order|when.*will.*my.*order.*come/i,
  /order.*tracking|track.*my.*order/i,
  /lost.*order|late.*order|didn.*t.*receive.*order/i,
  /modify.*order|change.*order|cancel.*order/i,
  /add.*to.*order|i.*want.*more|something.*else/i,
  /how.*long.*for.*order/i, /preparation.*time/i,
  /is.*my.*order.*ready/i, /is.*my.*order.*being.*prepared/i,
  /where.*is.*the.*waiter.*with.*my.*order/i, /where.*is.*my.*order/i,
  /i.*have.*waited.*long/i, /order.*delayed/i,
  /can.*i.*modify.*my.*order/i, /can.*i.*cancel.*my.*order/i,
  /i.*want.*to.*cancel.*my.*order/i, /i.*want.*to.*modify.*my.*order/i,
  /add.*something.*else/i, /add.*more.*to.*order/i,
  /order.*ready.*for.*pickup/i, /takeaway.*order/i,
  /delivery.*order/i, /order.*for.*delivery/i,
  /order.*number/i, /order.*confirmation/i
];

export const paymentPatternsEN = [
  /pay|payment|cash|card|money|how.*do.*i.*pay/i,
  /bill|receipt|check/i,
  /service.*charge|tip|gratuity/i,
  /split.*bill|pay.*separately/i,
  /voucher|discount|coupon|promotion/i,
  /vat|tax|invoice/i,
  /payment.*method/i, /payment.*option/i,
  /how.*to.*pay/i, /payment.*process/i,
  /cash.*payment/i, /card.*payment/i, /contactless.*payment/i,
  /phone.*payment/i, /apple.*pay|google.*pay/i,
  /online.*payment/i, /transfer.*payment/i,
  /installment.*payment/i, /credit|debit/i,
  /split.*the.*bill/i, /separate.*payment/i,
  /without.*receipt/i, /with.*receipt/i, /fiscal.*receipt/i,
  /student.*discount/i, /senior.*discount/i,
  /gift.*voucher/i, /loyalty.*card/i
];

export const specialRequestsPatternsEN = [
  /modify.*order|no.*salt|no.*oil|low.*salt|low.*oil/i,
  /extra.*sauce|more.*sauce|no.*onion|without.*onion/i,
  /well.*done|medium|rare|how.*do.*you.*want.*your.*meat/i,
  /allergy|allergies|intolerance|i.*don.*t.*eat/i,
  /special.*diet|diabetic|no.*sugar/i,
  /large.*portion|small.*portion|portion.*size/i,
  /no.*pepper|no.*spices|no.*seasoning/i,
  /extra.*cheese|extra.*meat|extra.*salami/i,
  /mild.*spicy|very.*spicy/i,
  /no.*meat|no.*fish|no.*dairy/i,
  /customized.*menu|special.*order/i,
  /special.*requirements|special.*needs/i,
  /food.*allergies|food.*intolerances/i,
  /menu.*modifications|menu.*adaptations/i,
  /keto.*diet|paleo.*diet|vegan.*diet/i,
  /no.*carbs|low.*carb/i,
  /gluten.*free|lactose.*free|sugar.*free/i,
  /kids.*order|children.*menu/i,
  /no.*salt.*dishes|low.*sodium/i,
  /exclude.*ingredients|ingredients.*excluded/i
];

export const greetingPatternsEN = [
  /^hi$/i, /^hello$/i, /^hey$/i, /^hiya$/i, /^heya$/i, /^howdy$/i,
  /^greetings$/i, /^good morning$/i, /^good afternoon$/i, /^good evening$/i,
  /^what's up$/i, /^sup$/i, /^yo$/i, /^ahoy$/i, /^hola$/i, /^ciao$/i,
  /^welcome$/i, /^nice to see you$/i, /^good to see you$/i,
  /^how are you doing$/i, /^how's it going$/i, /^how do you do$/i,
  /^hey.*there$/i, /^hello.*everyone$/i, /^hi.*all$/i,
  /^good.*day$/i, /^good.*night$/i, /^good.*evening$/i,
  /^pleasure.*to.*meet.*you$/i, /^nice.*to.*meet.*you$/i
];

export const howAreYouPatternsEN = [
  /how are you/i, /how are you doing/i, /how do you feel/i,
  /how's it going/i, /how's everything/i, /how have you been/i,
  /what's up/i, /what's new/i, /what are you up to/i,
  /how you doing/i, /how is everything/i, /how goes it/i,
  /how's life/i, /how's your day/i, /how's your day going/i,
  /are you ok/i, /are you okay/i, /you good/i, /you alright/i,
  /how.*do.*you.*feel/i, /how.*are.*things/i, /how.*is.*life/i,
  /what.*have.*you.*been.*up.*to/i, /how.*is.*your.*day/i,
  /are.*you.*busy/i, /do.*you.*have.*time/i, /are.*you.*feeling.*good/i
];

export const whoAreYouPatternsEN = [
  /who are you/i, /what are you/i, /who is this/i, /who am i talking to/i,
  /what is your name/i, /who created you/i, /who made you/i,
  /are you human/i, /are you a person/i, /are you real/i,
  /are you a robot/i, /are you ai/i, /are you artificial/i,
  /do you have consciousness/i, /do you have feelings/i,
  /what is your purpose/i, /why were you created/i,
  /can you think/i, /are you alive/i, /do you exist/i,
  /who.*made.*you/i, /who.*built.*you/i, /who.*developed.*you/i,
  /do.*you.*have.*creator/i, /do.*you.*have.*parents/i,
  /do.*you.*have.*family/i, /what.*do.*you.*do.*here/i,
  /what.*is.*your.*purpose/i, /why.*do.*you.*exist/i,
  /are.*you.*a.*program/i, /are.*you.*a.*computer/i,
  /do.*you.*have.*intelligence/i
];

export const todayPatternsEN = [
  /what day is it/i, /what date is today/i, /what is today/i,
  /what's today's date/i, /what is the date/i, /current date/i,
  /today's date/i, /which day is today/i, /what day today/i,
  /what month is it/i, /what year is it/i, /what's the year/i,
  /day of the week/i, /what is the day/i,
  /what time is it/i, /what's the time/i, /current time/i,
  /today's calendar/i, /current month/i, /current year/i,
  /when.*is.*christmas/i, /when.*is.*new.*year/i,
  /when.*is.*easter/i, /holidays/i
];

export const weatherPatternsEN = [
  /how is the weather/i, /what's the weather/i, /what is the weather/i,
  /weather today/i, /weather forecast/i, /how's weather/i,
  /is it raining/i, /is it sunny/i, /is it snowing/i,
  /what's the temperature/i, /how hot is it/i, /how cold is it/i,
  /temperature today/i, /weather outside/i, /how's outside/i,
  /rain today/i, /snow today/i, /sunny today/i,
  /weather.*tomorrow/i, /forecast.*for.*the.*week/i,
  /outside.*temperature/i, /what.*does.*the.*thermometer.*say/i,
  /humidity/i, /atmospheric.*pressure/i,
  /strong.*wind/i, /blizzard/i, /fog/i, /cloudy/i,
  /nice.*weather/i, /bad.*weather/i
];

export const thanksPatternsEN = [
  /^thanks$/i, /^thank you$/i, /^thank$/i, /^thx$/i, /^ty$/i,
  /thanks a lot/i, /thank you so much/i, /many thanks/i,
  /much appreciated/i, /i appreciate it/i, /grateful/i,
  /you're awesome/i, /you're the best/i, /you rock/i,
  /thank you very much/i, /thanks a bunch/i, /thanks a million/i,
  /thank.*you.*from.*the.*bottom.*of.*my.*heart/i,
  /thanks.*for.*your.*help/i, /thank.*you.*for.*your.*help/i,
  /you're.*super/i, /you're.*wonderful/i, /you're.*fantastic/i,
  /thanks.*a.*ton/i, /i.*owe.*you.*one/i
];

export const complimentPatternsEN = [
  /you're smart/i, /you are smart/i, /you're intelligent/i,
  /you are intelligent/i, /you're clever/i, /you are clever/i,
  /you're funny/i, /you are funny/i, /you're cool/i, /you are cool/i,
  /you're awesome/i, /you are awesome/i, /you're amazing/i,
  /you are amazing/i, /you're great/i, /you are great/i,
  /you're the best/i, /you are the best/i, /good job/i, /well done/i,
  /nice work/i, /excellent/i, /fantastic/i, /wonderful/i,
  /brilliant/i, /outstanding/i, /impressive/i,
  /you're fast/i, /you are fast/i, /you're efficient/i,
  /you are efficient/i, /you're professional/i, /you are professional/i,
  /you're good/i, /you are good/i, /you work well/i,
  /you do good work/i, /you're the best/i, /you are the best/i
];

export const smallTalkPatternsEN = [
  /what do you do/i, /what are you doing/i, /what's new/i,
  /what are your hobbies/i, /do you have hobbies/i, /what do you like/i,
  /can you talk/i, /do you speak/i, /can you chat/i,
  /do you have friends/i, /do you have family/i, /where do you live/i,
  /what do you eat/i, /do you sleep/i, /do you dream/i,
  /do you have feelings/i, /can you love/i, /do you get tired/i,
  /what makes you happy/i, /what do you think about/i,
  /what.*do.*you.*do.*in.*your.*free.*time/i, /how.*do.*you.*spend.*your.*time/i,
  /do.*you.*have.*pets/i, /do.*you.*like.*sports/i, /what.*music.*do.*you.*listen/i,
  /what.*movies.*do.*you.*like/i, /what.*books.*do.*you.*read/i,
  /do.*you.*have.*vacations/i, /where.*have.*you.*traveled/i,
  /what.*gives.*you.*pleasure/i
];

export const restaurantNamePatternsEN = [
  /what.*name/i, /what.*are.*you.*called/i, /why.*name/i,
  /what.*is.*the.*name/i, /restaurant.*name/i, /what.*called/i,
  /meaning.*of.*name/i, /story.*behind.*name/i, /how.*get.*name/i,
  /why.*diana/i, /who.*is.*diana/i, /where.*name.*from/i,
  /what.*does.*name.*mean/i, /name.*significance/i,
  /tell.*about.*name/i, /explain.*name/i, /name.*story/i,
  /history.*of.*the.*name/i, /why.*did.*you.*choose.*this.*name/i,
  /who.*chose.*the.*name/i, /does.*the.*name.*have.*a.*history/i,
  /significance.*of.*the.*name/i, /symbolic.*name/i
];

export const conceptPatternsEN = [
  /what.*kind.*of.*restaurant/i, /what.*concept/i, /what.*style/i,
  /what.*type.*of.*place/i, /atmosphere/i, /vibe/i, /theme/i,
  /what.*do.*you.*do/i, /what.*do.*you.*offer/i, /specialty/i,
  /what.*makes.*you.*different/i, /concept/i, /style/i,
  /type/i, /philosophy/i, /approach/i,
  /what.*kind.*of.*experience/i, /what.*type.*of.*clientele/i,
  /premium.*restaurant/i, /casual.*place/i, /family.*restaurant/i,
  /gourmet.*restaurant/i, /ethnic.*restaurant/i,
  /what.*makes.*you.*special/i, /what.*is.*your.*mission/i,
  /restaurant.*values/i, /restaurant.*principles/i
];

export const ownershipPatternsEN = [
  /who.*owns/i, /who.*is.*the.*owner/i, /who.*is.*in.*charge/i,
  /who.*started/i, /founder/i, /owner/i, /proprietor/i,
  /who.*runs/i, /management/i, /administration/i,
  /who.*is.*the.*boss/i, /who.*is.*the.*manager/i,
  /who.*established/i, /who.*created/i,
  /management.*team/i, /organizational.*structure/i,
  /who.*takes.*care.*of.*the.*restaurant/i, /who.*is.*responsible/i
];

export const historyPatternsEN = [
  /when.*did.*you.*open/i, /how.*long.*have.*you.*been.*open/i,
  /history/i, /since.*when/i, /years.*open/i, /age.*restaurant/i,
  /established/i, /story/i, /evolution/i, /how.*did.*you.*start/i,
  /history.*of.*the.*restaurant/i, /how.*was.*the.*place.*born/i,
  /important.*events/i, /historical.*moments/i,
  /changes.*over.*time/i, /renaming/i,
  /renovations/i, /expansions/i, /awards.*and.*recognitions/i
];

export const sustainabilityPatternsEN = [
  /sustainability/i, /eco.*friendly/i, /green/i, /environment/i,
  /recycling/i, /zero.*waste/i, /plastic/i, /biodegradable/i,
  /organic/i, /local/i, /supplier/i, /renewable.*energy/i,
  /environmental.*protection/i, /social.*responsibility/i,
  /eco.*products/i, /eco.*friendly.*packaging/i,
  /reduce.*carbon.*footprint/i, /water.*saving/i,
  /green.*energy/i, /renewable.*sources/i,
  /local.*partners/i, /local.*community/i,
  /sustainable.*agriculture/i, /sustainable.*fishing/i
];

export const dietaryOptionsPatternsEN = [
  /vegetarian/i, /vegan/i, /gluten.*free/i, /lactose.*free/i,
  /allergy/i, /intolerance/i, /diet/i, /restriction/i,
  /special.*options/i, /special.*needs/i, /keto/i, /paleo/i,
  /healthy.*eating/i, /healthy.*food/i,
  /healthy.*options/i, /light.*dishes/i,
  /no.*added.*sugar/i, /no.*oil/i, /no.*salt/i,
  /mediterranean.*diet/i, /plant.*based.*diet/i,
  /options.*for.*diabetics/i, /low.*calorie.*menu/i
];

export const kidsPatternsEN = [
  /children/i, /kids/i, /family/i, /kids.*menu/i,
  /high.*chair/i, /kids.*activities/i, /family.*friendly/i,
  /baby/i, /toddler/i, /toys/i,
  /kids.*space/i, /play.*area/i,
  /menu.*for.*children/i, /kids.*prices/i,
  /children.*discounts/i, /kids.*entertainment/i,
  /birthday.*parties/i, /children.*parties/i,
  /educational.*activities/i, /coloring.*books/i,
  /baby.*menu/i, /dishes.*for.*children/i
];

export const eventsPatternsEN = [
  /event/i, /wedding/i, /christening/i, /corporate/i,
  /birthday/i, /party/i, /reservation/i, /large.*group/i,
  /live.*music/i, /event.*hall/i, /event.*space/i,
  /event.*capacity/i, /event.*package/i,
  /event.*menu/i, /event.*organization/i,
  /teambuilding/i, /conference/i,
  /product.*launch/i, /banquet/i,
  /floral.*arrangements/i, /decorations/i,
  /sound.*system/i, /lighting/i, /video.*projection/i
];

export const technicalPatternsEN = [
  /wifi/i, /wi.*fi/i, /internet/i, /password/i, /outlet/i,
  /charger/i, /app/i, /website/i, /online/i, /contact/i,
  /phone/i, /email/i, /address/i,
  /network/i, /signal/i,
  /connection/i, /download/i,
  /upload/i, /internet.*speed/i,
  /phone.*charging/i, /battery/i,
  /tablet/i, /laptop/i, /computer/i,
  /technology/i, /tech/i, /digital/i
];

export const feedbackPatternsEN = [
  /feedback/i, /opinion/i, /suggestion/i, /complaint/i,
  /problem/i, /manager/i, /boss/i, /review/i, /rating/i,
  /grade/i, /how.*was.*it/i, /how.*did.*you.*like/i,
  /what.*can.*we.*improve/i, /improvement/i,
  /comment/i, /appreciation/i,
  /criticism/i, /critique/i, /praise/i,
  /feedback.*form/i, /opinion.*survey/i,
  /your.*experience/i, /our.*services/i
];

export const reservationPatternsEN = [
  /reservation/i, /booking/i, /reserve.*table/i,
  /i.*want.*to.*book/i, /table.*for.*.*people/i,
  /when.*do.*you.*have.*space/i, /availability/i,
  /reservation.*hours/i, /hours.*for.*reservations/i,
  /reservation.*confirmation/i, /cancellation.*reservation/i,
  /modify.*reservation/i, /waiting.*list/i,
  /window.*table/i, /garden.*table/i,
  /private.*table/i, /separate.*room/i
];

export const takeawayPatternsEN = [
  /takeaway/i, /take.*away/i, /delivery/i,
  /order.*home/i, /home.*delivery/i,
  /pick.*up/i, /order.*pickup/i,
  /online.*order/i, /order.*online/i,
  /free.*delivery/i, /delivery.*free/i,
  /delivery.*area/i, /area.*delivery/i,
  /delivery.*time/i, /time.*delivery/i,
  /delivery.*cost/i, /cost.*delivery/i,
  /minimum.*order/i, /order.*minimum/i,
  /takeaway.*packaging/i, /packaging/i
];

export const patternsEN = {
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
  feedback: feedbackPatternsEN,
  reservation: reservationPatternsEN,
  takeaway: takeawayPatternsEN
};
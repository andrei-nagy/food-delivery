const logos = [
  new URL("../assets/LogoBanner/logo1.svg", import.meta.url).href,
  new URL("../assets/LogoBanner/logo2.svg", import.meta.url).href,
  new URL("../assets/LogoBanner/logo3.svg", import.meta.url).href,
  new URL("../assets/LogoBanner/logo4.svg", import.meta.url).href,
  new URL("../assets/LogoBanner/logo5.svg", import.meta.url).href,
  new URL("../assets/LogoBanner/logo6.svg", import.meta.url).href,
  new URL("../assets/LogoBanner/logo7.svg", import.meta.url).href,

];

const features = [
  {
    gridArea: "tl",
    image: new URL("../assets/features/qr_code1.svg", import.meta.url).href,
    heading: "Scan QR for Instant Ordering",
    description: `Use your phone's camera to scan the QR code at your table. 
    Order your favorite food directly from your device without waiting. Simple and efficient!`,
  },
  {
    gridArea: "tr",
    image: new URL("../assets/features/view_menu.svg", import.meta.url).href,
    heading: "Digital Menus at Your Fingertips",
    description: `Easily explore restaurant menus. Choose from a variety of dishes 
    while viewing appetizing descriptions and images, all available directly in the Orderly app.`,
  },
  {
    gridArea: "bl",
    image: new URL("../assets/features/waiter.svg", import.meta.url).href,
    heading: "Quick Assistance at Your Table",
    description: `Need help? With just a click, you can summon the waitstaff
     to fulfill your needs. It's never been easier to get assistance when you need it!`,
  },
  {
    gridArea: "blm",
    image: new URL("../assets/features/Order.svg", import.meta.url)
      .href,
    heading: "Track Your Orders in Real-Time",
    description: `Stay informed about the status of your orders. Check the status
     from the "My Orders" section and no longer wait anxiously! Stay updated on every step of your dining experience.`,
  },
  {
    gridArea: "brm",
    image: new URL("../assets/features/Users.svg", import.meta.url).href,
    heading: "Simplified Experience for All Users",
    description: `The Orderly app is designed to be user-friendly, regardless
     of your tech-savviness. The intuitive design helps you navigate effortlessly and enjoy a pleasant experience.`,
  },
  {
    gridArea: "br",
    image: new URL("../assets/features/cards.svg", import.meta.url).href,
    heading: "Payment Options",
    description: `Supports various payment methods, including Apple Pay and Google Pay, credit/debit cards.`,
  },
];

const pricingData = [
  {
    darkMode: false,
    plan: "Individual Plan",
    planIcon: new URL("../assets/pricing/individual-plan.svg", import.meta.url)
      .href,
    planPrice: 9.99,
    bullets: [
      "Real-time collaboration",
      "AI-powered organization",
      "Customizable templates",
      "5GB cloud storage",
      "Basic integrations",
    ],
    CallToAction: "Request demo",
  },
  {
    darkMode: true,
    plan: "Team Plan",
    planIcon: new URL("../assets/pricing/team-plan.svg", import.meta.url).href,
    planPrice: 19.99,
    bullets: [
      "Everything in the Individual Plan",
      "Unlimited cloud storage",
      "Advanced integrations",
      "Team management and permissions",
      "Shared templates and note libraries",
    ],
    CallToAction: "Request demo",
  },
  {
    darkMode: false,
    plan: "Enterprise Plan",
    planIcon: new URL("../assets/pricing/enterprise-plan.svg", import.meta.url)
      .href,
    bullets: [
      "Everything in the Team Plan",
      "Dedicated account manager",
      "Enterprise-grade security",
      "Customized onboarding",
      "Advanced analytics",
    ],
    CallToAction: "Contact us",
  },
];

const faqItems = [
  {
    id: 1,
    question: "What is Orderly App?",
    answerHeading: "How do I get started with Orderly?",
    answer: `Orderly is a streamlined restaurant app that lets customers order effortlessly: they scan a QR code, browse the menu, and pay—all from their phone. Orders go directly to the waitstaff’s admin panel in real-time, enabling faster service and smoother operations. It’s a simple, efficient solution that saves time for both customers and staff.`,
  },
  {
    id: 2,
    question: "What are the key features of Orderly?",
    answerHeading: "Orderly offers a range of powerful features designed to enhance your restaurant's operations and customer experience.",
    answer: `The most important features of Orderly are: customers can scan a QR code to view the menu, place orders, and pay directly through the app. The app saves time for both customers and staff while reducing errors. With an intuitive interface, Orderly increases order frequency, and enhances the overall dining experience.`,
  },
  {
    id: 3,
    question: "What are the key features of Orderly Admin Panel?",
    answerHeading: "Orderly offers a simple and efficient management experience, along with a powerful analytics tool.",
    answer: `The ability to modify menus and categories, view customer orders in real-time, and update their status. Admins can access sales and product statistics, generate PDF reports with specific data, and customize restaurant settings. A standout feature is the ability to generate QR codes directly from the app and much more!`,
  },
  {
    id: 4,
    question: "How much does Orderly cost?",
    answerHeading: "How do I get started with Orderly?",
    answer: `Getting started with SmartNotes is very easy! Simply fill out the form, and one of our representatives will get in touch with you to help you choose the best solution for your restaurant. We’ll also provide a demo so you can see exactly how it works and what it can do for you.`,
  },
  {
    id: 5,
    question: "Who is Orderly for?",
    answerHeading: "Is this solution suitable for my business?",
    answer: `Orderly is designed for restaurant owners, managers, and staff who want to streamline their operations and enhance the customer experience. It is ideal for any type of restaurant, looking to improve order management, speed up service, and increase efficiency. The app is also beneficial for customers who want a seamless and convenient way to place orders and pay directly from their smartphones.`,
  },
  {
    id: 6,
    question: "Does Orderly provide customer support?",
    answerHeading: "If I have any type of issue, can you support me?",
    answer: `Yes, Orderly provides 24/7 support through the ticketing system in the admin panel. Additionally, you can directly email us or contact us for assistance.`,
  },
];

export { logos, features, pricingData, faqItems };

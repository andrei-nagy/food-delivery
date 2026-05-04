import React, { useState, useEffect, useRef } from 'react';
import './Terms.css';
import { motion, AnimatePresence } from 'framer-motion';
// import Navigation from '../Navigation/Navigation';
import Navigation from '../Navigation/Navigation';

import { 
  FiShield, 
  FiFileText, 
  FiLock, 
  FiUsers, 
  FiAlertCircle, 
  FiCheckCircle,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDownload,
  FiPrinter,
  FiBookOpen,
  FiBriefcase,
  FiGlobe,
  FiZap,
  FiStar,
  FiAward,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiRefreshCw
} from 'react-icons/fi';
import NavigationTerms from '../Navigation/NavigationTerms';

const Terms = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Referință pentru containerul cu scroll
  const contentContainerRef = useRef(null);
  // Referințe pentru fiecare secțiune
  const sectionRefs = useRef([]);

  // Secțiuni pentru navigare rapidă
  const sections = [
    { id: 'informatii-generale', title: 'Informații Generale', icon: <FiGlobe /> },
    { id: 'obiect-si-domeniu', title: 'Obiectul Contractului', icon: <FiFileText /> },
    { id: 'inregistrare', title: 'Înregistrare', icon: <FiUsers /> },
    { id: 'servicii', title: 'Servicii', icon: <FiZap /> },
    { id: 'tarife', title: 'Tarife și Plăți', icon: <FiDollarSign /> },
    { id: 'drepturi-obligatii', title: 'Drepturi și Obligații', icon: <FiBriefcase /> },
    { id: 'proprietate-intelectuala', title: 'Proprietate Intelectuală', icon: <FiLock /> },
    { id: 'protectia-datelor', title: 'Protecția Datelor', icon: <FiShield /> },
    { id: 'suspendare-incetare', title: 'Suspendare și Încetare', icon: <FiClock /> },
    { id: 'limitarea-raspunderii', title: 'Limitarea Răspunderii', icon: <FiAlertCircle /> },
    { id: 'forta-majora', title: 'Forța Majoră', icon: <FiRefreshCw /> },
    { id: 'lege-litigii', title: 'Lege și Litigii', icon: <FiBookOpen /> },
    { id: 'dispozitii-finale', title: 'Dispoziții Finale', icon: <FiCheckCircle /> }
  ];

  // Carduri cu statistici
  const stats = [
    { value: '13', label: 'Secțiuni', icon: <FiFileText />, color: '#E65C19' },
    { value: '2026', label: 'Ultima actualizare', icon: <FiCalendar />, color: '#F97316' },
    { value: 'GDPR', label: 'Conformitate', icon: <FiAward />, color: '#10B981' },
    { value: '24/7', label: 'Suport legal', icon: <FiClock />, color: '#3B82F6' }
  ];

  // Timeline pentru versiuni
  const versions = [
    { date: '13 Feb 2026', version: 'v3.2', changes: 'Actualizare GDPR, secțiune cookie-uri' },
    { date: '15 Ian 2026', version: 'v3.1', changes: 'Modificări tarife abonamente' },
    { date: '01 Dec 2025', version: 'v3.0', changes: 'Restructurare completă document' },
    { date: '15 Sep 2025', version: 'v2.5', changes: 'Adăugare secțiune plăți online' }
  ];

  // Detectează secțiunea activă pe baza scroll-ului în container
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const handleContainerScroll = () => {
      const scrollPosition = container.scrollTop + 100;
      
      for (let i = 0; i < sectionRefs.current.length; i++) {
        const section = sectionRefs.current[i];
        if (!section) continue;
        
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(i);
          break;
        }
      }
      
      setShowScrollTop(container.scrollTop > 400);
    };

    container.addEventListener('scroll', handleContainerScroll);
    return () => container.removeEventListener('scroll', handleContainerScroll);
  }, []);

  // Scroll la secțiunea selectată
  const scrollToSection = (index) => {
    const section = sectionRefs.current[index];
    if (section && contentContainerRef.current) {
      setActiveSection(index);
      contentContainerRef.current.scrollTo({
        top: section.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  };

  // Scroll la începutul containerului
  const scrollToTop = () => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('Documentul se descarcă...');
  };

  return (
    <>
    <Navigation/>
{/* <NavigationTerms 
  activeSection={activeSection}
  totalSections={sections.length}
  onPrint={handlePrint}
  onDownload={handleDownloadPDF}
  onNavigateHome={() => window.location.href = '/'}
/>       */}
      <section className="terms-section">
        {/* Elemente decorative */}
        <div className="terms-decorative-elements">
          <motion.div 
            className="decorative-circle circle-1"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="decorative-circle circle-2"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.04, 0.08, 0.04]
            }}
            transition={{ duration: 22, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Floating elements */}
        <div className="terms-floating-elements">
          <motion.div 
            className="floating-element shield-1"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <FiShield />
          </motion.div>
          <motion.div 
            className="floating-element lock-1"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, delay: 1 }}
          >
            <FiLock />
          </motion.div>
        </div>

        <div className="terms-container">
          {/* Header */}
          <div className="terms-header">
            <motion.div 
              className="header-chip-wrapper"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="header-chip-glow">
                <div className="header-chip">
                  <FiShield className="chip-icon" />
                  <span>Document Legal</span>
                </div>
              </div>
            </motion.div>

            <motion.h1 
              className="terms-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="terms-gradient">Termeni și Condiții</span>
              <span className="title-badge-container">
                <span className="title-badge">Ordinul 13/2026</span>
              </span>
            </motion.h1>

            <motion.p 
              className="terms-subtitle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Data ultimei actualizări: <strong>13 februarie 2026</strong>
            </motion.p>

            <motion.div 
              className="terms-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button 
                className="terms-action-btn print-btn"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
              >
                <FiPrinter />
                <span className="tooltip">Printează</span>
              </motion.button>
              
              <motion.button 
                className="terms-action-btn download-btn"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
              >
                <FiDownload />
                <span className="tooltip">Descarcă PDF</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div 
            className="terms-stats-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="terms-stat-card"
                whileHover={{ y: -5, borderColor: stat.color }}
              >
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid - 2 coloane */}
          <div className="terms-content-grid">
            {/* Sidebar Navigation - ACUM ESTE STICKY */}
            <motion.aside 
              className="terms-sidebar"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="sidebar-header">
                <FiBookOpen className="sidebar-icon" />
                <h3>Cuprins</h3>
              </div>
              
              <div className="sidebar-nav">
                {sections.map((section, index) => (
                  <motion.button
                    key={index}
                    className={`nav-item ${activeSection === index ? 'active' : ''}`}
                    onClick={() => scrollToSection(index)}
                    whileHover={{ x: 5, color: '#E65C19' }}
                  >
                    <span className="nav-icon">{section.icon}</span>
                    <span className="nav-title">{section.title}</span>
                    {activeSection === index && (
                      <motion.span 
                        className="nav-indicator"
                        layoutId="navIndicator"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="sidebar-contact">
                <h4>Contact Legal</h4>
                <div className="contact-links">
                  <a href="mailto:legal@orderly.ro">
                    <FiMail /> legal@orderly.ro
                  </a>
                  <a href="tel:+0750275575">
                    <FiPhone /> 0750 275 575
                  </a>
                  <span>
                    <FiMapPin /> București, România
                  </span>
                </div>
              </div>
            </motion.aside>

            {/* Content Area - CU SCROLL INTERN */}
            <div 
              className="terms-content-container" 
              ref={contentContainerRef}
            >
              <motion.div 
                className="terms-content"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                {/* 1. INFORMAȚII GENERALE */}
                <section 
                  id="informatii-generale" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[0] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiGlobe className="section-icon" />
                    </div>
                    <h2>1. INFORMAȚII GENERALE</h2>
                  </div>
                  
                  <div className="section-content">
                    <h3>1.1 Identitatea Furnizorului</h3>
                    <div className="company-card">
                      <div className="company-info">
                        <p><strong>Orderly Business Solutions SRL</strong></p>
                        <ul>
                          <li><span className="info-label">Sediu social:</span> Str. Stolnicul Vasile nr.2, bl.33, sc.3, București, România</li>
                          <li><span className="info-label">CUI:</span> 50975290</li>
                          <li><span className="info-label">Nr. Înmatriculare:</span> J2024045938001</li>
                          <li><span className="info-label">Capital social:</span> 200 RON</li>
                          <li><span className="info-label">Email:</span> <a href="mailto:contact@orderly.ro">contact@orderly.ro</a></li>
                          <li><span className="info-label">Telefon:</span> <a href="tel:+0750275575">+40 750 275 575</a></li>
                          <li><span className="info-label">Website:</span> <a href="https://www.orderly.ro" target="_blank">www.orderly.ro</a></li>
                        </ul>
                      </div>
                    </div>

                    <h3>1.2 Definiții</h3>
                    <div className="definitions-grid">
                      <div className="definition-item">
                        <span className="definition-term">Aplicație / Platformă</span>
                        <p>aplicația web și mobilă Orderly, destinată restaurantelor și clienților acestora</p>
                      </div>
                      <div className="definition-item">
                        <span className="definition-term">Utilizator Business / Partener</span>
                        <p>restaurant sau operator economic care utilizează Orderly pentru gestionarea comenzilor</p>
                      </div>
                      <div className="definition-item">
                        <span className="definition-term">Client Final</span>
                        <p>persoană fizică ce plasează comenzi prin scanarea unui cod QR în locația Partenerului</p>
                      </div>
                      <div className="definition-item">
                        <span className="definition-term">Servicii</span>
                        <p>funcționalitățile oferite prin Platformă: afișare meniu digital, preluare comenzi, procesare plăți, administrare meniu, statistici, generare QR etc.</p>
                      </div>
                      <div className="definition-item">
                        <span className="definition-term">GDPR</span>
                        <p>Regulamentul (UE) 2016/679</p>
                      </div>
                      <div className="definition-item">
                        <span className="definition-term">Legea 365/2002</span>
                        <p>privind comerțul electronic</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. OBIECTUL ȘI DOMENIUL DE APLICARE */}
                <section 
                  id="obiect-si-domeniu" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[1] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiFileText className="section-icon" />
                    </div>
                    <h2>2. OBIECTUL ȘI DOMENIUL DE APLICARE</h2>
                  </div>
                  
                  <div className="section-content">
                    <h3>2.1 Obiectul Contractului</h3>
                    <p>Prezentele Termeni și Condiții reglementează utilizarea aplicației Orderly, platformă software de tip SaaS destinată restaurantelor pentru:</p>
                    <ul className="styled-list">
                      <li><FiCheckCircle /> afișarea meniului prin scanarea unui cod QR;</li>
                      <li><FiCheckCircle /> preluarea comenzilor direct de pe telefonul clientului;</li>
                      <li><FiCheckCircle /> transmiterea comenzilor în timp real către panoul administrativ al personalului;</li>
                      <li><FiCheckCircle /> procesarea plăților online;</li>
                      <li><FiCheckCircle /> gestionarea promoțiilor și codurilor de reducere;</li>
                      <li><FiCheckCircle /> generarea de statistici și rapoarte financiare.</li>
                    </ul>
                    <div className="highlight-box">
                      <FiAlertCircle className="highlight-icon" />
                      <p><strong>Orderly nu este restaurant</strong> și nu vinde produse alimentare. Contractul de vânzare se încheie exclusiv între Clientul Final și Partener.</p>
                    </div>

                    <h3>2.2 Acceptarea Termenilor</h3>
                    <p>Prin crearea unui cont sau utilizarea Platformei, Utilizatorul confirmă că:</p>
                    <ul className="styled-list">
                      <li><FiCheckCircle /> a citit și acceptat prezentii Termeni;</li>
                      <li><FiCheckCircle /> are capacitate legală deplină;</li>
                      <li><FiCheckCircle /> va utiliza aplicația în conformitate cu legea română.</li>
                    </ul>
                  </div>
                </section>

                {/* 3. ÎNREGISTRAREA ȘI CREAREA CONTULUI */}
                <section 
                  id="inregistrare" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[2] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiUsers className="section-icon" />
                    </div>
                    <h2>3. ÎNREGISTRAREA ȘI CREAREA CONTULUI</h2>
                  </div>
                  
                  <div className="section-content">
                    <h3>3.1 Eligibilitate</h3>
                    <p>Contul de administrare poate fi creat doar de persoane juridice sau PFA legal înregistrate în România sau UE.</p>

                    <h3>3.2 Procesul de Înregistrare</h3>
                    <div className="steps-timeline">
                      <div className="step-item">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          <h4>Completarea formularului online</h4>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">2</div>
                        <div className="step-content">
                          <h4>Validarea datelor societății</h4>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">3</div>
                        <div className="step-content">
                          <h4>Confirmarea prin email</h4>
                        </div>
                      </div>
                      <div className="step-item">
                        <div className="step-number">4</div>
                        <div className="step-content">
                          <h4>Activarea contului și configurarea meniului</h4>
                        </div>
                      </div>
                    </div>

                    <h3>3.3 Securitatea Contului</h3>
                    <p>Utilizatorul este responsabil pentru păstrarea confidențialității datelor de acces. Orice suspiciune de acces neautorizat trebuie notificată la <a href="mailto:contact@orderly.ro">contact@orderly.ro</a>.</p>
                  </div>
                </section>

                {/* 4. SERVICIILE OFERITE */}
                <section 
                  id="servicii" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[3] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiZap className="section-icon" />
                    </div>
                    <h2>4. SERVICIILE OFERITE</h2>
                  </div>
                  
                  <div className="section-content">
                    <h3>4.1 Funcționalități Principale</h3>
                    <div className="features-showcase">
                      <div className="feature-showcase-item">
                        <div className="feature-showcase-icon">📱</div>
                        <div className="feature-showcase-text">
                          <h4>Generare cod QR</h4>
                          <p>unic pentru fiecare locație</p>
                        </div>
                      </div>
                      <div className="feature-showcase-item">
                        <div className="feature-showcase-icon">🍽️</div>
                        <div className="feature-showcase-text">
                          <h4>Meniu digital</h4>
                          <p>personalizabil cu imagini și prețuri</p>
                        </div>
                      </div>
                      <div className="feature-showcase-item">
                        <div className="feature-showcase-icon">🛒</div>
                        <div className="feature-showcase-text">
                          <h4>Plasare comandă</h4>
                          <p>direct din telefonul clientului</p>
                        </div>
                      </div>
                      <div className="feature-showcase-item">
                        <div className="feature-showcase-icon">⚡</div>
                        <div className="feature-showcase-text">
                          <h4>Transmitere în timp real</h4>
                          <p>către panoul administrativ</p>
                        </div>
                      </div>
                      <div className="feature-showcase-item">
                        <div className="feature-showcase-icon">💳</div>
                        <div className="feature-showcase-text">
                          <h4>Plată online</h4>
                          <p>securizată prin procesatori autorizați</p>
                        </div>
                      </div>
                      <div className="feature-showcase-item">
                        <div className="feature-showcase-icon">📊</div>
                        <div className="feature-showcase-text">
                          <h4>Statistici și rapoarte</h4>
                          <p>vânzări, produse preferate, trafic</p>
                        </div>
                      </div>
                    </div>

                    <h3>4.2 Disponibilitate</h3>
                    <p>Orderly depune eforturi pentru asigurarea unei disponibilități ridicate a serviciilor. Pot exista întreruperi temporare pentru mentenanță sau din motive independente de voința Furnizorului.</p>
                    
                    <div className="availability-card">
                      <div className="availability-stat">
                        <span className="stat-big">99.9%</span>
                        <span className="stat-label">Uptime garantat</span>
                      </div>
                      <div className="availability-stat">
                        <span className="stat-big">24/7</span>
                        <span className="stat-label">Monitorizare</span>
                      </div>
                      <div className="availability-stat">
                        <span className="stat-big">4h</span>
                        <span className="stat-label">Mentenanță/lună</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. TARIFE ȘI PLĂȚI */}
                <section 
                  id="tarife" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[4] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiDollarSign className="section-icon" />
                    </div>
                    <h2>5. TARIFE ȘI PLĂȚI</h2>
                  </div>
                  
                  <div className="section-content">
                    <h3>5.1 Model Comercial</h3>
                    <p>Utilizarea aplicației poate implica:</p>
                    <ul className="styled-list">
                      <li><FiCheckCircle /> abonament lunar sau anual;</li>
                      <li><FiCheckCircle /> comision per tranzacție procesată;</li>
                      <li><FiCheckCircle /> servicii suplimentare la cerere.</li>
                    </ul>
                    <p>Structura exactă a costurilor este comunicată individual fiecărui Partener prin ofertă comercială.</p>

                    <h3>5.2 Facturare</h3>
                    <p>Facturile sunt emise electronic, conform legislației fiscale din România. Termenul de plată este cel stabilit contractual.</p>

                    <div className="pricing-table">
                      <div className="pricing-row header">
                        <div className="pricing-cell">Pachet</div>
                        <div className="pricing-cell">Preț/lună</div>
                        <div className="pricing-cell">Comision</div>
                        <div className="pricing-cell">Comenzi</div>
                      </div>
                      <div className="pricing-row">
                        <div className="pricing-cell"><strong>Start</strong></div>
                        <div className="pricing-cell">0 RON</div>
                        <div className="pricing-cell">3.5%</div>
                        <div className="pricing-cell">100/lună</div>
                      </div>
                      <div className="pricing-row">
                        <div className="pricing-cell"><strong>Pro</strong></div>
                        <div className="pricing-cell">199 RON</div>
                        <div className="pricing-cell">2.5%</div>
                        <div className="pricing-cell">Nelimitat</div>
                      </div>
                      <div className="pricing-row">
                        <div className="pricing-cell"><strong>Enterprise</strong></div>
                        <div className="pricing-cell">499 RON</div>
                        <div className="pricing-cell">1.5%</div>
                        <div className="pricing-cell">Nelimitat</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. DREPTURILE ȘI OBLIGAȚIILE PĂRȚILOR */}
                <section 
                  id="drepturi-obligatii" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[5] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiBriefcase className="section-icon" />
                    </div>
                    <h2>6. DREPTURILE ȘI OBLIGAȚIILE PĂRȚILOR</h2>
                  </div>
                  
                  <div className="section-content">
                    <div className="obligations-grid">
                      <div className="obligation-card">
                        <div className="obligation-header">
                          <FiCheckCircle className="obligation-icon" style={{ color: '#10B981' }} />
                          <h3>Obligațiile Orderly</h3>
                        </div>
                        <ul>
                          <li>să furnizeze acces la Platformă;</li>
                          <li>să asigure măsuri tehnice rezonabile de securitate;</li>
                          <li>să ofere suport tehnic prin sistemul de ticketing și email;</li>
                          <li>să respecte legislația privind protecția datelor.</li>
                        </ul>
                      </div>
                      
                      <div className="obligation-card">
                        <div className="obligation-header">
                          <FiAlertCircle className="obligation-icon" style={{ color: '#E65C19' }} />
                          <h3>Obligațiile Partenerului</h3>
                        </div>
                        <ul>
                          <li>să introducă informații corecte privind produsele și prețurile;</li>
                          <li>să respecte legislația fiscală și sanitară aplicabilă;</li>
                          <li>să gestioneze corect comenzile primite;</li>
                          <li>să nu utilizeze Platforma în scopuri ilegale.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. PROPRIETATEA INTELECTUALĂ */}
                <section 
                  id="proprietate-intelectuala" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[6] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiLock className="section-icon" />
                    </div>
                    <h2>7. PROPRIETATEA INTELECTUALĂ</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Toate drepturile asupra codului sursă, designului, interfeței și mărcii Orderly aparțin <strong>Orderly Business Solutions SRL</strong>.</p>
                    <p>Utilizatorul primește o licență limitată, neexclusivă și netransferabilă pentru utilizarea aplicației pe durata contractului.</p>
                    
                    <div className="ip-box">
                      <div className="ip-icon">
                        <FiLock size={32} />
                      </div>
                      <div className="ip-text">
                        <h4>Licență de utilizare</h4>
                        <p>Licența este valabilă exclusiv pe perioada derulării contractului și încetează automat la rezilierea acestuia.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. PROTECȚIA DATELOR PERSONALE */}
                <section 
                  id="protectia-datelor" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[7] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiShield className="section-icon" />
                    </div>
                    <h2>8. PROTECȚIA DATELOR PERSONALE</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Prelucrarea datelor se realizează în conformitate cu <strong>GDPR</strong> și legislația națională aplicabilă.</p>
                    
                    <div className="gdpr-roles">
                      <div className="role-card">
                        <div className="role-icon">👨‍💼</div>
                        <h4>Operator</h4>
                        <p>pentru datele contului Partenerului</p>
                      </div>
                      <div className="role-card">
                        <div className="role-icon">🔐</div>
                        <h4>Persoană împuternicită</h4>
                        <p>pentru datele clienților finali procesate în numele restaurantului</p>
                      </div>
                    </div>
                    
                    <p>Datele sunt stocate pe servere din <strong>Uniunea Europeană</strong>.</p>
                    <p>Utilizatorii își pot exercita drepturile prin email la <a href="mailto:gdpr@orderly.ro">gdpr@orderly.ro</a>.</p>
                    
                    <div className="rights-grid">
                      <div className="right-item">
                        <FiCheckCircle /> Dreptul la informare
                      </div>
                      <div className="right-item">
                        <FiCheckCircle /> Dreptul de acces
                      </div>
                      <div className="right-item">
                        <FiCheckCircle /> Dreptul la rectificare
                      </div>
                      <div className="right-item">
                        <FiCheckCircle /> Dreptul la ștergere
                      </div>
                      <div className="right-item">
                        <FiCheckCircle /> Dreptul la restricționare
                      </div>
                      <div className="right-item">
                        <FiCheckCircle /> Dreptul la portabilitate
                      </div>
                    </div>
                  </div>
                </section>

                {/* 9. SUSPENDAREA ȘI ÎNCETAREA */}
                <section 
                  id="suspendare-incetare" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[8] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiClock className="section-icon" />
                    </div>
                    <h2>9. SUSPENDAREA ȘI ÎNCETAREA</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Orderly poate suspenda sau închide contul în cazul:</p>
                    <ul className="styled-list">
                      <li><FiAlertCircle /> neplății facturilor;</li>
                      <li><FiAlertCircle /> utilizării frauduloase;</li>
                      <li><FiAlertCircle /> încălcării prevederilor legale.</li>
                    </ul>
                    <p>La încetare, datele pot fi păstrate conform obligațiilor legale fiscale și contabile.</p>
                  </div>
                </section>

                {/* 10. LIMITAREA RĂSPUNDERII */}
                <section 
                  id="limitarea-raspunderii" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[9] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiAlertCircle className="section-icon" />
                    </div>
                    <h2>10. LIMITAREA RĂSPUNDERII</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Orderly <strong>nu răspunde</strong> pentru:</p>
                    <ul className="styled-list warning-list">
                      <li>neexecutarea comenzilor de către restaurant;</li>
                      <li>calitatea produselor oferite de Partener;</li>
                      <li>întreruperi cauzate de terți, inclusiv procesatori de plăți sau furnizori de internet;</li>
                      <li>pierderi indirecte.</li>
                    </ul>
                    <div className="highlight-box warning">
                      <FiAlertCircle className="highlight-icon" />
                      <p><strong>Răspunderea totală</strong> a Orderly este limitată la contravaloarea serviciilor plătite în ultimele 3 luni.</p>
                    </div>
                  </div>
                </section>

                {/* 11. FORȚA MAJORĂ */}
                <section 
                  id="forta-majora" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[10] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiRefreshCw className="section-icon" />
                    </div>
                    <h2>11. FORȚA MAJORĂ</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Niciuna dintre părți nu răspunde pentru neexecutarea obligațiilor în caz de forță majoră, conform Codului Civil român.</p>
                  </div>
                </section>

                {/* 12. LEGEA APLICABILĂ ȘI LITIGII */}
                <section 
                  id="lege-litigii" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[11] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiBookOpen className="section-icon" />
                    </div>
                    <h2>12. LEGEA APLICABILĂ ȘI LITIGII</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Contractul este guvernat de <strong>legislația română</strong>, inclusiv:</p>
                    <ul className="styled-list">
                      <li>Codul Civil;</li>
                      <li>Legea 365/2002 privind comerțul electronic;</li>
                      <li>OUG 34/2014 privind drepturile consumatorilor, acolo unde este aplicabil;</li>
                      <li>Regulamentul (UE) 2016/679.</li>
                    </ul>
                    <p>Litigiile vor fi soluționate de instanțele competente din <strong>București</strong>, dacă părțile nu ajung la o soluție amiabilă.</p>
                  </div>
                </section>

                {/* 13. DISPOZIȚII FINALE */}
                <section 
                  id="dispozitii-finale" 
                  className="terms-section-block"
                  ref={el => sectionRefs.current[12] = el}
                >
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiCheckCircle className="section-icon" />
                    </div>
                    <h2>13. DISPOZIȚII FINALE</h2>
                  </div>
                  
                  <div className="section-content">
                    <p>Prezentul document este redactat în limba română.</p>
                    <p>Pentru orice solicitare:</p>
                    <div className="contact-final">
                      <div><FiMail /> <a href="mailto:legal@orderly.ro">legal@orderly.ro</a></div>
                      <div><FiShield /> <a href="mailto:gdpr@orderly.ro">gdpr@orderly.ro</a></div>
                      <div><FiZap /> <a href="mailto:contact@orderly.ro">contact@orderly.ro</a></div>
                    </div>
                    
                    <div className="acceptance-section">
                      <h3>ACCEPTARE</h3>
                      <div className="acceptance-fields">
                        <div className="field">
                          <span className="field-label">Data acceptării:</span>
                          <span className="field-placeholder">_______________</span>
                        </div>
                        <div className="field">
                          <span className="field-label">Nume Utilizator:</span>
                          <span className="field-placeholder">_______________</span>
                        </div>
                        <div className="field">
                          <span className="field-label">Semnătură electronică:</span>
                          <span className="field-placeholder">_______________</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="company-signature">
                      <p><strong>Orderly Business Solutions SRL</strong></p>
                      <p>Reprezentant legal</p>
                    </div>
                  </div>
                </section>

                {/* Versions Timeline */}
                <section className="versions-section">
                  <div className="section-header">
                    <div className="section-icon-wrapper">
                      <FiClock className="section-icon" />
                    </div>
                    <h2>Istoric Versiuni</h2>
                  </div>
                  
                  <div className="versions-timeline">
                    {versions.map((version, index) => (
                      <div className="version-item" key={index}>
                        <div className="version-dot"></div>
                        <div className="version-content">
                          <span className="version-date">{version.date}</span>
                          <span className="version-tag">{version.version}</span>
                          <p>{version.changes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button - în containerul cu scroll */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button 
              className="scroll-top-fixed"
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
            >
              <FiChevronUp />
            </motion.button>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Terms;
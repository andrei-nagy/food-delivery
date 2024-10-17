import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LandingPage.css'; // Aici poți adăuga stiluri personalizate

const LandingPage = () => {
  return (
    <div className="landing">
      <header className="bg-primary text-white text-center p-5 landing-header">
        <h1 className="landing-title">Orderly</h1>
        <p className="landing-description">Gestionați comenzile cu ușurință!</p>
        <a href="#features" className="btn btn-light btn-lg landing-button">Află mai multe</a>
      </header>

      <main className="container mt-5 landing-main">
        <section id="features" className="mb-5 landing-features">
          <h2 className="landing-features-title">Funcționalități</h2>
          <div className="row landing-features-list">
            <div className="col-md-4 landing-feature-item">
              <h3 className="landing-feature-title">Gestionare Comenzi</h3>
              <p className="landing-feature-description">Ușor de utilizat, pentru a urmări comenzile dintr-o singură aplicație.</p>
            </div>
            <div className="col-md-4 landing-feature-item">
              <h3 className="landing-feature-title">Raportare</h3>
              <p className="landing-feature-description">Raporturi detaliate pentru a analiza performanța afacerii tale.</p>
            </div>
            <div className="col-md-4 landing-feature-item">
              <h3 className="landing-feature-title">Integrare</h3>
              <p className="landing-feature-description">Integrare ușoară cu celelalte aplicații folosite de tine.</p>
            </div>
          </div>
        </section>

        <section id="about" className="mb-5 landing-about">
          <h2 className="landing-about-title">Despre Orderly</h2>
          <p className="landing-about-description">Orderly este o aplicație creată pentru a ajuta afacerile să gestioneze comenzile eficient. Cu un design intuitiv și funcționalități avansate, îți oferim tot ce ai nevoie pentru a-ți optimiza fluxul de lucru.</p>
        </section>

        <section className="text-center landing-call-to-action">
          <h2 className="landing-cta-title">Începe acum!</h2>
          <a href="#signup" className="btn btn-primary btn-lg landing-cta-button">Creează un cont</a>
        </section>
      </main>

      <footer className="bg-dark text-white text-center p-3 landing-footer">
        <p className="landing-footer-text">&copy; 2024 Orderly. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

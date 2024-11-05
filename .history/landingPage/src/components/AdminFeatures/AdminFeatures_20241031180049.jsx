import React from 'react';
import './AdminFeatures.css'; // Importă fișierul CSS

const AdminFeatures = () => {
  const features = [
    {
      title: 'Interfață Prietenoasă',
      description: 'Admin Panel Orderly oferă o interfață intuitivă care facilitează gestionarea comenzilor.',
    },
    {
      title: 'Gestionare Eficientă',
      description: 'Permite gestionarea ușoară a comenzilor, cu opțiuni de filtrare avansate.',
    },
    {
      title: 'Raportare Detaliată',
      description: 'Oferă rapoarte detaliate pentru a analiza performanța vânzărilor.',
    },
    {
      title: 'Suport pentru Utilizatori',
      description: 'Oferim suport dedicat pentru a ajuta utilizatorii să maximizeze eficiența.',
    },
  ];

  return (
    <section className="features-section">
      <h2 className="features-title">Descoperă Admin Panel Orderly</h2>
      <p className="features-description">
        Admin Panel Orderly este soluția perfectă pentru gestionarea eficientă a comenzilor tale. 
        Cu o interfață prietenoasă și funcționalități avansate, îți oferim instrumentele de care ai nevoie pentru a excela în afacerea ta.
      </p>
      <div className="feature-container">
        {features.map((feature, index) => (
          <div key={index} className="feature">
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminFeatures;

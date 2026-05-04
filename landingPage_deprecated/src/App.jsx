// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Terms from './components/Terms/Terms';
import Page from './components/Page/Page';
import Footer from './components/Footer/Footer'; // ← Importă Footer o singură dată
import './index.css';
import AboutUs from './components/AboutUs/AboutUs';
import GDPR from './components/GDPR/gdpr';
import Navigation from './components/Navigation/Navigation';

function App() { 
  return (
    <Router>
      <Page>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/gdpr" element={<GDPR />} />

        </Routes>
        <Footer /> 
      </Page>
    </Router>
  );
}

export default App;
import React, { useEffect } from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const landingContent = document.querySelector('.landing-content');
            if (landingContent) {
                landingContent.style.opacity = 1; // Fade-in effect
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleExploreClick = () => {
        navigate('/home'); // Navigate to the Home page
    };

    return (
        <div>
            <header className="bg-primary text-white text-center p-5">
                <h1>Orderly</h1>
                <p>Gestionați comenzile cu ușurință!</p>
                <a href="#features" className="btn btn-light btn-lg">Află mai multe</a>
            </header>

            <main className="container mt-5">
                <section id="features" className="mb-5">
                    <h2>Funcționalități</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <h3>Gestionare Comenzi</h3>
                            <p>Ușor de utilizat, pentru a urmări comenzile dintr-o singură aplicație.</p>
                        </div>
                        <div className="col-md-4">
                            <h3>Raportare</h3>
                            <p>Raporturi detaliate pentru a analiza performanța afacerii tale.</p>
                        </div>
                        <div className="col-md-4">
                            <h3>Integrare</h3>
                            <p>Integrare ușoară cu celelalte aplicații folosite de tine.</p>
                        </div>
                    </div>
                </section>

                <section id="about" className="mb-5">
                    <h2>Despre Orderly</h2>
                    <p>Orderly este o aplicație creată pentru a ajuta afacerile să gestioneze comenzile eficient. Cu un design intuitiv și funcționalități avansate, îți oferim tot ce ai nevoie pentru a-ți optimiza fluxul de lucru.</p>
                </section>

                <section className="text-center">
                    <h2>Începe acum!</h2>
                    <a href="#signup" className="btn btn-primary btn-lg">Creează un cont</a>
                </section>
            </main>

            <footer className="bg-dark text-white text-center p-3">
                <p>&copy; 2024 Orderly. Toate drepturile rezervate.</p>
            </footer>
        </div>
    )
};

export default Welcome;

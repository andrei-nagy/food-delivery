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
        <div className="landing-container">
           <header>
    <section>
      <img class="avatar" src="https://i.ibb.co/GMdDLhB/procreate-logo.png" alt="User avatar">
      <a href="/">Procreate®</a>
    </section>
    <section>
      <form style="flex: 1 0 100%;">
        <fieldset class="input-with-button">
          <input type="email" placeholder="Your email address" value="">
          <button class="button">Subscribe</button>
        </fieldset>
      </form>
    </section>
  </header>
  <main>
    <header class="hero-header">
      <h1>Unleash your inner Procreate Pro</h1>
      <h2>Discover the best Gumroad resources made by our community</h2>
      <div class="tabs-list">
        <a class="tab selected" href="/">Collection</a>
        <a class="tab" href="/posts">About Procreate®</a>
        <a class="tab" href="/posts">Download ↗</a>
      </div>
    </header>

            <section className="relative">
                <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row gap-12 mt-14 lg:mt-28">
                    <div className="flex flex-1 flex-col items-center lg:items-start landing-content">
                        <h1 className="text-bookmark-blue text-3xl md:text-4xl lg:text-5xl text-center lg:text-left mb-6">
                            Welcome to Orderly!
                        </h1>
                        <p className="tagline text-bookmark-grey text-lg text-center lg:text-left mb-6">
                            Scan. Order. Relax.
                        </p>
                        <p className="description text-bookmark-grey text-lg text-center lg:text-left mb-6">
                            Discover a new way to enjoy your dining experience with our innovative solution.
                            Just scan the QR code, place your order, and relax while we take care of the rest.
                        </p>
                        <div className="flex justify-center flex-wrap gap-6">
                            <button className="explore-button" type="button" onClick={handleExploreClick}>
                                Get Started
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center flex-1 mb-10 md:mb-16 lg:mb-0 z-10">
                        <img className="w-5/6 h-5/6 sm:w-3/4 sm:h-3/4 md:w-full md:h-full" src="https://raw.githubusercontent.com/johnkomarnicki/modern-landing-page-with-tailwinds/master/public/imgs/hero-bg.png" alt="Hero Image" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Welcome;

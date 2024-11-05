import React from 'react';
import './AdminFeatures.css';

const AdminFeatures = () => {
  return (
    <div className="feature-section">
      <div className="header">
        <h1>Reliable, efficient delivery</h1>
        <h1>Powered by Technology</h1>
        <p>
          Our Artificial Intelligence powered tools use millions of project data points
          to ensure that your project is successful
        </p>
      </div>

      <div className="row1-container">
        <div className="box box-down cyan">
          <h2>Supervisor</h2>
          <p>Monitors activity to identify project roadblocks</p>
          <img src="https://assets.codepen.io/2301174/icon-supervisor.svg" alt="Supervisor icon" />
        </div>

        <div className="box red">
          <h2>Team Builder</h2>
          <p>Scans our talent network to create the optimal team for your project</p>
          <img src="https://assets.codepen.io/2301174/icon-team-builder.svg" alt="Team Builder icon" />
        </div>

        <div className="box blue">
          <h2>Calculator</h2>
          <p>Uses data from past projects to provide better delivery estimates</p>
          <img src="https://assets.codepen.io/2301174/icon-calculator.svg" alt="Calculator icon" />
        </div>
      </div>

      <div className="row2-container">
        <div className="box orange">
          <h2>Karma</h2>
          <p>Regularly evaluates our talent to ensure quality</p>
          <img src="https://assets.codepen.io/2301174/icon-karma.svg" alt="Karma icon" />
        </div>
      </div>

      <footer>
        <p className="attribution">
          Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank" rel="noopener noreferrer">Frontend Mentor</a>.
          Coded by <a href="#">Jared Parsons</a>.
        </p>
      </footer>
    </div>
  );
};

export default AdminFeatures;

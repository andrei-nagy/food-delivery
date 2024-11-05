import React from 'react';
import './AdminFeatures.css'; // Asigură-te că ai stilurile definite în `style.css`

// Functional Component
const AdminFeatures = () => {
  return (
    <section>
      <div className="row">
        <h1>Our Features</h1>
      </div>
      <div className="row">
        {/* Column One */}
        <div className="column">
          <div className="card">
            <div className="icon">
              <i className="fa-solid fa-user"></i>
            </div>
            <h3>User Friendly</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
              asperiores natus ad molestiae aliquid explicabo. Iste eaque quo et
              commodi.
            </p>
          </div>
        </div>
        {/* Column Two */}
        <div className="column">
          <div className="card">
            <div className="icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Super Secure</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
              asperiores natus ad molestiae aliquid explicabo. Iste eaque quo et
              commodi.
            </p>
          </div>
        </div>
        {/* Column Three */}
        <div className="column">
          <div className="card">
            <div className="icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3>Quick Support</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
              asperiores natus ad molestiae aliquid explicabo. Iste eaque quo et
              commodi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminFeatures;

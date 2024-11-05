import React from "react";
import "./ManagementAdminPanel.css";
// import panelImage1 from "../../assets/panelImage1.png";
// import panelImage2 from "../../assets/panelImage2.png";
// import panelImage3 from "../../assets/panelImage3.png";
// import panelImage4 from "../../assets/panelImage4.png";
import analytics_admin from "../../assets/analytics_admin.png"; // Exemplu de imagine

const adminImages = [
    { src: analytics_admin, alt: "Dashboard Overview" },
    { src: analytics_admin, alt: "Order Management" },
    { src: analytics_admin, alt: "User Analytics" },
    { src: analytics_admin, alt: "Inventory Management" },
];

const AdminPanelShowcase = () => {
    return (
        <section className="admin-showcase" id="adminpanel">
            <div className="admin-showcase__heading-container">
                <h2 className="h2 admin-showcase__heading">
                    Discover the <span className="text-gradient">Admin Panel</span>
                </h2>
                <p className="text-reg admin-showcase__subheading">
                    Manage every aspect of your restaurant seamlessly, from orders to inventory, with our powerful admin dashboard.
                </p>
            </div>

            <div className="admin-showcase__image-grid">
                {adminImages.map((image, index) => (
                    <div className="admin-showcase__image-wrapper" key={index}>
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="admin-showcase__image"
                        />
                        <p className="admin-showcase__image-caption">{image.alt}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AdminPanelShowcase;

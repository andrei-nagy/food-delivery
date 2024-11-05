import React from "react";
import "./ManagementAdminPanel.css";
// import panelImage1 from "../../assets/panelImage1.png";
// import panelImage2 from "../../assets/panelImage2.png";
// import panelImage3 from "../../assets/panelImage3.png";
// import panelImage4 from "../../assets/panelImage4.png";
import analytics_admin from "../../assets/analytics_admin.png"; // Exemplu de imagine
import sales_admin from "../../assets/sales_admin.png"; // Exemplu de imagine
import admin_menu from "../../assets/admin_menu.png"; // Exemplu de imagine
import orders_admin from "../../assets/orders_admin.png"; // Exemplu de imagine

const adminImages = [
    { src: orders_admin, alt: "Dashboard Overview" },
    { src: sales_admin, alt: "Order Management" },
    { src: analytics_admin, alt: "User Analytics" },
    { src: analytics_admin, alt: "Inventory Management" },
];

const AdminPanelShowcase = () => {
    return (
        <section className="admin-showcase" id="adminpanel">
          
            <div className="roadmap__heading-container">
                <h2 className="h2 roadmap__heading">
                Discover the{" "}
                    <span className="h2 roadmap__text-gradient">Admin Panel</span>
                </h2>
                <p className="text-reg roadmap__subheading">
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

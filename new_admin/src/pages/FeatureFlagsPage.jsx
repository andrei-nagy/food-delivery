import { motion } from "framer-motion";
import FeatureFlags from "../components/featureFlags/FeatureFlags";
import Header from "../components/common/Header"; // Adaugă importul Header

const FeatureFlagsPage = () => {
    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title="Feature Flags" /> {/* Adaugă Header */}
            <motion.div
                className="max-w-4xl mx-auto py-6 px-4 lg:px-8" // Adaugă padding
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <FeatureFlags />
            </motion.div>
        </div>
    );
};

export default FeatureFlagsPage;
import { useEffect, useState } from "react"; // Importă useEffect și useState
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/products/SalesTrendChart";
import ProductsTable from "../components/products/ProductsTable";
import axios from "axios"; // Importă Axios
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import MostPopularProductChart from "../components/overview/MostPopularProduct";

const CategoriesPage = () => {
    const [totalProducts, setTotalProducts] = useState(0); // Starea pentru totalProducts
	const url = "http://localhost:4000";

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${url}/api/categories/listcategory`);
                // Aici presupunem că response.data returnează o listă de produse
                setTotalProducts(response.data.data.length); // Actualizează totalProducts cu lungimea listei
            } catch (error) {
                console.error("Eroare la obținerea produselor:", error);
            }
        };

        fetchProducts();
    }, []); // Array gol pentru a rula doar la montarea componentelor

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Products' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Products' icon={Package} value={totalProducts} color='#6366F1' />
                    <StatCard name='Top Selling' icon={TrendingUp} value={89} color='#10B981' />
                    <StatCard name='Low Stock' icon={AlertTriangle} value={23} color='#F59E0B' />
                    <StatCard name='Total Revenue' icon={DollarSign} value={"$543,210"} color='#EF4444' />
                </motion.div>

                <ProductsTable />

                {/* CHARTS */}
                <div className='grid grid-col-1 lg:grid-cols-2 gap-8'>
                <SalesOverviewChart />
                    <CategoryDistributionChart />
                    <MostPopularProductChart />
                </div>
            </main>
        </div>
    );
};

export default CategoriesPage;

import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/products/SalesTrendChart";
import AddProducts from "../components/products/AddProducts";
import AddCategory from "../components/products/AddCategory";

const AddCategoriesPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Add category' />

			<AddCategory></AddCategory>
		</div>
	);
};
export default AddCategoriesPage;

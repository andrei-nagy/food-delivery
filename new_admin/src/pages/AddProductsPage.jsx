
import Header from "../components/common/Header";

import AddProducts from "../components/products/AddProducts";

const AddProductsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			    
				<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
			<Header title='Add products' />

			<AddProducts></AddProducts>
			</main>
		</div>
	);
};
export default AddProductsPage;
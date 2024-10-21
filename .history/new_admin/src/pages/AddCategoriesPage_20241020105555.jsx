
import Header from "../components/common/Header";

import AddCategory from "../components/products/AddCategory";

const AddCategoriesPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
            
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
			<Header title='Add category' />

			<AddCategory></AddCategory>
            </main>
		</div>
	);
};
export default AddCategoriesPage;

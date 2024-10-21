
import Header from "../components/common/Header";

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

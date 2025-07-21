
import Header from "../components/common/Header";
import CustomizationPage from "../components/customization/CustomizationForm";



const AddCustomization = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
            
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
			<Header title='Customization Page' />

			<CustomizationPage></CustomizationPage>
            </main>
		</div>
	);
};
export default AddCustomization;

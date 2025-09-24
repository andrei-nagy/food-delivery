import { useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import AddProducts from "../components/orders/AddProducts";

const AddProductsInOrderPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tableNo = searchParams.get("tableNo");
  const userId = searchParams.get("userId");

  // DECODEAZĂ userId dacă este encoded
  const decodedUserId = userId ? decodeURIComponent(userId) : null;

  console.log('TableNo:', tableNo, 'UserId:', decodedUserId);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <Header title={`Add products to Table ${tableNo}`} />
        {/* Transmite decoded userId */}
        <AddProducts tableNo={tableNo} userId={decodedUserId} />
      </main>
    </div>
  );
};
export default AddProductsInOrderPage;
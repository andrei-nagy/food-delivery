import axios from "axios";

export const fetchPopularCategories = async (url) => {
  try {
    const response = await axios.get(`${url}/api/order/list`);
    if (response.data.success) {
      const orders = response.data.data.filter(
        (order) => order.status === "Delivered"
      );

      // Contorizează categoriile și produsele
      const categoryCountMap = {};
      const productCountMap = {};

      orders.forEach((order) => {
        if (order.items) {
          order.items.forEach((item) => {
            // Contorizează produsele
            const productName = item.name;
            if (productName) {
              productCountMap[productName] =
                (productCountMap[productName] || 0) + 1;
            }

            // Contorizează categoriile
            const category = item.category;
            if (category) {
              categoryCountMap[category] =
                (categoryCountMap[category] || 0) + 1;
            }
          });
        }
      });

      // Transformă în array și sortează
      const topProducts = Object.entries(productCountMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const topCategories = Object.entries(categoryCountMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

      return { topProducts, topCategories };
    }
  } catch (error) {
    console.error("Eroare la obținerea datelor populare:", error);
    return { topProducts: [], topCategories: [] };
  }
};

export const submitWaiterOrder = async (url, action, tableNo) => {
  try {
    const response = await axios.post(`${url}/api/waiterorders/add`, {
      action,
      tableNo,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting waiter order:", error);
    throw error;
  }
};
import { useState, useEffect } from "react";
import axios from "axios";

export const usePopularProducts = (show, url) => {
  const [popularProducts, setPopularProducts] = useState([]);

  const fetchPopularProducts = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        const orders = response.data.data.filter(
          (order) => order.status === "Delivered"
        );

        const productCountMap = {};
        const categoryCountMap = {};

        orders.forEach((order) => {
          if (order.items) {
            order.items.forEach((item) => {
              const productName = item.name;
              if (productName) {
                productCountMap[productName] = (productCountMap[productName] || 0) + 1;
              }

              const category = item.category;
              if (category) {
                categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
              }
            });
          }
        });

        const topProducts = Object.entries(productCountMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        const topCategories = Object.entries(categoryCountMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);

        setPopularProducts({ topProducts, topCategories });
        return { topProducts, topCategories };
      }
    } catch (error) {
      console.error("Eroare la obținerea produselor populare:", error);
      return { topProducts: [], topCategories: [] };
    }
  };

  const fetchPopularCategories = async () => {
    return fetchPopularProducts();
  };

  useEffect(() => {
    if (show) {
      fetchPopularProducts();
    }
  }, [show]);

  return { popularProducts, fetchPopularProducts, fetchPopularCategories };
};
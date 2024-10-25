// PDFButton.js
import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';

const PDFButton = ({ apiUrl, documentTitle }) => {
  const [dataFromDatabase, setDataFromDatabase] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl);
        setDataFromDatabase(response.data.data);
      } catch (error) {
        console.error('Eroare la obținerea datelor:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text(documentTitle, 10, 10);

    // dataFromDatabase.forEach((item, index) => {
    //   doc.text(`Total Revenue: ${item.name}, Vârstă: ${item.age}`, 10, 30 + index * 10);
    // });

   
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0); // Sum of amounts

        doc.text(`Total Revenue: ${totalRevenue}`);
      
    doc.save('document.pdf');
  };

  return (
    <button onClick={handleGeneratePDF}>Generare PDF</button>
  );
};

export default PDFButton;

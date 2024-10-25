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

        dataFromDatabase.forEach((item, index) => {
            doc.text(`Order number: ${item.orderNumber}, Amount: ${item.amount}`, 10, 30 + index * 10);
        });


        // Obține data curentă
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0]; // format YYYY-MM-DD

        // Generează numele fișierului
        const fileName = `${documentTitle.replace(/\s+/g, '')}_${formattedDate}.pdf`;


        // const totalRevenue = dataFromDatabase.reduce((sum, order) => sum + order.amount, 0); // Sum of amounts

        // doc.text(`Total Revenue: ${totalRevenue}`);

        doc.save(fileName);
    };

    return (
        <button onClick={handleGeneratePDF}>Generare PDF</button>
    );
};

export default PDFButton;

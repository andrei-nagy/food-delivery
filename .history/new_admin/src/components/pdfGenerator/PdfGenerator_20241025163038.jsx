// PDFButton.js
import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

        // Adaugă titlul documentului
        doc.text(documentTitle, 10, 10);

        // Configurarea capului tabelului
        const columns = [
            { title: 'Order Number', dataKey: 'orderNumber' },
            { title: 'Amount', dataKey: 'amount' }
        ];

        // Configurarea datelor pentru tabel
        const rows = dataFromDatabase.map((item) => {
            console.log(item.orderNumber);
            return {
                orderNumber: item.orderNumber, // asigură-te că aceste chei există în datele tale
                amount: item.amount,
            }

         });
console.log(rows)

const testData = [
    { orderNumber: 1, amount: 100 },
    { orderNumber: 2, amount: 200 },
    { orderNumber: 3, amount: 300 },
];
console.log(testData)
        // Adaugă tabelul în PDF
        doc.autoTable({
            // head: [columns],
            head: [['Order Number', 'Amount']],
            body: testData,
            startY: 20, // începe tabelul mai jos pe pagină
            theme: 'grid', // poate ajuta la stilizarea tabelului
            styles: {
                halign: 'center', // aliniază textul în centru
            },
        });
        // Obține data curentă
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0]; // format YYYY-MM-DD

        // Generează numele fișierului
        const fileName = `${documentTitle.replace(/\s+/g, '')}_${formattedDate}.pdf`;

        // Salvează PDF-ul
        doc.save(fileName);
    };

    return (
        <button onClick={handleGeneratePDF}>Generare PDF</button>
    );
};

export default PDFButton;

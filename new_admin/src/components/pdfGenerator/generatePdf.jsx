// generatePDF.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

export const generatePDF = async (apiUrl, documentTitle) => {
    const doc = new jsPDF();

    // Obține datele din API
    try {
        const response = await axios.get(apiUrl);
        const dataFromDatabase = response.data.data;

        // Adaugă titlul documentului
        doc.text(documentTitle, 10, 10);

        // Capul tabelului
        const tableHead = [['Order Number', 'Amount']];

        // Transformă datele în array-uri
        const rows = dataFromDatabase.map((item) => [
            item.orderNumber,
            item.amount,
        ]);

        // Adaugă tabelul în PDF
        doc.autoTable({
            head: tableHead,
            body: rows,
            startY: 20,
            theme: 'grid',
            styles: {
                halign: 'center',
            },
        });

        // Generează numele fișierului cu data curentă
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const fileName = `${documentTitle.replace(/\s+/g, '')}_${formattedDate}.pdf`;

        // Salvează PDF-ul
        doc.save(fileName);
    } catch (error) {
        console.error('Eroare la obținerea datelor:', error);
    }
};

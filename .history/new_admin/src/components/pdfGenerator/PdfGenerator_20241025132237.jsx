import React from 'react';
import { jsPDF } from 'jspdf';

const PDFGenerator = () => {
  const handleGeneratePDF = () => {
    // Crează o instanță jsPDF
    const doc = new jsPDF();

    // Adaugă text în PDF
    doc.text('Titlul Documentului', 10, 10);
    doc.text('Acesta este un exemplu de document PDF generat dintr-o aplicație React.', 10, 20);
    
    // Exemplu de date pe care ai putea să le extragi din baza de date
    const dataFromDatabase = [
      { name: 'John Doe', age: 30 },
      { name: 'Jane Smith', age: 25 },
    ];

    // Adaugă datele în PDF
    dataFromDatabase.forEach((item, index) => {
      doc.text(`Nume: ${item.name}, Vârstă: ${item.age}`, 10, 30 + index * 10);
    });

    // Salvează PDF-ul
    doc.save('document.pdf');
  };

  return (
    <div>
      <button onClick={handleGeneratePDF}>Generare PDF</button>
    </div>
  );
};

export default PDFGenerator;

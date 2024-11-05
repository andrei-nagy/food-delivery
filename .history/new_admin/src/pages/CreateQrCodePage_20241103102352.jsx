// src/App.js
import React from "react";
import QRCodeGenerator from "../components/qrCode/qrCode";
const CreateQrCodePage = () => {
         return (
            <div className='flex-1 overflow-auto relative z-10'>
                
                <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Header title='Customization Page' />
    
                <QRCodeGenerator></QRCodeGenerator>
                </main>
            </div>
        );
    


  
};
export default CreateQrCodePage;
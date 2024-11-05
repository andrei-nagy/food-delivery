// src/App.js
import React from "react";
import QRCodeGenerator from "../components/qrCode/qrCode";
import Header from "../components/common/Header";
import QrCodes from "../components/qrCode/QrCodes";
const CreateQrCodePage = () => {
         return (
            <div className='flex-1 overflow-auto relative z-10'>
                
                <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <Header title='Customization Page' />
    
                <QrCodes></QrCodes>
                </main>
            </div>
        );
    


  
};
export default CreateQrCodePage;
import React, { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
// import htmlToImage from 'html-to-image';
import axios from 'axios';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { useUrl } from '../context/UrlContext';
import { toast } from 'react-toastify';

const QRCodeGenerator = () => {
    const [tableNo, setTableNo] = useState('');
    const [restaurantId, setRestaurantId] = useState('');
    const [qrImage, setQrImage] = useState(null);
    const {url} = useUrl();
    
    const handleGenerateQRCode = async () => {
        const qrContainer = document.getElementById('qr-container');

        // Salvează imaginea QR ca PNG
        try {
            const dataUrl = await toPng(qrContainer);
            setQrImage(dataUrl); // Setează imaginea QR în state pentru afișare

            // Trimite imaginea și datele la server pentru salvare
            await axios.post(`${url}/admin/create-qrcode`, {
                tableNo,
                restaurantId,
                qrImage: dataUrl,
                createdOn: new Date(),
            });
            if (response.data.success) {

            toast.success("QR code saved successfully!");
            } else {
                toast.error(response.data.message); // Notificare de eroare

            }
        } catch (error) {
            console.error("Error generating QR code image:", error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Generate QR Code for Table</h2>
            <div>
                <input
                    type="text"
                    placeholder="Table Number"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Restaurant ID"
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                />
            </div>
            <button onClick={handleGenerateQRCode}>Generate QR Code</button>

            {/* Afișează codul QR cu text personalizat */}
            {tableNo && (
                <div id="qr-container" style={{ marginTop: '20px', padding: '10px', background: '#fff' }}>
                    <QRCode
                        value={`Table No: ${tableNo}, Restaurant ID: ${restaurantId}`}
                        logoImage="path/to/logo.png" // opțional, pentru un logo personalizat
                        size={200}
                    />
                    <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                        QR Code for Table No. {tableNo}
                    </p>
                </div>
            )}

            {/* Afișează imaginea QR salvată */}
            {qrImage && (
                <div>
                    <h3>Saved QR Code Image</h3>
                    <img src={qrImage} alt="QR Code" style={{ marginTop: '10px' }} />
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;

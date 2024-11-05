import React, { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { useUrl } from '../context/UrlContext';
import { toast } from 'react-toastify';

const QRCodeGenerator = () => {
    const [tableNo, setTableNo] = useState('');
    const [restaurantId, setRestaurantId] = useState('');
    const [qrImage, setQrImage] = useState(null);
    const { url } = useUrl();

    const handleGenerateQRCode = async () => {
        const qrContainer = document.getElementById('qr-container');

        try {
            const dataUrl = await toPng(qrContainer);
            setQrImage(dataUrl);

            const response = await axios.post(`${url}/admin/create-qrcode`, {
                tableNo,
                restaurantId,
                qrImage: dataUrl,
                createdOn: new Date(),
            });

            if (response.data.success) {
                toast.success("QR code saved successfully!");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error generating QR code image:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-semibold mb-6">Generate QR Code for Table</h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Table Number"
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Restaurant ID"
                        value={restaurantId}
                        onChange={(e) => setRestaurantId(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                </div>

                <button
                    onClick={handleGenerateQRCode}
                    className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Generate QR Code
                </button>

                {/* Display the QR Code */}
                {tableNo && (
                    <div
                        id="qr-container"
                        className="mt-8 bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
                    >
                        <QRCode
                            value={`Table No: ${tableNo}, Restaurant ID: ${restaurantId}`}
                            logoImage="path/to/logo.png"
                            size={180}
                            className="rounded"
                        />
                        <p className="mt-4 font-semibold text-gray-700">
                            QR Code for Table No. {tableNo}
                        </p>
                    </div>
                )}

                {/* Display saved QR code image */}
                {qrImage && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold">Saved QR Code Image</h3>
                        <img
                            src={qrImage}
                            alt="QR Code"
                            className="mt-4 rounded-lg border border-gray-700"
                            style={{ width: '200px', height: '200px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeGenerator;

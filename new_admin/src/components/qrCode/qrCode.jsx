import React, { useEffect, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { useUrl } from '../context/UrlContext';
import { toast } from 'react-toastify';
import './QrCodes.css'
import { assets } from '../../../../frontend/src/assets/assets';

const QRCodeGenerator = () => {
    const [tableNo, setTableNo] = useState('');
    const [createdByUserName, setCreatedByUserName] = useState('');
    const [qrImage, setQrImage] = useState(null);
    const { url } = useUrl();
    const adminUserName = localStorage.getItem("userName");
    const [image, setImage] = useState(null);
    const [data, setData] = useState(null);
    const [baseUrl, setBaseUrl] = useState('');

    // Funcție simplă pentru a obține URL-ul de bază
    const getBaseUrl = () => {
        return window.location.origin;
    };

    // Funcție pentru a obține URL-ul complet pentru register
    const getRegisterUrl = (tableNumber) => {
        const base = getBaseUrl();
        return `${base}/register?table=${tableNumber}`;
    };

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                const customizationData = response.data.data;
                setImage(customizationData.image);
                setData(customizationData);
            }
        } catch (error) {
            toast.error('Error fetching customization data:', error);
        }
    };

    useEffect(() => {
        // Setează URL-ul de bază la montarea componentei
        setBaseUrl(getBaseUrl());
        setCreatedByUserName(adminUserName);
        fetchCustomization();
    }, [adminUserName]);

    const handleGenerateQRCode = async () => {
        const qrContainer = document.getElementById('qr-container');

        try {
            const dataUrl = await toPng(qrContainer);
            setQrImage(dataUrl);

            const response = await axios.post(`${url}/admin/create-qrcode`, {
                tableNo,
                createdByUserName,
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

    const handleDownloadImage = () => {
        const link = document.createElement('a');
        link.href = qrImage;
        link.download = `QR_Code_Table_${tableNo}.png`;
        link.click();
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
                        placeholder="User Name"
                        value={createdByUserName}
                        onChange={(e) => setCreatedByUserName(e.target.value)}
                        disabled
                        hidden
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
                        className="mt-8 bg-white p-6 rounded-lg shadow-md flex flex-col items-center transition-transform transform hover:scale-105 border border-gray-300"
                        style={{
                            backgroundImage: `url(` + assets.BannerBackground + `)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            opacity: 0.9,
                            borderRadius: "10px"
                        }}
                    >
                        {/* Logo-ul restaurantului */}
                        <div className="mb-4">
                            <img
                                src={image ? `${url}/images/` + image : assets.original_logo}
                                alt="Restaurant Logo"
                                className="h-16 w-auto"
                                style={{
                                    borderRadius: "10px"
                                }}
                            />
                        </div>
                        <p className="font-semibold text-white restaurant_name text-[24px] font-raleway">
                            {data?.restaurantName}
                        </p>
                        
                        {/* QR Code */}
                        <QRCode
                            value={getRegisterUrl(tableNo)} // Folosim URL-ul dinamic aici
                            size={180}
                            logoWidth={60}
                            logoHeight={40}
                            logoClassName="qr-logo"
                            border={4}
                        />
                        
                        <p className="mt-4 font-semibold text-gray-700 text-lg font-raleway">
                            QR Code for <span className="text-white font-bold">Table no. {tableNo}</span>
                        </p>
                        <p className="text-gray-500 text-sm mt-2 text-center font-raleway">
                            Scan to register your table and enjoy our services!
                        </p>

                        <hr className="my-4 border-gray-300 w-full" />

                        <p className="mt-2 text-gray-600 text-center italic font-raleway font-semibold font-tangerine text-[30px]">
                            Thank you for choosing us!
                        </p>
                        <br />
                        <br />
                    </div>
                )}

                {/* Display saved QR code image */}
                {qrImage && (
                    <div className="mt-8">
                        <button
                            onClick={handleDownloadImage}
                            className="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            Download Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeGenerator;
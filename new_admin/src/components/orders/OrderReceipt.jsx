import React, { useState, useEffect } from 'react';
import { 
  PDFDownloadLink, 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Font,
  Image 
} from '@react-pdf/renderer';
import axios from 'axios';
import { useUrl } from '../context/UrlContext';

// Înregistrează fonturi cu suport pentru diacritice
Font.register({
  family: 'Roboto',
  fonts: [
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400 
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700 
    },
  ],
});

Font.register({
  family: 'Roboto-Italic',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf'
});

// Stiluri pentru PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 15,
    objectFit: 'contain',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  restaurantSlogan: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 5,
    fontFamily: 'Roboto-Italic',
  },
  restaurantDetails: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    color: '#333333',
  },
  orderInfo: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  orderInfoBlock: {
    flex: 1,
  },
  orderInfoTitle: {
    fontSize: 7,
    color: '#666666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  orderInfoValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#F0F0F0',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#CCCCCC',
  },
  colNr: { width: '8%', textAlign: 'center' },
  colDesc: { width: '37%' },
  colQty: { width: '8%', textAlign: 'center' },
  colPrice: { width: '12%', textAlign: 'right' }, // Preț fără TVA
  colVat: { width: '8%', textAlign: 'center' },
  colTotal: { width: '15%', textAlign: 'right' }, // Total cu TVA
  colSubtotal: { width: '12%', textAlign: 'right' }, // Subtotal fără TVA
  totalsSection: {
    marginTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
    width: '50%',
    alignSelf: 'flex-end',
  },
  totalLabel: {
    width: '40%',
    textAlign: 'right',
    marginRight: 10,
    fontSize: 9,
  },
  totalValue: {
    width: '50%',
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 9,
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    marginTop: 5,
    paddingTop: 5,
  },
  paymentInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  signature: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
  },
  legalInfo: {
    marginTop: 15,
    fontSize: 6,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  socialInfo: {
    marginTop: 5,
    fontSize: 6,
    color: '#888888',
    textAlign: 'center',
  }
});

// Valori implicite pentru restaurantData (ca în Welcome)
const DEFAULT_RESTAURANT_DATA = {
  image: '',
  restaurantName: 'Restaurantul Tău',
  slogan: 'Bucătărie tradițională',
  openingHours: {},
  contactEmail: '',
  contactPhone: '',
  facebook: '',
  instagram: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  vatNumber: '',
  companyNumber: '',
  website: '',
  currency: 'EUR',
  taxRate: '19',
  serviceCharge: '0',
  receiptFooter: 'Vă mulțumim că ne-ați vizitat!'
};

// Funcție pentru calcul TVA
const calculateVATDetails = (items, taxRate) => {
  const vatRate = parseFloat(taxRate || 19) / 100;
  let subtotalFaraTVA = 0;
  let totalCuTVA = 0;
  
  items.forEach(item => {
    const pretFaraTVA = item.price || 0; // Presupunem că price este deja fără TVA
    const cantitate = item.quantity || 1;
    subtotalFaraTVA += pretFaraTVA * cantitate;
    totalCuTVA += pretFaraTVA * cantitate * (1 + vatRate);
  });
  
  return {
    subtotalFaraTVA,
    vatRate: taxRate || 19,
    vatAmount: totalCuTVA - subtotalFaraTVA,
    totalCuTVA
  };
};

// Formatare sume
const formatAmount = (amount, currency = 'EUR') => {
  const formatted = amount?.toFixed(2) || '0.00';
  const currencySymbols = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'RON': 'lei',
    'MDL': 'lei'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${formatted} ${symbol}`;
};

// Componenta Document PDF
const ReceiptDocument = ({ order, restaurantData, baseUrl }) => {
  // Asigură-te că restaurantData nu este null
  const data = restaurantData || DEFAULT_RESTAURANT_DATA;
  
  // Calculează TVA
  const vatDetails = calculateVATDetails(order.items || [], data.taxRate);
  const currency = data.currency || 'EUR';
  const vatRate = parseFloat(data.taxRate || 19) / 100;
  
  // Construiește URL-ul pentru logo - dacă nu există, folosește logo-ul default din public
  const logoUrl = data.image 
    ? `${baseUrl}/images/${data.image}`
    : '/o-logo.svg'; // Logo default din folderul public
  
  // Formatează adresa completă
  const fullAddress = [
    data.address,
    data.city,
    data.postalCode,
    data.country
  ].filter(Boolean).join(', ');
  
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header cu Logo și Info Restaurant */}
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>
              {data.restaurantName}
            </Text>
            {data.slogan && (
              <Text style={styles.restaurantSlogan}>
                {data.slogan}
              </Text>
            )}
            <Text style={styles.restaurantDetails}>
              {fullAddress}
            </Text>
            <Text style={styles.restaurantDetails}>
              {data.contactPhone && `Tel: ${data.contactPhone}`}
              {data.contactEmail && ` | Email: ${data.contactEmail}`}
            </Text>
            {(data.vatNumber || data.companyNumber) && (
              <Text style={styles.restaurantDetails}>
                {data.vatNumber && `CUI: ${data.vatNumber}`}
                {data.companyNumber && ` | J: ${data.companyNumber}`}
              </Text>
            )}
            {data.website && (
              <Text style={styles.restaurantDetails}>
                Web: {data.website}
              </Text>
            )}
          </View>
        </View>

        {/* Titlu Bon Fiscal */}
        <Text style={styles.title}>BON FISCAL</Text>

        {/* Info Comandă */}
        <View style={styles.orderInfo}>
          <View style={styles.orderInfoBlock}>
            <Text style={styles.orderInfoTitle}>Comanda #</Text>
            <Text style={styles.orderInfoValue}>{order.orderNumber || 'N/A'}</Text>
          </View>
          <View style={styles.orderInfoBlock}>
            <Text style={styles.orderInfoTitle}>Masa</Text>
            <Text style={styles.orderInfoValue}>{order.tableNo || 'Takeaway'}</Text>
          </View>
          <View style={styles.orderInfoBlock}>
            <Text style={styles.orderInfoTitle}>Data</Text>
            <Text style={styles.orderInfoValue}>
              {order.date ? new Date(order.date).toLocaleDateString('ro-RO') : 'N/A'}
            </Text>
          </View>
          <View style={styles.orderInfoBlock}>
            <Text style={styles.orderInfoTitle}>Ora</Text>
            <Text style={styles.orderInfoValue}>
              {order.date ? new Date(order.date).toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Tabel Produse */}
        <View style={styles.table}>
          {/* Header Tabel */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colNr}>#</Text>
            <Text style={styles.colDesc}>Produs</Text>
            <Text style={styles.colQty}>Cant</Text>
            <Text style={styles.colPrice}>Preț (fără TVA)</Text>
            <Text style={styles.colVat}>TVA</Text>
            <Text style={styles.colTotal}>Total (cu TVA)</Text>
          </View>

          {/* Produse */}
          {(order.items || []).map((item, index) => {
            const pretFaraTVA = item.price || 0;
            const cantitate = item.quantity || 1;
            const totalFaraTVA = pretFaraTVA * cantitate;
            const totalCuTVA = totalFaraTVA * (1 + vatRate);
            
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colNr}>{index + 1}</Text>
                <Text style={styles.colDesc}>{item.name || 'Produs'}</Text>
                <Text style={styles.colQty}>{cantitate}</Text>
                <Text style={styles.colPrice}>
                  {formatAmount(pretFaraTVA, currency)}
                </Text>
                <Text style={styles.colVat}>{data.taxRate || 19}%</Text>
                <Text style={styles.colTotal}>
                  {formatAmount(totalCuTVA, currency)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totaluri */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (fără TVA):</Text>
            <Text style={styles.totalValue}>
              {formatAmount(vatDetails.subtotalFaraTVA, currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA {data.taxRate || 19}%:</Text>
            <Text style={styles.totalValue}>
              {formatAmount(vatDetails.vatAmount, currency)}
            </Text>
          </View>
          {parseFloat(data.serviceCharge || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Serviciu {data.serviceCharge}%:</Text>
              <Text style={styles.totalValue}>
                {formatAmount(vatDetails.subtotalFaraTVA * (parseFloat(data.serviceCharge) / 100), currency)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>TOTAL DE PLATĂ (cu TVA):</Text>
            <Text style={styles.totalValue}>
              {formatAmount(order.amount || vatDetails.totalCuTVA, currency)}
            </Text>
          </View>
        </View>

        {/* Info Plată */}
        <View style={styles.paymentInfo}>
          <View>
            <Text>💳 Metodă plată: {order.paymentMethod || 'Nespecificată'}</Text>
            <Text>📊 Status: {order.payment ? 'Plătit' : 'Neplătit'}</Text>
          </View>
          <View>
            <Text>👤 Operator: Sistem</Text>
            <Text>🕒 {new Date().toLocaleTimeString('ro-RO')}</Text>
          </View>
        </View>

        {/* Instrucțiuni Speciale */}
        {order.specialInstructions && (
          <View style={{ marginTop: 10, padding: 5, backgroundColor: '#FFF3CD' }}>
            <Text style={{ fontSize: 8, color: '#856404' }}>
              📝 Observații: {order.specialInstructions}
            </Text>
          </View>
        )}

        {/* Social Media */}
        {(data.facebook || data.instagram) && (
          <View style={styles.socialInfo}>
            <Text>
              {data.facebook && `Facebook: ${data.facebook}`}
              {data.facebook && data.instagram && ' | '}
              {data.instagram && `Instagram: ${data.instagram}`}
            </Text>
          </View>
        )}

        {/* Footer personalizat */}
        {data.receiptFooter && (
          <View style={styles.footer}>
            <Text style={{ fontFamily: 'Roboto-Italic' }}>
              {data.receiptFooter}
            </Text>
          </View>
        )}

        {/* Semnături */}
        <View style={styles.signature}>
          <Text>_________________________</Text>
          <Text>_________________________</Text>
        </View>
        <View style={[styles.signature, { marginTop: 5 }]}>
          <Text style={{ fontSize: 7 }}>Semnătura client</Text>
          <Text style={{ fontSize: 7 }}>Semnătura casier</Text>
        </View>

        {/* Info Legal */}
        <View style={styles.legalInfo}>
          <Text>Bonul nu este fiscal în absența ștampilei și semnăturii</Text>
          <Text>Document generat digital • {new Date().toLocaleDateString('ro-RO')}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Componenta principală
const OrderReceiptButton = ({ order, className = '' }) => {
  const [restaurantData, setRestaurantData] = useState(DEFAULT_RESTAURANT_DATA);
  const [loading, setLoading] = useState(true);
  const { url } = useUrl();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Folosim același endpoint ca în Welcome
        const response = await axios.get(`${url}/admin/personalization/get`);
        if (response.data.success && response.data.data) {
          setRestaurantData(response.data.data);
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        // În caz de eroare, păstrăm datele implicite
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (loading) {
    return (
      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-500 text-white cursor-wait ${className}`}
        disabled
      >
        <span className="flex items-center gap-1">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Se încarcă...
        </span>
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ReceiptDocument order={order} restaurantData={restaurantData} baseUrl={url} />}
      fileName={`bon_${order.orderNumber || 'comanda'}_${new Date().toISOString().split('T')[0]}.pdf`}
      className={`inline-block ${className}`}
    >
      {({ loading: pdfLoading, error }) => (
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            pdfLoading 
              ? 'bg-gray-500 cursor-wait' 
              : error 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Se generează...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Bon Fiscal
            </span>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default OrderReceiptButton;
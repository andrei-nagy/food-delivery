import Header from "../components/common/Header";
import PromoCodeTable from "../components/promoCodes/PromoCodeTable";

function PromoCodePage() {
    return (
        <div className="flex-1 overflow-auto">
            <Header title="Promo Codes" showNotifications={true} />
            <div className="p-4 md:p-6">
                <PromoCodeTable />
            </div>
        </div>
    );
}

export default PromoCodePage;
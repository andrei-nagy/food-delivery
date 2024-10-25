import Header from "../components/common/Header";
import ConnectedAccounts from "../components/settings/ConnectedAccounts";
import DangerZone from "../components/settings/DangerZone";
import Notifications from "../components/settings/Notifications";
import Profile from "../components/settings/Profile";
import Security from "../components/settings/Security";
import SubmitTicketPage from "../components/tickets/SubmitTicket";

const SupportPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title='Support' />
			<main className='max-w-5xl mx-auto py-6 px-4 lg:px-4'>
				<SubmitTicketPage></SubmitTicketPage>
				
			</main>
		</div>
	);
};
export default SupportPage;

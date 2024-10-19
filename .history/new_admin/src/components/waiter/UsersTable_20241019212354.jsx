import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios"
import { toast } from "react-toastify";

const userData = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin", status: "Active" },
	{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Customer", status: "Inactive" },
	{ id: 4, name: "Alice Brown", email: "alice@example.com", role: "Customer", status: "Active" },
	{ id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "Moderator", status: "Active" },
];

const UsersTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredRequests, setFilteredRequests] = useState("");
	const url = 'http://localhost:4000';
	const [list, setList] = useState([]);
	const [newRequests, setNewRequests] = useState([]); // Stocăm cererile noi pentru a aplica stilul
	const audioRef = useRef(null); // Referință la elementul audio pentru a reda sunetul




	// Funcția de preluare a listei de comenzi
	const fetchList = async () => {
		const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);

		if (response.data.success) {
			const newList = response.data.data;

			// Verificăm dacă există modificări în listă
			if (JSON.stringify(newList) !== JSON.stringify(list)) {
				// Verificăm cererile noi
				const pendingRequests = newList.filter(item => item.status === 'Pending');
				const completedRequests = newList.filter(item => item.status === 'Completed');

				// Actualizăm cererile noi
				setNewRequests(pendingRequests.filter(item => !list.includes(item)));

				// Redăm sunetul de notificare
				if (audioRef.current) {
					audioRef.current.play().catch(error => {
						console.log('Sound play blocked by browser:', error);
					});
				}

				toast.success("New waiter request received!");
				setList(newList); // Actualizăm lista doar dacă s-a schimbat
			}
		} else {
			toast.error("Error");
		}
	};

	// Facem polling la fiecare 5 secunde
	useEffect(() => {
		fetchList(); // Prima cerere imediat ce componenta e montată

		const intervalId = setInterval(() => {
			fetchList();
		}, 5000); // Polling la fiecare 5 secunde

		return () => clearInterval(intervalId); // Curățăm intervalul la demontare
	}, [list]); // Adăugăm `list` în dependency array pentru a verifica lista la fiecare actualizare

	// Handler pentru schimbarea statusului (opțional)
	const statusHandler = async (event, orderId) => {
		const response = await axios.post(url + "/api/waiterorders/status", {
			orderId,
			status: event.target.value
		});

		if (response.data.success) {
			toast.success("Status updated successfully.")
			// Fetch updated list or any other logic after status update
			await fetchList();
		} else {
			toast.error("Error");
		}
	};


	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = newRequests.filter(
			(request) => request.tableNo.toLowerCase().includes(term) || user.action.toLowerCase().includes(term)
		);
		setFilteredRequests(filtered);
	};

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Users</h2>
				<div className='relative'>
					<input
						type='text'
						placeholder='Search users...'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Name
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Email
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Role
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Status
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-700'>
						{list
							.filter(item => item.status === 'Pending')
							.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sortare descrescătoare
							.map((item) => (
								console.log(item)
								<motion.tr
									key={item._id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.3 }}
								>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='flex items-center'>
											<div className='flex-shrink-0 h-10 w-10'>
												<div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
													{item.tableNo.charAt(0)}
												</div>
											</div>
											<div className='ml-4'>
												<div className='text-sm font-medium text-gray-100'>{item.tableNo}</div>
											</div>
										</div>
									</td>

									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='text-sm text-gray-300'>{item.tableNo}</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
											{item.action}
										</span>
									</td>

									<td className='px-6 py-4 whitespace-nowrap'>
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === "Active"
												? "bg-green-800 text-green-100"
												: "bg-red-800 text-red-100"
												}`}
										>
											{item.status}
										</span>
									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
										<button className='text-indigo-400 hover:text-indigo-300 mr-2'>Edit</button>
										<button className='text-red-400 hover:text-red-300'>Delete</button>
									</td>
								</motion.tr>
							))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};
export default UsersTable;

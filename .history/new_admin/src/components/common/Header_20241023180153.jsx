const Header = ({ title, profileImageUrl, notificationsCount }) => {
	return (
		<header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
				
				{/* Profile & Notifications Section */}
				<div className="flex items-center space-x-4">
					{/* Notifications */}
					<div className="relative">
						<div className="w-6 h-6 bg-gray-600 rounded-full flex justify-center items-center text-white text-sm">
							{notificationsCount}
						</div>
						<span className="sr-only">Notifications</span> {/* Screen reader accessibility */}
					</div>

					{/* Profile Image */}
					<div>
						<img
							 src={`https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`}
  alt="Random"
							className="w-10 h-10 rounded-full object-cover"
							style={{ maxWidth: '50px' }} // Limitează lățimea imaginii
						/>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;

const Header = ({ title, profileImageUrl, }) => {
	const role = localStorage.getItem("userRole"); 
	const name = localStorage.getItem("userName"); 

	return (
		<header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<h1 className="text-2xl font-semibold text-gray-100">{title}</h1>

				<div className="flex items-center space-x-4">
					{/* Welcome Message */}
					<span className="text-gray-100 text-sm">
						{`Welcome back, `} 
						<span className="font-bold text-blue-500">{name}</span> {/* Afișează numele bolduit și cu culoare albastră */}
					</span>

					{/* Profile Image */}
					<div>
						<img
							src={`https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`}
							alt="Random"
							className="w-20 h-10 rounded-full object-cover"
							style={{ maxWidth: '40px' }} // Limitează lățimea imaginii
						/>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;

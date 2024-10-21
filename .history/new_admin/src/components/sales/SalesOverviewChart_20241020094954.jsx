// Helper function to get the start and end of the current week (Monday to Sunday)
const getWeekRange = () => {
	const now = new Date();
	const firstDayOfWeek = new Date(now);
	// Set to Monday of the current week
	firstDayOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // If today is Sunday, back to last Monday
	firstDayOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00

	const lastDayOfWeek = new Date(firstDayOfWeek);
	lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Add 6 days to get to Sunday
	lastDayOfWeek.setHours(23, 59, 59, 999); // Set time to 23:59:59 on Sunday

	return { start: firstDayOfWeek, end: lastDayOfWeek };
};

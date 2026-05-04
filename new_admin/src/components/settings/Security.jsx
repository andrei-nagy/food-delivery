import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import { useNavigate } from "react-router-dom";

const ROLE_COLORS = {
    admin:   "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    waiter:  "bg-green-500/20 text-green-400 border border-green-500/30",
    orderly: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

const getRoleBadge = (role) => ROLE_COLORS[role?.toLowerCase()] ?? "bg-gray-500/20 text-gray-400 border border-gray-500/30";

const Profile = () => {
    const navigate  = useNavigate();

    // Date reale din localStorage (setate la login din adminController.loginAdmin)
    const userName  = localStorage.getItem("userName")  ?? "Unknown User";
    const userRole  = localStorage.getItem("userRole")  ?? "—";

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    // Inițiale pentru avatar
    const initials = userName
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <SettingSection icon={User} title={"Profile"}>
            <div className='flex flex-col sm:flex-row items-center mb-6 gap-4'>
                {/* Avatar cu inițiale */}
                <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg, #eb6816, #f59e0b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 700, color: "#fff",
                    flexShrink: 0, boxShadow: "0 4px 16px rgba(235,104,22,0.35)",
                }}>
                    {initials}
                </div>

                <div>
                    <h3 className='text-lg font-semibold text-gray-100'>{userName}</h3>
                    <span className={`mt-1 inline-flex px-3 py-1 text-xs font-medium rounded-full ${getRoleBadge(userRole)}`}>
                        {userRole}
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => navigate('/settings')}
                    className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto text-sm'
                >
                    Edit Profile
                </button>
                <button
                    onClick={handleLogout}
                    className='bg-transparent hover:bg-red-700/20 text-red-400 font-semibold py-2 px-4 rounded border border-red-700/40 transition duration-200 w-full sm:w-auto text-sm'
                >
                    Logout
                </button>
            </div>
        </SettingSection>
    );
};

export default Profile;
import { Lock, User, Mail, Eye, EyeOff, CheckCircle, XCircle, Phone } from "lucide-react";
import SettingSection from "./SettingSection";
import ToggleSwitch from "./ToggleSwitch";
import { useState, useEffect } from "react";
import axios from "axios";

const Security = () => {
    const [twoFactor, setTwoFactor] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    
    // State pentru schimbarea parolei
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    // State pentru actualizarea profilului
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: ""
    });
    
    // State pentru vizibilitatea parolelor
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // State pentru mesaje și stare de încărcare
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [passwordStrength, setPasswordStrength] = useState("");
    
    // Hardcode API URL
    const apiUrl = "https://api.orderly-app.com";

    // Preia datele utilizatorului curent din backend
useEffect(() => {
    const fetchCurrentUserData = async () => {
        try {
            setIsLoadingProfile(true);
            const token = localStorage.getItem("authToken");
            
            if (!token) {
                console.error("No auth token found");
                setIsLoadingProfile(false);
                return;
            }

            const response = await axios.get(`${apiUrl}/api/admin/current-user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success && response.data.data) {
                const userData = response.data.data;
                setProfileData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || ""
                });
                
                // Actualizează localStorage pentru compatibilitate
                localStorage.setItem("userName", userData.name || "");
                localStorage.setItem("userEmail", userData.email || "");
                if (userData._id) {
                    localStorage.setItem("userId", userData._id);
                }
            } else {
                console.error("Failed to fetch user data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching current user data:", error);
            // Poți adăuga un fallback dacă ești offline
        } finally {
            setIsLoadingProfile(false);
        }
    };

    fetchCurrentUserData();
}, []);

    // Verifică puterea parolei
    useEffect(() => {
        if (passwordData.newPassword) {
            const strength = checkPasswordStrength(passwordData.newPassword);
            setPasswordStrength(strength);
        } else {
            setPasswordStrength("");
        }
    }, [passwordData.newPassword]);

    const checkPasswordStrength = (password) => {
        if (password.length === 0) return "";
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        switch(strength) {
            case 1: return "Weak";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Strong";
            default: return "Very Weak";
        }
    };

    const getPasswordStrengthColor = (strength) => {
        switch(strength) {
            case "Very Weak": return "text-red-500";
            case "Weak": return "text-red-400";
            case "Fair": return "text-yellow-500";
            case "Good": return "text-green-400";
            case "Strong": return "text-green-500";
            default: return "text-gray-400";
        }
    };

    const getPasswordStrengthBar = (strength) => {
        switch(strength) {
            case "Very Weak": return "w-1/5 bg-red-500";
            case "Weak": return "w-2/5 bg-red-400";
            case "Fair": return "w-3/5 bg-yellow-500";
            case "Good": return "w-4/5 bg-green-400";
            case "Strong": return "w-full bg-green-500";
            default: return "w-0 bg-gray-400";
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        // Validări
        if (!passwordData.currentPassword) {
            setMessage({ text: "Current password is required.", type: "error" });
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: "New passwords don't match.", type: "error" });
            return;
        }
        
        if (passwordData.newPassword.length < 8) {
            setMessage({ text: "New password must be at least 8 characters long.", type: "error" });
            return;
        }
        
        if (passwordData.currentPassword === passwordData.newPassword) {
            setMessage({ text: "New password must be different from current password.", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const userId = localStorage.getItem("userId") || "";
            const token = localStorage.getItem("authToken");

            const response = await axios.post(`${apiUrl}/api/admin/change-password`, {
                userId,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage({ 
                    text: "Password changed successfully!", 
                    type: "success" 
                });
                
                // Reset form
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                
                // Închide formularul după 2 secunde
                setTimeout(() => {
                    setIsChangingPassword(false);
                    setMessage({ text: "", type: "" });
                }, 2000);
            } else {
                setMessage({ 
                    text: response.data.message || "Failed to change password.", 
                    type: "error" 
                });
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setMessage({ 
                text: error.response?.data?.message || "An error occurred. Please try again.", 
                type: "error" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!profileData.name.trim()) {
            setMessage({ text: "Name is required.", type: "error" });
            return;
        }
        
        if (!profileData.email.trim()) {
            setMessage({ text: "Email is required.", type: "error" });
            return;
        }
        
        // Validare simplă de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            setMessage({ text: "Please enter a valid email address.", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const userId = localStorage.getItem("userId") || "";
            const token = localStorage.getItem("authToken");

            const response = await axios.post(`${apiUrl}/api/admin/update-profile`, {
                userId,
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone || ""
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage({ 
                    text: "Profile updated successfully!", 
                    type: "success" 
                });
                
                // Actualizează localStorage cu noile date
                localStorage.setItem("userName", profileData.name);
                localStorage.setItem("userEmail", profileData.email);
                
                // Reîncarcă pagina pentru a reflecta schimbările în toată aplicația
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setMessage({ 
                    text: response.data.message || "Failed to update profile.", 
                    type: "error" 
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ 
                text: error.response?.data?.message || "An error occurred. Please try again.", 
                type: "error" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SettingSection icon={Lock} title={"Security & Account"}>
            <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="bg-gray-800 bg-opacity-30 rounded-xl p-4 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                            <ToggleSwitch
                                label={"Two-Factor Authentication"}
                                isOn={twoFactor}
                                onToggle={() => setTwoFactor(!twoFactor)}
                            />
                            <p className="text-sm text-gray-400 mt-2 ml-1">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 bg-indigo-900 bg-opacity-20 hover:bg-opacity-30 rounded-lg border border-indigo-800">
                            Setup Guide
                        </button>
                    </div>
                </div>

                {/* Profile Update Section */}
                <div className="bg-gray-800 bg-opacity-30 rounded-xl p-4 md:p-5 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-white flex items-center">
                                <User size={18} className="mr-2" />
                                Account Information
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Update your name, email, and phone number
                            </p>
                        </div>
                        <button
                            onClick={() => setIsUpdatingProfile(!isUpdatingProfile)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                                isUpdatingProfile 
                                    ? 'bg-gray-700 text-gray-300' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {isUpdatingProfile ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>

                    {isLoadingProfile ? (
                        <div className="py-8 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                            <p className="text-gray-400 text-sm">Loading profile data...</p>
                        </div>
                    ) : isUpdatingProfile ? (
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter your phone number"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                        Optional
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsUpdatingProfile(false)}
                                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                                    <User className="text-gray-400 mr-3 flex-shrink-0" size={18} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-400 truncate">Name</p>
                                        <p className="text-white font-medium truncate">{profileData.name || "Not set"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                                    <Mail className="text-gray-400 mr-3 flex-shrink-0" size={18} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-400 truncate">Email</p>
                                        <p className="text-white font-medium truncate">{profileData.email || "Not set"}</p>
                                    </div>
                                </div>
                            </div>
                            {profileData.phone && (
                                <div className="flex items-center p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                                    <Phone className="text-gray-400 mr-3 flex-shrink-0" size={18} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-400 truncate">Phone</p>
                                        <p className="text-white font-medium truncate">{profileData.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Change Password Section */}
                <div className="bg-gray-800 bg-opacity-30 rounded-xl p-4 md:p-5 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-white">Change Password</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Update your password to keep your account secure
                            </p>
                        </div>
                        <button
                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                                isChangingPassword 
                                    ? 'bg-gray-700 text-gray-300' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {isChangingPassword ? "Cancel" : "Change Password"}
                        </button>
                    </div>

                    {isChangingPassword && (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Current Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordStrength && (
                                        <div className="mt-2">
                                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-300 ${getPasswordStrengthBar(passwordStrength)}`}
                                                ></div>
                                            </div>
                                            <p className={`text-xs mt-1 ml-1 ${getPasswordStrengthColor(passwordStrength)}`}>
                                                Password strength: <span className="font-medium">{passwordStrength}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm New Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordData.newPassword && passwordData.confirmPassword && (
                                        <p className={`text-xs mt-2 ml-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                                            {passwordData.newPassword === passwordData.confirmPassword ? 
                                                "✓ Passwords match" : 
                                                "✗ Passwords don't match"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Message Display */}
                            {message.text && (
                                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900 bg-opacity-30 border border-green-800' : 'bg-red-900 bg-opacity-30 border border-red-800'}`}>
                                    <div className="flex items-center">
                                        {message.type === 'success' ? 
                                            <CheckCircle className="text-green-400 mr-2 flex-shrink-0" size={18} /> : 
                                            <XCircle className="text-red-400 mr-2 flex-shrink-0" size={18} />
                                        }
                                        <p className={`text-sm ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Password Requirements */}
                            <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="flex items-center">
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <span className="text-xs text-gray-400">At least 8 characters</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <span className="text-xs text-gray-400">Uppercase letter</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <span className="text-xs text-gray-400">Number</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <span className="text-xs text-gray-400">Special character</span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Changing Password...
                                    </>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Account Security Tips */}
                <div className="bg-blue-900 bg-opacity-20 rounded-xl p-4 md:p-5 border border-blue-800">
                    <h4 className="text-base font-medium text-white mb-3 flex items-center">
                        <Lock size={16} className="mr-2" />
                        Security Tips
                    </h4>
                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                            <span className="text-sm text-blue-300">Use a strong, unique password</span>
                        </li>
                        <li className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                            <span className="text-sm text-blue-300">Enable two-factor authentication</span>
                        </li>
                        <li className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                            <span className="text-sm text-blue-300">Regularly update your password</span>
                        </li>
                        <li className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></div>
                            <span className="text-sm text-blue-300">Never share your login credentials</span>
                        </li>
                    </ul>
                </div>
            </div>
        </SettingSection>
    );
};

export default Security;
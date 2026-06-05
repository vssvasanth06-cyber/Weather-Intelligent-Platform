import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/weatherApi";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async () => {
        if (!username || !password) {
            setError("Please enter username and password");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await api.post(
                "/auth/login",
                formData
            );

            localStorage.setItem("token", response.data.access_token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("username", response.data.username);

            const role = response.data.role.toLowerCase();
            if (role === "admin") navigate("/admin");
            else if (role === "farmer") navigate("/farmer");
            else navigate("/analyst");
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Login failed. Check credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") login();
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🌤️</div>
                    <h1 className="text-3xl font-bold text-white">
                        Weather Intelligence
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Off-Grid IoT Monitoring Platform
                    </p>
                </div>

                {/* Card */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
                    <h2 className="text-white font-semibold text-lg mb-6">Sign in</h2>

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-300 text-sm rounded-lg p-3 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-xs font-medium mb-1.5">
                                USERNAME
                            </label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKey}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-medium mb-1.5">
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKey}
                            />
                        </div>
                    </div>

                    <button
                        onClick={login}
                        disabled={loading}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="text-gray-600 text-xs text-center mt-6">
                        Roles: Admin · Farmer · Analyst
                    </p>
                </div>

                <p className="text-gray-600 text-xs text-center mt-4">
                    Weather Intelligence Platform v1.0
                </p>
            </div>
        </div>
    );
}

export default Login;

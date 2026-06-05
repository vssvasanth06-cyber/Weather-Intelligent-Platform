import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/farmer"
                    element={
                        <ProtectedRoute role="Farmer">
                            <FarmerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analyst"
                    element={
                        <ProtectedRoute role="Analyst">
                            <AnalystDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;
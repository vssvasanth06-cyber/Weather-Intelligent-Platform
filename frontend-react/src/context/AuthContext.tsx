import { createContext, useContext } from "react";

interface AuthContextType {
    token: string | null;
    role: string | null;
}

const AuthContext =
    createContext<AuthContextType>({
        token: null,
        role: null
    });

export const AuthProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    return (
        <AuthContext.Provider
            value={{
                token,
                role
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>
    useContext(AuthContext);
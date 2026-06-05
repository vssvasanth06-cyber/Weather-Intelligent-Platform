import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
    role?: string;
}

function ProtectedRoute({
    children,
    role
}: Props) {

    const token =
        localStorage.getItem("token");

    const userRole =
        localStorage.getItem("role");

    if (!token) {

        return (
            <Navigate to="/" />
        );
    }

    if (
        role &&
        userRole?.toLowerCase() !==
        role.toLowerCase()
    ) {

        return (
            <Navigate to="/" />
        );
    }

    return <>{children}</>;
}

export default ProtectedRoute;
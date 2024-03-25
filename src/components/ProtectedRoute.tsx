import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const location = useLocation();
    const { currentUser } = useAuth()

    return currentUser && allowedRoles === currentUser.role
        ? <Outlet />
        : currentUser?.uid
            ? <Navigate to="/unauthorized" state={{ from: location }} replace />
            : <Navigate to="/login" state={{ from: location }} replace />
}

export default ProtectedRoute;

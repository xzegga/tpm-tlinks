import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useStore } from "../hooks/useGlobalStore";

interface ProtectedRouteProps {
    allowedRoles?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const location = useLocation();
    const { currentUser } = useStore()

    return currentUser && allowedRoles === currentUser.role
        ? <Outlet />
        : currentUser?.uid
            ? <Navigate to="/unauthorized" state={{ from: location }} replace />
            : <Navigate to="/login" state={{ from: location }} replace />
}

export default ProtectedRoute;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from '../pages/admin/Users';
import AddProject from '../pages/shared/AddProject';
import Dashboard from '../pages/client/Dashboard';
import ProjectDetail from '../pages/shared/ProjectDetail';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';
import Registre from '../pages/Registre';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Tenants from '../pages/admin/Tenants';
import { ROLES } from '../models/users';


const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Layout />}>
                    <Route path="" element={<Login />}></Route>
                    <Route path="login" element={<Login />}></Route>
                    <Route path="register" element={<Registre />}></Route>
                    <Route path="unauthorized" element={<Unauthorized />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="/" element={<ProtectedRoute allowedRoles={ROLES.Client} />} >
                        <Route path="client" element={<Dashboard />} />
                        <Route path="client/project/:projectId" element={<ProjectDetail />} />
                        <Route path="client/projects/add" element={<AddProject />} />
                    </Route>
                    <Route path="/" element={<ProtectedRoute allowedRoles={ROLES.Admin} />} >
                        <Route path="admin" element={<Dashboard />} />
                        <Route path="admin/users" element={<Users />} />
                        <Route path="admin/clients" element={<Tenants />} />
                        <Route path="admin/project/:projectId" element={<ProjectDetail />} />
                        <Route path="admin/projects/add" element={<AddProject />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter >
    );
};

export default AppRouter;

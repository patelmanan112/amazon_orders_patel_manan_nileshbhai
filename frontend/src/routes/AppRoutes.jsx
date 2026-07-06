import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import PublicRoute from './guards/PublicRoute';
import ProtectedRoute from './guards/ProtectedRoute';
import AdminRoute from './guards/AdminRoute';

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const DashboardOverview = lazy(() => import('../pages/DashboardOverview'));
const Profile = lazy(() => import('../pages/Profile'));
const OrdersList = lazy(() => import('../pages/Orders/OrdersList'));
const UsersList = lazy(() => import('../pages/Users/UsersList'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const TrendingPage = lazy(() => import('../pages/TrendingPage'));
const ShipmentsPage = lazy(() => import('../pages/ShipmentsPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-indigo-600">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<div>Settings Component Placeholder</div>} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="trending" element={<TrendingPage />} />
          <Route path="shipments" element={<ShipmentsPage />} />
          
          <Route path="users" element={<AdminRoute><UsersList /></AdminRoute>} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Wallets from '@/pages/Wallets';
import Categories from '@/pages/Categories';
import Transactions from '@/pages/Transactions';
import Budgets from '@/pages/Budgets';
import SavingGoals from '@/pages/SavingGoals';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Auth) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/savings" element={<SavingGoals />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
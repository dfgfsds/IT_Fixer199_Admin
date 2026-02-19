import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Agents from './pages/Agents';
import Attendance from './pages/Attendance';
import Tickets from './pages/Tickets';
import Refunds from './pages/Refunds';
import Coupons from './pages/Coupons';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import ZonalManager from './pages/ZonalManager';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users/Users';
import Slots from './pages/Slots/Slots';
import Hubs from './pages/Hubs/Hubs';
import Categories from './pages/Categories/Categories';
import Brands from './pages/Brands/Brands';
import Attribute from './pages/Attribute/Attribute';
import Products from './pages/Products/Products';
import Services from './pages/Services/Services';
import Agents360 from './components/Agent/Agent360';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  console.log(user)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="agents" element={<Agents />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="payments" element={<Payments />} />
        <Route path="zones" element={<ZonalManager />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path='users' element={<Users />} />
        <Route path='slots' element={<Slots />} />
        <Route path='hubs' element={<Hubs />} />
        <Route path='categories' element={<Categories />} />
        <Route path='brands' element={<Brands />} />
        <Route path='attribute' element={<Attribute />} />
        <Route path='products' element={<Products />} />
        <Route path='services' element={<Services />} />
        <Route path='agents/:id' element={<Agents360 />} />


      </Route>
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
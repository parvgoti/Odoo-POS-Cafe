import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProductsPage from './features/products/ProductsPage';
import PaymentMethodsPage from './features/payment-methods/PaymentMethodsPage';
import FloorPlanPage from './features/floor-plans/FloorPlanPage';
import SessionPage from './features/sessions/SessionPage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import SelfOrderingPage from './features/self-ordering/SelfOrderingPage';
import SelfOrderingMenu from './features/self-ordering/SelfOrderingMenu';
import OrdersPage from './features/orders/OrdersPage';
import PosLayout from './features/pos/PosLayout';
import FloorView from './features/pos/FloorView';
import OrderScreen from './features/pos/OrderScreen';
import PaymentScreen from './features/pos/PaymentScreen';
import KitchenDisplay from './features/kitchen/KitchenDisplay';
import CustomerDisplay from './features/customer-display/CustomerDisplay';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Dashboard / Backend Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/floor-plans" element={<FloorPlanPage />} />
            <Route path="/sessions" element={<SessionPage />} />
            <Route path="/self-ordering" element={<SelfOrderingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* POS Terminal Routes (Full screen, dark) */}
          <Route path="/pos" element={<PosLayout />}>
            <Route index element={<Navigate to="tables" replace />} />
            <Route path="tables" element={<FloorView />} />
            <Route path="order/:tableId" element={<OrderScreen />} />
            <Route path="payment/:orderId" element={<PaymentScreen />} />
          </Route>

          {/* Self-Ordering Customer Menu (standalone, no auth) */}
          <Route path="/self-order/menu" element={<SelfOrderingMenu />} />

          {/* Standalone Full-Screen Displays */}
          <Route path="/kitchen" element={<KitchenDisplay />} />
          <Route path="/customer-display" element={<CustomerDisplay />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

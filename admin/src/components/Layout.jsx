import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}

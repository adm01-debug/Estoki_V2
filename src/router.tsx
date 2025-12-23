import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/products/ProductsPage';
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <DashboardPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/products', element: <ProductsPage /> },
]);
export default router;

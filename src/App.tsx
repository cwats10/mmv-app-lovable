import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import VaultDetail from '@/pages/VaultDetail';
import BookDetail from '@/pages/BookDetail';
import Contribute from '@/pages/Contribute';
import Manage from '@/pages/Manage';
import Checkout from '@/pages/Checkout';
import Referral from '@/pages/Referral';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/contribute/:token" element={<Contribute />} />
        <Route path="/manage/:token" element={<Manage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/vault/:id" element={<VaultDetail />} />
        <Route path="/dashboard/vault/:id/book/:bookId" element={<BookDetail />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

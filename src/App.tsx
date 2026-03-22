import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Landing = lazy(() => import('@/pages/Landing'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const VaultDetail = lazy(() => import('@/pages/VaultDetail'));
const BookDetail = lazy(() => import('@/pages/BookDetail'));
const Contribute = lazy(() => import('@/pages/Contribute'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Referral = lazy(() => import('@/pages/Referral'));
const Admin = lazy(() => import('@/pages/Admin'));
const Manage = lazy(() => import('@/pages/Manage'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Terms = lazy(() => import('@/pages/Terms'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-bg">
      <p className="font-inter text-sm text-muted-text">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vault/:id" element={<VaultDetail />} />
          <Route path="/vault/:id/book/:bookId" element={<BookDetail />} />
          <Route path="/contribute/:token" element={<Contribute />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/manage/:token" element={<Manage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

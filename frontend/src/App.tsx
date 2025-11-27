/**
 * Main App Component
 * Root component with routing and code splitting
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ToastProvider } from './hooks/useToast';
import { NotificationToast } from './components/notifications/NotificationToast';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import './i18n/config'; // Initialize i18next

// Eager-loaded components (critical for initial render)
import Login from './pages/auth/Login';
import VerifyOTP from './pages/auth/VerifyOTP';
import CompleteRegistration from './pages/auth/CompleteRegistration';
import { BuyerHome } from './pages/BuyerHome';

// Lazy-loaded components (code splitting)
// Buyer pages
const FenceTemplate = lazy(() => import('./pages/FenceTemplate').then(m => ({ default: m.FenceTemplate })));
const SlabTemplate = lazy(() => import('./pages/SlabTemplate').then(m => ({ default: m.SlabTemplate })));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectForm = lazy(() => import('./pages/ProjectForm'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const RFQs = lazy(() => import('./pages/RFQs').then(m => ({ default: m.RFQs })));
const CreateRFQ = lazy(() => import('./pages/CreateRFQ').then(m => ({ default: m.CreateRFQ })));
const RFQDetail = lazy(() => import('./pages/RFQDetail').then(m => ({ default: m.RFQDetail })));
const OfferComparison = lazy(() => import('./pages/OfferComparison'));
const DirectOrder = lazy(() => import('./pages/DirectOrder').then(m => ({ default: m.DirectOrder })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const Catalog = lazy(() => import('./pages/Catalog').then(m => ({ default: m.Catalog })));
const SKUDetail = lazy(() => import('./pages/SKUDetail').then(m => ({ default: m.SKUDetail })));
const Factories = lazy(() => import('./pages/Factories').then(m => ({ default: m.Factories })));
const FactoryProfile = lazy(() => import('./pages/FactoryProfile').then(m => ({ default: m.FactoryProfile })));
const Rentals = lazy(() => import('./pages/Rentals'));
const RentalToolDetail = lazy(() => import('./pages/RentalToolDetail').then(m => ({ default: m.RentalToolDetail })));
const BookRentalTool = lazy(() => import('./pages/BookRentalTool'));
const RentalBookingDetail = lazy(() => import('./pages/RentalBookingDetail'));
const CreateRentalRFQ = lazy(() => import('./pages/CreateRentalRFQ'));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const FAQs = lazy(() => import('./pages/FAQs').then(m => ({ default: m.FAQs })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const NotificationList = lazy(() => import('./pages/NotificationList'));
const NotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));

// Supplier pages
const SupplierOnboarding = lazy(() => import('./pages/SupplierOnboarding').then(m => ({ default: m.SupplierOnboarding })));
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard').then(m => ({ default: m.SupplierDashboard })));
const SupplierRFQInbox = lazy(() => import('./pages/SupplierRFQInbox').then(m => ({ default: m.SupplierRFQInbox })));
const SupplierRFQDetail = lazy(() => import('./pages/SupplierRFQDetail').then(m => ({ default: m.SupplierRFQDetail })));
const SupplierDirectOrdersInbox = lazy(() => import('./pages/SupplierDirectOrdersInbox').then(m => ({ default: m.SupplierDirectOrdersInbox })));
const SupplierDirectOrderDetail = lazy(() => import('./pages/SupplierDirectOrderDetail').then(m => ({ default: m.SupplierDirectOrderDetail })));
const SupplierCatalog = lazy(() => import('./pages/SupplierCatalog'));
const SupplierPerformance = lazy(() => import('./pages/SupplierPerformance'));
const SupplierBilling = lazy(() => import('./pages/SupplierBilling').then(m => ({ default: m.SupplierBilling })));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const RFQQueue = lazy(() => import('./pages/admin/RFQQueue').then(m => ({ default: m.RFQQueue })));
const DeliveryQueue = lazy(() => import('./pages/admin/DeliveryQueue').then(m => ({ default: m.DeliveryQueue })));
const SupplierQueue = lazy(() => import('./pages/admin/SupplierQueue').then(m => ({ default: m.SupplierQueue })));
const DisputeQueue = lazy(() => import('./pages/admin/DisputeQueue').then(m => ({ default: m.DisputeQueue })));
const ConfirmationQueue = lazy(() => import('./pages/admin/ConfirmationQueue').then(m => ({ default: m.ConfirmationQueue })));
const RentalQueue = lazy(() => import('./pages/admin/RentalQueue').then(m => ({ default: m.RentalQueue })));
const TemplateList = lazy(() => import('./pages/admin/TemplateList').then(m => ({ default: m.TemplateList })));
const TemplateEditor = lazy(() => import('./pages/admin/TemplateEditor').then(m => ({ default: m.TemplateEditor })));
const Exports = lazy(() => import('./pages/admin/Exports').then(m => ({ default: m.Exports })));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs').then(m => ({ default: m.AuditLogs })));

// Loading fallback component
const PageLoader = () => <LoadingSpinner size="lg" message="Loading..." fullScreen />;

// Root redirect component
function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null; // Let AuthProvider handle loading state
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type
  if (user?.user_type === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.user_type === 'supplier') {
    return <Navigate to="/supplier/dashboard" replace />;
  }

  return <Navigate to="/home" replace />;
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <ToastProvider>
        <NotificationToast />
        <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth routes (no layout, no protection) */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/complete-registration" element={<CompleteRegistration />} />

          {/* Supplier onboarding (protected, no layout) */}
          <Route path="/supplier/onboard" element={<ProtectedRoute><SupplierOnboarding /></ProtectedRoute>} />

          {/* Admin dashboard and queues (protected, with layout) */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rfqs" element={<RFQQueue />} />
            <Route path="/admin/deliveries" element={<DeliveryQueue />} />
            <Route path="/admin/suppliers" element={<SupplierQueue />} />
            <Route path="/admin/disputes" element={<DisputeQueue />} />
            <Route path="/admin/confirmations" element={<ConfirmationQueue />} />
            <Route path="/admin/rentals" element={<RentalQueue />} />
            <Route path="/admin/templates" element={<TemplateList />} />
            <Route path="/admin/templates/new" element={<TemplateEditor />} />
            <Route path="/admin/templates/:slug/edit" element={<TemplateEditor />} />
            <Route path="/admin/exports" element={<Exports />} />
            <Route path="/admin/audit" element={<AuditLogs />} />
          </Route>

          {/* Supplier dashboard and RFQ routes (protected, with layout) */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/rfqs" element={<SupplierRFQInbox />} />
            <Route path="/supplier/rfqs/:rfqId" element={<SupplierRFQDetail />} />
            <Route path="/supplier/orders" element={<SupplierDirectOrdersInbox />} />
            <Route path="/supplier/orders/:orderId" element={<SupplierDirectOrderDetail />} />
            <Route path="/supplier/catalog" element={<SupplierCatalog />} />
            <Route path="/supplier/performance" element={<SupplierPerformance />} />
            <Route path="/supplier/billing" element={<SupplierBilling />} />
          </Route>

          {/* Redirect root based on auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected routes with app layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/home" element={<BuyerHome />} />
            <Route path="/template/fence" element={<FenceTemplate />} />
            <Route path="/template/slab" element={<SlabTemplate />} />

            {/* Projects routes */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />

            {/* RFQ routes */}
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/rfqs/create" element={<CreateRFQ />} />
            <Route path="/rfqs/:id" element={<RFQDetail />} />
            <Route path="/rfqs/:id/offers" element={<OfferComparison />} />

            {/* Direct Order routes */}
            <Route path="/orders/direct" element={<DirectOrder />} />
            <Route path="/orders/direct/:supplierId" element={<DirectOrder />} />

            {/* Orders routes */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />

            {/* Catalog & Factory routes */}
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:id" element={<SKUDetail />} />
            <Route path="/factories" element={<Factories />} />
            <Route path="/factories/:supplierId" element={<FactoryProfile />} />

            {/* Rentals routes */}
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/rentals/tools/:id" element={<RentalToolDetail />} />
            <Route path="/rentals/rfq" element={<CreateRentalRFQ />} />
            <Route path="/rentals/book/:toolId" element={<BookRentalTool />} />
            <Route path="/rentals/:bookingId" element={<RentalBookingDetail />} />

            {/* Profile route */}
            <Route path="/profile" element={<Profile />} />

            {/* Legal pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contact" element={<Contact />} />

            {/* Coming soon routes */}
            <Route path="/settings" element={<div style={{ padding: '2rem' }}>Settings Page (Coming Soon)</div>} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationList />} />
            <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
              <p>Page not found</p>
              <a href="/home" style={{ color: '#4CAF50', textDecoration: 'underline' }}>Go to Home</a>
            </div>
          } />
        </Routes>
        </Suspense>
        </BrowserRouter>
        </ToastProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;

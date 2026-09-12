import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import { Navigate } from "react-router-dom";

const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const KVKK = lazy(() => import("./pages/KVKK"));
const Login = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./components/layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Appointments = lazy(() => import("./pages/admin/Appointments"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const MediaManagement = lazy(() => import("./pages/admin/MediaManagement"));
const FAQManagement = lazy(() => import("./pages/admin/FAQManagement"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
    Yükleniyor...
  </div>
);

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hizmet/:slug" element={<ServiceDetail />} />
              <Route path="/gizlilik" element={<PrivacyPolicy />} />
              <Route path="/kvkk" element={<KVKK />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="messages" element={<Messages />} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="media" element={<MediaManagement />} />
                <Route path="faq" element={<FAQManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;

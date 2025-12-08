import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import KVKK from "./pages/KVKK";
import Login from "./pages/admin/Login";
import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Appointments from "./pages/admin/Appointments";
import Settings from "./pages/admin/Settings";
import Messages from "./pages/admin/Messages";
import ContentManagement from "./pages/admin/ContentManagement";
import MediaManagement from "./pages/admin/MediaManagement";
import FAQManagement from "./pages/admin/FAQManagement";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

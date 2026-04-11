import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import Index from "./pages/Index";
import IsletmelerPage from "./pages/IsletmelerPage";
import IsletmeDetailPage from "./pages/IsletmeDetailPage";
import GirisPage from "./pages/GirisPage";
import KayitPage from "./pages/KayitPage";
import HakkimizdaPage from "./pages/HakkimizdaPage";
import IletisimPage from "./pages/IletisimPage";
import SSSPage from "./pages/SSSPage";
import IsletmeBasvuruPage from "./pages/IsletmeBasvuruPage";
import BusinessDashboard from "./pages/BusinessDashboard";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import ProfilPage from "./pages/ProfilPage";
import AdminPage from "./pages/AdminPage";
import ForBusinessesPage from "./pages/ForBusinessesPage";
import HqDashboard from "./pages/HqDashboard";
import HqLoginPage from "./pages/HqLoginPage";
import NotFound from "./pages/NotFound";
import KarsilastirmaPage from "./pages/KarsilastirmaPage";
import HaritaPage from "./pages/HaritaPage";
import { TrafficTracker } from "./components/TrafficTracker";
import { QuickBookWidget } from "./components/QuickBookWidget";
import { ChatbotWidget } from "./components/ChatbotWidget";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TrafficTracker />
            <QuickBookWidget />
            <ChatbotWidget />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/isletmeler" element={<IsletmelerPage />} />
              <Route path="/isletme/:slug" element={<IsletmeDetailPage />} />
              <Route path="/giris" element={<GirisPage />} />
              <Route path="/register" element={<KayitPage />} />
              <Route path="/kayit" element={<KayitPage />} />
              <Route path="/hakkimizda" element={<HakkimizdaPage />} />
              <Route path="/iletisim" element={<IletisimPage />} />
              <Route path="/sss" element={<SSSPage />} />
              <Route path="/isletme-basvuru" element={<IsletmeBasvuruPage />} />
              <Route path="/isletmeler-icin" element={<ForBusinessesPage />} />
              <Route path="/hq/login" element={<HqLoginPage />} />
              <Route path="/karsilastir" element={<KarsilastirmaPage />} />
              <Route path="/harita" element={<HaritaPage />} />

              {/* Protected routes - requires login */}
              <Route path="/profil" element={
                <ProtectedRoute>
                  <ProfilPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <BusinessDashboard />
                </ProtectedRoute>
              } />
              <Route path="/personel-paneli" element={
                <ProtectedRoute>
                  <StaffDashboardPage />
                </ProtectedRoute>
              } />

              {/* Admin routes - requires admin email */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } />
              <Route path="/hq" element={
                <AdminRoute>
                  <HqDashboard />
                </AdminRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

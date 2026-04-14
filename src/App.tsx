import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute, AdminRoute, BusinessRoute } from "@/components/ProtectedRoute";
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
import GoogleOAuthCallback from "./pages/GoogleOAuthCallback";
import NotFound from "./pages/NotFound";
import KarsilastirmaPage from "./pages/KarsilastirmaPage";
import HaritaPage from "./pages/HaritaPage";
import { TrafficTracker } from "./components/TrafficTracker";
import { QuickBookWidget } from "./components/QuickBookWidget";
import { MobileNav } from "./components/layout/MobileNav";
import KvkkPage from "./pages/KvkkPage";
import KullanimKosullari from "./pages/KullanimKosullari";
import GizlilikPolitikasi from "./pages/GizlilikPolitikasi";
import CerezPolitikasi from "./pages/CerezPolitikasi";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
          <Sonner position="top-right" expand={true} richColors />
          <BrowserRouter>
            <TrafficTracker />
            <QuickBookWidget />
            <MobileNav />
            <div className="pb-20 md:pb-0">
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
                <Route path="/hq-gate-auth-v2-j5l1z8y9w" element={<HqLoginPage />} />
                <Route path="/karsilastir" element={<KarsilastirmaPage />} />
                <Route path="/harita" element={<HaritaPage />} />
                <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
                <Route path="/kvkk" element={<KvkkPage />} />
                <Route path="/kullanim-kosullari" element={<KullanimKosullari />} />
                <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
                <Route path="/cerez-politikasi" element={<CerezPolitikasi />} />

                {/* Protected routes - requires login */}
                <Route path="/profil" element={
                  <ProtectedRoute>
                    <ProfilPage />
                  </ProtectedRoute>
                } />
                <Route path="/biz-dashboard-secure-x31p9q8w2" element={
                  <BusinessRoute>
                    <BusinessDashboard />
                  </BusinessRoute>
                } />
                <Route path="/personel-paneli" element={
                  <ProtectedRoute>
                    <StaffDashboardPage />
                  </ProtectedRoute>
                } />

                {/* Admin routes - requires admin email */}
                <Route path="/admin-secure-panel-v5-x89j2k1m4n5" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                <Route path="/hq-intelligence-vault-v8-m2n5b4v1" element={
                  <AdminRoute>
                    <HqDashboard />
                  </AdminRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
          </TooltipProvider>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

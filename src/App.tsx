import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
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
import { TrafficTracker } from "./components/TrafficTracker";
import { QuickBookWidget } from "./components/QuickBookWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TrafficTracker />
          <QuickBookWidget />
          <Routes>
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
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/personel-paneli" element={<StaffDashboardPage />} />
            <Route path="/profil" element={<ProfilPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/isletmeler-icin" element={<ForBusinessesPage />} />
            <Route path="/hq" element={<HqDashboard />} />
            <Route path="/hq/login" element={<HqLoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
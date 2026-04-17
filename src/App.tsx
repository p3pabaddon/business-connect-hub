import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
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
import { TrafficTracker } from "./components/TrafficTracker";
import { MobileNav } from "./components/layout/MobileNav";
import CookieConsent from "./components/CookieConsent";
import { PWAUpdateHandler } from "./components/PWAUpdateHandler";
import { A2HSPrompt } from "./components/A2HSPrompt";
import { PageLoader } from "./components/PageLoader";

// Lazy Pages
const Index = lazy(() => import("./pages/Index"));
const IsletmelerPage = lazy(() => import("./pages/IsletmelerPage"));
const IsletmeDetailPage = lazy(() => import("./pages/IsletmeDetailPage"));
const GirisPage = lazy(() => import("./pages/GirisPage"));
const KayitPage = lazy(() => import("./pages/KayitPage"));
const HakkimizdaPage = lazy(() => import("./pages/HakkimizdaPage"));
const IletisimPage = lazy(() => import("./pages/IletisimPage"));
const SSSPage = lazy(() => import("./pages/SSSPage"));
const IsletmeBasvuruPage = lazy(() => import("./pages/IsletmeBasvuruPage"));
const ForBusinessesPage = lazy(() => import("./pages/ForBusinessesPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const ProfilPage = lazy(() => import("./pages/ProfilPage"));
const HqDashboard = lazy(() => import("./pages/HqDashboard"));
const HqLoginPage = lazy(() => import("./pages/HqLoginPage"));
const StaffDashboardPage = lazy(() => import("./pages/StaffDashboardPage"));
const KarsilastirmaPage = lazy(() => import("./pages/KarsilastirmaPage"));
const HaritaPage = lazy(() => import("./pages/HaritaPage"));
const Discover = lazy(() => import("./pages/Discover"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const StyleAdvisor = lazy(() => import("./pages/StyleAdvisor"));
const CityGuide = lazy(() => import("./pages/CityGuide"));
const GoogleOAuthCallback = lazy(() => import("./pages/GoogleOAuthCallback"));
const KvkkPage = lazy(() => import("./pages/KvkkPage"));
const KullanimKosullari = lazy(() => import("./pages/KullanimKosullari"));
const GizlilikPolitikasi = lazy(() => import("./pages/GizlilikPolitikasi"));
const CerezPolitikasi = lazy(() => import("./pages/CerezPolitikasi"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import { SEOHead } from "@/components/SEOHead";

const AppContent = () => {
  const { pathname } = useLocation();
  
  const isDashboardRoute = 
    pathname.startsWith("/biz-dashboard") || 
    pathname.startsWith("/admin-secure") || 
    pathname.startsWith("/hq-dashboard") ||
    pathname.startsWith("/hq-intelligence") ||
    pathname.startsWith("/personel-paneli") ||
    pathname.startsWith("/profil");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead noindex={isDashboardRoute} />
      <TrafficTracker />
      {!isDashboardRoute && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/isletmeler" element={<IsletmelerPage />} />
            <Route path="/isletme/:slug" element={<IsletmeDetailPage />} />
            <Route path="/giris" element={<GirisPage />} />
            <Route path="/register" element={<KayitPage />} />
            <Route path="/kayit" element={<KayitPage />} />
            <Route path="/nasil-calisir" element={<HowItWorks />} />
            <Route path="/hakkimizda" element={<HakkimizdaPage />} />
            <Route path="/iletisim" element={<IletisimPage />} />
            <Route path="/sss" element={<SSSPage />} />
            <Route path="/isletme-basvuru" element={<IsletmeBasvuruPage />} />
            <Route path="/isletmeler-icin" element={<ForBusinessesPage />} />
            <Route path="/hq-gate-auth-v2-j5l1z8y9w" element={<HqLoginPage />} />
            <Route path="/karsilastir" element={<KarsilastirmaPage />} />
            <Route path="/harita" element={<HaritaPage />} />
            <Route path="/kesfet" element={<Discover />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/stil-danismani" element={<StyleAdvisor />} />
            <Route path="/sehir/:citySlug" element={<CityGuide />} />
            <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
            <Route path="/kvkk" element={<KvkkPage />} />
            <Route path="/kullanim-kosullari" element={<KullanimKosullari />} />
            <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
            <Route path="/cerez-politikasi" element={<CerezPolitikasi />} />

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
        </Suspense>
      </main>
      {!isDashboardRoute && <Footer />}
      <MobileNav />
      <CookieConsent />
    </div>
  );
};

import { HelmetProvider } from "react-helmet-async";

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Sonner position="top-right" expand={true} richColors duration={2500} />
              <BrowserRouter>
                <ScrollToTop />
                <PWAUpdateHandler />
                <A2HSPrompt />
                <AppContent />
              </BrowserRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;

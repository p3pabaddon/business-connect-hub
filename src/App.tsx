import { lazy, Suspense } from "react";
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
import { TrafficTracker } from "./components/TrafficTracker";
import { QuickBookWidget } from "./components/QuickBookWidget";
import { MobileNav } from "./components/layout/MobileNav";
import CookieConsent from "./components/CookieConsent";
import { PWAUpdateHandler } from "./components/PWAUpdateHandler";
import { A2HSPrompt } from "./components/A2HSPrompt";

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
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const StaffDashboardPage = lazy(() => import("./pages/StaffDashboardPage"));
const ProfilPage = lazy(() => import("./pages/ProfilPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ForBusinessesPage = lazy(() => import("./pages/ForBusinessesPage"));
const HqDashboard = lazy(() => import("./pages/HqDashboard"));
const HqLoginPage = lazy(() => import("./pages/HqLoginPage"));
const GoogleOAuthCallback = lazy(() => import("./pages/GoogleOAuthCallback"));
const KarsilastirmaPage = lazy(() => import("./pages/KarsilastirmaPage"));
const HaritaPage = lazy(() => import("./pages/HaritaPage"));
const Discover = lazy(() => import("./pages/Discover"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const StyleAdvisor = lazy(() => import("./pages/StyleAdvisor"));
const CityGuide = lazy(() => import("./pages/CityGuide"));
const KvkkPage = lazy(() => import("./pages/KvkkPage"));
const KullanimKosullari = lazy(() => import("./pages/KullanimKosullari"));
const GizlilikPolitikasi = lazy(() => import("./pages/GizlilikPolitikasi"));
const CerezPolitikasi = lazy(() => import("./pages/CerezPolitikasi"));

const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-muted-foreground animate-pulse font-medium text-sm">Sayfa Yükleniyor...</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
          <Sonner position="top-right" expand={true} richColors duration={2500} />
          <BrowserRouter>
            <PWAUpdateHandler />
            <A2HSPrompt />
            <TrafficTracker />
            <QuickBookWidget />
            <div className="min-h-screen flex flex-col">
              <ScrollToTop />
              <Header />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
              </main>
              <Footer />
              <MobileNav />
            </div>
            <CookieConsent />
          </BrowserRouter>
          </TooltipProvider>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

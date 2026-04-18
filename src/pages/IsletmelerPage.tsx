import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, CheckCircle, SlidersHorizontal, Zap, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBusinesses } from "@/hooks/useQueries";
import { turkiyeIller } from "@/lib/turkey-locations";
import { FavoriteButton } from "@/components/FavoriteButton";
import { t } from "@/lib/translations";
import { SEOHead } from "@/components/SEOHead";
import { cn, getCategoryPlaceholder, toTitleCase } from "@/lib/utils";
import { FeaturedSalonsSection } from "@/components/marketing/FeaturedSalonsSection";

const categories = [
  { value: "all", label: t("isletmeler.all_categories") },
  { value: "Berber", label: t("sectors.barber") },
  { value: "Güzellik Salonu", label: t("sectors.beauty") },
  { value: "Spa & Wellness", label: t("sectors.spa") },
  { value: "Diş Kliniği", label: t("sectors.dental") },
  { value: "Kuaför", label: t("sectors.hairdresser") },
  { value: "Veteriner", label: t("sectors.vet") },
];

const sortOptions = [
  { value: "rating", label: t("isletmeler.sort_rating") },
  { value: "review_count", label: t("isletmeler.sort_reviews") },
  { value: "name", label: t("isletmeler.sort_name") },
];

const IsletmelerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get("district") || "all");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("rating");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCity !== "all") params.set("city", selectedCity);
    if (selectedDistrict !== "all") params.set("district", selectedDistrict);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCity, selectedDistrict, selectedCategory, setSearchParams]);

  const availableDistricts = turkiyeIller.find(i => i.il === selectedCity)?.ilceler || [];

  const { data: businesses = [], isLoading: loading } = useBusinesses({
    city: selectedCity === "all" ? "" : selectedCity,
    district: selectedDistrict === "all" ? "" : selectedDistrict,
    category: selectedCategory === "all" ? "" : selectedCategory,
    search: searchQuery,
  });

  // Haversine distance calculation
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleNearMe = () => {
    if (userLocation) {
      setSortByDistance(!sortByDistance);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setLocating(false);
        toast.success("Konumunuz alındı, en yakındaki işletmeler sıralanıyor.");
      },
      (err) => {
        setLocating(false);
        toast.error("Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.");
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Client-side sort & filter
  const filteredBusinesses = businesses
    .filter((b) => !minRating || b.rating >= Number(minRating))
    .sort((a, b) => {
      // Distance sort has highest priority when active
      if (sortByDistance && userLocation) {
        const distA = a.latitude && a.longitude ? getDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) : 9999;
        const distB = b.latitude && b.longitude ? getDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude) : 9999;
        return distA - distB;
      }

      // Always prioritize featured businesses
      if (a.is_featured !== b.is_featured) {
        return b.is_featured ? 1 : -1;
      }
      
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "review_count") return (b.review_count || 0) - (a.review_count || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "", "tr");
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title={`${selectedCategory && selectedCategory !== "all" ? selectedCategory : "Berber, Kuaför ve Güzellik Salonu"} Seç & Online Randevu Al`}
        description={`Türkiye'nin en iyi ${selectedCategory !== "all" ? selectedCategory.toLowerCase() : "işletmelerini"} keşfedin. Konumunuza en yakın işletmeyi bulun, yorumları okuyun ve saniyeler içinde ücretsiz online randevu alın.`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Randevu Dünyası İşletmeler",
          "description": "Yakınınızdaki en iyi berberler, güzellik merkezleri, spa ve kuaförler. Online randevu al.",
          "keywords": "yakınımdaki berber, en iyi kuaför, yakınımdaki güzellik merkezi, online randevu al, berber randevu"
        }}
      />
      <main className="flex-1 bg-surface">
        {/* Search Header */}
        <div className="bg-background border-b border-border py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-heading text-foreground mb-6">{t("isletmeler.title")}</h1>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("hero.search")}
                  className="pl-10 h-12 rounded-xl shadow-sm border-border/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-fit">
                  <Select value={selectedCity} onValueChange={(v) => { setSelectedCity(v); setSelectedDistrict("all"); }}>
                    <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl">
                      <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                      <SelectValue placeholder={t("isletmeler.all_cities")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("isletmeler.all_cities")}</SelectItem>
                      {turkiyeIller.map((loc) => (
                        <SelectItem key={loc.il} value={loc.il}>{loc.il}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedDistrict} 
                    onValueChange={setSelectedDistrict}
                    disabled={selectedCity === "all" || !selectedCity}
                  >
                    <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl text-left">
                      <SelectValue placeholder={selectedCity !== "all" ? t("common.select_district") : t("common.select_city_first")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm İlçeler</SelectItem>
                      {availableDistricts.map((ilce) => (
                        <SelectItem key={ilce} value={ilce}>{ilce}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Link to="/harita" className="flex-1 sm:flex-none">
                    <Button variant="outline" className="w-full h-11 rounded-xl gap-2 font-semibold shadow-sm">
                      <MapPin className="w-4 h-4 text-primary" /> Harita
                    </Button>
                  </Link>
                  <Link to="/karsilastir" className="flex-1 sm:flex-none">
                    <Button variant="outline" className="w-full h-11 rounded-xl gap-2 font-semibold shadow-sm">
                      <SlidersHorizontal className="w-4 h-4 text-primary" /> Karşılaştır
                    </Button>
                  </Link>
                  <Button
                    variant={sortByDistance ? "default" : "outline"}
                    className="flex-1 sm:flex-none h-11 rounded-xl gap-2 font-semibold shadow-sm"
                    onClick={handleNearMe}
                    disabled={locating}
                  >
                    <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : sortByDistance ? "text-white" : "text-primary"}`} />
                    {locating ? "..." : sortByDistance ? "Yakın" : "Bana Yakın"}
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                        "flex-1 sm:flex-none h-11 rounded-xl font-semibold shadow-sm transition-all",
                        showFilters ? "bg-primary/5 border-primary text-primary" : ""
                    )}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    {t("isletmeler.filters")}
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-xl animate-fade-in mt-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 h-10">
                      <SelectValue placeholder={t("isletmeler.category_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 h-10">
                      <SelectValue placeholder={t("isletmeler.sort_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger className="w-full sm:w-36 h-10">
                      <SelectValue placeholder={t("isletmeler.rating_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("isletmeler.all_ratings")}</SelectItem>
                      <SelectItem value="4.5">4.5+</SelectItem>
                      <SelectItem value="4">4.0+</SelectItem>
                      <SelectItem value="3.5">3.5+</SelectItem>
                      <SelectItem value="3">3.0+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="bg-surface border-b border-border/50">
          <FeaturedSalonsSection />
        </div>

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">{filteredBusinesses.length} {t("isletmeler.found_count")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((biz) => (
                  <Link
                    key={biz.id}
                    to={`/isletme/${biz.slug}`}
                    className="group flex sm:flex-col bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative"
                  >
                    <div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3">
                      <FavoriteButton businessId={biz.id} size="sm" />
                    </div>
                    <div className="w-28 sm:w-full aspect-square sm:aspect-[16/10] bg-muted relative shrink-0">
                      <img 
                        src={biz.image_url || biz.cover_image || biz.logo || getCategoryPlaceholder(biz.category)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 shadow-inner" 
                        loading="lazy" 
                      />
                      {biz.is_featured && (
                        <div className="absolute top-2 left-2 z-10 hidden sm:block">
                           <Badge className="bg-amber-500 text-white border-none shadow-lg animate-pulse">
                              <Zap className="w-3 h-3 mr-1 fill-current" /> Öne Çıkan
                           </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h3 className="font-black text-foreground group-hover:text-primary transition-colors truncate text-sm sm:text-lg">
                            {biz.name}
                          </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 font-bold uppercase tracking-wider">{toTitleCase(biz.category)}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                            <span className="font-black text-foreground">{biz.rating || "0.0"}</span>
                            <span className="text-muted-foreground">({biz.review_count || 0})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground truncate">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{biz.district}, {biz.city}</span>
                          </div>
                        </div>

                        {biz.is_featured && (
                           <div className="sm:hidden">
                              <Badge className="bg-amber-500 text-white border-none text-[8px] h-5 py-0 px-2">
                                 <Zap className="w-2.5 h-2.5 mr-1 fill-current" /> Vitrin
                              </Badge>
                           </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {filteredBusinesses.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("isletmeler.not_found")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default IsletmelerPage;

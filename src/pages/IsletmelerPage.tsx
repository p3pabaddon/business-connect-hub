import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, CheckCircle, SlidersHorizontal, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { turkiyeIller } from "@/lib/turkey-locations";
import { getBusinesses } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";
import { t } from "@/lib/translations";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [minRating, setMinRating] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => loadBusinesses(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCity, selectedCategory]);

  const loadBusinesses = async () => {
    try {
      const data = await getBusinesses({
        city: selectedCity,
        category: selectedCategory,
        search: searchQuery,
      });
      setBusinesses(data || []);
    } catch {
      setBusinesses([]);
    }
    setLoading(false);
  };

  // Client-side sort & filter
  const filteredBusinesses = businesses
    .filter((b) => !minRating || b.rating >= Number(minRating))
    .sort((a, b) => {
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
      <Header />
      <main className="flex-1 bg-surface">
        {/* Search Header */}
        <div className="bg-background border-b border-border py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-heading text-foreground mb-6">{t("isletmeler.title")}</h1>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t("hero.search")}
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full sm:w-48 h-11">
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
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t("isletmeler.filters")}
                </Button>
              </div>

              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-xl animate-fade-in">
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
                    className="group bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative"
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <FavoriteButton businessId={biz.id} />
                    </div>
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                      {biz.image_url && (
                        <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                          {biz.name}
                        </h3>
                        {biz.is_featured && (
                          <Badge className="bg-amber-500 text-white border-none shadow-lg animate-pulse">
                            <Zap className="w-3 h-3 mr-1 fill-current" /> Öne Çıkan
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{biz.category}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="font-medium text-foreground">{biz.rating}</span>
                          <span className="text-muted-foreground">({biz.review_count})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{biz.district}, {biz.city}</span>
                        </div>
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
      <Footer />
    </div>
  );
};

export default IsletmelerPage;

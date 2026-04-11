import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, X, Plus, ArrowLeftRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBusinesses } from "@/hooks/useQueries";
import { Link } from "react-router-dom";

const KarsilastirmaPage = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { data: businesses = [], isLoading } = useBusinesses({});

  const selectedBusinesses = businesses.filter((b: any) => selectedIds.includes(b.id));
  const searchResults = businesses.filter((b: any) =>
    !selectedIds.includes(b.id) &&
    (b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     b.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 6);

  const addBusiness = (id: string) => {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const removeBusiness = (id: string) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const getMinPrice = (biz: any) => {
    // We don't have services loaded in list, show price_range
    return biz.price_range || "—";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="İşletme Karşılaştır" description="İşletmeleri yan yana karşılaştırın. Fiyat, puan ve hizmetleri kolayca kıyaslayın." />
      <Header />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <ArrowLeftRight className="w-7 h-7 text-accent" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading text-foreground">İşletme Karşılaştır</h1>
              <p className="text-sm text-muted-foreground">En fazla 3 işletmeyi yan yana karşılaştırın</p>
            </div>
          </div>

          {/* Selected slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((slot) => {
              const biz = selectedBusinesses[slot];
              return (
                <div key={slot} className="relative">
                  {biz ? (
                    <div className="bg-card border border-border rounded-xl p-4 h-full">
                      <button
                        onClick={() => removeBusiness(biz.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                        aria-label={`${biz.name} kaldır`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-full h-28 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 overflow-hidden">
                        {biz.image_url && <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <h3 className="font-semibold text-foreground text-sm truncate">{biz.name}</h3>
                      <p className="text-xs text-muted-foreground">{biz.category}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="w-full h-full min-h-[180px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-sm font-medium">İşletme Ekle</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Search modal */}
          {showSearch && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="İşletme ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button variant="ghost" size="sm" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>İptal</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((biz: any) => (
                  <button
                    key={biz.id}
                    onClick={() => addBusiness(biz.id)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex-shrink-0 overflow-hidden">
                      {biz.image_url && <img src={biz.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{biz.name}</p>
                      <p className="text-xs text-muted-foreground">{biz.category} · {biz.city}</p>
                    </div>
                    <Star className="w-3.5 h-3.5 text-warning fill-warning flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground">{biz.rating}</span>
                  </button>
                ))}
                {searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-4">Sonuç bulunamadı</p>
                )}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {selectedBusinesses.length >= 2 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-4 text-left text-muted-foreground font-medium w-40">Özellik</th>
                      {selectedBusinesses.map((biz: any) => (
                        <th key={biz.id} className="p-4 text-center font-semibold text-foreground">{biz.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-4 text-muted-foreground font-medium">Puan</td>
                      {selectedBusinesses.map((biz: any) => (
                        <td key={biz.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-warning fill-warning" />
                            <span className="font-semibold text-foreground">{biz.rating}</span>
                            <span className="text-muted-foreground">({biz.review_count})</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-4 text-muted-foreground font-medium">Kategori</td>
                      {selectedBusinesses.map((biz: any) => (
                        <td key={biz.id} className="p-4 text-center">
                          <Badge variant="secondary">{biz.category}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-4 text-muted-foreground font-medium">Konum</td>
                      {selectedBusinesses.map((biz: any) => (
                        <td key={biz.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{biz.district}, {biz.city}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-4 text-muted-foreground font-medium">Fiyat Aralığı</td>
                      {selectedBusinesses.map((biz: any) => (
                        <td key={biz.id} className="p-4 text-center font-medium text-foreground">
                          {getMinPrice(biz)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-4 text-muted-foreground font-medium">Doğrulanmış</td>
                      {selectedBusinesses.map((biz: any) => (
                        <td key={biz.id} className="p-4 text-center">
                          {biz.is_verified ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">✓ Onaylı</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground font-medium">Premium</td>
                      {selectedBusinesses.map((biz: any) => (
                        <td key={biz.id} className="p-4 text-center">
                          {biz.is_premium ? (
                            <Badge className="bg-accent/10 text-accent border-accent/20">Premium</Badge>
                          ) : (
                            <span className="text-muted-foreground">Ücretsiz</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="border-t border-border p-4 flex gap-3 justify-center">
                {selectedBusinesses.map((biz: any) => (
                  <Link key={biz.id} to={`/isletme/${biz.slug}`}>
                    <Button size="sm" variant="outline">
                      {biz.name} — Randevu Al
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {selectedBusinesses.length < 2 && (
            <div className="text-center py-16">
              <ArrowLeftRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Karşılaştırmak için en az 2 işletme seçin</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KarsilastirmaPage;

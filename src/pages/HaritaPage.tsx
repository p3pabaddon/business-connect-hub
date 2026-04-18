import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, List, Map as MapIcon } from "lucide-react";
import { useBusinesses } from "@/hooks/useQueries";
import { Link } from "react-router-dom";
import { getCategoryPlaceholder } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";

// Lazy load map to avoid SSR issues
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// City coordinates for Turkey
const CITY_COORDS: Record<string, [number, number]> = {
  "İstanbul": [41.0082, 28.9784],
  "Ankara": [39.9334, 32.8597],
  "İzmir": [38.4237, 27.1428],
  "Antalya": [36.8969, 30.7133],
  "Bursa": [40.1885, 29.0610],
  "Adana": [37.0000, 35.3213],
  "Konya": [37.8746, 32.4932],
  "Gaziantep": [37.0662, 37.3833],
  "Kayseri": [38.7312, 35.4787],
  "Mersin": [36.8121, 34.6415],
  "Eskişehir": [39.7767, 30.5206],
  "Diyarbakır": [37.9144, 40.2306],
  "Samsun": [41.2867, 36.33],
  "Trabzon": [41.0027, 39.7168],
  "Muğla": [37.2153, 28.3636],
};

const TURKEY_CENTER: [number, number] = [39.0, 35.0];

const HaritaPage = () => {
  const { data: businesses = [], isLoading } = useBusinesses({});
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Add approximate coords based on city
  const businessesWithCoords = (businesses as any[]).map((biz: any) => {
    const coords = CITY_COORDS[biz.city];
    if (!coords) return null;
    // Add slight random offset to avoid stacking
    const lat = coords[0] + (Math.random() - 0.5) * 0.05;
    const lng = coords[1] + (Math.random() - 0.5) * 0.05;
    return { ...biz, lat, lng };
  }).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Harita - İşletmeler" description="Harita üzerinde işletmeleri keşfedin." />
      <main className="flex-1 bg-surface">
        <div className="bg-background border-b border-border py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapIcon className="w-6 h-6 text-accent" />
              <h1 className="text-xl font-heading text-foreground">Harita Görünümü</h1>
              <Badge variant="secondary">{businessesWithCoords.length} işletme</Badge>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "map" ? "default" : "ghost"}
                onClick={() => setViewMode("map")}
                className="gap-1.5"
              >
                <MapIcon className="w-4 h-4" /> Harita
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="gap-1.5"
              >
                <List className="w-4 h-4" /> Liste
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="w-full" style={{ height: "calc(100vh - 180px)" }}>
            <MapContainer
              center={TURKEY_CENTER}
              zoom={6}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {businessesWithCoords.map((biz: any) => (
                <Marker key={biz.id} position={[biz.lat, biz.lng]}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-sm mb-1">{biz.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{biz.category}</p>
                      <div className="flex items-center gap-1 text-xs mb-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{biz.rating}</span>
                        <span className="text-gray-400">({biz.review_count})</span>
                        <span className="text-gray-400 ml-1">· {biz.district}, {biz.city}</span>
                      </div>
                      <Link to={`/isletme/${biz.slug}`} className="text-xs text-blue-600 hover:underline font-medium">
                        Detay & Randevu →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessesWithCoords.map((biz: any) => (
                <Link
                  key={biz.id}
                  to={`/isletme/${biz.slug}`}
                  className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      src={biz.image_url || biz.cover_image || biz.logo || getCategoryPlaceholder(biz.category || "")} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{biz.name}</h3>
                    <p className="text-xs text-muted-foreground">{biz.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-xs font-medium">{biz.rating}</span>
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{biz.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HaritaPage;

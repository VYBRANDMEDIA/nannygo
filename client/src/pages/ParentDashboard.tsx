import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calendar, List, LogOut, Map as MapIcon, MapPin, Star, User, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MapView } from "@/components/Map";

export default function ParentDashboard() {
  const { signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [cityFilter, setCityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [selectedNanny, setSelectedNanny] = useState<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const { data: profile } = trpc.profile.me.useQuery();
  const { data: nannies, isLoading } = trpc.nanny.list.useQuery({
    city: cityFilter || undefined,
  });

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  // Add markers when nannies data changes
  useEffect(() => {
    if (!map || !nannies || nannies.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    const bounds = new google.maps.LatLngBounds();
    
    nannies.forEach((item, index) => {
      // Generate random coordinates around Amsterdam for demo
      // In production, use real coordinates from profile.address
      const lat = 52.3676 + (Math.random() - 0.5) * 0.1;
      const lng = 4.9041 + (Math.random() - 0.5) * 0.1;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: item.profile.fullName,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: index % 2 === 0 ? "#20B2AA" : "#E91E8C",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      marker.addListener("click", () => {
        setSelectedNanny(item.profile.id);
        map.panTo({ lat, lng });
      });

      markersRef.current.push(marker);
      bounds.extend({ lat, lng });
    });

    map.fitBounds(bounds);
  }, [map, nannies]);

  const selectedNannyData = nannies?.find(n => n.profile.id === selectedNanny);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm relative z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="NannyGo" className="h-10" />
            <nav className="hidden md:flex gap-2">
              <Button 
                variant="ghost" 
                className="text-gray-700"
                onClick={() => setLocation("/app/parent")}
              >
                Nannies zoeken
              </Button>
              <Button 
                variant="ghost"
                className="text-gray-700"
                onClick={() => setLocation("/app/parent/bookings")}
              >
                Mijn boekingen
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700"
              onClick={() => setLocation("/app/parent/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar - Fixed at top */}
      <div className="bg-white border-b shadow-sm relative z-40">
        <div className="container py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek op stad..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="icon"
              className={`h-12 w-12 ${viewMode === "map" ? "bg-[#20B2AA] hover:bg-[#1a8f89]" : ""}`}
              onClick={() => setViewMode("map")}
            >
              <MapIcon className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className={`h-12 w-12 ${viewMode === "list" ? "bg-[#20B2AA] hover:bg-[#1a8f89]" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "map" ? (
        <div className="relative h-[calc(100vh-140px)]">
          {/* Map */}
          <MapView
            onMapReady={handleMapReady}
            className="w-full h-full"
            initialCenter={{ lat: 52.3676, lng: 4.9041 }}
            initialZoom={12}
          />

          {/* Swipeable Card at Bottom */}
          {selectedNannyData && (
            <div className="absolute bottom-0 left-0 right-0 z-30 animate-in slide-in-from-bottom duration-300">
              <div className="container pb-6">
                <Card className="shadow-2xl border-2">
                  <CardHeader className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => setSelectedNanny(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-start gap-4 pr-8">
                      <div className="w-20 h-20 rounded-full bg-[#20B2AA]/10 flex items-center justify-center text-3xl font-bold text-[#20B2AA] flex-shrink-0">
                        {selectedNannyData.profile.fullName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-1">
                          {selectedNannyData.profile.fullName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-base">
                          <MapPin className="h-4 w-4" />
                          {selectedNannyData.profile.city || "Locatie niet opgegeven"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Uurtarief</p>
                        <p className="text-lg font-bold text-[#20B2AA]">
                          {selectedNannyData.nannyProfile.hourlyRate
                            ? `€${(selectedNannyData.nannyProfile.hourlyRate / 100).toFixed(2)}`
                            : "Op aanvraag"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Ervaring</p>
                        <p className="text-lg font-bold">
                          {selectedNannyData.nannyProfile.yearsExperience || 0} jaar
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Rating</p>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <p className="text-lg font-bold">
                            {selectedNannyData.profile.averageRating
                              ? (selectedNannyData.profile.averageRating / 100).toFixed(1)
                              : "Nieuw"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base bg-[#E91E8C] hover:bg-[#d11a7d]"
                      onClick={() => setLocation(`/app/parent/nanny/${selectedNannyData.profile.id}`)}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Bekijk profiel & Boek
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#20B2AA] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Nannies laden...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <main className="container py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#20B2AA] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Nannies laden...</p>
            </div>
          ) : !nannies || nannies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Geen nannies gevonden{cityFilter ? ` in ${cityFilter}` : ""}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nannies.map((item) => {
                const { profile, nannyProfile } = item;
                const tags = nannyProfile.tags
                  ? JSON.parse(nannyProfile.tags)
                  : [];
                const hourlyRate = nannyProfile.hourlyRate
                  ? `€${(nannyProfile.hourlyRate / 100).toFixed(2)}`
                  : "Prijs op aanvraag";
                const rating = profile.averageRating
                  ? (profile.averageRating / 100).toFixed(1)
                  : "Nieuw";

                return (
                  <Card
                    key={profile.id}
                    className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#20B2AA]"
                    onClick={() => setLocation(`/app/parent/nanny/${profile.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#20B2AA]/10 flex items-center justify-center text-2xl font-bold text-[#20B2AA]">
                          {profile.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{profile.fullName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {profile.city || "Locatie niet opgegeven"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Uurtarief</span>
                          <span className="font-semibold text-[#20B2AA]">{hourlyRate}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Ervaring</span>
                          <span className="font-semibold">
                            {nannyProfile.yearsExperience || 0} jaar
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {rating}
                              {(profile.reviewCount || 0) > 0 && (
                                <span className="text-gray-500 ml-1">
                                  ({profile.reviewCount})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-[#E91E8C]/10 text-[#E91E8C] text-xs rounded-full font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <Button className="w-full mt-4 bg-[#20B2AA] hover:bg-[#1a8f89]">
                          <Calendar className="h-4 w-4 mr-2" />
                          Bekijk profiel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

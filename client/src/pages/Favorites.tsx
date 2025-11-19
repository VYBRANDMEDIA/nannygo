import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Heart, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface FavoriteNanny {
  id: string;
  full_name: string;
  city: string;
  avatar_url: string | null;
  hourly_rate: number;
  years_experience: number;
  rating_average: number;
  rating_count: number;
}

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteNanny[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLocation('/login');
      } else {
        loadFavorites();
      }
    }
  }, [user, authLoading]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data: favData } = await supabase
        .from('favorites')
        .select('nanny_id')
        .eq('user_id', user.id);

      if (!favData || favData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const nannyIds = favData.map(f => f.nanny_id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', nannyIds);

      const { data: nannyProfilesData } = await supabase
        .from('nanny_profiles')
        .select('*')
        .in('profile_id', nannyIds);

      if (profilesData && nannyProfilesData) {
        const nannies: FavoriteNanny[] = profilesData.map(profile => {
          const nannyProfile = nannyProfilesData.find(np => np.profile_id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name || '',
            city: profile.city || '',
            avatar_url: profile.avatar_url,
            hourly_rate: nannyProfile?.hourly_rate || 0,
            years_experience: nannyProfile?.years_experience || 0,
            rating_average: profile.average_rating ? profile.average_rating / 100 : 0,
            rating_count: profile.review_count || 0,
          };
        });
        setFavorites(nannies);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (nannyId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('nanny_id', nannyId);

      setFavorites(favorites.filter(f => f.id !== nannyId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E8C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container flex items-center justify-between h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <img src={APP_LOGO} alt="NannyGo" className="h-10" />
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-[#E91E8C] fill-[#E91E8C]" />
          <h1 className="text-3xl font-bold text-gray-900">Mijn Favorieten</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nog geen favorieten</h2>
            <p className="text-gray-600 mb-6">
              Voeg nannies toe aan je favorieten om ze hier terug te vinden
            </p>
            <Button
              onClick={() => setLocation('/app')}
              className="bg-[#E91E8C] hover:bg-[#d11a7d] text-white"
            >
              Nannies ontdekken
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favorites.map((nanny) => (
              <div
                key={nanny.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {nanny.avatar_url ? (
                    <img
                      src={nanny.avatar_url}
                      alt={nanny.full_name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setLocation(`/nanny/${nanny.id}`)}
                    />
                  ) : (
                    <div 
                      className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-[#20B2AA] to-[#E91E8C] cursor-pointer"
                      onClick={() => setLocation(`/nanny/${nanny.id}`)}
                    >
                      <span className="text-white text-6xl font-bold">
                        {nanny.full_name?.charAt(0) || "N"}
                      </span>
                    </div>
                  )}
                  
                  {/* Remove Heart Button */}
                  <button
                    onClick={() => removeFavorite(nanny.id)}
                    className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center transition-transform hover:scale-110"
                  >
                    <Heart className="w-7 h-7 fill-[#E91E8C] stroke-[#E91E8C]" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-[#E91E8C]"
                    onClick={() => setLocation(`/nanny/${nanny.id}`)}
                  >
                    {nanny.full_name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{nanny.city}</span>
                    <span className="text-sm">• {nanny.years_experience} jaar ervaring</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{nanny.rating_average.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({nanny.rating_count})</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      €{(nanny.hourly_rate / 100).toFixed(2)}/uur
                    </div>
                  </div>

                  <Button
                    onClick={() => setLocation(`/nanny/${nanny.id}`)}
                    className="w-full mt-4 bg-[#E91E8C] hover:bg-[#d11a7d] text-white"
                  >
                    Bekijk profiel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

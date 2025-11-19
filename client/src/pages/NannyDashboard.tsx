import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { APP_LOGO } from "@/const";
import { AlertCircle, Calendar, CreditCard, Eye, LogOut, Menu, Phone, Settings, Star, TrendingUp, Users, X } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface NannyProfile {
  id: string;
  full_name: string;
  city: string;
  bio: string;
  hourly_rate: number;
  years_experience: number;
  max_children: number;
  is_available: boolean;
  subscription_status: string;
  rating_average: number;
  rating_count: number;
  avatar_url: string | null;
}

interface Booking {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
  parent_id: string;
}

export default function NannyDashboard() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<NannyProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contactRequests, setContactRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      console.log('Loading dashboard data for user:', user.id);
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log('Profile data:', profileData);
      console.log('Profile error:', profileError);

      // Load nanny profile separately
      const { data: nannyData, error: nannyError } = await supabase
        .from("nanny_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      console.log('Nanny profile data:', nannyData);
      console.log('Nanny error:', nannyError);

      if (profileData) {
        const np = nannyData;
        console.log('Using nanny data:', np);
        
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name || "",
          city: profileData.city || "",
          bio: np?.bio || "",
          hourly_rate: np?.hourly_rate || 0,
          years_experience: np?.years_experience || 0,
          max_children: np?.max_children || 0,
          is_available: np?.is_available || false,
          subscription_status: np?.subscription_status || "inactive",
          rating_average: profileData.average_rating ? profileData.average_rating / 100 : 0,
          rating_count: profileData.review_count || 0,
          avatar_url: profileData.avatar_url,
        });
      }

      // Load bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("nanny_id", user.id)
        .order("start_time", { ascending: false });

      setBookings(bookingsData || []);

      // Load contact requests count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: contactData } = await supabase
        .from("contact_requests")
        .select("id")
        .eq("nanny_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      setContactRequests(contactData?.length || 0);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  const handleToggleAvailability = async (checked: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from("nanny_profiles")
        .update({ is_available: checked })
        .eq("profile_id", user.id);

      toast.success("Beschikbaarheid bijgewerkt");
      loadData();
    } catch (error) {
      toast.error("Fout bij bijwerken");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasActiveSubscription =
    profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const isAvailable = profile?.is_available;

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const upcomingBookings = bookings.filter((b) => b.status === "accepted");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container flex items-center justify-center h-16 relative px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/app")} className="absolute left-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <img src={APP_LOGO} alt="NannyGo" className="h-12" />
          <div className="absolute right-4 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/nanny/${user?.id}`)}>
              <Eye className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Slide Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 animate-in fade-in duration-300" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-40 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-14"
                  onClick={() => {
                    setMenuOpen(false);
                    setLocation("/app/nanny/profile");
                  }}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Profiel bewerken
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-14"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Uitloggen
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="max-w-6xl mx-auto pb-8">
        {/* Profile Header */}
        <div className="bg-white mb-6">
          {/* Profile Photo - Square */}
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#20B2AA] to-[#E91E8C]">
                <span className="text-white text-8xl font-bold">
                  {profile?.full_name?.charAt(0) || "N"}
                </span>
              </div>
            )}
            
            {/* Profile Edit Badge */}
            <button
              onClick={() => setLocation('/app/nanny/profile')}
              className="absolute top-4 right-4 px-4 py-2 rounded-full bg-[#E91E8C] hover:bg-[#d11a7d] text-white font-semibold text-sm shadow-lg transition-colors"
            >
              Profiel bewerken
            </button>
            
            {/* Name and Price Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-2xl font-bold text-white mb-1">{profile?.full_name}</h2>
              <p className="text-xl text-white font-semibold">
                €{profile?.hourly_rate ? (profile.hourly_rate / 100).toFixed(2) : '0.00'}/uur
              </p>
            </div>
          </div>

          {/* Info Badges */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Ervaring</div>
                <div className="text-xl font-bold text-gray-900">{profile?.years_experience || 0} jaar</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Beoordeling</div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold text-gray-900">{profile?.rating_average.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Max kinderen</div>
                <div className="text-xl font-bold text-gray-900">
                  {profile?.max_children || 0} {profile?.max_children === 1 ? 'kind' : 'kinderen'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Alert */}
        {!hasActiveSubscription && (
          <div className="mx-4 mb-6 bg-pink-50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#E91E8C]" />
              <p className="text-base font-semibold text-[#E91E8C]">Activeer je abonnement</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">Je profiel is nog niet zichtbaar voor ouders. Activeer je abonnement om boekingen te ontvangen.</p>
            <Button
              onClick={() => setLocation("/app/nanny/subscription")}
              className="bg-[#E91E8C] hover:bg-[#d11a7d] w-full h-14 text-base"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Abonnement activeren - €9.95/maand
            </Button>
            <p className="text-sm text-gray-500 mt-3">Eerste 2 maanden gratis!</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="px-4 space-y-4 mb-6">
          <Card className="border-0 shadow-sm" onClick={() => pendingBookings.length > 0 && setLocation("/app/bookings")}>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600 mb-2">Nieuwe aanvragen</p>
                  <p className="text-4xl font-bold text-[#E91E8C]">{pendingBookings.length}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-[#E91E8C]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600 mb-2">Aankomend</p>
                  <p className="text-4xl font-bold text-[#20B2AA]">{upcomingBookings.length}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-[#20B2AA]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600 mb-2">Contact verzoeken</p>
                  <p className="text-sm text-gray-500 mb-1">Laatste 30 dagen</p>
                  <p className="text-4xl font-bold text-[#E91E8C]">{contactRequests}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-[#E91E8C]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="px-4">
            <h2 className="text-xl font-bold mb-4">🔔 Nieuwe boekingsverzoeken</h2>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold mb-1">Nieuw verzoek</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.start_time).toLocaleDateString("nl-NL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setLocation(`/app/booking/${booking.id}`)}
                      className="bg-[#20B2AA] hover:bg-[#1a8f89] w-full h-12 text-base"
                    >
                      Bekijk details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

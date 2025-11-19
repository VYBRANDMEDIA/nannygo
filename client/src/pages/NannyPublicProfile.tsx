import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";
import { ArrowLeft, Award, Baby, MapPin, Phone, Share2, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface NannyProfile {
  id: string;
  full_name: string;
  city: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  video_url: string | null;
  bio: string;
  hourly_rate: number;
  years_experience: number;
  max_children: number;
  tags: string[];
  rating_average: number;
  rating_count: number;
  is_available: boolean;
}

export default function NannyPublicProfile() {
  const [, params] = useRoute("/nanny/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const nannyId = params?.id;

  const [profile, setProfile] = useState<NannyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [availableDates, setAvailableDates] = useState<Set<number>>(new Set());
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProfile();
    checkFavoriteStatus();
  }, [nannyId, user]);

  const loadProfile = async () => {
    if (!nannyId) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", nannyId)
        .single();

      const { data: nannyData } = await supabase
        .from("nanny_profiles")
        .select("*")
        .eq("profile_id", nannyId)
        .maybeSingle();

      if (profileData && nannyData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name || "",
          city: profileData.city || "",
          phone: profileData.phone || null,
          email: null,
          avatar_url: profileData.avatar_url,
          video_url: profileData.video_url,
          bio: nannyData.bio || "",
          hourly_rate: nannyData.hourly_rate || 0,
          years_experience: nannyData.years_experience || 0,
          max_children: nannyData.max_children || 0,
          tags: Array.isArray(nannyData.tags) ? nannyData.tags : [],
          rating_average: profileData.average_rating ? profileData.average_rating / 100 : 0,
          rating_count: profileData.review_count || 0,
          is_available: nannyData.is_available || false,
        });

        // Load availability
        const { data: availData } = await supabase
          .from("nanny_availability")
          .select("available_date")
          .eq("nanny_profile_id", nannyData.id)
          .gte("available_date", new Date().toISOString().split('T')[0]);

        if (availData) {
          const today = new Date();
          const daysSet = new Set<number>();
          availData.forEach(d => {
            const date = new Date(d.available_date);
            if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
              daysSet.add(date.getDate());
            }
          });
          setAvailableDates(daysSet);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return videoId;
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return videoId ? `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&playsinline=1` : '';
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  const checkFavoriteStatus = async () => {
    if (!user || !nannyId) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('nanny_id', nannyId)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      setLocation('/login');
      return;
    }

    if (!nannyId) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('nanny_id', nannyId);
        setIsFavorite(false);
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, nanny_id: nannyId });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const logContactRequest = async (contactType: 'call' | 'whatsapp' | 'email' | 'booking_modal') => {
    if (!nannyId) return;

    try {
      const userId = user?.id || 'anonymous';
      const today = new Date().toISOString().split('T')[0];

      // Check if request already exists today for this user/nanny combination
      const { data: existing } = await supabase
        .from('contact_requests')
        .select('id')
        .eq('nanny_id', nannyId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      // Filter by parent_id if user is logged in, otherwise check all anonymous requests
      const alreadyLogged = user?.id 
        ? existing?.some(r => r.parent_id === user.id)
        : existing && existing.length > 0;

      if (alreadyLogged) {
        return; // Already logged today
      }

      await supabase
        .from('contact_requests')
        .insert({
          parent_id: user?.id || null,
          nanny_id: nannyId,
          contact_type: contactType,
        });
    } catch (error) {
      console.error('Error logging contact request:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.full_name} - NannyGo`,
      text: `Bekijk het profiel van ${profile?.full_name} op NannyGo`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link gekopieerd naar klembord!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20B2AA]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profiel niet gevonden</p>
          <Button onClick={() => setLocation("/")} className="bg-[#20B2AA] hover:bg-[#1a8f89]">
            Terug
          </Button>
        </div>
      </div>
    );
  }

  const videoId = profile.video_url ? getYouTubeVideoId(profile.video_url) : '';
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : '';
  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';

  const today = new Date();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container flex items-center justify-between h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <img src={APP_LOGO} alt="NannyGo" className="h-10" />
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="pb-28">
        {/* Profile Photo - Full Width */}
        <div className="relative w-full aspect-square max-w-md mx-auto">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#20B2AA] to-[#E91E8C]">
              <span className="text-white text-8xl font-bold">
                {profile.full_name?.charAt(0) || "N"}
              </span>
            </div>
          )}
          
          {/* Heart Icon */}
          <button 
            onClick={toggleFavorite}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center transition-transform hover:scale-110"
          >
            <svg className="w-8 h-8" fill={isFavorite ? "#E91E8C" : "none"} stroke="#E91E8C" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Experience Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur rounded-xl">
            <Award className="h-5 w-5 text-[#E83397]" />
            <div>
              <div className="text-xs text-gray-600">Ervaring</div>
              <div className="text-sm font-bold text-gray-900">{profile.years_experience} jaar</div>
            </div>
          </div>

          {/* Name & Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
              {/* Availability Indicator - Pulsating dot */}
              {profile.is_available && (
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-[#E83397]"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#E83397] animate-ping"></div>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-white mb-3">
              €{profile.hourly_rate ? (profile.hourly_rate / 100).toFixed(2) : '0.00'}<span className="text-lg">/uur</span>
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-white">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-base font-semibold">{profile.rating_average.toFixed(1)}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/50"></div>
              <div className="flex items-center gap-1.5 text-white">
                <Baby className="h-5 w-5" />
                <span className="text-base font-semibold">Max {profile.max_children} {profile.max_children === 1 ? 'kind' : 'kinderen'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/50"></div>
              <div className="flex items-center gap-1.5 text-white">
                <MapPin className="h-5 w-5" />
                <span className="text-base font-semibold">{profile.city}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6">
          {/* About */}
          {profile.bio && (
            <div className="my-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}



          {/* Specialisaties */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Video Thumbnail */}
          {embedUrl && (
            <div className="mb-6">
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full aspect-video rounded-2xl overflow-hidden relative group bg-gray-900"
              >
                {thumbnailUrl && (
                  <img 
                    src={thumbnailUrl} 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                    <svg className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Bekijk introductie video
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Availability Calendar */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">
                {['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'][today.getMonth()]} {today.getFullYear()}
              </h3>
              
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const year = today.getFullYear();
                  const month = today.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const firstDay = new Date(year, month, 1).getDay();
                  const days = [];
                  
                  // Empty cells before month starts
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                  }
                  
                  // Actual days
                  for (let day = 1; day <= daysInMonth; day++) {
                    const isAvailable = availableDates.has(day);
                    const isToday = day === today.getDate();
                    days.push(
                      <div
                        key={day}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold ${
                          isAvailable
                            ? 'bg-[#E83397] text-white'
                            : 'bg-white text-gray-400 border border-gray-200'
                        } ${isToday ? 'ring-2 ring-[#20B2AA]' : ''}`}
                      >
                        {day}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-3">💗 Gemarkeerde dagen zijn beschikbaar voor boekingen</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <a 
            href={profile.phone ? `tel:${profile.phone}` : '#'}
            onClick={() => logContactRequest('call')}
            className="w-14 h-14 rounded-full bg-[#E91E8C] hover:bg-[#d11a7d] text-white flex items-center justify-center shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
          </a>
          <Button
            onClick={() => {
              logContactRequest('booking_modal');
              setShowContactModal(true);
            }}
            className="flex-1 h-14 rounded-full bg-[#E91E8C] hover:bg-[#d11a7d] text-white font-semibold text-lg"
          >
            Boek Nu
          </Button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Contact opnemen</h2>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* WhatsApp */}
              {profile.phone && (
                <a 
                  href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`}
                  onClick={() => logContactRequest('whatsapp')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">WhatsApp</div>
                    <div className="text-sm text-gray-600">{profile.phone}</div>
                  </div>
                </a>
              )}
              
              {/* Phone */}
              {profile.phone && (
                <a 
                  href={`tel:${profile.phone}`}
                  onClick={() => logContactRequest('call')}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E83397' }}>
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">Bellen</div>
                    <div className="text-sm text-gray-600">{profile.phone}</div>
                  </div>
                </a>
              )}
              
              {/* Email */}
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`}
                  onClick={() => logContactRequest('email')}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E83397' }}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">{profile.email}</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && embedUrl && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-200"
            onClick={() => setShowVideoModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={embedUrl + "&autoplay=1"}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

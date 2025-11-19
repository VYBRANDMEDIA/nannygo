import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO } from "@/const";
import { ArrowLeft, Camera, Loader2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ImageCropper } from "@/components/ImageCropper";

interface NannyProfile {
  bio: string;
  hourly_rate: number;
  years_experience: number;
  max_children: number;
  tags: string[];
}

export default function NannyProfileEdit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [maxChildren, setMaxChildren] = useState("");
  const [tags, setTags] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [cropImage, setCropImage] = useState<File | null>(null);
  const [nannyProfileId, setNannyProfileId] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      console.log('Loading profile for user:', user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profileData);

      const { data: nannyData, error: nannyError } = await supabase
        .from("nanny_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      console.log('Nanny profile data:', nannyData);

      if (profileData) {
        setFullName(profileData.full_name || "");
        setCity(profileData.city || "");
        setPhone(profileData.phone || "");
        setEmail(profileData.email || "");
        setProfilePhotoUrl(profileData.avatar_url);
        setYoutubeUrl(profileData.video_url || "");
      }

      if (nannyData) {
        setNannyProfileId(nannyData.id);
        setBio(nannyData.bio || "");
        setHourlyRate(nannyData.hourly_rate ? (nannyData.hourly_rate / 100).toString() : "");
        setYearsExperience(nannyData.years_experience?.toString() || "");
        setMaxChildren(nannyData.max_children?.toString() || "");
        setTags(Array.isArray(nannyData.tags) ? nannyData.tags.join(", ") : "");

        // Load availability
        const { data: availData } = await supabase
          .from("nanny_availability")
          .select("available_date")
          .eq("nanny_profile_id", nannyData.id);

        if (availData) {
          setAvailableDates(new Set(availData.map(d => d.available_date)));
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Fout bij laden profiel");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      setProfilePhotoUrl(publicUrl);
      toast.success("Foto geüpload!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Fout bij uploaden foto");
    }
  };

  const toggleDate = (dateStr: string) => {
    setAvailableDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      console.log('Saving profile...');

      // Save basic profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          city: city,
          phone: phone,
          email: email,
          video_url: youtubeUrl,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      console.log('Saving nanny data...');

      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);
      const nannyData = {
        profile_id: user.id,
        bio: bio || "",
        hourly_rate: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : 0,
        years_experience: yearsExperience ? parseInt(yearsExperience) : 0,
        max_children: maxChildren ? parseInt(maxChildren) : 0,
        tags: tagsArray,
      };

      console.log('Nanny data to save:', nannyData);

      // Check if nanny profile exists
      const { data: existingNanny } = await supabase
        .from("nanny_profiles")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      let currentNannyId = nannyProfileId;

      if (existingNanny) {
        console.log('Updating existing profile...');
        const { error: nannyError } = await supabase
          .from("nanny_profiles")
          .update(nannyData)
          .eq("profile_id", user.id);

        if (nannyError) throw nannyError;
        currentNannyId = existingNanny.id;
      } else {
        console.log('Creating new profile...');
        const { data: newNanny, error: nannyError } = await supabase
          .from("nanny_profiles")
          .insert([nannyData])
          .select()
          .single();

        if (nannyError) throw nannyError;
        currentNannyId = newNanny.id;
        setNannyProfileId(newNanny.id);
      }

      // Save availability
      if (currentNannyId) {
        // Delete old availability
        await supabase
          .from("nanny_availability")
          .delete()
          .eq("nanny_profile_id", currentNannyId);

        // Insert new availability
        if (availableDates.size > 0) {
          const availRecords = Array.from(availableDates).map(date => ({
            nanny_profile_id: currentNannyId,
            available_date: date,
          }));

          const { error: availError } = await supabase
            .from("nanny_availability")
            .insert(availRecords);

          if (availError) throw availError;
        }
      }

      console.log('Save successful!');
      toast.success("Profiel opgeslagen!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Fout bij opslaan profiel");
    } finally {
      setSaving(false);
    }
  };

  const generateCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, dateStr: '' });
    }
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({ day, dateStr });
    }
    return days;
  };

  const getMonthName = () => {
    const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    return months[new Date().getMonth()];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#20B2AA]" />
      </div>
    );
  }

  const calendarDays = generateCalendar();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/app/nanny")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <img src={APP_LOGO} alt="NannyGo" className="h-10" />
          <div className="w-10" />
        </div>
      </header>

      <main className="container max-w-2xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profiel bewerken</CardTitle>
            <CardDescription>Vul je gegevens in om je profiel compleet te maken</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div>
              <Label>Profielfoto</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#20B2AA] to-[#E91E8C] flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {fullName?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#20B2AA] text-white flex items-center justify-center shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCropImage(file);
                  }}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <Label htmlFor="fullName">Volledige naam</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Bijv. Jenny van Dijk"
              />
            </div>

            <div>
              <Label htmlFor="city">Stad</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bijv. Rotterdam"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefoonnummer *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Bijv. 06 12345678"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Voor WhatsApp contact</p>
            </div>

            <div>
              <Label htmlFor="email">Email (optioneel)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Bijv. jenny@email.com"
              />
            </div>

            {/* Over jezelf */}
            <div>
              <Label htmlFor="bio">Over jezelf</Label>
              <p className="text-sm text-gray-600 mb-2">Vertel ouders wie je bent en wat je ervaring is</p>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bijv. Ik ben een ervaren nanny met een passie voor kinderopvang..."
                rows={4}
              />
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Professionele gegevens</h3>
              <p className="text-sm text-gray-600">Tarieven en ervaring</p>

              <div>
                <Label htmlFor="hourlyRate">Uurtarief (€)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="Bijv. 12.50"
                />
              </div>

              <div>
                <Label htmlFor="yearsExperience">Jaren ervaring</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="Bijv. 5"
                />
              </div>

              <div>
                <Label htmlFor="maxChildren">Max aantal kinderen</Label>
                <Input
                  id="maxChildren"
                  type="number"
                  value={maxChildren}
                  onChange={(e) => setMaxChildren(e.target.value)}
                  placeholder="Bijv. 3"
                />
              </div>

              <div>
                <Label htmlFor="tags">Specialiteiten (gescheiden door komma's)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Bijv. Baby's, Peuters, EHBO, Huiswerk begeleiding"
                />
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Beschikbaarheid</h3>
              <p className="text-sm text-gray-600">Klik op dagen om je beschikbaarheid in te stellen</p>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-center font-semibold text-gray-900 mb-3">{getMonthName()} {new Date().getFullYear()}</div>
                
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
                  {calendarDays.map(({ day, dateStr }, idx) => {
                    if (day === 0) {
                      return <div key={`empty-${idx}`} className="aspect-square"></div>;
                    }
                    
                    const isSelected = availableDates.has(dateStr);
                    const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
                    
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && toggleDate(dateStr)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                          isPast
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#E83397] text-white hover:bg-green-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">💗 Gemarkeerde dagen zijn beschikbaar voor boekingen</p>
              </div>
            </div>

            {/* Video */}
            <div>
              <Label htmlFor="youtubeUrl">Introductie video (optioneel)</Label>
              <p className="text-sm text-gray-600 mb-2">Voeg een YouTube video link toe om jezelf voor te stellen</p>
              <Input
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/app/nanny")}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 bg-[#20B2AA] hover:bg-[#1a8f89]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  "Profiel opslaan"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={handlePhotoUpload}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}

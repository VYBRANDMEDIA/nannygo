import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { APP_LOGO } from "@/const";
import { Baby, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Onboarding() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<"parent" | "nanny" | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);

  // Redirect if user already has a profile
  useEffect(() => {
    if (!authLoading && profile) {
      if (profile.role === "parent") {
        setLocation("/app/parent");
      } else if (profile.role === "nanny") {
        setLocation("/app/nanny");
      }
    }
  }, [authLoading, profile, setLocation]);

  // Show loading while checking profile
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  const handleRoleSelect = (selectedRole: "parent" | "nanny") => {
    setRole(selectedRole);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !fullName || !user) {
      toast.error("Vul alle verplichte velden in");
      return;
    }

    setLoading(true);
    try {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role,
          full_name: fullName,
          phone: phone || null,
          city: city || null,
        });

      if (profileError) throw profileError;

      // If nanny, create nanny profile
      if (role === 'nanny') {
        const { error: nannyError } = await supabase
          .from('nanny_profiles')
          .insert({
            profile_id: user.id,
            subscription_status: 'inactive',
          });

        if (nannyError) throw nannyError;
      }

      toast.success("Profiel aangemaakt!");
      setLocation(role === 'nanny' ? '/app/nanny' : '/app');
    } catch (error: any) {
      toast.error("Er ging iets mis: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (step === "role") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <img src={APP_LOGO} alt="NannyGo" className="h-12 mb-8" />
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welkom bij NannyGo!
            </h1>
            <p className="text-muted-foreground">
              Kies je rol om te beginnen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
              onClick={() => handleRoleSelect("parent")}
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Baby className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Ik ben ouder</CardTitle>
                <CardDescription>
                  Zoek en boek betrouwbare nannies in jouw buurt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Volledig gratis</li>
                  <li>✓ Zoek nannies op locatie</li>
                  <li>✓ Bekijk reviews en profielen</li>
                  <li>✓ Direct boeken</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-secondary"
              onClick={() => handleRoleSelect("nanny")}
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Ik ben nanny</CardTitle>
                <CardDescription>
                  Maak een profiel en ontvang boekingen van ouders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ €9.95/maand</li>
                  <li>✓ Eerste 2 maanden gratis</li>
                  <li>✓ Zichtbaar voor ouders</li>
                  <li>✓ Ontvang boekingen</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <img src={APP_LOGO} alt="NannyGo" className="h-12 mb-8" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vul je gegevens in</CardTitle>
          <CardDescription>
            {role === "parent"
              ? "Maak je ouder profiel aan"
              : "Maak je nanny profiel aan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Volledige naam *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Bijv. Jan Jansen"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Bijv. 06 12345678"
              />
            </div>

            <div>
              <Label htmlFor="city">Stad</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bijv. Amsterdam"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("role")}
                className="flex-1"
              >
                Terug
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Bezig..." : "Profiel aanmaken"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

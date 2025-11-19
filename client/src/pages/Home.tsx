import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";
import { Baby, Heart, Shield, Star } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/app");
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <img src={APP_LOGO} alt="NannyGo" className="h-32 md:h-40 mb-12" />
            <h1 className="text-5xl md:text-7xl font-bold mb-16 text-gray-900">
              Vind de perfecte oppas in jouw buurt
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl mb-8">
              <Button
                size="lg"
                className="flex-1 text-lg h-16 bg-[#20B2AA] hover:bg-[#1a8f89] text-white"
                onClick={() => setLocation("/register")}
              >
                <Baby className="mr-2 h-5 w-5" />
                Ik ben ouder
              </Button>
              <Button
                size="lg"
                className="flex-1 text-lg h-16 bg-[#E91E8C] hover:bg-[#d11a7d] text-white"
                onClick={() => setLocation("/register")}
              >
                <Heart className="mr-2 h-5 w-5" />
                Ik ben nanny
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Account aanmaken is altijd gratis
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">
            Waarom NannyGo?
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            NannyGo verbindt ouders met betrouwbare nannies. Snel, veilig en eenvoudig.
          </p>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#20B2AA] flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Veilig & Betrouwbaar</h3>
              <p className="text-gray-600 text-lg">
                Geverifieerde nannies met reviews
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#E91E8C] flex items-center justify-center mb-6">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Kwaliteit Gegarandeerd</h3>
              <p className="text-gray-600 text-lg">
                Profielen met foto's en video's
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#20B2AA] flex items-center justify-center mb-6">
                <Baby className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">In Jouw Buurt</h3>
              <p className="text-gray-600 text-lg">
                Nannies bij jou in de buurt
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Parents */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Voor Ouders
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Volledig gratis, geen verborgen kosten
          </p>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Maak account", desc: "Gratis aanmelden" },
              { step: "2", title: "Zoek nanny", desc: "Filter op locatie" },
              { step: "3", title: "Bekijk profiel", desc: "Reviews en video's" },
              { step: "4", title: "Boek direct", desc: "Plan een afspraak" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#20B2AA] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2 text-lg text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Nannies */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Voor Nannies
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            €9.95/maand • Eerste 2 maanden gratis
          </p>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Maak profiel", desc: "Gratis account" },
              { step: "2", title: "Vul gegevens in", desc: "Foto's en video" },
              { step: "3", title: "Activeer abonnement", desc: "2 maanden gratis" },
              { step: "4", title: "Ontvang boekingen", desc: "Word gevonden" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#E91E8C] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2 text-lg text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-[#20B2AA]">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Meld je vandaag nog aan
          </p>
          <Button
            size="lg"
            className="text-lg h-16 px-12 bg-[#E91E8C] hover:bg-[#d11a7d] text-white"
            onClick={() => setLocation("/register")}
          >
            Account aanmaken
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container text-center text-sm text-gray-500">
          <p>© 2024 NannyGo. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Check, CreditCard, Loader2, Sparkles, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function NannySubscription() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Je wordt doorverwezen naar de betaalpagina");
      }
    },
    onError: (error) => {
      toast.error("Fout bij het starten van betaling: " + error.message);
    },
  });

  const handleSubscribe = () => {
    if (!user) {
      toast.error("Je moet ingelogd zijn om te abonneren");
      setLocation("/login");
      return;
    }
    createCheckout.mutate();
  };

  const nannyImages = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20">
        <div className="container flex items-center justify-center h-16 relative px-4">
          <button 
            onClick={() => setLocation("/app/nanny")}
            className="absolute left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={APP_LOGO} alt="NannyGo" className="h-14 md:h-16" />
        </div>
      </header>

      <main className="container py-8 max-w-2xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#E82E95]">
            Join de Nanny Family
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Start vandaag met het ontvangen van boekingen
          </p>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="flex -space-x-3">
              {nannyImages.map((img, idx) => (
                <div key={idx} className="w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg">
                  <img src={img} alt={`Nanny ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <Users className="h-4 w-4 text-[#15BCCA]" />
              <span className="font-semibold text-gray-900">1000+ actieve nannies</span>
            </div>
          </div>
        </div>

        {/* Main Pricing Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 overflow-hidden mb-8">
          {/* Price Header */}
          <div className="bg-[#E82E95] p-8 text-center text-white">
            <div className="text-5xl font-bold mb-2">
              €9<span className="text-3xl">,95</span>
            </div>
            <p className="text-lg opacity-90 mb-4">per maand • maandelijks opzegbaar</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Tijdelijk gratis tot 31 dec</span>
            </div>
          </div>

          {/* Features List */}
          <div className="p-8">
            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-4">
                <Check className="h-6 w-6 text-[#15BCCA] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-1">Zichtbaar voor ouders</p>
                  <p className="text-gray-600">
                    Je profiel wordt direct getoond in zoekresultaten
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="h-6 w-6 text-[#15BCCA] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-1">Onbeperkte boekingen</p>
                  <p className="text-gray-600">
                    Ontvang en accepteer zoveel boekingen als je wilt
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="h-6 w-6 text-[#15BCCA] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-1">Profiel met foto's en video</p>
                  <p className="text-gray-600">
                    Upload tot 5 foto's en een introductie video
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="h-6 w-6 text-[#15BCCA] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-1">Houd 100% van je betalingen</p>
                  <p className="text-gray-600">
                    Geen commissie op boekingen. Alleen een vaste maandelijkse fee.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Check className="h-6 w-6 text-[#15BCCA] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg mb-1">Reviews en ratings</p>
                  <p className="text-gray-600">
                    Bouw je reputatie op met beoordelingen van ouders
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={createCheckout.isPending}
              className="w-full py-4 bg-[#E82E95] hover:bg-[#d11a7d] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCheckout.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Bezig met laden...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Start nu tijdelijk gratis
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Veilige betaling via Stripe • Geen lange contracten • Stop wanneer je wilt
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-[#15BCCA] mb-1">1000+</div>
            <div className="text-xs text-gray-600">Actieve nannies</div>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-[#E82E95] mb-1">4.8★</div>
            <div className="text-xs text-gray-600">Gemiddelde rating</div>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-[#15BCCA] mb-1">5000+</div>
            <div className="text-xs text-gray-600">Boekingen</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md shadow-gray-100/50">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Veelgestelde vragen
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-gray-200">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                Wanneer word ik zichtbaar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Direct na het activeren van je abonnement wordt je profiel zichtbaar voor ouders in jouw regio. Je kunt meteen boekingen ontvangen!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-gray-200">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                Hoe werkt de gratis periode?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Tot 31 december is het volledig gratis. Daarna wordt automatisch €9,95 per maand afgeschreven. Je kunt op elk moment zonder kosten opzeggen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-gray-200">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                Houd ik 100% van mijn betalingen?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Ja! Betalingen tussen ouders en nannies worden buiten het platform geregeld. Je houdt dus 100% van wat je verdient. Het abonnement is alleen om zichtbaar te zijn op het platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-none">
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                Kan ik mijn abonnement opzeggen?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Absoluut! Je kunt je abonnement op elk moment opzeggen via je accountinstellingen. Je profiel blijft actief tot het einde van de betaalde periode.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
}

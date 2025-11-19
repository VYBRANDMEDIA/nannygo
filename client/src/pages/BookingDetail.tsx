import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Check, Clock, MapPin, X } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function BookingDetail() {
  const [, params] = useRoute("/app/nanny/booking/:id");
  const [, setLocation] = useLocation();
  const bookingId = params?.id ? parseInt(params.id) : 0;

  const { data: bookingData, isLoading } = trpc.booking.getById.useQuery({ bookingId });

  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      const action = variables.status === "accepted" ? "geaccepteerd" : "afgewezen";
      toast.success(`Boeking ${action}!`);
      setLocation("/app/nanny");
    },
    onError: (error) => {
      toast.error("Fout: " + error.message);
    },
  });

  const handleAccept = () => {
    updateStatus.mutate({ bookingId, status: "accepted" });
  };

  const handleDecline = () => {
    updateStatus.mutate({ bookingId, status: "declined" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Boeking niet gevonden</p>
          <Button onClick={() => setLocation("/app/nanny")}>
            Terug naar dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { booking, parentProfile } = bookingData;
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="NannyGo" className="h-10" />
            <h1 className="text-xl font-semibold">Boekingsverzoek</h1>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/app/nanny")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-2xl">
        {/* Parent Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ouder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {'parentProfile' in bookingData && bookingData.parentProfile ? bookingData.parentProfile.fullName.charAt(0) : 'O'}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {'parentProfile' in bookingData && bookingData.parentProfile ? bookingData.parentProfile.fullName : 'Ouder'}
                </p>
                <p className="text-muted-foreground">
                  {'parentProfile' in bookingData && bookingData.parentProfile?.phone
                    ? bookingData.parentProfile.phone
                    : "Geen telefoonnummer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Boekingsdetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Datum</p>
                <p className="text-muted-foreground">
                  {startDate.toLocaleDateString("nl-NL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Tijd</p>
                <p className="text-muted-foreground">
                  {startDate.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {endDate.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({duration} uur)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Adres</p>
                <p className="text-muted-foreground">{booking.address}</p>
              </div>
            </div>

            {booking.notes && (
              <div className="pt-2 border-t">
                <p className="font-medium mb-1">Opmerkingen</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {booking.status === "pending" && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecline}
              disabled={updateStatus.isPending}
              className="border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <X className="h-5 w-5 mr-2" />
              Afwijzen
            </Button>
            <Button
              size="lg"
              onClick={handleAccept}
              disabled={updateStatus.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-5 w-5 mr-2" />
              Accepteren
            </Button>
          </div>
        )}

        {booking.status === "accepted" && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                <p className="font-semibold">Boeking geaccepteerd</p>
              </div>
            </CardContent>
          </Card>
        )}

        {booking.status === "declined" && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <X className="h-5 w-5" />
                <p className="font-semibold">Boeking afgewezen</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function NannyDetail() {
  const [, params] = useRoute("/app/parent/nanny/:id");
  const [, setLocation] = useLocation();
  const nannyId = params?.id ? parseInt(params.id) : 0;

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const { data: nannyData, isLoading } = trpc.nanny.getById.useQuery({ profileId: nannyId });

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: () => {
      toast.success("Boekingsverzoek verzonden!");
      setShowBookingDialog(false);
      setLocation("/app/parent/bookings");
    },
    onError: (error) => {
      toast.error("Fout: " + error.message);
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !startTime || !endTime || !address) {
      toast.error("Vul alle verplichte velden in");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error("Eindtijd moet na starttijd zijn");
      return;
    }

    createBooking.mutate({
      nannyId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      address,
      notes: notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!nannyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nanny niet gevonden</p>
          <Button onClick={() => setLocation("/app/parent")}>
            Terug naar overzicht
          </Button>
        </div>
      </div>
    );
  }

  const { profile, nannyProfile } = nannyData;
  const tags = nannyProfile?.tags ? JSON.parse(nannyProfile.tags) : [];
  const hourlyRate = nannyProfile?.hourlyRate
    ? `€${(nannyProfile.hourlyRate / 100).toFixed(2)}`
    : "Prijs op aanvraag";
  const rating = profile.averageRating
    ? (profile.averageRating / 100).toFixed(1)
    : "Nieuw";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="NannyGo" className="h-10" />
          </div>
          <Button variant="ghost" onClick={() => setLocation("/app/parent")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
                {profile.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{profile.fullName}</CardTitle>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city || "Locatie niet opgegeven"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{rating}</span>
                    {(profile.reviewCount || 0) > 0 && (
                      <span className="text-sm">({profile.reviewCount} reviews)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Uurtarief</p>
                    <p className="text-2xl font-bold text-primary">{hourlyRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ervaring</p>
                    <p className="text-xl font-semibold">{nannyProfile?.yearsExperience || 0} jaar</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max kinderen</p>
                    <p className="text-xl font-semibold">{nannyProfile?.maxChildren || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bio */}
        {nannyProfile?.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Over mij</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{nannyProfile?.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Specialisaties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* YouTube Video */}
        {profile.youtubeVideoUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Introductie video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">YouTube video embed komt hier</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking CTA */}
        <Card>
          <CardContent className="pt-6">
            <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  <Calendar className="h-5 w-5 mr-2" />
                  Boek deze nanny
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Boekingsverzoek</DialogTitle>
                  <DialogDescription>
                    Vul de details in voor je boekingsverzoek
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="date">Datum *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Van *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Tot *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Adres *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Straat 123, 1234 AB Stad"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Opmerkingen</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Bijv. aantal kinderen, speciale wensen..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBookingDialog(false)}
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBooking.isPending}
                      className="flex-1"
                    >
                      {createBooking.isPending ? "Bezig..." : "Verstuur verzoek"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

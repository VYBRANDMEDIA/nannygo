import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { LogOut, Users } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: allProfiles, isLoading } = trpc.admin.getAllProfiles.useQuery();

  const toggleStatus = trpc.admin.toggleUserStatus.useMutation({
    onSuccess: () => {
      toast.success("Status bijgewerkt");
      utils.admin.getAllProfiles.invalidate();
    },
    onError: (error) => {
      toast.error("Fout: " + error.message);
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const parents = allProfiles?.filter((p) => p.role === "parent") || [];
  const nannies = allProfiles?.filter((p) => p.role === "nanny") || [];
  const admins = allProfiles?.filter((p) => p.role === "admin") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="NannyGo" className="h-10" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totaal Ouders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{parents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totaal Nannies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{nannies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totaal Gebruikers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allProfiles?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Nannies List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Nannies</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : nannies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Geen nannies gevonden
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {nannies.map((profile) => (
                <Card key={profile.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{profile.fullName}</CardTitle>
                        <CardDescription>
                          {profile.city || "Geen stad"} • {profile.phone || "Geen telefoon"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {profile.isActive ? "Actief" : "Inactief"}
                          </p>
                        </div>
                        <Switch
                          checked={profile.isActive === 1}
                          onCheckedChange={(checked) =>
                            toggleStatus.mutate({
                              profileId: profile.id,
                              isActive: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Parents List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Ouders</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : parents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Geen ouders gevonden
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {parents.map((profile) => (
                <Card key={profile.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{profile.fullName}</CardTitle>
                        <CardDescription>
                          {profile.city || "Geen stad"} • {profile.phone || "Geen telefoon"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {profile.isActive ? "Actief" : "Inactief"}
                          </p>
                        </div>
                        <Switch
                          checked={profile.isActive === 1}
                          onCheckedChange={(checked) =>
                            toggleStatus.mutate({
                              profileId: profile.id,
                              isActive: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

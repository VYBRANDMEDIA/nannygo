import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function StripeDebug() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      console.log("✅ Checkout success:", data);
      toast.success("Checkout URL ontvangen!");
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      console.error("❌ Checkout error:", error);
      toast.error("Error: " + error.message);
    },
  });

  const handleTest = () => {
    console.log("🔍 Testing Stripe checkout...");
    console.log("User:", user);
    createCheckout.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Debug Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Auth Status</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(
                  {
                    isLoggedIn: !!user,
                    userId: user?.id,
                    email: user?.email,
                    name: user?.name,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Mutation Status</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(
                  {
                    isPending: createCheckout.isPending,
                    isError: createCheckout.isError,
                    isSuccess: createCheckout.isSuccess,
                    error: createCheckout.error?.message,
                    data: createCheckout.data,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleTest}
                disabled={createCheckout.isPending}
                className="w-full"
              >
                {createCheckout.isPending ? "Testing..." : "Test Stripe Checkout"}
              </Button>

              <Button
                onClick={() => setLocation("/app/nanny")}
                variant="outline"
                className="w-full"
              >
                Terug naar Dashboard
              </Button>

              {!user && (
                <Button
                  onClick={() => setLocation("/login")}
                  variant="secondary"
                  className="w-full"
                >
                  Login
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>✅ Check browser console voor logs</p>
              <p>✅ Check Network tab voor API calls</p>
              <p>✅ Check Application &gt; Cookies voor session cookie</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

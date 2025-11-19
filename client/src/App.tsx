import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/AppDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import NannyDashboard from "./pages/NannyDashboard";
import NannySubscription from "./pages/NannySubscription";
import StripeDebug from "./pages/StripeDebug";
import AdminDashboard from "./pages/AdminDashboard";
import NannyProfileEdit from "./pages/NannyProfileEdit";
import NannyDetail from "./pages/NannyDetail";
import NannyPublicProfile from "./pages/NannyPublicProfile";
import BookingDetail from "./pages/BookingDetail";
import Favorites from "./pages/Favorites";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/app" component={AppDashboard} />
      <Route path="/app/favorites" component={Favorites} />
      <Route path="/app/parent" component={ParentDashboard} />
      <Route path="/app/parent/nanny/:id" component={NannyDetail} />
      <Route path="/nanny/:id" component={NannyPublicProfile} />
      <Route path="/app/nanny" component={NannyDashboard} />
      <Route path="/app/nanny/subscription" component={NannySubscription} />
      <Route path="/app/nanny/profile" component={NannyProfileEdit} />
      <Route path="/debug/stripe" component={StripeDebug} />
      <Route path="/app/nanny/booking/:id" component={BookingDetail} />
      <Route path="/app/admin" component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

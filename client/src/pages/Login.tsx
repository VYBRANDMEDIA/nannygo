import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_LOGO } from '@/const';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect after login when profile is loaded
  useEffect(() => {
    if (loading && !authLoading && profile) {
      // User just logged in and profile is loaded
      if (profile.role === 'parent') {
        setLocation('/app/parent');
      } else if (profile.role === 'nanny') {
        setLocation('/app/nanny');
      } else {
        setLocation('/app');
      }
    }
  }, [loading, authLoading, profile, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welkom terug!');
      // Don't redirect here - let useEffect handle it after profile loads
    } catch (error: any) {
      toast.error(error.message || 'Inloggen mislukt');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-slide-in-up">
        <CardHeader className="text-center">
          <img src={APP_LOGO} alt="NannyGo" className="h-20 mx-auto mb-4" />
          <CardTitle className="text-2xl">Inloggen</CardTitle>
          <CardDescription>
            Log in met je email en wachtwoord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="je@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Wachtwoord</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#20B2AA] hover:bg-[#1a8f89]"
              disabled={loading}
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Nog geen account?{' '}
              <button
                type="button"
                onClick={() => setLocation('/register')}
                className="text-[#20B2AA] hover:underline font-medium"
              >
                Registreer hier
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

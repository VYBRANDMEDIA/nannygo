import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_LOGO } from '@/const';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Baby, Heart } from 'lucide-react';

export default function Register() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'parent' | 'nanny' | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: 'parent' | 'nanny') => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
      toast.success('Account aangemaakt! Welkom bij NannyGo!');
      setLocation('/app');
    } catch (error: any) {
      toast.error(error.message || 'Registratie mislukt');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md animate-slide-in-up">
          <CardHeader className="text-center">
            <img src={APP_LOGO} alt="NannyGo" className="h-20 mx-auto mb-4" />
            <CardTitle className="text-2xl">Account aanmaken</CardTitle>
            <CardDescription>
              Kies je rol om te beginnen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full h-16 text-lg bg-[#20B2AA] hover:bg-[#1a8f89]"
              onClick={() => handleRoleSelect('parent')}
            >
              <Baby className="mr-2 h-6 w-6" />
              Ik ben ouder
            </Button>
            <Button
              className="w-full h-16 text-lg bg-[#E91E8C] hover:bg-[#d11a7d]"
              onClick={() => handleRoleSelect('nanny')}
            >
              <Heart className="mr-2 h-6 w-6" />
              Ik ben nanny
            </Button>

            <div className="text-center text-sm text-gray-600 pt-4">
              Heb je al een account?{' '}
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-[#20B2AA] hover:underline font-medium"
              >
                Log hier in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={APP_LOGO} alt="NannyGo" className="h-20 mx-auto mb-4" />
          <CardTitle className="text-2xl">
            Registreer als {role === 'parent' ? 'ouder' : 'nanny'}
          </CardTitle>
          <CardDescription>
            Vul je gegevens in om te beginnen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Volledige naam</label>
              <Input
                type="text"
                placeholder="Je naam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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
                  placeholder="Minimaal 6 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            {role === 'nanny' && (
              <div className="bg-[#E91E8C]/10 border border-[#E91E8C]/20 rounded-lg p-4 text-sm">
                <p className="font-medium text-gray-900 mb-1">
                  💰 Nanny abonnement
                </p>
                <p className="text-gray-600">
                  €9.95/maand • Eerste 2 maanden gratis
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('role')}
                disabled={loading}
              >
                Terug
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  role === 'parent'
                    ? 'bg-[#20B2AA] hover:bg-[#1a8f89]'
                    : 'bg-[#E91E8C] hover:bg-[#d11a7d]'
                }`}
                disabled={loading}
              >
                {loading ? 'Bezig...' : 'Account aanmaken'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

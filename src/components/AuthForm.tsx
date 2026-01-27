import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Scale, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { SpecialAccessDialog } from "./SpecialAccessDialog";
import { projectId } from '../utils/supabase/info';
import { api } from "../utils/api";
import { CPSPunisherLogo } from "./CPSPunisherLogo";
import { TierSelection } from "./TierSelection";

interface AuthFormProps {
  onAuth: (userId: string, accessToken: string, tier?: 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise') => void;
}

type AuthProvider = 'email' | 'google' | 'microsoft' | 'apple' | 'yahoo';

export function AuthForm({ onAuth }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [showTierSelection, setShowTierSelection] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{ userId: string; accessToken: string } | null>(null);

  const handleSocialAuth = async (provider: Exclude<AuthProvider, 'email'>) => {
    setError('');
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      // In a real app, this would redirect to OAuth provider
      // For demo purposes, we'll simulate successful authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful OAuth
      const mockUserId = `${provider}_${Math.random().toString(36).substring(7)}`;
      const mockToken = `token_${Math.random().toString(36).substring(7)}`;
      
      // Show tier selection for new signups
      setPendingAuth({ userId: mockUserId, accessToken: mockToken });
      setShowTierSelection(true);
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up validation
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }

        // Sign up
        await api.signup(email, password, name.trim());
        toast.success('Account created successfully!');
        
        // Show tier selection before completing auth
        const loginData = await api.login(email, password);
        if (loginData.accessToken && loginData.userId) {
          setPendingAuth({ userId: loginData.userId, accessToken: loginData.accessToken });
          setShowTierSelection(true);
          setIsLoading(false);
        }
      } else {
        // Login - go straight to app
        await handleLogin();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Provide more helpful error messages
      let errorMessage = err.message || 'An error occurred';
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = isSignUp 
          ? 'Failed to create account. Please try again.'
          : 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
      } else if (errorMessage.includes('Server configuration error')) {
        errorMessage = 'Server is not properly configured. Please contact support or try again later.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const data = await api.login(email, password);

      if (data.accessToken && data.userId) {
        toast.success('Login successful!');
        onAuth(data.userId, data.accessToken);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierSelected = (tier: 'free' | 'essential' | 'professional' | 'attorney' | 'enterprise') => {
    console.log('User selected tier:', tier);
    
    // In production, this would save the tier to the database
    // and handle payment processing for paid tiers
    
    // For now, complete authentication
    if (pendingAuth) {
      toast.success(`Welcome! You're on the ${tier} plan.`);
      onAuth(pendingAuth.userId, pendingAuth.accessToken, tier);
    }
  };

  const handleSkipTierSelection = () => {
    // User skipped tier selection - default to free tier
    if (pendingAuth) {
      toast.success('Welcome! You\'re on the free plan.');
      onAuth(pendingAuth.userId, pendingAuth.accessToken, 'free');
    }
  };

  // Show tier selection after signup
  if (showTierSelection) {
    return (
      <TierSelection 
        onSelectTier={handleTierSelected}
        onSkip={handleSkipTierSelection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md mx-auto p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <CPSPunisherLogo size="lg" showText={false} variant="image" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4">
            {isSignUp ? 'Create your account to fight back' : 'Sign in to continue your fight'}
          </p>
        </div>

        {error && (
          <AlertCircle className="mb-4 text-sm" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={isSignUp ? 'Create a password (6+ characters)' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && loadingProvider === null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialAuth('google')}
              disabled={isLoading}
              className="w-full"
            >
              {loadingProvider === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Microsoft */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialAuth('microsoft')}
              disabled={isLoading}
              className="w-full"
            >
              {loadingProvider === 'microsoft' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
              )}
              Continue with Microsoft
            </Button>

            {/* Apple */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialAuth('apple')}
              disabled={isLoading}
              className="w-full"
            >
              {loadingProvider === 'apple' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/>
                </svg>
              )}
              Continue with Apple
            </Button>

            {/* Yahoo */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialAuth('yahoo')}
              disabled={isLoading}
              className="w-full"
            >
              {loadingProvider === 'yahoo' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#6001D2" d="M13.131 21.631v-5.388h3.744v-2.613h-3.744V9.706c0-1.05.291-1.766 1.798-1.766h1.38V5.556c-.239-.032-1.058-.102-2.011-.102-1.989 0-3.351 1.214-3.351 3.443v3.733H7.195v2.613h2.752v5.388h3.184z"/>
                  <path fill="#6001D2" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
              )}
              Continue with Yahoo
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setPassword('');
            }}
            className="text-sm text-primary hover:underline"
            disabled={isLoading}
          >
            {isSignUp ? "Already have an account? Sign in" : 'Don\'t have an account? Sign up'}
          </button>
        </div>

        <AlertCircle className="mt-6">
          <AlertDescription className="text-xs">
            🔒 Your data is encrypted and secure. Only you can access your case information.
          </AlertDescription>
        </AlertCircle>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/health`);
                const data = await response.json();
                if (data.status === 'ok') {
                  toast.success('Server is online and ready!');
                } else {
                  toast.error('Server responded but with unexpected status');
                }
              } catch (error: any) {
                toast.error('Cannot connect to server: ' + error.message);
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Test Server Connection
          </button>
        </div>
      </Card>
    </div>
  );
}
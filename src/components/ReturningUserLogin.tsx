import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CPSPunisherLogo } from './CPSPunisherLogo';
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReturningUserLoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onForgotPassword: () => void;
  onBackToWelcome: () => void;
}

export function ReturningUserLogin({
  onLogin,
  onForgotPassword,
  onBackToWelcome
}: ReturningUserLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(email, password);
      if (success) {
        toast.success('Welcome back!');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <CPSPunisherLogo size="large" showText={true} variant="image" />
        </div>

        {/* Welcome Back */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to continue defending your rights
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 h-12"
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10 h-12"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Forgot Password */}
          <div className="text-right">
            <Button
              type="button"
              variant="link"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              Forgot password?
            </Button>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* New User */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            First time here?
          </p>
          <Button
            variant="outline"
            onClick={onBackToWelcome}
            className="w-full h-12 border-2"
          >
            Create New Account
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-800">
              Your data is encrypted and secure. We never share your information.
            </p>
          </div>
        </div>

        {/* Demo Access Code Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Demo access code: <code className="bg-gray-100 px-2 py-1 rounded">CPSPUNISHER2024</code>
          </p>
        </div>
      </Card>

      {/* Footer Branding */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <CPSPunisherLogo size="tiny" showText={false} variant="image" className="brightness-0 invert opacity-80" />
          <span>Defending Your Rights</span>
        </div>
      </div>
    </div>
  );
}

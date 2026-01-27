import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Eye, EyeOff, Copy, CheckCircle, AlertTriangle, Server, Key, Database, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EnvVariable {
  key: string;
  value: string | undefined;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  category: 'database' | 'ai' | 'payment' | 'other';
}

export function EnvironmentVariablesViewer() {
  const [showValues, setShowValues] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Safely access import.meta.env with fallback
  const getEnvValue = (key: string): string | undefined => {
    try {
      return import.meta?.env?.[key];
    } catch {
      return undefined;
    }
  };

  const envVariables: EnvVariable[] = [
    {
      key: 'VITE_SUPABASE_URL',
      value: getEnvValue('VITE_SUPABASE_URL'),
      description: 'Supabase project URL for database and authentication',
      icon: <Database className="w-4 h-4" />,
      required: true,
      category: 'database'
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      value: getEnvValue('VITE_SUPABASE_ANON_KEY'),
      description: 'Supabase anonymous/public API key',
      icon: <Key className="w-4 h-4" />,
      required: true,
      category: 'database'
    },
    {
      key: 'VITE_GEMINI_API_KEY',
      value: getEnvValue('VITE_GEMINI_API_KEY'),
      description: 'Google Gemini API key for AI analysis features',
      icon: <Server className="w-4 h-4" />,
      required: true,
      category: 'ai'
    },
    {
      key: 'VITE_STRIPE_PUBLISHABLE_KEY',
      value: getEnvValue('VITE_STRIPE_PUBLISHABLE_KEY'),
      description: 'Stripe publishable key for payment processing',
      icon: <CreditCard className="w-4 h-4" />,
      required: false,
      category: 'payment'
    }
  ];

  const handleCopy = async (key: string, value: string | undefined) => {
    if (!value) {
      toast.error('No value to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success(`Copied ${key}`);
      
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusColor = (isSet: boolean, required: boolean) => {
    if (isSet) return 'text-green-600';
    if (required) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (isSet: boolean, required: boolean) => {
    if (isSet) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (required) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  };

  const requiredVars = envVariables.filter(v => v.required);
  const requiredConfigured = requiredVars.filter(v => v.value).length;
  const isFullyConfigured = requiredConfigured === requiredVars.length;

  const maskValue = (value: string | undefined) => {
    if (!value) return 'Not configured';
    if (showValues) return value;
    
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 8) + '•'.repeat(Math.min(value.length - 8, 32));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Server className="w-4 h-4" />
          View Environment Variables
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Environment Variables Configuration
          </DialogTitle>
          <DialogDescription>
            View and manage your application's environment variables. These are required for the app to function properly.
          </DialogDescription>
        </DialogHeader>

        {/* Configuration Status */}
        <Alert className={isFullyConfigured ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
          <div className="flex items-center gap-2">
            {isFullyConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <AlertTitle className={isFullyConfigured ? 'text-green-900' : 'text-yellow-900'}>
                {isFullyConfigured ? 'All Required Variables Configured' : 'Configuration Incomplete'}
              </AlertTitle>
              <AlertDescription className={isFullyConfigured ? 'text-green-800' : 'text-yellow-800'}>
                {requiredConfigured} of {requiredVars.length} required environment variables are configured
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Show/Hide Values Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowValues(!showValues)}
            className="gap-2"
          >
            {showValues ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Values
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Values
              </>
            )}
          </Button>
        </div>

        {/* Environment Variables List */}
        <div className="space-y-6">
          {/* Database Variables */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database & Authentication
            </h3>
            <div className="space-y-3">
              {envVariables.filter(v => v.category === 'database').map((envVar) => (
                <Card key={envVar.key} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{envVar.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold">{envVar.key}</code>
                        {envVar.required && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            Required
                          </span>
                        )}
                        {getStatusIcon(!!envVar.value, envVar.required)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{envVar.description}</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border break-all">
                          {maskValue(envVar.value)}
                        </code>
                        {envVar.value && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(envVar.key, envVar.value)}
                            className="flex-shrink-0"
                          >
                            {copiedKey === envVar.key ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Variables */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              AI & Analysis
            </h3>
            <div className="space-y-3">
              {envVariables.filter(v => v.category === 'ai').map((envVar) => (
                <Card key={envVar.key} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{envVar.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold">{envVar.key}</code>
                        {envVar.required && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            Required
                          </span>
                        )}
                        {getStatusIcon(!!envVar.value, envVar.required)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{envVar.description}</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border break-all">
                          {maskValue(envVar.value)}
                        </code>
                        {envVar.value && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(envVar.key, envVar.value)}
                            className="flex-shrink-0"
                          >
                            {copiedKey === envVar.key ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Variables */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Processing
            </h3>
            <div className="space-y-3">
              {envVariables.filter(v => v.category === 'payment').map((envVar) => (
                <Card key={envVar.key} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{envVar.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold">{envVar.key}</code>
                        {envVar.required ? (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            Required
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                            Optional
                          </span>
                        )}
                        {getStatusIcon(!!envVar.value, envVar.required)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{envVar.description}</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border break-all">
                          {maskValue(envVar.value)}
                        </code>
                        {envVar.value && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(envVar.key, envVar.value)}
                            className="flex-shrink-0"
                          >
                            {copiedKey === envVar.key ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {!isFullyConfigured && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Missing environment variables detected. To configure:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create a <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in your project root</li>
                <li>Add the missing variables with their values</li>
                <li>Restart your development server</li>
              </ol>
              <p className="mt-2 text-sm">
                For Vercel deployment, add these in the project settings under "Environment Variables".
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Legal Notice */}
        <Alert className="border-blue-500 bg-blue-50">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Security Notice</AlertTitle>
          <AlertDescription className="text-blue-800 text-xs">
            Never commit environment variables to version control. These values are for configuration only and should be kept secure. 
            The Supabase anon key is safe to expose on the client side as it's protected by Row Level Security (RLS) policies.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
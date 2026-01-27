import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function LoginDiagnostic() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // Check 1: Health endpoint
      try {
        const healthUrl = `${window.location.origin.replace(/:\d+$/, '')}:54321/functions/v1/make-server-a24eaa40/health`;
        const healthResponse = await fetch(healthUrl);
        const healthData = await healthResponse.json();
        diagnostics.checks.health = {
          status: healthResponse.ok && healthData.status === 'ok' ? 'pass' : 'fail',
          message: healthResponse.ok ? 'Server is running' : 'Server returned error',
          url: healthUrl,
          response: healthData
        };
      } catch (error: any) {
        diagnostics.checks.health = {
          status: 'fail',
          message: 'Cannot reach server',
          error: error.message
        };
      }

      // Check 2: Test signup endpoint
      try {
        const signupUrl = `${window.location.origin.replace(/:\d+$/, '')}:54321/functions/v1/make-server-a24eaa40/auth/signup`;
        const testEmail = `test_${Date.now()}@example.com`;
        const signupResponse = await fetch(signupUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: 'test123456',
            name: 'Test User'
          })
        });
        const signupData = await signupResponse.json();
        diagnostics.checks.signup = {
          status: signupResponse.ok ? 'pass' : 'warn',
          message: signupResponse.ok ? 'Signup endpoint working' : signupData.error || 'Signup returned error',
          statusCode: signupResponse.status,
          response: signupData
        };
      } catch (error: any) {
        diagnostics.checks.signup = {
          status: 'fail',
          message: 'Cannot reach signup endpoint',
          error: error.message
        };
      }

      // Check 3: Test login endpoint (with invalid credentials - should return 401)
      try {
        const loginUrl = `${window.location.origin.replace(/:\d+$/, '')}:54321/functions/v1/make-server-a24eaa40/auth/login`;
        const loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
          })
        });
        const loginData = await loginResponse.json();
        diagnostics.checks.login = {
          status: loginResponse.status === 401 ? 'pass' : 'warn',
          message: loginResponse.status === 401 ? 'Login endpoint working (401 expected)' : 'Unexpected response',
          statusCode: loginResponse.status,
          response: loginData
        };
      } catch (error: any) {
        diagnostics.checks.login = {
          status: 'fail',
          message: 'Cannot reach login endpoint',
          error: error.message
        };
      }

      // Check 4: Environment info
      diagnostics.checks.environment = {
        status: 'info',
        message: 'Environment information',
        data: {
          origin: window.location.origin,
          hostname: window.location.hostname,
          isLocalhost: window.location.hostname === 'localhost',
          userAgent: navigator.userAgent
        }
      };

    } catch (error: any) {
      diagnostics.error = error.message;
    }

    setResults(diagnostics);
    setChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warn':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <Card className="w-96 max-h-[500px] overflow-y-auto p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Login Diagnostics</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={runDiagnostics}
            disabled={checking}
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recheck'}
          </Button>
        </div>

        {checking && !results && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Running diagnostics...</p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            {Object.entries(results.checks).map(([key, check]: [string, any]) => (
              <div key={key} className="border rounded-lg p-3">
                <div className="flex items-start gap-2">
                  {getStatusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm capitalize">{key}</h4>
                    <p className="text-xs text-gray-600 mt-1">{check.message}</p>
                    
                    {check.statusCode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {check.statusCode}
                      </p>
                    )}
                    
                    {check.error && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {check.error}
                      </p>
                    )}
                    
                    {check.response && check.status !== 'info' && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">
                          View response
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(check.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Quick Fixes:</h4>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• If health check fails: Server not running</li>
                <li>• If signup fails with "Server configuration error": Missing env vars</li>
                <li>• If login fails with "Invalid credentials": Normal (test account doesn't exist)</li>
                <li>• Try signing UP first, then sign IN</li>
              </ul>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                const summary = Object.entries(results.checks).map(([key, check]: [string, any]) => 
                  `${key}: ${check.status} - ${check.message}`
                ).join('\n');
                navigator.clipboard.writeText(JSON.stringify(results, null, 2));
                alert('Diagnostics copied to clipboard!\n\n' + summary);
              }}
            >
              Copy Full Report
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-3 text-center">
          Last check: {results?.timestamp ? new Date(results.timestamp).toLocaleTimeString() : 'Not run'}
        </p>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Debug component to clear community data cache
 * Use this if you're seeing community initialization errors
 */
export function CacheClearer() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const checkCacheStatus = () => {
    const hasFlag = localStorage.getItem('cps_community_initialized');
    return hasFlag ? 'cached' : 'clear';
  };

  const clearCache = () => {
    try {
      localStorage.removeItem('cps_community_initialized');
      setStatus('success');
      setMessage('Cache cleared! Refreshing in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  const cacheStatus = checkCacheStatus();

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trash2 className="w-5 h-5 text-orange-600" />
          Clear Community Data Cache
        </CardTitle>
        <CardDescription>
          Use this if you're seeing "Error initializing community data" in the console
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <Alert className={cacheStatus === 'cached' ? 'border-orange-300 bg-orange-100' : 'border-green-300 bg-green-100'}>
          <AlertTriangle className={`w-4 h-4 ${cacheStatus === 'cached' ? 'text-orange-600' : 'text-green-600'}`} />
          <AlertDescription>
            <strong>Cache Status:</strong>{' '}
            {cacheStatus === 'cached' ? (
              <span className="text-orange-700">Cached (may show errors)</span>
            ) : (
              <span className="text-green-700">Clear (no cache)</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={clearCache}
            disabled={status === 'success'}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <Alert className="border-green-300 bg-green-100">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="border-red-300 bg-red-100">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-2 pt-2 border-t">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Clears the community data initialization flag</li>
            <li>Forces a fresh initialization attempt</li>
            <li>Removes cached error states</li>
            <li>Refreshes the page to apply changes</li>
          </ul>
          <p className="mt-2">
            <strong>Alternative:</strong> Press F12, open console, and type:
          </p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1 text-xs">
            localStorage.removeItem('cps_community_initialized'); location.reload();
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

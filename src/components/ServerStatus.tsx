import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Server, RefreshCw } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

export function ServerStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/health`,
        { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status === 'ok' ? 'online' : 'error');
        setMessage(data.status === 'ok' ? 'Server Online' : 'Server Error');
        setLastChecked(new Date());
      } else {
        setStatus('error');
        setMessage(`Server returned ${response.status}`);
        setLastChecked(new Date());
      }
    } catch (error: any) {
      setStatus('offline');
      setMessage('Server Offline');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkServerStatus();
    // Check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-50 border-green-200';
      case 'offline':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-yellow-50 border-yellow-200';
      case 'checking':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Card className={`p-3 border-2 ${getStatusColor()} shadow-lg max-w-sm`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{message}</p>
            {lastChecked && (
              <p className="text-xs text-gray-600">
                Last check: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={checkServerStatus}
              disabled={status === 'checking'}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
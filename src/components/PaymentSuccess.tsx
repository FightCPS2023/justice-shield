import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface PaymentSuccessProps {
  sessionId: string;
  onContinue: () => void;
}

export function PaymentSuccess({ sessionId, onContinue }: PaymentSuccessProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the pending tier from localStorage
        const pendingTier = localStorage.getItem('cps_pending_tier');

        // In a real app, you'd verify the session with your backend
        // For now, we'll simulate the verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as successful
        if (pendingTier) {
          localStorage.setItem('cps_user_tier', pendingTier);
          localStorage.setItem('cps_subscription_status', 'active');
          localStorage.setItem('cps_subscription_date', new Date().toISOString());
          localStorage.removeItem('cps_pending_tier');
          localStorage.removeItem('cps_stripe_session_id');
        }

        setStatus('success');
        setMessage('Payment successful! Your subscription is now active.');

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          onContinue();
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [sessionId, onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-purple-600" />
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Alert className="border-green-300 bg-green-50 mb-4">
              <AlertDescription className="text-green-900 text-sm">
                You'll be redirected to your dashboard in a few seconds...
              </AlertDescription>
            </Alert>
            <Button onClick={onContinue} className="w-full bg-green-600 hover:bg-green-700">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button onClick={onContinue} variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

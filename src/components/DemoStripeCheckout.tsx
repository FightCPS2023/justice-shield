import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Check, Lock, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { completeDemoCheckout } from '../utils/stripe-demo';
import { toast } from 'sonner@2.0.3';

interface DemoStripeCheckoutProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function DemoStripeCheckout({ onSuccess, onCancel }: DemoStripeCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [email, setEmail] = useState('');
  const [planInfo, setPlanInfo] = useState<any>(null);

  useEffect(() => {
    // Load plan info from localStorage
    const plan = localStorage.getItem('stripe_demo_plan');
    const userEmail = localStorage.getItem('stripe_demo_user_email');
    
    if (plan) {
      setPlanInfo(JSON.parse(plan));
    }
    
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + ' / ' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace(/\s|\//g, '').length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Complete the demo checkout
      completeDemoCheckout(sessionId);
      
      toast.success('Payment Successful!', {
        description: `Demo subscription activated for ${planInfo?.name} plan`
      });

      // Redirect to success
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      toast.error('Session not found');
      setIsProcessing(false);
    }
  };

  if (!planInfo) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Secure Checkout</h1>
          </div>
          <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-900/20">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
              <strong>Demo Mode:</strong> This is a simulated Stripe checkout for demonstration purposes. 
              No real charges will be made. Use any test card number (e.g., 4242 4242 4242 4242).
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>

              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    required
                    disabled={isProcessing}
                    className="pr-10"
                  />
                  <CreditCard className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Test card: 4242 4242 4242 4242
                </p>
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM / YY"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="123"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Pay ${planInfo.price}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full"
              >
                Cancel
              </Button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>PCI Compliant</span>
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{planInfo.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-medium">Monthly</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${planInfo.price}.00/mo</span>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">What's included:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Full access to {planInfo.name} features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Powered by Stripe */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-blue-600">Stripe</span> (Demo Mode)
          </p>
        </div>
      </div>
    </div>
  );
}

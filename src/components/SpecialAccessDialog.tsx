import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Key, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription } from './ui/alert';

export function SpecialAccessDialog() {
  const { checkAccessCode, hasSpecialAccess, removeSpecialAccess } = useSubscription();
  const [code, setCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkAccessCode(code)) {
      setFeedback({ type: 'success', message: '✅ Special Access Granted! All premium features unlocked.' });
      setTimeout(() => {
        setIsOpen(false);
        setCode('');
        setFeedback(null);
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: '❌ Invalid access code. Please try again.' });
      setCode('');
    }
  };

  const handleRemoveAccess = () => {
    removeSpecialAccess();
    setFeedback({ type: 'success', message: 'Special access removed.' });
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={hasSpecialAccess ? "default" : "outline"}
          size="sm"
          className={hasSpecialAccess ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <Key className="w-4 h-4 mr-2" />
          {hasSpecialAccess ? 'Special Access Active' : 'Enter Access Code'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Special Access Code
          </DialogTitle>
          <DialogDescription>
            {hasSpecialAccess 
              ? 'You currently have special access to all premium features.'
              : 'Enter your special access code to unlock all premium features including Enterprise-level tools.'}
          </DialogDescription>
        </DialogHeader>

        {hasSpecialAccess ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                All premium features are unlocked with your special access code.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Special access includes:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Unlimited document uploads</li>
                <li>✓ Unlimited violation checks</li>
                <li>✓ 2,000 AI analysis credits</li>
                <li>✓ All Attorney & Enterprise features</li>
                <li>✓ Federal litigation tools</li>
                <li>✓ Multi-client management</li>
              </ul>
            </div>
            <Button 
              onClick={handleRemoveAccess}
              variant="outline"
              className="w-full"
            >
              Remove Special Access
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="access-code" className="text-sm font-medium">
                Access Code
              </label>
              <Input
                id="access-code"
                type="text"
                placeholder="Enter your code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="uppercase"
                autoComplete="off"
              />
            </div>

            {feedback && (
              <Alert className={feedback.type === 'success' 
                ? "bg-green-50 dark:bg-green-950 border-green-200" 
                : "bg-red-50 dark:bg-red-950 border-red-200"
              }>
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={feedback.type === 'success'
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
                }>
                  {feedback.message}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={!code.trim()}
            >
              Unlock Access
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

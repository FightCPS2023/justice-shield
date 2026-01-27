import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sparkles, ExternalLink, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

export function GeminiSetupGuide() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult('error');
      return;
    }

    setIsValidating(true);
    
    try {
      // Test the API key with a simple request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: 'Hello' }],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem('VITE_GEMINI_API_KEY', apiKey);
        setValidationResult('success');
      } else {
        setValidationResult('error');
      }
    } catch (error) {
      console.error('API key validation error:', error);
      setValidationResult('error');
    } finally {
      setIsValidating(false);
    }
  };

  const existingKey = localStorage.getItem('VITE_GEMINI_API_KEY');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <Sparkles className="size-6" />
          Gemini AI Setup Guide
        </h2>
        <p className="text-muted-foreground mt-2">
          Set up Google's Gemini AI to power document analysis and defense strategy generation
        </p>
      </div>

      {existingKey && (
        <Alert>
          <CheckCircle className="size-4" />
          <AlertDescription>
            <strong>API Key Already Configured!</strong> Your Gemini API key is set and ready to use.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-5" />
            Step 1: Get Your Free Gemini API Key
          </CardTitle>
          <CardDescription>
            Create a free API key from Google AI Studio (takes 2 minutes)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge>1</Badge>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Visit Google AI Studio:</strong> Go to{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    https://aistudio.google.com/apikey
                    <ExternalLink className="size-3" />
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge>2</Badge>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Sign in:</strong> Use your Google account (or create one if needed)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge>3</Badge>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Create API Key:</strong> Click "Create API Key" or "Get API Key"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge>4</Badge>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Copy the key:</strong> It will look something like{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    AIzaSyD9X2f3H8k5L1m4N6p7Q8r9S0t1U2v3W4x
                  </code>
                </p>
              </div>
            </div>
          </div>

          <Button asChild className="w-full">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4 mr-2" />
              Get Your Free API Key
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Enter Your API Key</CardTitle>
          <CardDescription>
            Paste your Gemini API key below to enable AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          {validationResult === 'success' && (
            <Alert>
              <CheckCircle className="size-4" />
              <AlertDescription>
                <strong>Success!</strong> Your API key is valid and has been saved.
              </AlertDescription>
            </Alert>
          )}

          {validationResult === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                <strong>Invalid API Key.</strong> Please check your key and try again.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleSaveApiKey} 
            className="w-full"
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Save API Key'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What You'll Get</CardTitle>
          <CardDescription>
            Gemini AI powers these features in your CPS case analyzer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">📄 Document Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Automatically analyze CPS documents to identify violations, rights issues, and defense opportunities
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">⚖️ Defense Strategies</h3>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive legal defense strategies based on your specific violations and case facts
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">📋 Motion Templates</h3>
              <p className="text-sm text-muted-foreground">
                Create properly formatted legal motions with citations and persuasive arguments
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">❓ Legal Q&A</h3>
              <p className="text-sm text-muted-foreground">
                Get answers to your legal questions with context from your specific case
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">🔍 Case Law Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Understand complex court opinions and how they apply to your CPS defense
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">📊 Violation Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Deep analysis of identified violations with legal remedies and evidence requirements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Sparkles className="size-4" />
        <AlertDescription>
          <strong>100% Free:</strong> Google provides a generous free tier for Gemini API with 15 requests per minute 
          and 1 million tokens per minute. This is more than enough for CPS case analysis. No credit card required.
        </AlertDescription>
      </Alert>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-sm">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 text-amber-600 flex-shrink-0" />
            <p>
              <strong>Privacy:</strong> Your API key is stored in your browser's local storage and is never sent to our servers.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 text-amber-600 flex-shrink-0" />
            <p>
              <strong>Security:</strong> Keep your API key private. Don't share it with others.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 text-amber-600 flex-shrink-0" />
            <p>
              <strong>Data:</strong> Your documents and case information are sent to Google's Gemini API for analysis. 
              Review <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="underline">
                Google's terms
              </a>.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 text-amber-600 flex-shrink-0" />
            <p>
              <strong>Legal Disclaimer:</strong> AI-generated analysis is for educational purposes only and does not 
              constitute legal advice. Consult with a qualified attorney.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

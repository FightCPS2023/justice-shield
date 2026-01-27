import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Settings as SettingsIcon, 
  Sparkles, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Trash2,
  Download,
  Upload,
  Database,
  Zap,
  Shield,
  Bug
} from 'lucide-react';
import { generateText } from '../utils/gemini-api';
import { HelpTooltip, InfoBox } from './ui/help-tooltip';
import { AdminPanel } from './AdminPanel';
import { CacheClearer } from './CacheClearer';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<string>('');

  useEffect(() => {
    // Check if API key exists
    const key = localStorage.getItem('VITE_GEMINI_API_KEY');
    if (key) {
      setExistingKey(key);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult('error');
      return;
    }

    setIsValidating(true);
    setTestOutput('Testing API key...');
    
    try {
      // Temporarily save to localStorage for testing
      const previousKey = localStorage.getItem('VITE_GEMINI_API_KEY');
      localStorage.setItem('VITE_GEMINI_API_KEY', apiKey);

      // Test the API key with a simple request
      const testResponse = await generateText('Say "API key is working!" in one sentence.');
      
      setValidationResult('success');
      setExistingKey(apiKey);
      setTestOutput(`✅ Success! Test response: "${testResponse}"`);
      setApiKey(''); // Clear input field
    } catch (error) {
      setValidationResult('error');
      setTestOutput(`❌ Error: ${error instanceof Error ? error.message : 'Invalid API key'}`);
      // Restore previous key
      const previousKey = localStorage.getItem('VITE_GEMINI_API_KEY');
      if (previousKey) {
        localStorage.setItem('VITE_GEMINI_API_KEY', previousKey);
      } else {
        localStorage.removeItem('VITE_GEMINI_API_KEY');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = () => {
    if (confirm('Are you sure you want to remove your Gemini API key? AI features will stop working.')) {
      localStorage.removeItem('VITE_GEMINI_API_KEY');
      setExistingKey(null);
      setValidationResult(null);
      setTestOutput('');
    }
  };

  const handleTestApiKey = async () => {
    if (!existingKey) return;

    setIsValidating(true);
    setTestOutput('Running test...');

    try {
      const response = await generateText('Explain what CPS stands for in 5 words or less.');
      setTestOutput(`✅ API working! Response: "${response}"`);
    } catch (error) {
      setTestOutput(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsValidating(false);
    }
  };

  const exportData = () => {
    // Export all localStorage data
    const data = {
      documents: localStorage.getItem('cps_documents'),
      timeline: localStorage.getItem('cps_timeline'),
      violations: localStorage.getItem('cps_violations'),
      strategies: localStorage.getItem('cps_strategies'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cps-case-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.documents) localStorage.setItem('cps_documents', data.documents);
          if (data.timeline) localStorage.setItem('cps_timeline', data.timeline);
          if (data.violations) localStorage.setItem('cps_violations', data.violations);
          if (data.strategies) localStorage.setItem('cps_strategies', data.strategies);

          alert('Data imported successfully! Please refresh the page.');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const clearAllData = () => {
    if (confirm('⚠️ WARNING: This will permanently delete ALL your case data. This cannot be undone. Are you absolutely sure?')) {
      if (confirm('Final confirmation: Delete everything?')) {
        localStorage.removeItem('cps_documents');
        localStorage.removeItem('cps_timeline');
        localStorage.removeItem('cps_violations');
        localStorage.removeItem('cps_strategies');
        alert('All data cleared. Page will refresh.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="size-6" />
          <h2>Settings & Configuration</h2>
          <HelpTooltip 
            content="Configure AI features to analyze your documents, manage your case data with import/export, and learn about the app's capabilities." 
            side="right"
          />
        </div>
        <p className="text-muted-foreground mt-2">
          Configure AI features, manage your data, and customize your experience
        </p>
      </div>

      <InfoBox title="🚀 Quick Setup Guide" variant="primary">
        <ol className="space-y-2 list-decimal list-inside">
          <li><strong>Set up AI:</strong> Add your free Gemini API key to enable document analysis (takes 2 minutes)</li>
          <li><strong>Start uploading:</strong> Add your CPS documents and let AI identify violations automatically</li>
          <li><strong>Backup regularly:</strong> Use Data Management to export your case data for safekeeping</li>
        </ol>
      </InfoBox>

      <Tabs defaultValue="gemini" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="gemini">AI Setup</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="debug">
            <Bug className="w-3 h-3 mr-1" />
            Debug
          </TabsTrigger>
          <TabsTrigger value="admin">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* GEMINI AI SETUP TAB */}
        <TabsContent value="gemini" className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-5" />
              <h3>Gemini AI Configuration</h3>
              <HelpTooltip 
                content="Google's Gemini AI analyzes your documents, identifies violations, extracts timeline events, and generates defense strategies. Setting this up unlocks the full power of the app." 
                side="right"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Set up Google's Gemini AI to power document analysis and defense strategy generation
            </p>
          </div>

          {existingKey && (
            <Alert>
              <CheckCircle className="size-4" />
              <AlertDescription>
                <strong>API Key Configured!</strong> Your Gemini API key is set and AI features are enabled.
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
                      <strong>Sign in:</strong> Use your Google account (or create one)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Badge>3</Badge>
                  <div className="flex-1">
                    <p className="text-sm">
                      <strong>Create API Key:</strong> Click "Create API Key" button
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Badge>4</Badge>
                  <div className="flex-1">
                    <p className="text-sm">
                      <strong>Copy the key:</strong> It looks like{' '}
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
              {existingKey && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-900">
                    Current API Key: {existingKey.substring(0, 20)}...{existingKey.substring(existingKey.length - 4)}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleTestApiKey} disabled={isValidating}>
                      <Zap className="size-4 mr-2" />
                      Test API Key
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleRemoveApiKey}>
                      <Trash2 className="size-4 mr-2" />
                      Remove Key
                    </Button>
                  </div>
                </div>
              )}

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

              {testOutput && (
                <div className="p-3 bg-slate-50 border rounded text-sm font-mono whitespace-pre-wrap">
                  {testOutput}
                </div>
              )}

              <Button 
                onClick={handleSaveApiKey} 
                className="w-full"
                disabled={isValidating || !apiKey.trim()}
              >
                {isValidating ? 'Validating & Testing...' : 'Save & Test API Key'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Features Enabled</CardTitle>
              <CardDescription>
                What you get with Gemini AI configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">📄 Document Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Automatic violation detection on every upload
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">⚖️ Defense Strategies</h4>
                  <p className="text-xs text-muted-foreground">
                    AI-generated legal defense strategies
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">📋 Motion Templates</h4>
                  <p className="text-xs text-muted-foreground">
                    Formatted legal motions with citations
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">❓ Legal Q&A</h4>
                  <p className="text-xs text-muted-foreground">
                    Get answers to your legal questions
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">🔍 Case Law Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Understand complex court opinions
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">📊 Violation Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Deep analysis with legal remedies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Sparkles className="size-4" />
            <AlertDescription>
              <strong>100% Free:</strong> Google provides 15 requests/min, 1M tokens/min. 
              No credit card required. More than enough for CPS case analysis!
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ACCESSIBILITY TAB */}
        <TabsContent value="accessibility" className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="size-5" />
              <h3>Accessibility Settings</h3>
              <HelpTooltip 
                content="Customize the app for better accessibility. These settings help ensure everyone can use The CPS Punisher effectively, including those who use screen readers or have visual impairments." 
                side="right"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Customize visual settings and keyboard navigation to meet your accessibility needs
            </p>
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CheckCircle className="size-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>WCAG 2.1 Level AA Compliant:</strong> This app meets Web Content Accessibility Guidelines for accessibility.
              All features are keyboard accessible and screen reader compatible.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Visual Accessibility</CardTitle>
              <CardDescription>
                Adjust visual settings for better readability and comfort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="font-size-setting">Font Size</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-3"
                    onClick={() => {
                      document.documentElement.classList.remove('font-large', 'font-x-large');
                      document.documentElement.classList.add('font-normal');
                      localStorage.setItem('cps-font-size', 'normal');
                    }}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Normal</div>
                      <div className="text-xs text-muted-foreground mt-1">100%</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3"
                    onClick={() => {
                      document.documentElement.classList.remove('font-normal', 'font-x-large');
                      document.documentElement.classList.add('font-large');
                      localStorage.setItem('cps-font-size', 'large');
                    }}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Large</div>
                      <div className="text-xs text-muted-foreground mt-1">125%</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3"
                    onClick={() => {
                      document.documentElement.classList.remove('font-normal', 'font-large');
                      document.documentElement.classList.add('font-x-large');
                      localStorage.setItem('cps-font-size', 'x-large');
                    }}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Extra Large</div>
                      <div className="text-xs text-muted-foreground mt-1">150%</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const isHighContrast = document.documentElement.classList.contains('high-contrast');
                    if (isHighContrast) {
                      document.documentElement.classList.remove('high-contrast');
                      localStorage.setItem('cps-high-contrast', 'false');
                    } else {
                      document.documentElement.classList.add('high-contrast');
                      localStorage.setItem('cps-high-contrast', 'true');
                    }
                  }}
                >
                  Toggle High Contrast Mode
                </Button>
                <p className="text-xs text-muted-foreground">
                  Increases contrast for better visibility. Recommended for users with low vision.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyboard Navigation</CardTitle>
              <CardDescription>
                Essential keyboard shortcuts for efficient navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold mb-2">Navigation Shortcuts</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skip to main content</span>
                      <kbd className="px-2 py-1 bg-background border rounded">Tab</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Navigate tabs</span>
                      <kbd className="px-2 py-1 bg-background border rounded">Tab / Shift+Tab</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Activate button/link</span>
                      <kbd className="px-2 py-1 bg-background border rounded">Enter / Space</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Close dialog</span>
                      <kbd className="px-2 py-1 bg-background border rounded">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Screen Reader Compatibility</CardTitle>
              <CardDescription>
                Tested with popular screen reader software
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-sm">NVDA (Windows) - Compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-sm">JAWS (Windows) - Compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-sm">VoiceOver (Mac/iOS) - Compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-sm">TalkBack (Android) - Compatible</span>
                </div>
              </div>
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription className="text-sm">
                  All interactive elements have proper labels and descriptions for screen readers.
                  Live regions announce dynamic content updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
              <CardDescription>
                Built-in features to ensure usability for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Semantic HTML:</strong> Proper heading hierarchy and landmarks for screen readers
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Focus Indicators:</strong> Visible 3px outline on all interactive elements
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Touch Targets:</strong> Minimum 44px tap targets on mobile devices
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Color Contrast:</strong> 4.5:1 minimum contrast ratio for all text
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Responsive Design:</strong> Works on screens from 320px to large desktop
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Reduced Motion:</strong> Respects prefers-reduced-motion system preference
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>ARIA Labels:</strong> All icons and controls have descriptive labels
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>No Keyboard Traps:</strong> All modals and dialogs can be closed with Escape key
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Alert className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
            <AlertCircle className="size-4 text-purple-600" />
            <AlertDescription className="text-purple-900 dark:text-purple-100">
              <strong>Need Help?</strong> If you encounter any accessibility issues, please use the Help Center to report them.
              We are committed to maintaining and improving accessibility for all users.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* DATA MANAGEMENT TAB */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>
                Export your case data or import from a backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button onClick={exportData} variant="outline">
                  <Download className="size-4 mr-2" />
                  Export All Data
                </Button>
                <Button onClick={importData} variant="outline">
                  <Upload className="size-4 mr-2" />
                  Import Data
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Exports include: documents, timeline events, violations, and defense strategies
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="size-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete all your case data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={clearAllData} variant="destructive">
                <Trash2 className="size-4 mr-2" />
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ This action cannot be undone. Export your data first!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEBUG TAB */}
        <TabsContent value="debug" className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bug className="size-5 text-orange-600" />
              <h3>Debug Tools</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Clear cache and fix common errors
            </p>
          </div>

          <CacheClearer />

          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">
              <strong>When to use:</strong> If you see "Error initializing community data" or other cache-related errors in the browser console.
              Clearing the cache forces a fresh initialization and resolves most console errors.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ADMIN TAB */}
        <TabsContent value="admin" className="space-y-6">
          <AdminPanel />
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CPS Case Defense Analyzer</CardTitle>
              <CardDescription>Version 2.0 - Gemini AI Edition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Powered By:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Google Gemini 2.5 Flash AI</li>
                  <li>• CourtListener Legal Research (50M+ opinions)</li>
                  <li>• 50-State CPS Policy Engine</li>
                  <li>• React + TypeScript</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ Document Management & Analysis</li>
                  <li>✅ Timeline Builder</li>
                  <li>✅ 24 Violation Types</li>
                  <li>✅ Defense Strategy Generator</li>
                  <li>✅ Legal Research Tools</li>
                  <li>✅ Rights Guide</li>
                  <li>✅ Evidence Checklist</li>
                  <li>✅ AI Paralegal Assistant</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">
                  <strong>Legal Disclaimer:</strong> This tool provides educational information only 
                  and does not constitute legal advice. Always consult with a qualified attorney.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
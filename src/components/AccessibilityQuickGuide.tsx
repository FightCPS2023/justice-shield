import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  Keyboard, 
  Eye, 
  MousePointer, 
  Volume2, 
  Palette, 
  Type,
  CheckCircle,
  Info
} from "lucide-react";

export function AccessibilityQuickGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Accessibility Quick Guide</h2>
        <p className="text-muted-foreground">
          The CPS Punisher is designed to be accessible to everyone. Here's how to get the most out of our accessibility features.
        </p>
      </div>

      <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CheckCircle className="size-4 text-green-600" />
        <AlertDescription className="text-green-900 dark:text-green-100">
          <strong>WCAG 2.1 Level AA Certified:</strong> This application meets international accessibility standards.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Keyboard Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="size-5 text-blue-600" />
              <CardTitle className="text-lg">Keyboard Navigation</CardTitle>
            </div>
            <CardDescription>Navigate without a mouse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Move between elements</span>
                <Badge variant="outline">Tab</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Move backwards</span>
                <Badge variant="outline">Shift + Tab</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Activate button/link</span>
                <Badge variant="outline">Enter</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Toggle checkbox</span>
                <Badge variant="outline">Space</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Close dialog</span>
                <Badge variant="outline">Escape</Badge>
              </div>
            </div>
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Info className="size-4" />
              <AlertDescription className="text-xs">
                Press Tab when the page loads to see the "Skip to main content" link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Screen Readers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Volume2 className="size-5 text-purple-600" />
              <CardTitle className="text-lg">Screen Readers</CardTitle>
            </div>
            <CardDescription>Compatible with popular screen readers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm">NVDA (Windows)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm">JAWS (Windows)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm">VoiceOver (Mac/iOS)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm">TalkBack (Android)</span>
              </div>
            </div>
            <Alert className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <Info className="size-4" />
              <AlertDescription className="text-xs">
                All buttons, links, and form fields have descriptive labels for screen readers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Visual Customization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="size-5 text-amber-600" />
              <CardTitle className="text-lg">Visual Settings</CardTitle>
            </div>
            <CardDescription>Customize for better visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="size-4" />
                <span className="text-sm"><strong>Font Size:</strong> Normal, Large, or Extra Large</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="size-4" />
                <span className="text-sm"><strong>High Contrast:</strong> Improved visibility</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="size-4" />
                <span className="text-sm"><strong>Focus Indicators:</strong> 3px visible outlines</span>
              </div>
            </div>
            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <Info className="size-4" />
              <AlertDescription className="text-xs">
                Access these settings in Settings → Accessibility tab.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Touch & Mobile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MousePointer className="size-5 text-green-600" />
              <CardTitle className="text-lg">Touch & Mobile</CardTitle>
            </div>
            <CardDescription>Optimized for touch screens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Minimum 44px tap targets on all buttons</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">No accidental activations</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Works on screens from 320px to desktop</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Portrait and landscape orientations</span>
              </div>
            </div>
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <Info className="size-4" />
              <AlertDescription className="text-xs">
                All features work perfectly on phones, tablets, and desktops.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Accessibility Features</CardTitle>
          <CardDescription>Built-in features that work automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-sm">Semantic HTML</strong>
                <p className="text-xs text-muted-foreground">Proper heading hierarchy for screen readers</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-sm">Color Contrast</strong>
                <p className="text-xs text-muted-foreground">4.5:1 minimum contrast ratio on all text</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-sm">Reduced Motion</strong>
                <p className="text-xs text-muted-foreground">Respects system motion preferences</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-sm">No Keyboard Traps</strong>
                <p className="text-xs text-muted-foreground">Always possible to navigate away</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-sm">Live Regions</strong>
                <p className="text-xs text-muted-foreground">Screen readers announce dynamic updates</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-sm">Error Prevention</strong>
                <p className="text-xs text-muted-foreground">Clear error messages with suggestions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          <strong>Need Help?</strong> If you encounter any accessibility issues or have suggestions for improvement,
          please contact us through the Help Center. We're committed to making The CPS Punisher accessible to everyone.
        </AlertDescription>
      </Alert>
    </div>
  );
}

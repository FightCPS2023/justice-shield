import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { FolderOpen, AlertCircle, Plus } from 'lucide-react';

interface NoCaseSelectedProps {
  onCreateCase: () => void;
}

export function NoCaseSelected({ onCreateCase }: NoCaseSelectedProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          No Case Selected
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          You need to create or select a case to use this feature. Each case keeps its documents, timeline, violations, and analysis organized separately.
        </AlertDescription>
      </Alert>

      <Card className="mt-6 p-12 text-center">
        <FolderOpen className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-3">Create Your First Case</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start by creating a case to organize all your CPS-related documents, timeline events, violations, and defense strategies in one place.
        </p>
        <Button onClick={onCreateCase} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create New Case
        </Button>
      </Card>

      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-center">What You Can Track in Each Case:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">📄 Case Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Docket number and case name</li>
              <li>• Court and jurisdiction details</li>
              <li>• Case worker information</li>
              <li>• Important dates and deadlines</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2">👨‍👩‍👧‍👦 Family Details</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Children involved</li>
              <li>• Key dates and milestones</li>
              <li>• Case status tracking</li>
              <li>• Custom notes and context</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2">📁 Documents & Evidence</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload and organize documents</li>
              <li>• AI-powered analysis</li>
              <li>• Violation detection</li>
              <li>• Evidence tracking</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2">⚖️ Defense Strategy</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Timeline building</li>
              <li>• Violation documentation</li>
              <li>• Legal strategy generation</li>
              <li>• Federal civil rights tools</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

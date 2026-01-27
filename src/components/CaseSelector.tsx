import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, FolderOpen, AlertCircle, Edit, Trash2, MoreVertical } from 'lucide-react';
import type { CaseData } from './CaseManager';
import { Alert, AlertDescription } from './ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useState } from 'react';

interface CaseSelectorProps {
  cases: CaseData[];
  activeCase: CaseData | null;
  onSelectCase: (caseId: string) => void;
  onCreateCase: () => void;
  onEditCase: (caseData: CaseData) => void;
  onDeleteCase: (caseId: string) => void;
}

export function CaseSelector({ cases, activeCase, onSelectCase, onCreateCase, onEditCase, onDeleteCase }: CaseSelectorProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteConfirmId) {
      onDeleteCase(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (cases.length === 0) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm text-yellow-800">
            No cases created yet. Create your first case to get started.
          </span>
          <Button size="sm" onClick={onCreateCase} className="ml-4">
            <Plus className="w-4 h-4 mr-1" />
            Create Case
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <div className="flex items-center gap-2 flex-1">
          <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
          <Select
            value={activeCase?.id || ''}
            onValueChange={onSelectCase}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a case">
                {activeCase && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{activeCase.caseName}</span>
                    <span className="text-muted-foreground text-sm">
                      ({activeCase.docketNumber})
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cases.map((caseItem) => (
                <SelectItem key={caseItem.id} value={caseItem.id}>
                  <div className="flex flex-col">
                    <div className="font-semibold">{caseItem.caseName}</div>
                    <div className="text-xs text-muted-foreground">
                      {caseItem.docketNumber} • {caseItem.county} • {caseItem.status}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Edit/Delete Active Case */}
        {activeCase && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditCase(activeCase)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Case
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteConfirmId(activeCase.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Case
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button size="sm" onClick={onCreateCase} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-1" />
          New Case
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this case and all associated data (documents, timeline, 
              violations, etc.). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
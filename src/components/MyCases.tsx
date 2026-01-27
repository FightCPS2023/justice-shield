import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FolderOpen, Edit, Trash2, Calendar, Users, 
  Scale, Briefcase, Plus, FileText, MoreVertical 
} from 'lucide-react';
import type { CaseData } from './CaseManager';
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

interface MyCasesProps {
  cases: CaseData[];
  activeCase: CaseData | null;
  onSelectCase: (caseId: string) => void;
  onEditCase: (caseData: CaseData) => void;
  onDeleteCase: (caseId: string) => void;
  onCreateCase: () => void;
}

export function MyCases({ 
  cases, 
  activeCase, 
  onSelectCase, 
  onEditCase, 
  onDeleteCase, 
  onCreateCase 
}: MyCasesProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteConfirmId) {
      onDeleteCase(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary" />
            My Cases
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your CPS cases in one place
          </p>
        </div>
        <Button onClick={onCreateCase} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create New Case
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-bold">{cases.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-blue-600">
                {cases.filter(c => c.status === 'Open').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {cases.filter(c => c.status === 'In Progress').length}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-yellow-600 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-2xl font-bold text-gray-600">
                {cases.filter(c => c.status === 'Closed').length}
              </p>
            </div>
            <Scale className="w-8 h-8 text-gray-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Cases Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first case to start organizing your CPS defense strategy
          </p>
          <Button onClick={onCreateCase} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Case
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className={`p-5 hover:shadow-lg transition-all cursor-pointer ${
                activeCase?.id === caseItem.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectCase(caseItem.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{caseItem.caseName}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {caseItem.docketNumber}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCase(caseItem);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Case
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(caseItem.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Case
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Badge */}
              <Badge className={`${getStatusColor(caseItem.status)} mb-3`}>
                {caseItem.status}
              </Badge>

              {/* Case Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Scale className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{caseItem.county}</span>
                </div>
                
                {caseItem.caseWorkerName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{caseItem.caseWorkerName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Opened: {formatDate(caseItem.dateOpened)}</span>
                </div>

                {caseItem.children && caseItem.children.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {caseItem.children.length} {caseItem.children.length === 1 ? 'child' : 'children'}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Badge */}
              {activeCase?.id === caseItem.id && (
                <div className="mt-4 pt-3 border-t">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                    Active Case
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
}
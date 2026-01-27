import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Shield,
  CheckCircle,
  XCircle,
  Users,
  Link as LinkIcon,
  UserCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { adminApi, type Advocate, type ResourceLink } from '../utils/communityApi';

export function AdminPanel() {
  const [pendingAdvocates, setPendingAdvocates] = useState<Advocate[]>([]);
  const [pendingResources, setPendingResources] = useState<ResourceLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const [advocates, resources] = await Promise.all([
        adminApi.getPendingAdvocates(),
        adminApi.getPendingResources(),
      ]);
      setPendingAdvocates(advocates);
      setPendingResources(resources);
    } catch (error: any) {
      console.log('ℹ️ Admin panel in demo mode (server not deployed)');
      
      // Don't show error toasts for "Server not deployed yet"
      if (!error.message?.includes('Server not deployed') && 
          !error.message?.includes('Server is not responding')) {
        toast.error('Failed to load pending items');
      }
      
      // Fall back to empty arrays
      setPendingAdvocates([]);
      setPendingResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAdvocate = async (id: string) => {
    try {
      const result = await adminApi.approveAdvocate(id);
      toast.success(result.message);
      // Remove from pending list
      setPendingAdvocates(prev => prev.filter(a => a.id !== id));
    } catch (error: any) {
      console.error('Error approving advocate:', error);
      toast.error(error.message || 'Failed to approve advocate');
    }
  };

  const handleApproveResource = async (id: string) => {
    try {
      const result = await adminApi.approveResource(id);
      toast.success(result.message);
      // Remove from pending list
      setPendingResources(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      console.error('Error approving resource:', error);
      toast.error(error.message || 'Failed to approve resource');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading pending items...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-7 h-7 text-purple-600" />
            Admin Panel - Community Hub
          </CardTitle>
          <CardDescription className="text-base">
            Review and approve pending advocate signups and resource submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {pendingAdvocates.length} Pending Advocates
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <LinkIcon className="w-4 h-4 mr-2" />
              {pendingResources.length} Pending Resources
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="advocates">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="advocates" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Advocates ({pendingAdvocates.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Resources ({pendingResources.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Advocates */}
        <TabsContent value="advocates" className="space-y-4">
          {pendingAdvocates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No pending advocate applications to review.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingAdvocates.map(advocate => (
              <Card key={advocate.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {advocate.type === 'attorney' ? (
                          <Badge className="bg-blue-600">Attorney</Badge>
                        ) : (
                          <Badge className="bg-purple-600">Advocate</Badge>
                        )}
                        {advocate.name}
                      </CardTitle>
                      <CardDescription>{advocate.credentials}</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong>Email:</strong> {advocate.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {advocate.phone}
                    </div>
                    <div>
                      <strong>State:</strong> {advocate.state}
                    </div>
                    <div>
                      <strong>County:</strong> {advocate.county || 'N/A'}
                    </div>
                    {advocate.barNumber && (
                      <div>
                        <strong>Bar #:</strong> {advocate.barNumber}
                      </div>
                    )}
                    {advocate.yearsExperience && (
                      <div>
                        <strong>Experience:</strong> {advocate.yearsExperience} years
                      </div>
                    )}
                  </div>

                  {/* About */}
                  <div>
                    <strong className="text-sm">About:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{advocate.about}</p>
                  </div>

                  {/* Cities */}
                  <div>
                    <strong className="text-sm">Service Areas:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {advocate.cities.map((city, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <strong className="text-sm">Specializations:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {advocate.specializations.map((spec, i) => (
                        <Badge key={i} className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Rates */}
                  {advocate.rates && (
                    <div className="text-sm">
                      <strong>Rates:</strong> {advocate.rates}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApproveAdvocate(advocate.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement reject
                        toast.info('Reject functionality coming soon');
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Resources */}
        <TabsContent value="resources" className="space-y-4">
          {pendingResources.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No pending resource submissions to review.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingResources.map(resource => (
              <Card key={resource.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{resource.title}</CardTitle>
                      <CardDescription className="mt-2">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {resource.url}
                          <LinkIcon className="w-3 h-3" />
                        </a>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge>{resource.category}</Badge>
                    <Badge variant="outline">{resource.type}</Badge>
                    {resource.state && (
                      <Badge variant="secondary">{resource.state}</Badge>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <strong className="text-sm">Description:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {resource.tags.length > 0 && (
                    <div>
                      <strong className="text-sm">Tags:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {resource.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted By */}
                  <div className="text-xs text-muted-foreground">
                    Submitted by {resource.submittedBy} on{' '}
                    {new Date(resource.dateAdded).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApproveResource(resource.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement reject
                        toast.info('Reject functionality coming soon');
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription className="text-sm">
          <strong>Review Guidelines:</strong> Verify all contact information, check website legitimacy,
          ensure qualifications are accurate, and confirm service areas. Only approve legitimate professionals
          and helpful resources that will benefit families fighting CPS.
        </AlertDescription>
      </Alert>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  ExternalLink,
  Link as LinkIcon,
  Globe,
  Search,
  Plus,
  ThumbsUp,
  Flag,
  Star,
  BookOpen,
  Video,
  FileText,
  Users,
  Phone,
  Shield,
  Scale,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { resourceApi, type ResourceLink as ResourceLinkType } from '../utils/communityApi';

interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  type: 'organization' | 'legal-resource' | 'educational' | 'support-group' | 'blog' | 'video' | 'document';
  state?: string;
  upvotes: number;
  submittedBy: string;
  dateAdded: string;
  verified: boolean;
  tags: string[];
}

interface ResourceLinksProps {
  userState: string;
}

export function ResourceLinks({ userState }: ResourceLinksProps) {
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    description: '',
    category: 'legal-help',
    type: 'organization' as ResourceLink['type'],
    state: userState,
    tags: [] as string[],
  });

  // Load resources from backend
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceApi.getAll();
      setResources(data);
      setFilteredResources(data);
    } catch (error: any) {
      console.log('ℹ️ Resource hub in demo mode (server not deployed)');
      
      // Don't show error toasts for "Server not deployed yet"
      if (!error.message?.includes('Server not deployed') && 
          !error.message?.includes('Server is not responding')) {
        toast.error('Failed to load resources. Please try again.');
      }
      
      setResources([]);
      setFilteredResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter resources
  useEffect(() => {
    let filtered = [...resources];

    if (filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === filterCategory);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort by upvotes
    filtered.sort((a, b) => b.upvotes - a.upvotes);

    setFilteredResources(filtered);
  }, [resources, filterCategory, filterType, searchQuery]);

  const handleSubmitResource = async () => {
    if (!newResource.title || !newResource.url || !newResource.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await resourceApi.create({
        ...newResource,
        submittedBy: 'User', // TODO: Get from auth context
      });

      toast.success(response.message);
      setIsAddingResource(false);
      setNewResource({
        title: '',
        url: '',
        description: '',
        category: 'legal-help',
        type: 'organization',
        state: userState,
        tags: [],
      });
      
      // Reload resources to show pending submission
      loadResources();
    } catch (error: any) {
      console.error('Error submitting resource:', error);
      toast.error(error.message || 'Failed to submit resource');
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      // Use a simple user ID from localStorage (in production, use auth)
      const userId = localStorage.getItem('cpsUserId') || crypto.randomUUID();
      if (!localStorage.getItem('cpsUserId')) {
        localStorage.setItem('cpsUserId', userId);
      }

      const updated = await resourceApi.upvote(id, userId);
      
      // Update local state
      setResources(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      
      toast.success('Thank you for your vote!');
    } catch (error: any) {
      console.error('Error upvoting resource:', error);
      if (error.message.includes('already upvoted')) {
        toast.info('You\'ve already upvoted this resource');
      } else {
        toast.error('Failed to upvote resource');
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal-help':
        return <Scale className="w-5 h-5" />;
      case 'advocacy':
        return <Shield className="w-5 h-5" />;
      case 'education':
        return <BookOpen className="w-5 h-5" />;
      case 'support':
        return <Heart className="w-5 h-5" />;
      default:
        return <LinkIcon className="w-5 h-5" />;
    }
  };

  const getTypeIcon = (type: ResourceLink['type']) => {
    switch (type) {
      case 'organization':
        return <Users className="w-4 h-4" />;
      case 'legal-resource':
        return <FileText className="w-4 h-4" />;
      case 'educational':
        return <BookOpen className="w-4 h-4" />;
      case 'support-group':
        return <Heart className="w-4 h-4" />;
      case 'blog':
        return <Globe className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Globe className="w-7 h-7 text-green-600" />
            Community Resource Links
          </CardTitle>
          <CardDescription className="text-base">
            Vetted websites, organizations, and resources to help you fight CPS and protect your family
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Plus className="w-4 h-4 text-blue-600" />
            <AlertDescription>
              <strong>Know a helpful resource?</strong> Submit websites, YouTube channels, support groups, or organizations that helped you!{' '}
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => setIsAddingResource(!isAddingResource)}
              >
                {isAddingResource ? 'Cancel' : 'Submit resource →'}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Submit Resource Form */}
      {isAddingResource && (
        <Card className="border-blue-300">
          <CardHeader>
            <CardTitle>Submit a Resource</CardTitle>
            <CardDescription>Help the community by sharing helpful resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Resource Title *</Label>
              <Input
                value={newResource.title}
                onChange={(e) =>
                  setNewResource({ ...newResource, title: e.target.value })
                }
                placeholder="National Coalition for Child Protection Reform"
              />
            </div>

            <div>
              <Label>Website URL *</Label>
              <Input
                type="url"
                value={newResource.url}
                onChange={(e) =>
                  setNewResource({ ...newResource, url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label>Description * (Why is this helpful?)</Label>
              <Textarea
                value={newResource.description}
                onChange={(e) =>
                  setNewResource({ ...newResource, description: e.target.value })
                }
                placeholder="Explain what this resource offers and how it helped you..."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={newResource.category}
                  onValueChange={(value) =>
                    setNewResource({ ...newResource, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal-help">Legal Help</SelectItem>
                    <SelectItem value="advocacy">Advocacy</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="support">Support Groups</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  value={newResource.type}
                  onValueChange={(value: any) =>
                    setNewResource({ ...newResource, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="legal-resource">Legal Resource</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="support-group">Support Group</SelectItem>
                    <SelectItem value="blog">Blog/Article</SelectItem>
                    <SelectItem value="video">Video/YouTube</SelectItem>
                    <SelectItem value="document">Documents/Templates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>State (if applicable)</Label>
                <Input
                  value={newResource.state}
                  onChange={(e) =>
                    setNewResource({ ...newResource, state: e.target.value })
                  }
                  placeholder="Texas"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddingResource(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitResource} className="flex-1">
                Submit Resource
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="legal-help">Legal Help</SelectItem>
                  <SelectItem value="advocacy">Advocacy</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="support">Support Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organization">Organizations</SelectItem>
                  <SelectItem value="legal-resource">Legal Resources</SelectItem>
                  <SelectItem value="support-group">Support Groups</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
          </h3>
          <p className="text-sm text-muted-foreground">Sorted by community votes</p>
        </div>

        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Upvote Section */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={() => handleUpvote(resource.id)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-bold">{resource.upvotes}</span>
                    <span className="text-xs text-muted-foreground">votes</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title & Badges */}
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <h4 className="text-lg font-bold flex items-center gap-2 flex-1">
                          {getCategoryIcon(resource.category)}
                          {resource.title}
                          {resource.verified && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(resource.type)}
                          {resource.type.replace('-', ' ')}
                        </Badge>
                        <Badge variant="secondary">{resource.category}</Badge>
                        {resource.state && (
                          <Badge variant="outline">{resource.state}</Badge>
                        )}
                        {resource.verified && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Submitted by {resource.submittedBy} •{' '}
                        {new Date(resource.dateAdded).toLocaleDateString()}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Visit Resource
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
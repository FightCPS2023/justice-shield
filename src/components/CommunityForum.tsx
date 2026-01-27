import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  MessageSquare, Plus, Search, Filter, TrendingUp, 
  Users, FileText, Video, Image, Send, Reply, 
  ThumbsUp, Flag, Pin, Lock, Eye, Crown, Upload,
  Calendar, User, ChevronDown, ChevronUp, Paperclip,
  Download, Shield, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PremiumLock } from './PremiumUpgrade';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner@2.0.3';

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  createdAt: string;
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video';
  url: string;
  size: string;
}

interface Reply {
  id: string;
  threadId: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  likes: number;
  attachments: Attachment[];
}

export function CommunityForum() {
  const { tier } = useSubscription();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'replies'>('recent');
  
  // New thread form
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[],
    attachments: [] as Attachment[]
  });

  // Reply form
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);

  // Mock current user (in production, get from auth)
  const currentUser = {
    id: 'user_123',
    name: 'Sarah M.',
    isPremium: tier === 'premium'
  };

  const categories = [
    { value: 'all', label: 'All Topics', icon: MessageSquare },
    { value: 'general', label: 'General Discussion', icon: MessageSquare },
    { value: 'legal-advice', label: 'Legal Strategy', icon: Shield },
    { value: 'violations', label: 'Violations & Rights', icon: AlertCircle },
    { value: 'success-stories', label: 'Success Stories', icon: CheckCircle2 },
    { value: 'court-prep', label: 'Court Preparation', icon: FileText },
    { value: 'documents', label: 'Document Sharing', icon: Paperclip },
    { value: 'support', label: 'Emotional Support', icon: Users },
  ];

  useEffect(() => {
    loadThreads();
    loadReplies();
  }, []);

  const loadThreads = () => {
    // Mock data - in production, load from backend
    const mockThreads: ForumThread[] = [
      {
        id: '1',
        title: 'Successfully Got Illegal Entry Evidence Suppressed - Here\'s How',
        content: 'After working with my attorney and using this app to identify violations, we successfully got all evidence from the illegal warrantless entry suppressed. The judge agreed that CPS violated our 4th Amendment rights. Here\'s what worked...',
        author: 'Jennifer K.',
        authorId: 'user_456',
        category: 'success-stories',
        createdAt: '2024-01-20T10:00:00Z',
        replies: 23,
        views: 456,
        likes: 67,
        isPinned: true,
        isLocked: false,
        tags: ['4th Amendment', 'Evidence Suppression', 'Victory'],
        attachments: [
          {
            id: 'att1',
            name: 'Motion_to_Suppress.pdf',
            type: 'document',
            url: '#',
            size: '245 KB'
          }
        ]
      },
      {
        id: '2',
        title: 'Template: Motion to Dismiss for Lack of Reasonable Efforts',
        content: 'I\'m sharing the motion template my attorney filed that resulted in our case being dismissed. The judge agreed CPS failed to make reasonable efforts. Feel free to use as reference with your attorney.',
        author: 'Michael T.',
        authorId: 'user_789',
        category: 'documents',
        createdAt: '2024-01-19T15:30:00Z',
        replies: 15,
        views: 234,
        likes: 45,
        isPinned: true,
        isLocked: false,
        tags: ['ASFA', 'Reasonable Efforts', 'Template'],
        attachments: [
          {
            id: 'att2',
            name: 'Motion_Reasonable_Efforts.docx',
            type: 'document',
            url: '#',
            size: '87 KB'
          }
        ]
      },
      {
        id: '3',
        title: 'CPS Caseworker Lied in Report - How to Prove It?',
        content: 'My caseworker wrote things in her report that never happened. I have recordings that contradict her statements. What\'s the best way to present this evidence to the court? Has anyone dealt with perjury issues?',
        author: 'Anonymous User',
        authorId: 'user_101',
        category: 'legal-advice',
        createdAt: '2024-01-18T09:15:00Z',
        replies: 31,
        views: 567,
        likes: 28,
        isPinned: false,
        isLocked: false,
        tags: ['False Reports', 'Evidence', 'Recordings'],
        attachments: []
      },
      {
        id: '4',
        title: 'Reunified After 8 Months - Timeline of What Worked',
        content: 'I finally got my kids back! Documenting everything and identifying CPS violations was crucial. Here\'s a detailed timeline of everything we did, all the motions filed, and what ultimately led to reunification.',
        author: 'David R.',
        authorId: 'user_202',
        category: 'success-stories',
        createdAt: '2024-01-17T14:20:00Z',
        replies: 42,
        views: 892,
        likes: 134,
        isPinned: false,
        isLocked: false,
        tags: ['Reunification', 'Success', 'Timeline'],
        attachments: [
          {
            id: 'att3',
            name: 'My_Case_Timeline.pdf',
            type: 'document',
            url: '#',
            size: '512 KB'
          }
        ]
      },
      {
        id: '5',
        title: 'Preparing for Court Hearing - What to Expect?',
        content: 'I have my first court hearing next week. I\'ve never been in family court before and I\'m nervous. Can anyone share what to expect, how to dress, what to say, and what NOT to say?',
        author: 'Lisa W.',
        authorId: 'user_303',
        category: 'court-prep',
        createdAt: '2024-01-16T11:45:00Z',
        replies: 18,
        views: 345,
        likes: 22,
        isPinned: false,
        isLocked: false,
        tags: ['Court Hearing', 'Advice', 'First Time'],
        attachments: []
      }
    ];
    setThreads(mockThreads);
  };

  const loadReplies = () => {
    // Mock replies - in production, load from backend
    const mockReplies: Reply[] = [
      {
        id: 'r1',
        threadId: '1',
        content: 'Thank you so much for sharing this! We\'re dealing with the same illegal entry issue. My attorney said we have a strong case. Did you use Caniglia v. Strom in your motion?',
        author: 'Robert M.',
        authorId: 'user_404',
        createdAt: '2024-01-20T11:30:00Z',
        likes: 12,
        attachments: []
      },
      {
        id: 'r2',
        threadId: '1',
        content: 'Yes! Caniglia v. Strom was the key case. The Supreme Court ruled that the "community caretaking" exception doesn\'t apply to homes. Make sure your attorney cites this. We also used Payton v. New York. I\'m attaching our motion as reference.',
        author: 'Jennifer K.',
        authorId: 'user_456',
        createdAt: '2024-01-20T12:15:00Z',
        likes: 23,
        attachments: [
          {
            id: 'att4',
            name: 'Our_Motion_Redacted.pdf',
            type: 'document',
            url: '#',
            size: '189 KB'
          }
        ]
      },
      {
        id: 'r3',
        threadId: '3',
        content: 'I went through the exact same thing. Present the recordings to your attorney ASAP. In my case, we filed a motion highlighting the contradictions and requested a hearing on caseworker credibility. The judge was NOT happy when the lies were exposed.',
        author: 'Thomas B.',
        authorId: 'user_505',
        createdAt: '2024-01-18T10:30:00Z',
        likes: 15,
        attachments: []
      },
      {
        id: 'r4',
        threadId: '3',
        content: 'Document EVERYTHING with timestamps. Make a chart showing her statement vs. what the recording actually says. Visual evidence is powerful. Also file a formal complaint with her supervisor.',
        author: 'Patricia L.',
        authorId: 'user_606',
        createdAt: '2024-01-18T11:00:00Z',
        likes: 19,
        attachments: []
      }
    ];
    setReplies(mockReplies);
  };

  if (tier === 'free') {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Community Forum
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              Premium Only
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect with other parents, share strategies, upload documents, and learn from success stories.
          </p>
        </div>

        <PremiumLock 
          feature="Community Forum Access"
          description="Join thousands of parents sharing strategies, success stories, and legal documents. Upload and share your own documents, ask questions, get support from people who understand what you're going through, and learn from those who've successfully navigated the system."
        />

        {/* Preview of forum */}
        <Card className="p-6 bg-muted/50">
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-5 h-5" />
            Preview: Recent Forum Activity
          </div>
          <div className="space-y-3 opacity-60">
            {[
              { title: 'Successfully Got Evidence Suppressed', replies: 23, category: 'Success Stories' },
              { title: 'Template: Motion to Dismiss', replies: 15, category: 'Documents' },
              { title: 'How to Prove Caseworker Lied', replies: 31, category: 'Legal Strategy' },
              { title: 'Reunified After 8 Months', replies: 42, category: 'Success Stories' }
            ].map((thread, idx) => (
              <Card key={idx} className="p-4 border-l-4 border-primary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1">{thread.title}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline">{thread.category}</Badge>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.replies} replies
                      </span>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const handleCreateThread = () => {
    if (!newThread.title || !newThread.content) {
      toast.error('Please fill in title and content');
      return;
    }

    const thread: ForumThread = {
      id: Date.now().toString(),
      title: newThread.title,
      content: newThread.content,
      author: currentUser.name,
      authorId: currentUser.id,
      category: newThread.category,
      createdAt: new Date().toISOString(),
      replies: 0,
      views: 0,
      likes: 0,
      isPinned: false,
      isLocked: false,
      tags: newThread.tags,
      attachments: newThread.attachments
    };

    setThreads(prev => [thread, ...prev]);
    setShowNewThread(false);
    setNewThread({
      title: '',
      content: '',
      category: 'general',
      tags: [],
      attachments: []
    });
    toast.success('Thread created successfully!');
  };

  const handleReply = () => {
    if (!replyContent || !selectedThread) {
      toast.error('Please enter a reply');
      return;
    }

    const reply: Reply = {
      id: Date.now().toString(),
      threadId: selectedThread.id,
      content: replyContent,
      author: currentUser.name,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      likes: 0,
      attachments: replyAttachments
    };

    setReplies(prev => [...prev, reply]);
    setReplyContent('');
    setReplyAttachments([]);
    
    // Update thread reply count
    setThreads(prev => prev.map(t => 
      t.id === selectedThread.id ? { ...t, replies: t.replies + 1 } : t
    ));
    
    toast.success('Reply posted!');
  };

  const handleFileUpload = (type: 'thread' | 'reply') => {
    // Mock file upload - in production, handle actual upload
    const mockAttachment: Attachment = {
      id: Date.now().toString(),
      name: 'uploaded_document.pdf',
      type: 'document',
      url: '#',
      size: '123 KB'
    };

    if (type === 'thread') {
      setNewThread(prev => ({
        ...prev,
        attachments: [...prev.attachments, mockAttachment]
      }));
    } else {
      setReplyAttachments(prev => [...prev, mockAttachment]);
    }
    
    toast.success('File uploaded!');
  };

  const filteredThreads = threads
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'replies':
          return b.replies - a.replies;
        default: // recent
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const threadReplies = selectedThread 
    ? replies.filter(r => r.threadId === selectedThread.id)
    : [];

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Community Forum
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
            Premium
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect with other parents fighting CPS. Share strategies, documents, and support each other.
        </p>
      </div>

      <Alert className="bg-green-50 border-green-200">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Safe & Confidential Community</AlertTitle>
        <AlertDescription className="text-green-800">
          This forum is for premium members only. Be respectful, support each other, and remember: 
          this is NOT legal advice. Always consult your attorney before taking action.
        </AlertDescription>
      </Alert>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions, topics, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="popular">Most Liked</SelectItem>
            <SelectItem value="replies">Most Replies</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowNewThread(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-2xl">{threads.length}</span>
          </div>
          <p className="text-xs text-muted-foreground">Active Threads</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-2xl">1,234</span>
          </div>
          <p className="text-xs text-muted-foreground">Community Members</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-2xl">456</span>
          </div>
          <p className="text-xs text-muted-foreground">Shared Documents</p>
        </Card>
      </div>

      {/* Thread List */}
      <div className="space-y-3">
        {filteredThreads.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No threads found</p>
          </Card>
        ) : (
          filteredThreads.map((thread) => (
            <Card 
              key={thread.id} 
              className={`p-5 cursor-pointer transition-all hover:border-primary ${
                thread.isPinned ? 'bg-amber-50 dark:bg-amber-950 border-amber-200' : ''
              }`}
              onClick={() => setSelectedThread(thread)}
            >
              <div className="flex gap-4">
                {/* Thread Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Thread Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    {thread.isPinned && (
                      <Pin className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="mb-1">{thread.title}</div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {thread.content}
                      </p>
                    </div>
                    {thread.isLocked && (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="outline">
                      {categories.find(c => c.value === thread.category)?.label || thread.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {thread.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {thread.replies} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {thread.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {thread.likes}
                    </span>
                    {thread.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {thread.attachments.length} files
                      </span>
                    )}
                  </div>

                  {thread.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {thread.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Thread Dialog */}
      <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Share your experience, ask questions, or upload helpful documents for the community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm mb-2 block">Category</label>
              <Select 
                value={newThread.category} 
                onValueChange={(value) => setNewThread(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== 'all').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Thread Title</label>
              <Input
                placeholder="Enter a clear, descriptive title..."
                value={newThread.title}
                onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm mb-2 block">Content</label>
              <Textarea
                placeholder="Share your story, ask your question, or provide details..."
                rows={8}
                value={newThread.content}
                onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm">Attachments</label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFileUpload('thread')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
              {newThread.attachments.length > 0 && (
                <div className="space-y-2">
                  {newThread.attachments.map((att) => {
                    const Icon = getAttachmentIcon(att.type);
                    return (
                      <div key={att.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm flex-1">{att.name}</span>
                        <span className="text-xs text-muted-foreground">{att.size}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setNewThread(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter(a => a.id !== att.id)
                          }))}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Community Guidelines</AlertTitle>
              <AlertDescription className="text-xs">
                • Be respectful and supportive • No personal attacks • Protect your privacy (use pseudonyms if needed) 
                • This is not legal advice • Consult your attorney before taking action
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewThread(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread}>
              <Send className="w-4 h-4 mr-2" />
              Post Thread
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thread Detail Dialog */}
      <Dialog open={!!selectedThread} onOpenChange={() => setSelectedThread(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedThread && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  {selectedThread.isPinned && (
                    <Pin className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedThread.title}</DialogTitle>
                    <DialogDescription className="mt-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline">
                          {categories.find(c => c.value === selectedThread.category)?.label}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs">
                          <User className="w-3 h-3" />
                          {selectedThread.author}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(selectedThread.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Original Post */}
                <Card className="p-6 bg-muted/50">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                    {selectedThread.content}
                  </p>

                  {selectedThread.attachments.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Attachments:</div>
                      {selectedThread.attachments.map((att) => {
                        const Icon = getAttachmentIcon(att.type);
                        return (
                          <div key={att.id} className="flex items-center gap-3 p-3 bg-background rounded">
                            <Icon className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <div className="text-sm">{att.name}</div>
                              <div className="text-xs text-muted-foreground">{att.size}</div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Like ({selectedThread.likes})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </Card>

                {/* Replies */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span>{threadReplies.length} Replies</span>
                  </div>

                  <div className="space-y-4">
                    {threadReplies.map((reply) => (
                      <Card key={reply.id} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{reply.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {reply.content}
                            </p>

                            {reply.attachments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {reply.attachments.map((att) => {
                                  const Icon = getAttachmentIcon(att.type);
                                  return (
                                    <div key={att.id} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                                      <Icon className="w-4 h-4" />
                                      <span className="flex-1">{att.name}</span>
                                      <span className="text-muted-foreground">{att.size}</span>
                                      <Button variant="ghost" size="sm">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-3">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {reply.likes}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Reply className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                {!selectedThread.isLocked && (
                  <Card className="p-4 bg-primary/5">
                    <div className="mb-3">Leave a Reply</div>
                    <Textarea
                      placeholder="Share your thoughts, advice, or experience..."
                      rows={4}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-3"
                    />

                    {replyAttachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {replyAttachments.map((att) => {
                          const Icon = getAttachmentIcon(att.type);
                          return (
                            <div key={att.id} className="flex items-center gap-2 p-2 bg-background rounded text-sm">
                              <Icon className="w-4 h-4" />
                              <span className="flex-1">{att.name}</span>
                              <span className="text-xs text-muted-foreground">{att.size}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setReplyAttachments(prev => prev.filter(a => a.id !== att.id))}
                              >
                                Remove
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleFileUpload('reply')}>
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach File
                      </Button>
                      <Button onClick={handleReply}>
                        <Send className="w-4 h-4 mr-2" />
                        Post Reply
                      </Button>
                    </div>
                  </Card>
                )}

                {selectedThread.isLocked && (
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Thread Locked</AlertTitle>
                    <AlertDescription>
                      This thread has been locked by moderators. No new replies can be added.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

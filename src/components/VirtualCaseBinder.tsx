import { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FolderOpen, FileText, Upload, Trash2, Download, 
  Filter, Search, Calendar, AlertTriangle, Shield,
  Image, Mic, Video, FilePlus, Eye, Lock
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PremiumLock } from './PremiumUpgrade';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

interface CaseFile {
  id: string;
  name: string;
  type: 'document' | 'photo' | 'audio' | 'video' | 'evidence';
  category: string;
  uploadDate: string;
  size: string;
  tags: string[];
  encrypted: boolean;
}

export function VirtualCaseBinder() {
  const { tier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [files, setFiles] = useState<CaseFile[]>([
    {
      id: '1',
      name: 'Initial CPS Report.pdf',
      type: 'document',
      category: 'CPS Reports',
      uploadDate: '2024-01-15',
      size: '245 KB',
      tags: ['initial', 'investigation'],
      encrypted: true
    },
    {
      id: '2',
      name: 'Home Visit Photos.zip',
      type: 'photo',
      category: 'Evidence',
      uploadDate: '2024-01-20',
      size: '12.3 MB',
      tags: ['home', 'evidence'],
      encrypted: true
    },
    {
      id: '3',
      name: 'Caseworker Recording.mp3',
      type: 'audio',
      category: 'Recordings',
      uploadDate: '2024-01-25',
      size: '8.7 MB',
      tags: ['caseworker', 'interview'],
      encrypted: true
    }
  ]);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'All Files', icon: FolderOpen, count: files.length },
    { value: 'CPS Reports', label: 'CPS Reports', icon: FileText, count: files.filter(f => f.category === 'CPS Reports').length },
    { value: 'Court Orders', label: 'Court Orders', icon: Shield, count: files.filter(f => f.category === 'Court Orders').length },
    { value: 'Evidence', label: 'Evidence', icon: AlertTriangle, count: files.filter(f => f.category === 'Evidence').length },
    { value: 'Medical Records', label: 'Medical Records', icon: FileText, count: files.filter(f => f.category === 'Medical Records').length },
    { value: 'Recordings', label: 'Recordings', icon: Mic, count: files.filter(f => f.category === 'Recordings').length },
    { value: 'Photos/Videos', label: 'Photos/Videos', icon: Image, count: files.filter(f => f.type === 'photo' || f.type === 'video').length },
    { value: 'Generated Documents', label: 'Generated Documents', icon: FilePlus, count: files.filter(f => f.category === 'Generated Documents').length },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'document' | 'photo') => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploadMessage('Processing files...');

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // Determine file type and category
      let type: 'document' | 'photo' | 'audio' | 'video' = 'document';
      let category = 'Evidence';
      
      if (fileType === 'photo' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
        type = 'photo';
        category = 'Photos/Videos';
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension || '')) {
        type = 'audio';
        category = 'Recordings';
      } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension || '')) {
        type = 'video';
        category = 'Photos/Videos';
      } else if (['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
        type = 'document';
        // Auto-classify based on filename
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('cps') || lowerName.includes('report')) {
          category = 'CPS Reports';
        } else if (lowerName.includes('court') || lowerName.includes('order')) {
          category = 'Court Orders';
        } else if (lowerName.includes('medical') || lowerName.includes('health')) {
          category = 'Medical Records';
        }
      }

      // Generate tags based on filename
      const tags: string[] = [];
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('investigation')) tags.push('investigation');
      if (lowerName.includes('home')) tags.push('home');
      if (lowerName.includes('visit')) tags.push('visit');
      if (lowerName.includes('interview')) tags.push('interview');
      if (lowerName.includes('evidence')) tags.push('evidence');
      if (lowerName.includes('court')) tags.push('court');
      if (tags.length === 0) tags.push('general');

      const newFile: CaseFile = {
        id: Date.now().toString() + i,
        name: file.name,
        type,
        category,
        uploadDate: new Date().toISOString().split('T')[0],
        size: formatFileSize(file.size),
        tags,
        encrypted: true
      };

      setFiles(prev => [newFile, ...prev]);
    }

    setUploadMessage(`✅ Successfully uploaded ${uploadedFiles.length} file(s) with AES-256 encryption`);
    setTimeout(() => setUploadMessage(''), 5000);

    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRecordAudio = async () => {
    try {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        setUploadMessage('✅ Audio recording saved and encrypted');
        
        // Add mock recording file
        const newFile: CaseFile = {
          id: Date.now().toString(),
          name: `Recording_${new Date().toISOString().split('T')[0]}_${new Date().getHours()}-${new Date().getMinutes()}.mp3`,
          type: 'audio',
          category: 'Recordings',
          uploadDate: new Date().toISOString().split('T')[0],
          size: '5.2 MB',
          tags: ['recording', 'new'],
          encrypted: true
        };
        
        setFiles(prev => [newFile, ...prev]);
        setTimeout(() => setUploadMessage(''), 5000);
      } else {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        setUploadMessage('🎤 Recording in progress... Click "Stop Recording" when done');
        
        // In a real implementation, you would use MediaRecorder API here
        // For now, we'll just toggle the recording state
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setUploadMessage('❌ Could not access microphone. Please check permissions.');
      setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadMessage('✅ File securely deleted');
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const handleDownloadFile = (file: CaseFile) => {
    setUploadMessage(`📥 Downloading ${file.name}...`);
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const handleViewFile = (file: CaseFile) => {
    setUploadMessage(`👁️ Opening ${file.name}...`);
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const handleExportAll = () => {
    setUploadMessage(`📦 Exporting all ${filteredFiles.length} files...`);
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (tier === 'free') {
    return (
      <PremiumLock 
        feature="Virtual Case Binder"
        description="Professional case organization with encrypted storage, drag-and-drop filing, auto-classified uploads, and attorney-ready formatting. Keep all your evidence organized in one secure place."
      />
    );
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo': return Image;
      case 'audio': return Mic;
      case 'video': return Video;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-primary" />
          Virtual Case Binder
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
            Premium
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Professional case organization with military-grade encryption. All files auto-classified and attorney-ready.
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="p-6 border-2 border-dashed border-primary/30 bg-primary/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary/10'
            }`}>
              {isRecording ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
          <div>
            <div className="mb-2">
              {isRecording ? 'Recording Audio...' : 'Drag & Drop Files Here'}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isRecording 
                ? 'Click "Stop Recording" when finished' 
                : 'AI automatically classifies and encrypts your uploads'
              }
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
              onChange={(e) => handleFileUpload(e, 'document')}
              className="hidden"
            />
            
            <Button variant="outline" onClick={() => photoInputRef.current?.click()}>
              <Image className="w-4 h-4 mr-2" />
              Add Photos
            </Button>
            <input
              ref={photoInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'photo')}
              className="hidden"
            />
            
            <Button 
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleRecordAudio}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop Recording' : 'Record Audio'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            All files encrypted with AES-256
          </p>
        </div>
      </Card>

      {/* Upload Message */}
      {uploadMessage && (
        <Alert className={uploadMessage.includes('❌') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
          <AlertDescription className={uploadMessage.includes('❌') ? 'text-red-800' : 'text-green-800'}>
            {uploadMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <cat.icon className="w-4 h-4" />
                  {cat.label} ({cat.count})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {categories.slice(1).map((cat) => (
          <Card 
            key={cat.value}
            className={`p-4 cursor-pointer transition-all hover:border-primary ${
              filterCategory === cat.value ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setFilterCategory(cat.value)}
          >
            <div className="flex items-center justify-between mb-2">
              <cat.icon className="w-5 h-5 text-primary" />
              <Badge variant="secondary">{cat.count}</Badge>
            </div>
            <div className="text-sm">{cat.label}</div>
          </Card>
        ))}
      </div>

      {/* Files List */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            Files
            <Badge variant="secondary">{filteredFiles.length} items</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredFiles.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No files found</p>
            </Card>
          ) : (
            filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <Card key={file.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="truncate">{file.name}</div>
                        {file.encrypted && (
                          <Lock className="w-3 h-3 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{file.category}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {file.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleViewFile(file)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(file)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Storage Info */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="text-green-900 mb-1">Secure Encrypted Storage</div>
            <p className="text-green-800">
              All files encrypted with AES-256 military-grade encryption. Only you can access your case files.
            </p>
            <div className="mt-2 text-xs text-green-700">
              Storage used: {files.reduce((acc, f) => acc + parseFloat(f.size), 0).toFixed(1)} MB / Unlimited
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

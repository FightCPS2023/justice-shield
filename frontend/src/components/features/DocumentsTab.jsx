import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api, { API_URL } from '../../lib/api';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DocumentAnalysisView from './DocumentAnalysisView';
import ForensicAnalyzerView from './ForensicAnalyzerView';

function DocumentsTab({ selectedCase }) {
  const { api } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('upload');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueDetails, setQueueDetails] = useState({});
  const [queueDetailsLoading, setQueueDetailsLoading] = useState({});
  const [activeQueueDocId, setActiveQueueDocId] = useState(null);
  const fileInputRef = React.useRef(null);
  const folderInputRef = React.useRef(null);
  const queuePollRef = useRef(null);
  const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.rtf', '.gif', '.webp', '.heic', '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB for documents/images
  const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50MB for audio/video

  // Helper to get icon for file type
  const getFileIcon = (fileType, category) => {
    const ext = fileType?.toLowerCase();
    if (category === 'audio' || ['.mp3', '.wav', '.m4a', '.aac', '.ogg'].includes(ext)) {
      return <Volume2 className="w-8 h-8 text-purple-500" />;
    }
    if (category === 'video' || ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
      return <Play className="w-8 h-8 text-red-500" />;
    }
    if (category === 'image' || ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'].includes(ext)) {
      return <Eye className="w-8 h-8 text-green-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const documentTypes = [
    { id: 'motion_to_dismiss', name: 'Motion to Dismiss' },
    { id: 'motion_discovery', name: 'Motion for Discovery' },
    { id: 'motion_due_process', name: 'Motion for Due Process Hearing' },
    { id: 'demand_letter', name: 'Demand Letter to CPS' },
    { id: 'objection_letter', name: 'Written Objection' },
    { id: 'affidavit', name: 'Affidavit/Declaration' },
    { id: 'case_plan_objection', name: 'Case Plan Objection' },
    { id: 'motion_reunification', name: 'Motion for Reunification' },
    { id: 'emergency_motion', name: 'Emergency Motion' },
    { id: 'complaint_1983', name: 'Section 1983 Civil Rights Complaint' },
  ];

  useEffect(() => {
    if (!selectedCase) return;
    loadDocuments();
    loadQueueMetrics();
    setQueueDetails({});
    setQueueDetailsLoading({});
    setActiveQueueDocId(null);

    if (queuePollRef.current) {
      clearInterval(queuePollRef.current);
    }
    queuePollRef.current = setInterval(() => {
      loadQueueMetrics();
    }, 5000);

    return () => {
      if (queuePollRef.current) {
        clearInterval(queuePollRef.current);
      }
    };
  }, [selectedCase]);

  const loadDocuments = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/documents/${selectedCase.id}`);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQueueMetrics = async () => {
    if (!selectedCase) return;
    setQueueLoading(true);
    try {
      const data = await api.get(`/api/analysis-queue?case_id=${selectedCase.id}`);
      setQueueMetrics(data);
    } catch (error) {
      console.error('Failed to load analysis queue metrics:', error);
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchQueueDetails = async (docId) => {
    setQueueDetailsLoading(prev => ({ ...prev, [docId]: true }));
    try {
      const data = await api.get(`/api/analysis-queue/${docId}`);
      setQueueDetails(prev => ({ ...prev, [docId]: data }));
      return data;
    } catch (error) {
      toast.error('Failed to load queue details');
      return null;
    } finally {
      setQueueDetailsLoading(prev => ({ ...prev, [docId]: false }));
    }
  };

  const toggleQueueDetails = (docId) => {
    if (activeQueueDocId === docId) {
      setActiveQueueDocId(null);
      return;
    }
    setActiveQueueDocId(docId);
    fetchQueueDetails(docId);
  };

  useEffect(() => {
    if (!selectedDocument) return;
    const status = selectedDocument.analysis_status;
    if (!['queued', 'analyzing', 'error'].includes(status)) return;
    if (queueDetails[selectedDocument.id] || queueDetailsLoading[selectedDocument.id]) return;
    fetchQueueDetails(selectedDocument.id);
  }, [selectedDocument, queueDetails, queueDetailsLoading]);

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Unsupported type: ${ext}`;
    
    // Different size limits for media files
    const mediaExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const maxSize = mediaExtensions.includes(ext) ? MAX_MEDIA_SIZE : MAX_FILE_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);
    
    if (file.size > maxSize) return `File too large (max ${maxSizeMB}MB)`;
    return null;
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', selectedCase.id);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('doc_type', 'cps_document');
    formData.append('auto_analyze', 'true');

    const token = localStorage.getItem('cps_token');
    const response = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    return response.json();
  };

  const handleBatchUpload = async (fileList) => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }

    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Validate and build queue
    const queue = files.map(file => {
      const error = validateFile(file);
      return {
        file,
        name: file.name,
        size: file.size,
        status: error ? 'error' : 'pending',
        error: error || null,
        result: null
      };
    });

    const validCount = queue.filter(q => q.status === 'pending').length;
    const invalidCount = queue.filter(q => q.status === 'error').length;

    if (validCount === 0) {
      toast.error(`No valid files to upload. ${invalidCount} file(s) skipped.`);
      return;
    }

    if (invalidCount > 0) {
      toast.warning(`${invalidCount} file(s) skipped (unsupported type or too large)`);
    }

    setUploadQueue(queue);
    setBatchUploading(true);

    // Process files sequentially
    const updatedQueue = [...queue];
    const newDocs = [];

    for (let i = 0; i < updatedQueue.length; i++) {
      if (updatedQueue[i].status === 'error') continue;

      updatedQueue[i].status = 'uploading';
      setUploadQueue([...updatedQueue]);

      try {
        const result = await uploadSingleFile(updatedQueue[i].file);
        updatedQueue[i].status = 'done';
        updatedQueue[i].result = result;
        newDocs.push(result);
      } catch (err) {
        updatedQueue[i].status = 'error';
        updatedQueue[i].error = err.message;
      }
      setUploadQueue([...updatedQueue]);
    }

    // Update document list
    if (newDocs.length > 0) {
      setDocuments(prev => [...newDocs, ...prev]);
      loadQueueMetrics();
      
      // Check if any docs are still being analyzed in background
      const analyzingDocs = newDocs.filter(d => ['analyzing', 'queued'].includes(d.analysis_result?.status));
      if (analyzingDocs.length > 0) {
        toast.success(
          `${newDocs.length} document(s) uploaded! AI analysis queued...`,
          { duration: 6000 }
        );
        // Poll for analysis completion
        pollAnalysisStatus(analyzingDocs.map(d => d.id));
      } else {
        const totalViolations = newDocs.reduce((sum, d) => sum + (d.analysis_result?.violations_created || 0), 0);
        toast.success(
          `${newDocs.length} document(s) uploaded! Found ${totalViolations} violations.`,
          { duration: 6000 }
        );
      }
    }

    setBatchUploading(false);
  };

  // Poll for background analysis completion
  const pollAnalysisStatus = async (docIds) => {
    const maxPolls = 20; // 20 * 5s = 100s max
    for (let poll = 0; poll < maxPolls; poll++) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
      
      let allDone = true;
      for (const docId of docIds) {
        try {
          const status = await api.get(`/api/documents/${docId}/analysis-status`);
          if (status.status === 'complete') {
            setDocuments(prev => prev.map(d => 
              d.id === docId ? { ...d, analysis: status.analysis, analysis_result: status, analysis_status: 'complete' } : d
            ));
            loadQueueMetrics();
            toast.success(`Analysis complete! Found ${status.violations_found} violations.`);
          } else if (status.status === 'error') {
            loadQueueMetrics();
            toast.error(`Analysis failed: ${status.error || 'Unknown error'}`);
          } else {
            allDone = false;
          }
        } catch (err) {
          // Ignore polling errors
        }
      }
      if (allDone) break;
    }
  };

  // Legacy single-file handler (kept for backwards compat)
  const handleFileUpload = async (file) => {
    await handleBatchUpload([file]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const items = e.dataTransfer.items;
    const files = [];

    // Handle folder drops (webkitGetAsEntry)
    if (items && items.length > 0 && items[0].webkitGetAsEntry) {
      const entries = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) entries.push(entry);
      }

      const readEntries = (dirEntry) => {
        return new Promise((resolve) => {
          const reader = dirEntry.createReader();
          const allEntries = [];
          const readBatch = () => {
            reader.readEntries((batch) => {
              if (batch.length === 0) {
                resolve(allEntries);
              } else {
                allEntries.push(...batch);
                readBatch();
              }
            });
          };
          readBatch();
        });
      };

      const getFile = (fileEntry) => {
        return new Promise((resolve) => fileEntry.file(resolve));
      };

      const processEntries = async (entryList) => {
        for (const entry of entryList) {
          if (entry.isFile) {
            const file = await getFile(entry);
            files.push(file);
          } else if (entry.isDirectory) {
            const subEntries = await readEntries(entry);
            await processEntries(subEntries);
          }
        }
      };

      processEntries(entries).then(() => {
        if (files.length > 0) handleBatchUpload(files);
      });
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBatchUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const clearQueue = () => {
    setUploadQueue([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const reanalyzeDocument = async (docId) => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('cps_token');
      const response = await fetch(`${API_URL}/api/documents/${docId}/reanalyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Reanalysis failed');

      const result = await response.json().catch(() => ({}));
      const queueMsg = result?.queue_position ? ` (Position ${result.queue_position})` : '';
      if (result?.status === 'queued') {
        toast.success(`Analysis queued${queueMsg}. Results will appear shortly...`, { duration: 5000 });
      } else {
        toast.success('Analysis started! Results will appear shortly...', { duration: 5000 });
      }
      loadQueueMetrics();
      
      // Poll for completion
      const maxPolls = 30;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise(r => setTimeout(r, 5000));
        try {
          const statusResp = await api.get(`/api/documents/${docId}/analysis-status`);
          if (statusResp.status === 'complete') {
            toast.success(`Analysis complete! Found ${statusResp.violations_found} violations.`);
            loadDocuments();
            loadQueueMetrics();
            break;
          }
          if (statusResp.status === 'error') {
            toast.error(`Analysis failed: ${statusResp.error || 'Unknown error'}. Try again.`);
            loadQueueMetrics();
            break;
          }
        } catch (err) {
          // Ignore polling errors
        }
      }
    } catch (error) {
      toast.error('Failed to start reanalysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateDocument = async (docType) => {
    if (!selectedCase) {
      toast.error('Please select a case first');
      return;
    }
    
    setGenerating(true);
    setSelectedDocType(docType);
    
    try {
      const response = await api.post('/api/ai/generate-document', {
        case_id: selectedCase.id,
        document_type: docType
      });
      
      const newDoc = await api.post('/api/documents', {
        case_id: selectedCase.id,
        title: documentTypes.find(d => d.id === docType)?.name || docType,
        content: response.document,
        doc_type: docType
      });
      
      setDocuments([newDoc, ...documents]);
      setSelectedDocument(newDoc);
      toast.success('Document generated successfully!');
      setActiveSubTab('analysis');
    } catch (error) {
      toast.error('Failed to generate document');
    } finally {
      setGenerating(false);
      setSelectedDocType('');
    }
  };

  const queuedCount = queueMetrics?.queued || 0;
  const processingCount = queueMetrics?.processing || 0;
  const completeCount = queueMetrics?.complete || 0;
  const errorCount = queueMetrics?.error || 0;
  const totalQueueCount = queueMetrics?.total || 0;
  const completedQueueCount = completeCount + errorCount;
  const queueProgress = totalQueueCount > 0 ? Math.round((completedQueueCount / totalQueueCount) * 100) : 0;
  const selectedQueueInfo = selectedDocument ? queueDetails[selectedDocument.id] : null;


  if (!selectedCase) {
    return (
      <div className="text-center py-12 animate-fadeIn" data-testid="documents-tab">
        <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
        <p className="text-gray-400">Select a case to upload and analyze documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="documents-tab">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Document Analysis Center
        </h1>
        <p className="text-gray-400">Upload CPS documents for AI-powered analysis - {selectedCase.title}</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
        {[
          { id: 'upload', label: 'Upload & Analyze', icon: Upload },
          { id: 'generate', label: 'Generate Documents', icon: FileText },
          { id: 'analysis', label: 'View Analysis', icon: Brain },
          { id: 'forensic', label: 'Forensic Analyzer', icon: Search },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeSubTab === tab.id 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeSubTab === 'upload' && (
        <div className="space-y-6">
          {/* Analysis Queue Metrics */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5" data-testid="analysis-queue-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold">Analysis Queue</h3>
                <p className="text-sm text-gray-400">Server-side queue with real-time progress</p>
              </div>
              <div className="text-xs text-gray-500" data-testid="analysis-queue-last-updated">
                {queueMetrics?.last_updated ? `Updated ${new Date(queueMetrics.last_updated).toLocaleTimeString()}` : 'Updating...'}
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-900/60 rounded-lg p-3" data-testid="analysis-queue-queued-count">
                <p className="text-xs text-gray-500">Queued</p>
                <p className="text-xl font-semibold text-blue-400">{queuedCount}</p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-3" data-testid="analysis-queue-processing-count">
                <p className="text-xs text-gray-500">Processing</p>
                <p className="text-xl font-semibold text-yellow-400">{processingCount}</p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-3" data-testid="analysis-queue-complete-count">
                <p className="text-xs text-gray-500">Complete</p>
                <p className="text-xl font-semibold text-green-400">{completeCount}</p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-3" data-testid="analysis-queue-error-count">
                <p className="text-xs text-gray-500">Errors</p>
                <p className="text-xl font-semibold text-red-400">{errorCount}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span data-testid="analysis-queue-total">Total: {totalQueueCount}</span>
                <span data-testid="analysis-queue-progress">Progress: {queueProgress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden" data-testid="analysis-queue-progress-bar">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                  style={{ width: `${queueProgress}%` }}
                />
              </div>
              {totalQueueCount === 0 && (
                <p className="text-xs text-gray-500" data-testid="analysis-queue-empty">
                  Queue is empty. Upload documents to start analysis.
                </p>
              )}
            </div>
          </div>

          {/* Upload Zone - Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              dragActive 
                ? 'border-red-500 bg-red-500/10 scale-[1.01]' 
                : 'border-gray-600 hover:border-red-600/50'
            } ${batchUploading ? 'opacity-50 pointer-events-none' : ''}`}
            data-testid="upload-dropzone"
          >
            {batchUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-red-500 animate-spin" />
                <p className="text-lg font-semibold text-red-400">
                  Uploading {uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.filter(q => q.status !== 'error' || q.result).length} files...
                </p>
                <p className="text-gray-400">AI is analyzing your documents for violations and timeline events...</p>
              </div>
            ) : (
              <>
                <Upload className="w-14 h-14 mx-auto text-gray-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Drop Files or Folders Here</h3>
                <p className="text-gray-400 mb-2">
                  Upload petitions, safety plans, court orders, letters, or any CPS documents
                </p>
                <p className="text-sm text-gray-500 mb-5">
                  Drag & drop files or folders • Documents (PDF, DOC, TXT) • Images (JPG, PNG) • Audio (MP3, WAV) • Video (MP4, MOV) • Max 50MB
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="btn-punisher cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors" data-testid="select-files-btn">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.txt,.png,.jpg,.jpeg,.doc,.docx,.rtf,.gif,.webp,.heic,.mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.avi,.mkv,.webm"
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 0) handleBatchUpload(e.target.files);
                        e.target.value = '';
                      }}
                      data-testid="file-upload-input"
                    />
                    <Upload className="w-4 h-4" />
                    Select Files
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors border border-gray-600" data-testid="select-folder-btn">
                    <input
                      ref={folderInputRef}
                      type="file"
                      className="hidden"
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 0) handleBatchUpload(e.target.files);
                        e.target.value = '';
                      }}
                      data-testid="folder-upload-input"
                    />
                    <FileText className="w-4 h-4" />
                    Upload Folder
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Upload Queue */}
          {uploadQueue.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5" data-testid="upload-queue">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-500" />
                  Upload Queue ({uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.length})
                </h3>
                {!batchUploading && (
                  <button onClick={clearQueue} className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600" data-testid="clear-queue-btn">
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadQueue.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.status === 'done' ? 'bg-green-900/20 border border-green-800/30' :
                    item.status === 'error' ? 'bg-red-900/20 border border-red-800/30' :
                    item.status === 'uploading' ? 'bg-blue-900/20 border border-blue-800/30' :
                    'bg-gray-900/50 border border-gray-800'
                  }`} data-testid={`queue-item-${idx}`}>
                    <div className="flex-shrink-0">
                      {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                      {item.status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {item.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {item.status === 'pending' && <Clock className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.size)}
                        {item.status === 'uploading' && ' — Analyzing with AI...'}
                        {item.status === 'done' && ` — ${item.result?.analysis_result?.violations_created || 0} violations found`}
                        {item.status === 'error' && ` — ${item.error}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'done' ? 'bg-green-600/20 text-green-400' :
                      item.status === 'error' ? 'bg-red-600/20 text-red-400' :
                      item.status === 'uploading' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {item.status === 'uploading' ? 'Analyzing' : item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What AI Will Find */}
          <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-500" />
              What THE CPS PUNISHER Will Analyze
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: AlertTriangle, title: 'Constitutional Violations', desc: '4th, 5th, 6th, 14th Amendment violations' },
                { icon: Clock, title: 'Timeline Events', desc: 'Every date and deadline extracted' },
                { icon: Users, title: 'Named Individuals', desc: 'Caseworkers, judges, attorneys identified' },
                { icon: Shield, title: 'Defense Opportunities', desc: 'Legal arguments and weaknesses' },
                { icon: FileText, title: 'Key Allegations', desc: 'What CPS claims against you' },
                { icon: Gavel, title: 'Motions to File', desc: 'Recommended legal actions' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Documents List */}
          {documents.filter(d => d.source === 'upload').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
              <div className="space-y-3">
                {documents.filter(d => d.source === 'upload').map(doc => (
                  <div key={doc.id} className="space-y-2">
                    <div 
                      className={`bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedDocument?.id === doc.id ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        setSelectedDocument(doc);
                        setActiveSubTab('analysis');
                      }}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type, doc.file_category)}
                        <div>
                          <h4 className="font-semibold">{doc.title}</h4>
                          <p className="text-sm text-gray-400">
                            {doc.filename} • {new Date(doc.created_at).toLocaleDateString()}
                            {doc.file_category && doc.file_category !== 'document' && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs capitalize">{doc.file_category}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.analysis_status === 'queued' && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded" data-testid={`doc-status-queued-${doc.id}`}>
                            Queued
                          </span>
                        )}
                        {doc.analysis_status === 'analyzing' && (
                          <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded flex items-center gap-1" data-testid={`doc-status-analyzing-${doc.id}`}>
                            <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                          </span>
                        )}
                        {doc.analysis_status === 'error' && (
                          <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded" data-testid={`doc-status-error-${doc.id}`}>
                            Analysis Failed
                          </span>
                        )}
                        {doc.analysis && doc.analysis_status === 'complete' && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded" data-testid={`doc-status-complete-${doc.id}`}>
                            Analyzed
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setActiveSubTab('analysis');
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          data-testid={`view-analysis-btn-${doc.id}`}
                        >
                          View Analysis
                        </button>
                        {['queued', 'analyzing', 'error'].includes(doc.analysis_status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleQueueDetails(doc.id);
                            }}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2"
                            data-testid={`queue-details-btn-${doc.id}`}
                          >
                            {queueDetailsLoading[doc.id] ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Loading</>
                            ) : (
                              <>Queue Details</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {activeQueueDocId === doc.id && (
                    <div className="mt-3 bg-gray-900/60 border border-gray-700 rounded-lg p-3" data-testid={`queue-details-panel-${doc.id}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-200" data-testid={`queue-details-status-${doc.id}`}>
                            Queue Status: {queueDetails[doc.id]?.status || doc.analysis_status || 'unknown'}
                          </p>
                          {queueDetails[doc.id]?.queue_position && (
                            <p className="text-xs text-gray-400" data-testid={`queue-details-position-${doc.id}`}>
                              Position: {queueDetails[doc.id]?.queue_position}
                            </p>
                          )}
                          {queueDetails[doc.id]?.started_at && (
                            <p className="text-xs text-gray-500" data-testid={`queue-details-started-${doc.id}`}>
                              Started: {new Date(queueDetails[doc.id].started_at).toLocaleString()}
                            </p>
                          )}
                          {queueDetails[doc.id]?.completed_at && (
                            <p className="text-xs text-gray-500" data-testid={`queue-details-completed-${doc.id}`}>
                              Completed: {new Date(queueDetails[doc.id].completed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetchQueueDetails(doc.id);
                          }}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                          data-testid={`queue-details-refresh-${doc.id}`}
                        >
                          Refresh
                        </button>
                      </div>
                      {queueDetails[doc.id]?.error && (
                        <p className="mt-2 text-xs text-red-400" data-testid={`queue-details-error-${doc.id}`}>
                          Error: {queueDetails[doc.id].error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Tab */}
      {activeSubTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-300">
              Generate professional legal documents based on your case data, violations, and timeline. 
              AI will include relevant case law and {selectedCase.state} statutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => generateDocument(doc.id)}
                disabled={generating}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-red-600/50 transition-all text-left"
                data-testid={`generate-${doc.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  {generating && selectedDocType === doc.id && (
                    <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                  )}
                </div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-gray-400 mt-1">Generate with AI</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeSubTab === 'analysis' && (
        <div className="space-y-6">
          {selectedDocument ? (
            <DocumentAnalysisView 
              document={selectedDocument} 
              onReanalyze={() => reanalyzeDocument(selectedDocument.id)}
              analyzing={analyzing}
              queueInfo={selectedQueueInfo}
              onRefreshQueue={() => fetchQueueDetails(selectedDocument.id)}
            />
          ) : (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Document Selected</h3>
              <p className="text-gray-400">Upload a document or select one from the list to view its analysis</p>
            </div>
          )}
        </div>
      )}

      {/* Forensic Analyzer Tab */}
      {activeSubTab === 'forensic' && (
        <ForensicAnalyzerView 
          selectedCase={selectedCase}
          documents={documents}
          selectedDocument={selectedDocument}
        />
      )}
    </div>
  );
}

// Document Analysis View Component

export default DocumentsTab;

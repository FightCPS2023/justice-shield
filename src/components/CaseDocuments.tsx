import React, { useState, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { FileText, Upload, Plus, X, File, AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Scale, Lightbulb, Shield, Image as ImageIcon, Crown, Lock, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { analyzeDocument, type AnalysisResult } from "../utils/documentAnalyzer";
import { analyzeDocumentWithGeniusAI, quickDocumentAnalysis, type GeniusDocumentAnalysis } from "../utils/genius-ai-integration";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import { useSubscription } from "../contexts/SubscriptionContext";
import { SubscriptionModal } from "./SubscriptionModal";
import { toast } from "sonner@2.0.3";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import { InlineDisclaimer } from "./InlineDisclaimer";

interface Document {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  analysis?: AnalysisResult;
  geniusAnalysis?: GeniusDocumentAnalysis; // Add genius AI analysis
}

interface CaseDocumentsProps {
  documents: Document[];
  onAddDocument: (doc: Omit<Document, "id">) => void;
  onRemoveDocument: (id: string) => void;
  onViolationsDetected?: (violations: string[]) => void;
  onTimelineEventsDetected?: (events: Array<{ date: string; title: string; description: string }>) => void;
  onCaseInfoDetected?: (info: { caseNumber?: string; dates?: string[]; names?: string[]; locations?: string[] }) => void;
}

export function CaseDocuments({ 
  documents, 
  onAddDocument, 
  onRemoveDocument,
  onViolationsDetected,
  onTimelineEventsDetected,
  onCaseInfoDetected
}: CaseDocumentsProps) {
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocDate, setNewDocDate] = useState("");
  const [newDocType, setNewDocType] = useState("Report");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDropInputRef = useRef<HTMLInputElement>(null);

  // Subscription hooks
  const { 
    tier, 
    canUploadDocument, 
    incrementDocumentUpload, 
    getRemainingUploads 
  } = useSubscription();

  // Configure PDF.js worker - match the API version 5.4.394
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs`;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      let hasAnyText = false;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Properly format the text with spacing
        let lastY = 0;
        let pageText = '';
        
        textContent.items.forEach((item: any, index: number) => {
          // Add line breaks when Y coordinate changes significantly (new line)
          if (item.transform && item.transform[5] !== undefined) {
            const currentY = item.transform[5];
            if (lastY && Math.abs(currentY - lastY) > 5) {
              pageText += '\n';
            }
            lastY = currentY;
          }
          
          // Add the text with a space
          pageText += item.str + ' ';
        });
        
        if (pageText.trim().length > 10) {
          hasAnyText = true;
        }
        
        fullText += `--- Page ${pageNum} ---\n${pageText.trim()}\n\n`;
      }
      
      // If no text was extracted, this might be a scanned PDF (image-based)
      // Try OCR on the PDF pages
      if (!hasAnyText || fullText.trim().length < 50) {
        console.log('PDF contains little/no text, attempting OCR...');
        return await extractTextFromScannedPDF(pdf);
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const extractTextFromScannedPDF = async (pdf: any): Promise<string> => {
    try {
      let fullText = '';
      
      // Process each page with OCR
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        
        // Create canvas to render page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Convert canvas to blob for OCR
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
          });
          
          // Run OCR on the rendered page
          const result = await Tesseract.recognize(blob, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Page ${pageNum}: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          
          const pageText = result.data.text.trim();
          if (pageText.length > 0) {
            fullText += `--- Page ${pageNum} (OCR) ---\n${pageText}\n\n`;
          }
        }
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Scanned PDF OCR error:', error);
      throw new Error('Failed to extract text from scanned PDF using OCR');
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m)
      });
      return result.data.text.trim();
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  };

  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      return result.value.trim();
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  };

  const toggleExpanded = (docId: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (docId: string) => {
    setDocumentToDelete(docId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      const docTitle = documents.find(d => d.id === documentToDelete)?.title;
      onRemoveDocument(documentToDelete);
      setDocumentToDelete(null);
      setDeleteConfirmOpen(false);
      toast.success(`Document deleted: ${docTitle}`);
    }
  };

  const handleCancelDelete = () => {
    setDocumentToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleClearAll = () => {
    setClearAllConfirmOpen(true);
  };

  const handleConfirmClearAll = () => {
    const count = documents.length;
    documents.forEach(doc => onRemoveDocument(doc.id));
    setClearAllConfirmOpen(false);
    toast.success(`All ${count} documents deleted successfully`);
  };

  const handleCancelClearAll = () => {
    setClearAllConfirmOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await processFiles(Array.from(files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setUploadMessage("");
    const queue: string[] = [];

    for (const file of files) {
      queue.push(file.name);
      setProcessingQueue([...queue]);

      try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

        let content = "";
        let message = "";

        if (fileExtension === 'txt') {
          // Handle text files
          content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || "");
            reader.onerror = () => reject(new Error("Error reading text file"));
            reader.readAsText(file);
          });
          message = `✅ ${file.name} - Text extracted successfully!`;
        } else if (fileExtension === 'pdf') {
          // Extract text from PDF (handles both text PDFs and scanned/CamScanner PDFs)
          try {
            setUploadMessage(prev => 
              prev ? `${prev}\n📄 Processing ${file.name}...` : `📄 Processing ${file.name}...`
            );
            
            content = await extractTextFromPDF(file);
            if (content && content.trim().length > 0) {
              const isOCR = content.includes('(OCR)');
              if (isOCR) {
                message = `✅ ${file.name} - Scanned PDF processed with OCR (${content.length} characters)`;
              } else {
                message = `✅ ${file.name} - PDF text extracted (${content.length} characters)`;
              }
            } else {
              message = `⚠️ ${file.name} - PDF appears empty or unreadable`;
              // Skip this file
              queue.splice(queue.indexOf(file.name), 1);
              setProcessingQueue([...queue]);
              continue;
            }
          } catch (error) {
            console.error('PDF processing error:', error);
            message = `❌ ${file.name} - Could not extract text from PDF`;
            queue.splice(queue.indexOf(file.name), 1);
            setProcessingQueue([...queue]);
            continue;
          }
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif' || fileExtension === 'bmp' || fileExtension === 'webp') {
          // Extract text from image (including photos from CamScanner app)
          try {
            setUploadMessage(prev => 
              prev ? `${prev}\n📸 Processing image with OCR: ${file.name}...` : `📸 Processing image with OCR: ${file.name}...`
            );
            
            content = await extractTextFromImage(file);
            if (content && content.trim().length > 0) {
              message = `✅ ${file.name} - Image OCR completed (${content.length} characters)`;
            } else {
              message = `⚠️ ${file.name} - No text detected in image`;
              // Skip this file
              queue.splice(queue.indexOf(file.name), 1);
              setProcessingQueue([...queue]);
              continue;
            }
          } catch (error) {
            console.error('Image OCR error:', error);
            message = `❌ ${file.name} - Could not extract text from image`;
            queue.splice(queue.indexOf(file.name), 1);
            setProcessingQueue([...queue]);
            continue;
          }
        } else if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'rtf' || fileExtension === 'odt') {
          // Extract text from Word document
          try {
            content = await extractTextFromWord(file);
            if (content && content.trim().length > 0) {
              message = `✅ ${file.name} - Word document text extracted (${content.length} characters)`;
            } else {
              message = `⚠️ ${file.name} - Word document appears empty or contains no text`;
              // Skip this file
              queue.splice(queue.indexOf(file.name), 1);
              setProcessingQueue([...queue]);
              continue;
            }
          } catch (error) {
            message = `❌ ${file.name} - Could not extract text from Word document`;
            queue.splice(queue.indexOf(file.name), 1);
            setProcessingQueue([...queue]);
            continue;
          }
        } else {
          // Other file types - show instructions but don't auto-add
          message = `ℹ️ ${file.name} - Please copy/paste content manually for this file type`;
          queue.splice(queue.indexOf(file.name), 1);
          setProcessingQueue([...queue]);
          continue;
        }

        // Auto-analyze and add the document
        if (content && content.trim()) {
          const analysis = analyzeDocument(content, fileName);
          
          onAddDocument({
            title: fileName,
            content: content,
            date: new Date().toISOString().split('T')[0],
            type: "report",
            analysis
          });

          // Pass extracted data to parent callbacks
          if (analysis.timelineEvents && analysis.timelineEvents.length > 0 && onTimelineEventsDetected) {
            onTimelineEventsDetected(analysis.timelineEvents);
          }
          
          if (analysis.identifiedViolations && analysis.identifiedViolations.length > 0 && onViolationsDetected) {
            onViolationsDetected(analysis.identifiedViolations);
          }
          
          if (analysis.extractedInfo && onCaseInfoDetected) {
            onCaseInfoDetected(analysis.extractedInfo);
          }

          setUploadMessage(prev => prev ? `${prev}\n${message}` : message);
        }

        // Remove from queue
        queue.splice(queue.indexOf(file.name), 1);
        setProcessingQueue([...queue]);

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setUploadMessage(prev => 
          prev ? `${prev}\n❌ ${file.name} - Error processing file` : `❌ ${file.name} - Error processing file`
        );
        queue.splice(queue.indexOf(file.name), 1);
        setProcessingQueue([...queue]);
      }
    }

    setIsProcessing(false);
    setProcessingQueue([]);
    
    // Reset file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (dragDropInputRef.current) {
      dragDropInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (newDocTitle && newDocContent) {
      // Analyze the document
      const analysis = analyzeDocument(newDocContent, newDocTitle);
      
      // Add document with analysis
      onAddDocument({
        title: newDocTitle,
        content: newDocContent,
        date: newDocDate,
        type: newDocType,
        analysis
      });

      // Pass extracted data to parent callbacks
      if (analysis.timelineEvents && analysis.timelineEvents.length > 0 && onTimelineEventsDetected) {
        onTimelineEventsDetected(analysis.timelineEvents);
      }
      
      if (analysis.identifiedViolations && analysis.identifiedViolations.length > 0 && onViolationsDetected) {
        onViolationsDetected(analysis.identifiedViolations);
      }
      
      if (analysis.extractedInfo && onCaseInfoDetected) {
        onCaseInfoDetected(analysis.extractedInfo);
      }

      setNewDocTitle("");
      setNewDocContent("");
      setNewDocDate("");
      setNewDocType("Report");
      setUploadMessage("");
    }
  };

  const docTypes = [
    { value: "report", label: "CPS Report" },
    { value: "court", label: "Court Document" },
    { value: "notice", label: "Notice/Letter" },
    { value: "investigation", label: "Investigation Notes" },
    { value: "email", label: "Email/Communication" },
    { value: "other", label: "Other" },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>Case Documents</span>
            {documents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <HelpTooltip 
              content="Upload CPS reports, court documents, emails, and other case-related files. Our AI will automatically analyze each document for violations, timeline events, and key information to strengthen your defense." 
              side="right"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Upload documents - they'll be automatically analyzed for violations and key information
          </p>
        </div>
        <div className="flex gap-2">
          {documents.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleClearAll}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete all documents from your case</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setNewDocTitle("")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a new document manually by typing or pasting text</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Quick Start Guide */}
      {documents.length === 0 && (
        <InfoBox title="Getting Started with Document Upload" variant="primary">
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>Quick Upload:</strong> Drag and drop files into the upload zone below, or click "Browse Files"</li>
            <li><strong>Supported Files:</strong> PDF, Word documents, text files, and images (including scanned documents)</li>
            <li><strong>Auto-Analysis:</strong> Each document is automatically analyzed for CPS violations, timeline events, and important details</li>
            <li><strong>Mobile Scans:</strong> Upload CamScanner PDFs or phone photos - OCR will extract the text</li>
          </ul>
        </InfoBox>
      )}

      {/* DRAG & DROP ZONE - Quick Multi-Upload */}
      <Card 
        className={`p-8 border-2 border-dashed transition-all ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>
          
          <div>
            <div className="mb-2">
              {isDragging ? 'Drop files here to upload' : 'Quick Upload: Drag & Drop Multiple Files'}
            </div>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, TXT, and images (JPG, PNG) • CamScanner PDFs supported with OCR
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                Scanned Docs
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Text PDFs
              </Badge>
              <Badge variant="secondary" className="text-xs">
                OCR Enabled
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (dragDropInputRef.current) {
                      dragDropInputRef.current.multiple = true;
                      dragDropInputRef.current.click();
                    }
                  }}
                  disabled={isProcessing}
                >
                  <File className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Or Browse Files'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select one or more files from your device</TooltipContent>
            </Tooltip>
            <input
              ref={dragDropInputRef}
              type="file"
              accept=".txt,.pdf,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.doc,.rtf,.odt"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {processingQueue.length > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Processing Files...</AlertTitle>
              <AlertDescription className="text-blue-800">
                <div className="space-y-1 mt-2">
                  {processingQueue.map((fileName, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      {fileName}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadMessage && !processingQueue.length && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Upload Complete!</AlertTitle>
              <AlertDescription className="text-green-800 whitespace-pre-line">
                {uploadMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>✅ Auto-extract & analyze:</strong> PDF, TXT, DOCX, DOC, RTF, ODT, Images (JPG, PNG, GIF, BMP, WEBP)</div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ImageIcon className="w-3 h-3" />
              <span><strong>CamScanner Ready:</strong> Upload scanned PDFs or photos - OCR will extract text automatically</span>
            </div>
          </div>
        </div>
      </Card>

      {/* CamScanner Tips */}
      <Alert className="border-l-4 border-l-blue-600 bg-blue-50 dark:bg-blue-950/20">
        <ImageIcon className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
          <strong className="font-semibold">📱 Using CamScanner or mobile scanner apps?</strong>
          <div className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
            <div>✅ Upload PDFs directly from CamScanner - we'll automatically detect if they're scanned and use OCR</div>
            <div>✅ You can also upload individual photos (JPG/PNG) - our OCR engine will extract the text</div>
            <div>✅ For best results: Ensure good lighting, flat surface, and clear focus when scanning</div>
            <div>💡 <strong>Tip:</strong> Scanned documents may take 10-30 seconds per page for OCR processing</div>
          </div>
        </AlertDescription>
      </Alert>

      {newDocTitle && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docTitle">Document Title</Label>
            <Input
              id="docTitle"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="e.g., Initial CPS Report, Court Order, Investigation Notes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type</Label>
              <select
                id="docType"
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {docTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docDate">Date</Label>
              <Input
                id="docDate"
                type="date"
                value={newDocDate}
                onChange={(e) => setNewDocDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docContent">Document Content</Label>
            <div className="space-y-3">
              <Alert className="bg-muted">
                <File className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Supported file types:</strong> PDF, TXT, DOC, DOCX, RTF, JPG, JPEG, PNG, GIF, BMP, WEBP, ODT
                  <br />
                  <strong>✅ Automatic extraction:</strong> PDF and TXT files • <strong>📋 Manual paste:</strong> Word docs and images
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <File className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Upload File from Computer"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.odt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">or</div>
              <Textarea
                id="docContent"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                placeholder="Paste the document text here or type key details..."
                rows={8}
              />
            </div>
          </div>

          {uploadMessage && (
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {uploadMessage}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900 mb-1">AI Analysis Enabled</AlertTitle>
            <AlertDescription className="text-blue-800">
              When you add this document, it will be automatically analyzed to identify violations, extract case information, and generate recommended actions.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!newDocTitle || !newDocContent}>
              Add & Analyze Document
            </Button>
            <Button variant="outline" onClick={() => setNewDocTitle("")}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card className="p-12 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="mb-2">No documents added yet</div>
            <p className="text-sm text-muted-foreground mb-4">
              Add your CPS reports, court documents, and other case materials for instant AI analysis
            </p>
            <Button onClick={() => setNewDocTitle("")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Document
            </Button>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="mb-1">{doc.title}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <Badge variant="outline">
                        {docTypes.find((t) => t.value === doc.type)?.label}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(doc.date).toLocaleDateString()}</span>
                      {doc.analysis && (
                        <>
                          <span>•</span>
                          <Badge className={getRiskColor(doc.analysis.riskLevel)}>
                            {doc.analysis.riskLevel.toUpperCase()} RISK
                          </Badge>
                          {doc.analysis.identifiedViolations.length > 0 && (
                            <>
                              <span>•</span>
                              <Badge variant="destructive">
                                {doc.analysis.identifiedViolations.length} Violation{doc.analysis.identifiedViolations.length !== 1 ? 's' : ''}
                              </Badge>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(doc.id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>

              {doc.analysis && (
                <div className="ml-8 space-y-3">
                  <InlineDisclaimer type="ai" variant="compact" className="mb-2" />
                  <Alert className="bg-blue-50 border-blue-200" role="region" aria-label="AI Analysis Results">
                    <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <AlertTitle className="text-blue-900">AI Analysis Summary</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      {doc.analysis.summary}
                    </AlertDescription>
                  </Alert>

                  <Collapsible open={expandedDocs.has(doc.id)} onOpenChange={() => toggleExpanded(doc.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        {expandedDocs.has(doc.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Hide Detailed Analysis
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View Detailed Analysis & Case Law
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="text-sm">Document Type: {doc.analysis.documentType}</div>
                        <div className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                          {doc.analysis.detailedExplanation}
                        </div>
                      </div>

                      {doc.analysis.caseLawReferences && doc.analysis.caseLawReferences.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm flex items-center gap-2">
                            <Scale className="w-4 h-4 text-blue-600" />
                            <span>Applicable Case Law & Precedents</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <ul className="text-sm space-y-2 text-blue-900">
                              {doc.analysis.caseLawReferences.map((caseRef, i) => (
                                <li key={i} className="pl-2">• {caseRef}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {doc.analysis.modernDefenseStrategies && doc.analysis.modernDefenseStrategies.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-purple-600" />
                            <span>Modern Defense Strategies (2024-2025)</span>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                            <ul className="text-sm space-y-2 text-purple-900">
                              {doc.analysis.modernDefenseStrategies.map((strategy, i) => (
                                <li key={i} className="pl-2">💡 {strategy}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {doc.analysis.legalStandards && doc.analysis.legalStandards.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-600" />
                            <span>Legal Standards & Burdens of Proof</span>
                          </div>
                          <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                            <ul className="text-sm space-y-1 text-indigo-900">
                              {doc.analysis.legalStandards.map((standard, i) => (
                                <li key={i} className="pl-2">⚖️ {standard}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {doc.analysis.identifiedViolations.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span>Identified Violations ({doc.analysis.identifiedViolations.length})</span>
                          </div>
                          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <ul className="text-sm space-y-1 text-red-900">
                              {doc.analysis.identifiedViolations.map((v, i) => (
                                <li key={i}>• {v}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {doc.analysis.recommendedActions.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Recommended Actions</span>
                          </div>
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <ol className="text-sm space-y-2 text-green-900 list-decimal list-inside">
                              {doc.analysis.recommendedActions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}

                      {doc.analysis.extractedInfo.caseNumber && (
                        <div className="text-sm bg-muted p-3 rounded-lg">
                          <strong>Extracted Case Number:</strong> {doc.analysis.extractedInfo.caseNumber}
                        </div>
                      )}

                      <div className="pt-3 border-t">
                        <details>
                          <summary className="text-sm cursor-pointer hover:text-primary">
                            View Original Document Content
                          </summary>
                          <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg max-h-60 overflow-y-auto">
                            {doc.content}
                          </div>
                        </details>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {!doc.analysis && (
                <div className="ml-8">
                  <p className="text-sm text-muted-foreground line-clamp-3">{doc.content}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <SubscriptionModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature="document uploads"
      />

      {/* Delete Single Document Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
              {documentToDelete && documents.find(d => d.id === documentToDelete) && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-foreground">
                    <strong>Document:</strong> {documents.find(d => d.id === documentToDelete)?.title}
                  </p>
                  {documents.find(d => d.id === documentToDelete)?.analysis && (
                    <p className="text-sm text-muted-foreground mt-1">
                      This document's analysis and any extracted violations or timeline events will also be removed.
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Documents Confirmation Dialog */}
      <AlertDialog open={clearAllConfirmOpen} onOpenChange={setClearAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Documents?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ALL {documents.length} document{documents.length !== 1 ? 's' : ''}? This action cannot be undone.
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive font-semibold text-sm">
                  ⚠️ Warning: This will permanently delete:
                </p>
                <ul className="text-sm text-destructive/90 mt-2 space-y-1 list-disc list-inside">
                  <li>All {documents.length} uploaded documents</li>
                  <li>All AI analyses and insights</li>
                  <li>All extracted violations and timeline events</li>
                  <li>All case information from these documents</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClearAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Documents
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
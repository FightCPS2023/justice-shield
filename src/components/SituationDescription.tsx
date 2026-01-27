import { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CPSPunisherLogo } from './CPSPunisherLogo';
import { HelpBot } from './HelpBot';
import {
  ArrowLeft,
  MessageSquare,
  Mic,
  Upload,
  Send,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SituationDescriptionProps {
  onBack: () => void;
  onSubmit: (description: string, method: 'write' | 'record') => void;
  onUploadInstead: () => void;
}

export function SituationDescription({ onBack, onSubmit, onUploadInstead }: SituationDescriptionProps) {
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please describe your situation before submitting');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSubmit(description, 'write');
      toast.success('Situation analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze situation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // In production, you'd send this to a speech-to-text API
        toast.success('Recording saved! (Speech-to-text coming soon)');
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const examplePrompts = [
    "CPS came to my door without a warrant...",
    "The caseworker is requiring drug tests without probable cause...",
    "My children were removed based on false allegations...",
    "I was not given proper notice of the hearing...",
    "The caseworker entered my home without permission..."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <CPSPunisherLogo size="small" showText={true} variant="image" />
            </div>
            <Badge className="bg-blue-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Analysis
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Describe Your Situation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us what happened in your CPS case. You can write, type, or record your story.
            Our AI will analyze your situation and help identify potential violations.
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="mb-6 p-6 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How to Use This Tool</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Choose whether to write/type or record your story</li>
                <li>Describe what happened: when, where, who was involved, what they said/did</li>
                <li>Include any concerns about your rights being violated</li>
                <li>Click "Analyze My Situation" to get AI-powered insights</li>
                <li>Review the analysis and proceed to upload documents if needed</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Card className="p-6 mb-6">
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="write" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Write/Type
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Record Audio
              </TabsTrigger>
            </TabsList>

            {/* Write/Type Tab */}
            <TabsContent value="write" className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe Your Situation
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Start typing here... Be as detailed as possible. Include dates, names, what was said, and any concerns you have about your rights."
                  className="min-h-[300px] text-base"
                  disabled={isAnalyzing}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    {description.length} characters
                    {description.length >= 100 && (
                      <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                    )}
                  </p>
                  {description.length < 100 && (
                    <p className="text-xs text-amber-600">
                      Tip: More detail helps our AI provide better analysis
                    </p>
                  )}
                </div>
              </div>

              {/* Example Prompts */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Need inspiration? Click an example to get started:
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setDescription(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!description.trim() || isAnalyzing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze My Situation
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onUploadInstead}
                  disabled={isAnalyzing}
                  size="lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Documents Instead
                </Button>
              </div>
            </TabsContent>

            {/* Record Tab */}
            <TabsContent value="record" className="space-y-4">
              <div className="text-center py-12">
                {!isRecording ? (
                  <>
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
                      <Mic className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ready to Record
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Click the button below to start recording. Speak clearly and describe
                      your situation in detail. You can record for up to 10 minutes.
                    </p>
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600 rounded-full mb-4 animate-pulse">
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Recording in Progress
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-red-600 mb-6">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold">{formatTime(recordingTime)}</span>
                    </div>
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>

              <Alert className="border-amber-300 bg-amber-50">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-900 text-sm">
                  <strong>Note:</strong> Voice recording with speech-to-text conversion is coming
                  soon. For now, recordings are saved but not automatically transcribed.
                  We recommend using the Write/Type option for immediate AI analysis.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Legal Disclaimer */}
        <Alert className="mb-6 border-red-300 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertTitle className="text-red-900 font-semibold">Legal Disclaimer</AlertTitle>
          <AlertDescription className="text-red-800 text-sm">
            This AI analysis is for informational purposes only and does not constitute legal
            advice. Results are generated by artificial intelligence and may not be completely
            accurate. Always consult with a licensed attorney before taking any legal action.
            Do not rely solely on AI analysis for legal decisions.
          </AlertDescription>
        </Alert>

        {/* Help Bot */}
        <div className="fixed bottom-4 right-4 z-50">
          <HelpBot />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Mail, MessageCircle, Calendar, User, Download, RefreshCw } from 'lucide-react';

interface ChatTranscript {
  key: string;
  userName: string;
  userEmail: string;
  timestamp: string;
}

interface FullTranscript {
  userName: string;
  userEmail: string;
  startTime: string;
  messages: Array<{
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: string;
  }>;
  receivedAt: string;
  emailSubject: string;
  emailBody: string;
}

export function ChatTranscriptViewer() {
  const [transcripts, setTranscripts] = useState<ChatTranscript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<FullTranscript | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTranscripts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${window.location.origin.replace(/:\d+$/, '')}:54321/functions/v1/make-server-a24eaa40/chat-transcripts`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data.transcripts || []);
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullTranscript = async (key: string) => {
    try {
      const response = await fetch(
        `${window.location.origin.replace(/:\d+$/, '')}:54321/functions/v1/make-server-a24eaa40/chat-transcripts/${key}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSelectedTranscript(data.transcript);
      }
    } catch (error) {
      console.error('Error fetching full transcript:', error);
    }
  };

  const downloadTranscript = () => {
    if (!selectedTranscript) return;

    const blob = new Blob([selectedTranscript.emailBody], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_transcript_${selectedTranscript.userName}_${new Date(selectedTranscript.receivedAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Help Chat Transcripts
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage support chat conversations
          </p>
        </div>
        <Button
          onClick={fetchTranscripts}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript List */}
        <Card className="lg:col-span-1 p-4 max-h-[700px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            All Conversations ({transcripts.length})
          </h2>
          
          {transcripts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No chat transcripts yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transcripts.map((transcript) => (
                <button
                  key={transcript.key}
                  onClick={() => fetchFullTranscript(transcript.key)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTranscript && selectedTranscript.userEmail === transcript.userEmail
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-1 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{transcript.userName}</p>
                      <p className="text-xs text-gray-500 truncate">{transcript.userEmail}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(transcript.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Transcript Details */}
        <Card className="lg:col-span-2 p-6">
          {!selectedTranscript ? (
            <div className="text-center py-20 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a conversation to view details</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="mb-6 pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-6 h-6 text-blue-600" />
                      {selectedTranscript.userName}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedTranscript.userEmail}</p>
                  </div>
                  <Button
                    onClick={downloadTranscript}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Started: {new Date(selectedTranscript.startTime).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {selectedTranscript.messages.length} messages
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {selectedTranscript.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs opacity-75">
                          {message.sender === 'user' ? selectedTranscript.userName : 'CPS Punisher Bot'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email Preview */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Format
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Subject:</p>
                  <p className="text-sm mb-4">{selectedTranscript.emailSubject}</p>
                  
                  <p className="text-sm font-semibold mb-2">Body:</p>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                    {selectedTranscript.emailBody}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

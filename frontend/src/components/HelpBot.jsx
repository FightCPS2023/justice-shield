import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api, { API_URL } from '../lib/api';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function HelpBot() {
  const { api, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your CPS Punisher assistant. I can help you:\n\n• Navigate the app features\n• Explain how tools work\n• Recommend features for your situation\n• Answer questions about CPS cases\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const helpContext = `You are the Help Bot for THE CPS PUNISHER app - an AI-powered legal defense platform for families dealing with Child Protective Services cases.

YOUR ROLE: Guide users through the app, explain features, and make recommendations.

APP FEATURES (explain these when asked):
- My Cases: Create and manage CPS cases
- AI Case Notes: View all AI-generated insights saved to your case
- Violations: Track CPS policy violations
- Timeline: Build chronological case history  
- Evidence: Upload and organize evidence
- Documents: Upload docs for AI analysis, Forensic Analyzer for deep analysis
- AI Assistant: Chat with AI about your case
- Smart Doc Generator: Create legal documents
- Defense Strategy: AI-generated defense plans
- Legal Notepad: Take organized notes
- ADA Compliance: Get ADA accommodation info
- Law Library: Research state-specific CPS laws
- Section 1983: Generate civil rights lawsuits
- Court Preparation Kit: Generate comprehensive PDF for court
- Find Advocates: Connect with family advocates

TIERS:
- Free: 1 case, 5 AI credits, 1 doc upload
- Essential ($19/mo): 25 docs, 100 AI credits, unlimited cases
- Professional ($99/mo): Unlimited docs, 500 AI credits, advanced AI tools
- Attorney ($299/mo): 2000 AI credits, Section 1983, Court Listener, Forensic Analyzer
- Enterprise: Unlimited everything

TIPS TO SHARE:
- Always select a case before using AI features so responses save automatically
- Use the Forensic Analyzer to find hidden issues in CPS documents
- Track every violation - they build your defense
- Download Court Preparation Kit before hearings
- Buy credits if you need specific features without upgrading

RESPOND: Be helpful, concise, and supportive. Users are often stressed dealing with CPS. Guide them to the right features.`;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/help-bot', {
        message: userMessage,
        context: helpContext
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Here are some quick tips:\n\n• For case help → Go to 'My Cases'\n• For AI features → Select a case first\n• For legal research → Try 'Law Library'\n• To upgrade → Visit 'Upgrade Plan'"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'How do I start?', query: 'How do I get started with this app?' },
    { label: 'Best features?', query: 'What are the best features for defending against CPS?' },
    { label: 'How to save AI?', query: 'How do I save AI responses to my case?' },
    { label: 'Court prep?', query: 'How do I prepare for court?' },
  ];

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-gray-700 rotate-90' 
            : 'bg-gradient-to-r from-red-600 to-purple-600 hover:scale-110 animate-pulse'
        }`}
        data-testid="help-bot-toggle"
      >
        {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-7 h-7" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn" style={{ height: '500px', maxHeight: 'calc(100vh - 150px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-purple-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">CPS Punisher Assistant</h3>
              <p className="text-xs text-white/70">Here to help you navigate</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(action.query); }}
                  className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-900 border border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpBot;

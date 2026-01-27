import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Mail } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatSession {
  messages: Message[];
  userEmail?: string;
  userName?: string;
  startTime: Date;
}

export function HelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<Date>(new Date());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      addBotMessage(
        "👋 Hi! I'm here to help you with The CPS Punisher. I can answer questions about:\n\n• Using the app\n• Your legal rights\n• Document management\n• Case strategies\n• Pricing & features\n\nHow can I assist you today?"
      );
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Pricing questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      return "💎 **Pricing Plans:**\n\n• **Free**: Basic features\n• **Essential ($39/mo)**: Full violation checker\n• **Professional ($79/mo)**: Advanced AI analysis\n• **Attorney ($299/mo)**: Professional litigation tools\n• **Enterprise ($999/mo)**: Multi-case management\n\nWhich plan interests you?";
    }

    // Document questions
    if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return "📄 **Document Management:**\n\nYou can upload any case-related documents including:\n• Court orders\n• Case plans\n• Visit logs\n• Communications with CPS\n• Medical records\n• Photos/videos\n\nOur AI analyzes each document for violations and opportunities. Would you like help getting started?";
    }

    // Rights questions
    if (lowerMessage.includes('rights') || lowerMessage.includes('constitutional') || lowerMessage.includes('legal')) {
      return "⚖️ **Your Rights:**\n\nYou have constitutional protections including:\n• 4th Amendment (unreasonable search/seizure)\n• 14th Amendment (due process)\n• Right to counsel\n• Right to evidence\n• Right to challenge findings\n\nCheck the Rights Guide in the app for detailed information. Need specific guidance?";
    }

    // Violation checker
    if (lowerMessage.includes('violation') || lowerMessage.includes('illegal') || lowerMessage.includes('wrong')) {
      return "🔍 **Violation Checker:**\n\nOur system identifies potential violations such as:\n• Warrantless searches\n• Coerced entries\n• Missing due process\n• Fabricated evidence\n• Failure to follow procedures\n\nUpload your documents to get a detailed violation analysis. Want me to guide you through it?";
    }

    // Strategy questions
    if (lowerMessage.includes('strategy') || lowerMessage.includes('defense') || lowerMessage.includes('fight')) {
      return "🎯 **Defense Strategies:**\n\nWe help you:\n• Build timeline of events\n• Identify procedural violations\n• Collect evidence\n• Prepare for hearings\n• Generate legal documents\n• File federal civil rights claims\n\nProfessional and Attorney tiers include AI-powered strategy generation. Need more info?";
    }

    // Federal litigation
    if (lowerMessage.includes('lawsuit') || lowerMessage.includes('sue') || lowerMessage.includes('1983') || lowerMessage.includes('federal')) {
      return "⚖️ **Federal Civil Rights Litigation:**\n\nWe provide tools for:\n• Section 1983 lawsuits\n• Notice of Liability\n• Federal court removal\n• Constitutional hearing briefs\n• Qualified immunity challenges\n\nAttorney tier includes full litigation document generation. Interested in learning more?";
    }

    // Getting started
    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('setup')) {
      return "🚀 **Getting Started:**\n\n1. Create an account (free!)\n2. Create your case file\n3. Upload documents\n4. Review AI analysis\n5. Check for violations\n6. Build your timeline\n7. Generate defense strategies\n\nReady to create your account? Click 'Sign Up' in the top right!";
    }

    // Contact/support
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('speak')) {
      return "📧 **Get in Touch:**\n\nI can send a transcript of our conversation to our support team. They'll review your questions and get back to you within 24 hours.\n\nWould you like me to send this chat to support?";
    }

    // AI analysis
    if (lowerMessage.includes('ai') || lowerMessage.includes('analysis') || lowerMessage.includes('gemini')) {
      return "🤖 **AI Analysis:**\n\nEvery document you upload is analyzed using Google Gemini AI to:\n• Identify legal issues\n• Spot violations\n• Find opportunities\n• Suggest strategies\n• Flag missing evidence\n\nAvailable on Essential tier and above. Want to see it in action?";
    }

    // Multi-case
    if (lowerMessage.includes('multi') || lowerMessage.includes('multiple case') || lowerMessage.includes('several case')) {
      return "📁 **Multi-Case Management:**\n\nEnterprise tier lets you:\n• Manage multiple cases\n• Switch between cases instantly\n• Separate documents & timelines\n• Individual violation reports\n• Case-specific strategies\n\nPerfect for advocates or families with multiple CPS cases. Questions?";
    }

    // Thank you/positive
    if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate') || lowerMessage.includes('helpful')) {
      return "💪 You're very welcome! We're here to help families fight for their children.\n\nRemember: Every parent deserves a fair fight. Every child deserves to be home.\n\nAnything else I can help with?";
    }

    // Default response
    return "I'd be happy to help! I can answer questions about:\n\n• 💎 Pricing & plans\n• 📄 Document management\n• ⚖️ Your legal rights\n• 🔍 Violation checking\n• 🎯 Defense strategies\n• ⚖️ Federal litigation\n• 🚀 Getting started\n\nWhat would you like to know more about?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    addUserMessage(inputValue);
    const userMsg = inputValue;
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Check if user wants to contact support
      if (userMsg.toLowerCase().includes('send') && 
          (userMsg.toLowerCase().includes('transcript') || 
           userMsg.toLowerCase().includes('chat') || 
           userMsg.toLowerCase().includes('support'))) {
        setShowEmailCapture(true);
        addBotMessage("I'd be happy to send this conversation to our support team! Please provide your information:");
      } else {
        // Get bot response
        const response = getBotResponse(userMsg);
        addBotMessage(response);
      }
    }, 1000);
  };

  const handleSendTranscript = async () => {
    if (!userEmail || !userName) {
      alert('Please provide your name and email');
      return;
    }

    try {
      // Send transcript to backend
      const session: ChatSession = {
        messages,
        userEmail,
        userName,
        startTime: sessionStartTime.current,
      };

      const response = await fetch(`${window.location.origin.replace(/:\d+$/, '')}:54321/functions/v1/make-server-a24eaa40/send-chat-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        addBotMessage("✅ Perfect! I've sent the transcript to our support team. They'll review your conversation and get back to you at " + userEmail + " within 24 hours.\n\nIs there anything else I can help you with right now?");
        setShowEmailCapture(false);
      } else {
        addBotMessage("❌ I'm sorry, there was an error sending the transcript. Please try again or email us directly at support@cpspunisher.com");
      }
    } catch (error) {
      console.error('Error sending transcript:', error);
      addBotMessage("❌ I'm sorry, there was an error sending the transcript. Please try again or email us directly at support@cpspunisher.com");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Open help chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            ?
          </span>
          
          {/* Hover tooltip */}
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Need help? Chat with us!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">CPS Punisher Help</h3>
                <p className="text-xs text-blue-100">We're here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Email capture form */}
            {showEmailCapture && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    spellCheck={true}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSendTranscript}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Transcript
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                spellCheck={true}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Transcript sent to support team
            </p>
          </div>
        </div>
      )}
    </>
  );
}
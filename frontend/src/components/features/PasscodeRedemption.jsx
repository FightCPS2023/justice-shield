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

function PasscodeRedemption() {
  const { api } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleBack = () => {
    const referrer = document.referrer || '';
    if (referrer.startsWith(window.location.origin) && window.history.length > 1) {
      window.history.back();
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      toast.error('Please enter a passcode');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/redeem-passcode', { passcode: passcode.trim() });
      toast.success(response.message || 'Full access granted!');
      setPasscode('');
      setShowInput(false);
      // Refresh the page to update tier
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Key className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Have a Passcode?</h3>
      </div>
      <p className="text-gray-400 text-sm mb-4">Enter your access code for full enterprise features</p>
      
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-semibold transition-all"
        >
          Enter Passcode
        </button>
      ) : (
        <form onSubmit={handleRedeem} className="flex gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="passcode-back-btn"
          >
            Back
          </button>
          <input
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
            placeholder="Enter passcode..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 uppercase tracking-wider"
            data-testid="passcode-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-semibold transition-all disabled:opacity-50"
            data-testid="redeem-passcode-btn"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Redeem'}
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setPasscode(''); }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            data-testid="passcode-cancel-btn"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

// Settings Tab

export default PasscodeRedemption;

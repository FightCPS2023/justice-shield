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
import PasscodeRedemption from './PasscodeRedemption';

function PricingTab() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const tiers = [
    {
      id: 'essential',
      name: 'Essential',
      icon: Star,
      color: 'from-blue-500 to-blue-700',
      monthly: 19,
      annual: 190,
      description: 'For parents starting their CPS defense',
      features: [
        'Unlimited Cases',
        '25 Document Uploads/month',
        '100 AI Credits/month',
        'AI Chat Assistant',
        'Smart Document Generator',
        'Defense Strategy Generator',
        'Incident Analyzer',
        'Legal Notepad with PDF Export',
        '50-State Law Library',
        'Basic Document Analysis',
        'Timeline & Violation Tracking',
        'Email Support'
      ],
      notIncluded: [
        'Background Check',
        'Section 1983 Tools',
        'Advanced AI Analysis'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Crown,
      color: 'from-purple-500 to-purple-700',
      monthly: 99,
      annual: 990,
      popular: true,
      description: 'Complete CPS defense toolkit',
      features: [
        'Everything in Essential, plus:',
        'UNLIMITED Document Uploads',
        '500 AI Credits/month',
        'Background Check / Person Lookup',
        'Court Records Search',
        'Smart Legal Research Engine',
        'Judge Research & Watch',
        'ADA Compliance Center',
        'Advanced Document Analysis',
        'Fraud & Perjury Detection AI',
        'Constitutional Violation Finder',
        'Section 1983 Research Guide',
        'Evidence Mapper & Precedent Finder',
        'Priority Email Support'
      ]
    },
    {
      id: 'attorney',
      name: 'Attorney Suite',
      icon: Scale,
      color: 'from-amber-500 to-amber-700',
      monthly: 299,
      annual: 2990,
      description: 'Professional tools for family law attorneys',
      features: [
        'Everything in Professional, plus:',
        '2,000 AI Credits/month',
        'Section 1983 Lawsuit BUILDER',
        'Federal Complaint Generator',
        'Qualified Immunity Analysis Tool',
        'CourtListener Integration (50M+ Opinions)',
        'Case Preparation Kit (PDF Export)',
        'Criminal Case Defense Prep',
        'Expert Witness Finder',
        'Federal Court Filing Guide',
        'Multi-Client Management',
        'Priority Phone Support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building2,
      color: 'from-red-500 to-red-700',
      monthly: 999,
      annual: 9990,
      description: 'For law firms & advocacy organizations',
      features: [
        'Everything in Attorney, plus:',
        'UNLIMITED AI Credits',
        'White-Label Options',
        'Team Management & Permissions',
        'Bulk Case Import/Export',
        'Advanced Analytics Dashboard',
        'API Access for Integration',
        'Custom AI Model Training',
        'Dedicated Account Manager',
        '24/7 Priority Support',
        'Quarterly Strategy Sessions'
      ]
    }
  ];

  const handleSubscribe = async (tier) => {
    setLoading(true);
    try {
      const response = await api.post('/api/stripe/create-checkout', {
        tier: tier.id,
        billing_period: billingPeriod,
        origin_url: window.location.origin
      });
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" data-testid="pricing-tab">
      {/* Header */}
      <div className="text-center">
        <img src="/images/chrome-logo.jpg" alt="CPS Punisher" className="w-48 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>Upgrade Your Plan</h1>
        <p className="text-gray-400">Current plan: <span className="text-red-500 font-semibold">{user?.tier?.toUpperCase() || 'FREE'}</span></p>
      </div>

      {/* Free Tier Banner */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Free Plan Includes:</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 1 Case</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 1 Doc Upload/Month</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 5 AI Questions</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> AI Chat Access</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Violation & Timeline Tracking</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Evidence & Visitation Logs</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Know Your Rights Guide</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Community Forum</span>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-full p-1 flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === 'monthly' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === 'annual' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
          >
            Annual <span className="text-green-400 text-xs ml-1">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-gray-800/50 border rounded-xl p-6 ${tier.popular ? 'border-purple-500 border-2' : 'border-gray-700'}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
              <tier.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
            
            <div className="mb-4">
              <span className="text-4xl font-bold">${billingPeriod === 'monthly' ? tier.monthly : tier.annual}</span>
              <span className="text-gray-400">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <button
              onClick={() => handleSubscribe(tier)}
              disabled={loading || user?.tier === tier.id}
              className={`w-full py-3 rounded-lg font-semibold mb-4 ${
                user?.tier === tier.id
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : tier.popular
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
               user?.tier === tier.id ? 'Current Plan' : 'Subscribe'}
            </button>

            <div className="space-y-2">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Credit Purchase Section */}
      <div className="bg-gradient-to-br from-amber-900/20 to-gray-900/50 border border-amber-700/30 rounded-xl p-8" data-testid="credit-purchase-section">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Buy AI Credits</h2>
          </div>
          <p className="text-gray-400">Use credits for any feature without upgrading your plan</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { id: 'credits_10', credits: 10, price: 4.99, label: '10 Credits' },
            { id: 'credits_50', credits: 50, price: 19.99, label: '50 Credits', popular: true },
            { id: 'credits_100', credits: 100, price: 34.99, label: '100 Credits' },
            { id: 'credits_250', credits: 250, price: 74.99, label: '250 Credits' },
          ].map((pkg) => (
            <div key={pkg.id} className={`relative bg-gray-800/80 border rounded-xl p-5 text-center ${pkg.popular ? 'border-amber-500 border-2' : 'border-gray-700'}`}>
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-600 rounded-full text-xs font-bold">
                  BEST VALUE
                </div>
              )}
              <Coins className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">{pkg.credits}</p>
              <p className="text-sm text-gray-400 mb-3">Credits</p>
              <p className="text-xl font-bold text-amber-400 mb-3">${pkg.price}</p>
              <p className="text-xs text-gray-500 mb-3">${(pkg.price / pkg.credits).toFixed(2)}/credit</p>
              <button
                onClick={async () => {
                  try {
                    const data = await api.post('/api/credits/purchase', { package_id: pkg.id, origin_url: window.location.origin });
                    if (data.url) window.location.href = data.url;
                  } catch (e) { toast.error(e.message); }
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors text-sm"
                data-testid={`buy-${pkg.id}`}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Credits never expire &bull; Use for any premium feature &bull; No subscription required</p>
        </div>
      </div>

      {/* Passcode Redemption */}
      <PasscodeRedemption />

      {/* Trust Badges */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <div className="flex justify-center gap-6">
          <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Secure Payment</span>
          <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Encrypted</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Cancel Anytime</span>
        </div>
        <p>All plans include a 30-day money-back guarantee</p>
      </div>
    </div>
  );
}

// Passcode Redemption Component

export default PricingTab;

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

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/images/shield-logo.png" alt="CPS Punisher" className="w-8 h-9" />
            <span className="text-lg font-semibold tracking-wide text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>THE CPS PUNISHER</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('auth')}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors flex items-center gap-2"
              data-testid="landing-sign-in-btn"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with hero image */}
        <div className="absolute inset-0">
          <img 
            src="/images/hero-logo-optimized.jpg" 
            srcSet="/images/hero-logo-small.jpg 900w, /images/hero-logo-optimized.jpg 1600w, /images/hero-logo.jpg 2200w"
            sizes="(max-width: 768px) 900px, 1600px"
            alt="The CPS Punisher" 
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl py-20 mt-32">
          <div className="bg-black/70 backdrop-blur-md border border-slate-700 rounded-3xl p-8 md:p-12 shadow-[0_30px_90px_rgba(0,0,0,0.55)]" data-testid="landing-hero-card">
            <div className="flex justify-center mb-6" data-testid="landing-shield-hero">
              <img
                src="/images/shield-logo.png"
                srcSet="/images/shield-logo-small.png 360w, /images/shield-logo.png 625w"
                sizes="(max-width: 768px) 120px, 160px"
                alt="Punisher Shield"
                className="w-20 h-24 md:w-28 md:h-32 drop-shadow-[0_18px_35px_rgba(220,38,38,0.45)] shield-hero-anim"
                loading="eager"
                decoding="async"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Protect your family with clarity and strength
            </h1>
          {/* Badges */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <span className="px-4 py-2 bg-slate-900/70 border border-slate-700 rounded-full text-sm text-slate-200 flex items-center gap-2 shadow-sm">
              <Brain className="w-4 h-4 text-red-500" />
              AI-Powered Analysis
            </span>
            <span className="px-4 py-2 bg-slate-900/70 border border-slate-700 rounded-full text-sm text-slate-200 flex items-center gap-2 shadow-sm">
              <Shield className="w-4 h-4 text-red-500" />
              50 States Covered
            </span>
            <span className="px-4 py-2 bg-slate-900/70 border border-slate-700 rounded-full text-sm text-slate-200 flex items-center gap-2 shadow-sm">
              <Lock className="w-4 h-4 text-red-500" />
              100% Confidential
            </span>
          </div>
          
          <p className="text-lg text-slate-200 mb-12 max-w-3xl mx-auto" data-testid="landing-hero-copy">
            We’re here to help you protect your family — one step at a time. Get calm, guided support with AI-powered analysis, violation detection, and defense strategy generation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('auth')}
              className="btn-punisher flex items-center justify-center gap-2 text-lg glow-red"
              data-testid="get-started-btn"
            >
              <Shield className="w-5 h-5" />
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline-punisher flex items-center justify-center gap-2 text-lg"
            >
              <Play className="w-5 h-5" />
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Start in 60 Seconds
            </span>
          </div>
        </div>
      </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-4 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Powerful Defense Support
          </h2>
          <p className="text-xl text-slate-300 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to analyze your case and build an effective defense, presented in a calm, guided way.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: 'AI Case Analysis', desc: 'GPT-5.2 powered analysis identifies violations and builds strategies automatically', color: 'text-zinc-300' },
              { icon: AlertTriangle, title: 'Violation Detection', desc: 'Track 24+ violation types including constitutional rights and procedural errors', color: 'text-red-500' },
              { icon: FileText, title: 'Document Generator', desc: 'Create court-ready motions, letters, and legal documents instantly', color: 'text-zinc-300' },
              { icon: Scale, title: 'Law Library', desc: 'Access statutes, case law, and CPS policies for all 50 states', color: 'text-yellow-500' },
              { icon: Calendar, title: 'Case Timeline', desc: 'Build comprehensive timelines with automatic event extraction', color: 'text-green-500' },
              { icon: MessageSquare, title: 'AI Legal Chat', desc: 'Ask questions and get instant answers from your AI legal assistant', color: 'text-cyan-500' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 card-hover">
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-600 mb-6" />
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to feel supported?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Your children are counting on you. We’ll guide you through your first case gently.
          </p>
          <button 
            onClick={() => onNavigate('auth')}
            className="btn-punisher text-xl glow-red"
            data-testid="cta-get-started-btn"
          >
            <Shield className="w-6 h-6 inline mr-2" />
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-black">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            © 2024-2025 THE CPS PUNISHER. Educational tool - not legal advice.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Always consult with a licensed attorney for legal matters.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Auth Page

export default LandingPage;

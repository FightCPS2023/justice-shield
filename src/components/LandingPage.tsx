import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Scale, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Gavel, 
  BookOpen,
  Zap,
  Lock,
  TrendingUp,
  FileSearch,
  Brain,
  Search,
  ArrowRight,
  Star,
  Check,
  Quote,
  ChevronDown,
  Play,
  BarChart3,
  MessageSquare,
  Award,
  Target,
  Clock,
  Download
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DemoModal } from './DemoModal';
import { FooterDisclaimer } from './LegalDisclaimer';
import { NancySchaeferTribute } from './NancySchaeferTribute';
import { toast } from 'sonner@2.0.3';
import heroImage from 'figma:asset/da7dee53b50fcb425e1a14bf57136ede67a0ca5a.png';
import logoImage from 'figma:asset/4d79a891e1263f20410892b0b4c2b4f9f8357e6b.png';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn?: () => void; // Add optional sign in handler
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showTribute, setShowTribute] = useState(() => {
    // Check if user has chosen to skip the tribute
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('skipSchaeferTribute');
    }
    return true;
  });

  // Handle plan selection
  const handlePlanSelect = (tier: 'free' | 'essential' | 'professional') => {
    // Store selected tier for after auth
    localStorage.setItem('cps_selected_tier', tier);
    
    if (tier === 'free') {
      // Free plan - just sign up
      toast.success('Starting with Free plan!');
      onGetStarted();
    } else {
      // Paid plans - go to sign up with tier pre-selected
      toast.success(`Selected ${tier === 'essential' ? 'Essential' : 'Professional'} plan - Create your account to continue`);
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nancy Schaefer Tribute Video - Shows on first visit unless skipped */}
      {showTribute && (
        <NancySchaeferTribute 
          autoplay={false} 
          onClose={() => setShowTribute(false)} 
        />
      )}

      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-2 px-4 text-center text-sm">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <Zap className="w-4 h-4" />
          <span className="font-semibold">Limited Time:</span> 
          <span>Get 50% off Professional plans with code DEFEND50</span>
          <ArrowRight className="w-4 h-4 hidden sm:inline" />
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Background Hero Image with enhanced overlay */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full overflow-hidden">
            <ImageWithFallback
              src={heroImage}
              alt="CPS Punisher Hero"
              className="w-full h-full opacity-50"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center center',
                minHeight: '100%',
                minWidth: '100%'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black" />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-6xl py-16 md:py-20">
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              AI-Powered Analysis
            </Badge>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <Shield className="w-3 h-3 mr-1" />
              50 States Covered
            </Badge>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <Lock className="w-3 h-3 mr-1" />
              100% Confidential
            </Badge>
          </div>

          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <ImageWithFallback
                src={logoImage}
                alt="The CPS Punisher Logo"
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 drop-shadow-2xl object-contain animate-pulse"
                style={{ animationDuration: '3s' }}
              />
              {/* Glow effect */}
              <div className="absolute inset-0 blur-2xl bg-red-600/30 -z-10" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 md:mb-4 tracking-tight animate-fade-in">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent drop-shadow-lg">
              THE CPS
            </span>
          </h1>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 tracking-wider animate-fade-in" 
              style={{ 
                fontFamily: 'Impact, "Arial Black", sans-serif',
                textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2)',
                animationDelay: '0.2s'
              }}>
            <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
              PUNISHER
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="h-px w-12 sm:w-16 md:w-24 lg:w-32 bg-gradient-to-r from-transparent to-red-600" />
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0 animate-pulse" />
            <div className="h-px w-12 sm:w-16 md:w-24 lg:w-32 bg-gradient-to-l from-transparent to-red-600" />
          </div>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 tracking-wide text-transparent bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text uppercase px-4">
            The Legal Educator They Didn't Want You To Find!
          </p>
          
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto text-gray-300 px-4 leading-relaxed">
            Analyze your CPS case, identify violations, and develop powerful defense strategies 
            to fight for your children and work toward reunification.
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 mb-8 px-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-black flex items-center justify-center text-xs">P</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-black flex items-center justify-center text-xs">M</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-black flex items-center justify-center text-xs">J</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-black flex items-center justify-center text-xs">S</div>
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">1,000+</span> parents fighting back with confidence
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 md:px-10 py-5 md:py-7 text-base md:text-lg shadow-2xl shadow-red-900/50 border-2 border-red-500 transition-all hover:scale-105 hover:shadow-red-900/70 group"
            >
              <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Free Trial Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto bg-white/5 border-2 border-white/30 hover:border-white hover:bg-white/10 text-white px-6 md:px-8 py-5 md:py-7 text-base md:text-lg backdrop-blur-sm transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Start in 60 Seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-800 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-3 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Trusted by Parents Nationwide
            </h2>
            <p className="text-gray-400">Real results, real impact</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm p-6 text-center hover:border-red-600/50 transition-all group">
              <div className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">24</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Violation Types</div>
              <div className="text-xs text-gray-500">Tracked & Analyzed</div>
            </Card>
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm p-6 text-center hover:border-red-600/50 transition-all group">
              <div className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">50</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">State Policies</div>
              <div className="text-xs text-gray-500">Complete Coverage</div>
            </Card>
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm p-6 text-center hover:border-red-600/50 transition-all group">
              <div className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">1K+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Active Users</div>
              <div className="text-xs text-gray-500">Fighting Back</div>
            </Card>
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm p-6 text-center hover:border-red-600/50 transition-all group">
              <div className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                <Brain className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">AI Analysis</div>
              <div className="text-xs text-gray-500">Instant Results</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Parents Are Winning
              </span>
            </h2>
            <p className="text-xl text-gray-400">Real stories from real families</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6 relative">
              <Quote className="w-10 h-10 text-red-600/30 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-lg">S</div>
                <div>
                  <div className="text-white font-semibold">Sarah M.</div>
                  <div className="text-sm text-gray-400">California</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                "The AI analysis found 6 violations in my CPS reports that even my attorney missed. This tool gave me the evidence I needed to fight back and win custody."
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6 relative">
              <Quote className="w-10 h-10 text-red-600/30 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg">M</div>
                <div>
                  <div className="text-white font-semibold">Marcus J.</div>
                  <div className="text-sm text-gray-400">Texas</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                "Reunited with my kids after 8 months. The violation checker and defense strategies were game-changers. Worth every penny and more."
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6 relative">
              <Quote className="w-10 h-10 text-red-600/30 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-lg">J</div>
                <div>
                  <div className="text-white font-semibold">Jennifer L.</div>
                  <div className="text-sm text-gray-400">Florida</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                "Finally, a tool that explains CPS procedures in plain English. The state policy engine helped me understand my rights and demand proper treatment."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="bg-red-600/10 border-red-600/30 text-red-400 mb-4">
              <Target className="w-3 h-3 mr-1" />
              Complete Defense Toolkit
            </Badge>
            <h2 className="text-4xl md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Powerful Defense Arsenal
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to analyze your case, identify violations, and build an effective defense strategy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature Card 1 */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-600/50 transition-all p-6 group hover:scale-105">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <FileSearch className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl mb-2 text-white">AI Document Analysis</h3>
              <p className="text-gray-400 text-sm">
                Upload CPS documents and get instant AI-powered analysis identifying violations, timeline events, and case details automatically.
              </p>
            </Card>

            {/* Feature Card 2 */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-600/50 transition-all p-6 group hover:scale-105">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl mb-2 text-white">Violation Detection</h3>
              <p className="text-gray-400 text-sm">
                Track 24 types of violations including constitutional rights, procedural errors, evidence issues, and service failures.
              </p>
            </Card>

            {/* Feature Card 3 */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-600/50 transition-all p-6 group hover:scale-105">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Scale className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl mb-2 text-white">Defense Strategies</h3>
              <p className="text-gray-400 text-sm">
                Generate specific legal defense strategies based on detected violations with relevant case law and constitutional arguments.
              </p>
            </Card>

            {/* Feature Card 4 */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-600/50 transition-all p-6 group hover:scale-105">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl mb-2 text-white">Case Timeline Builder</h3>
              <p className="text-gray-400 text-sm">
                Build a comprehensive timeline of events with automatic extraction from uploaded documents and export capabilities.
              </p>
            </Card>

            {/* Feature Card 5 */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-600/50 transition-all p-6 group hover:scale-105">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <BookOpen className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl mb-2 text-white">CPS Policy Engine</h3>
              <p className="text-gray-400 text-sm">
                Access state-specific CPS policies and regulations for all 50 states with citation-backed reference materials.
              </p>
            </Card>

            {/* Feature Card 6 */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-600/50 transition-all p-6 group hover:scale-105">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                <Brain className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl mb-2 text-white">CourtListener Integration</h3>
              <p className="text-gray-400 text-sm">
                Search millions of court opinions, track citations, and find relevant case law to support your defense.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Simple, powerful, and designed for parents fighting CPS
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-2xl mb-2 text-white">Upload Your Documents</h3>
                  <p className="text-gray-400">
                    Upload CPS reports, court orders, case plans, and any other documents. Our AI instantly analyzes them for violations and key information.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-2xl mb-2 text-white">Review AI Analysis</h3>
                  <p className="text-gray-400">
                    Get instant insights on potential violations, timeline events, and case details automatically extracted from your documents.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-2xl mb-2 text-white">Build Your Defense</h3>
                  <p className="text-gray-400">
                    Generate specific defense strategies, access relevant case law, and prepare compelling arguments backed by constitutional rights.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-2xl mb-2 text-white">Fight & Reunify</h3>
                  <p className="text-gray-400">
                    Armed with comprehensive analysis and defense strategies, work with your attorney to fight for your rights and reunify with your children.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tease Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Pricing Plans
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6 flex flex-col">
              <h3 className="text-2xl mb-2 text-white">Free</h3>
              <div className="text-4xl mb-4">
                <span className="text-white">$0</span>
              </div>
              <ul className="space-y-3 mb-6 flex-grow">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>3 document uploads</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Basic AI analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Violation checker</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Rights guide access</span>
                </li>
              </ul>
              <Button 
                onClick={() => handlePlanSelect('free')}
                variant="outline"
                className="w-full border-gray-600 hover:border-gray-500 hover:bg-gray-800 text-white"
              >
                Get Started Free
              </Button>
            </Card>

            {/* Essential Plan */}
            <Card className="bg-gradient-to-br from-red-900 to-red-950 border-red-600 p-6 relative overflow-hidden scale-105 flex flex-col">
              <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded">
                POPULAR
              </div>
              <h3 className="text-2xl mb-2 text-white">Essential</h3>
              <div className="text-4xl mb-4">
                <span className="text-white">$39</span>
                <span className="text-gray-400 text-lg">/mo</span>
              </div>
              <ul className="space-y-3 mb-6 flex-grow">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>25 document uploads</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Advanced AI analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>CourtListener access</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>State policy engine</span>
                </li>
              </ul>
              <Button 
                onClick={() => handlePlanSelect('essential')}
                className="w-full bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
              >
                Choose Essential
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 p-6 flex flex-col">
              <h3 className="text-2xl mb-2 text-white">Professional</h3>
              <div className="text-4xl mb-4">
                <span className="text-white">$79</span>
                <span className="text-gray-400 text-lg">/mo</span>
              </div>
              <ul className="space-y-3 mb-6 flex-grow">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unlimited uploads</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Premium AI features</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Document generator</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button 
                onClick={() => handlePlanSelect('professional')}
                variant="outline"
                className="w-full border-gray-600 hover:border-gray-500 hover:bg-gray-800 text-white"
              >
                Choose Professional
              </Button>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Attorney and Enterprise plans also available
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl mb-4">
                <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                  Common Questions
                </span>
              </h2>
              <p className="text-xl text-gray-400">Everything you need to know</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Is The CPS Punisher legal advice?",
                  a: "No, The CPS Punisher is an educational tool that helps you understand CPS procedures, identify potential violations, and research case law. Always consult with a qualified family law attorney for legal advice specific to your case."
                },
                {
                  q: "How does the AI document analysis work?",
                  a: "Our AI analyzes your uploaded CPS documents to identify potential violations, extract timeline events, and highlight key case information. It uses advanced natural language processing trained on CPS regulations and case law from all 50 states."
                },
                {
                  q: "What's included in the free plan?",
                  a: "The free plan includes 3 document uploads, basic AI analysis, access to the violation checker, timeline builder, and comprehensive rights guide. Upgrade anytime for unlimited uploads and premium features."
                },
                {
                  q: "Can I use this if I already have an attorney?",
                  a: "Absolutely! Many users work alongside their attorneys. The CPS Punisher helps you stay informed, identify issues your attorney might miss, and communicate more effectively with your legal team."
                },
                {
                  q: "Is my data secure and confidential?",
                  a: "Yes. All data is encrypted end-to-end, stored securely, and never shared with third parties. We take your privacy seriously and comply with all data protection regulations."
                },
                {
                  q: "Which states are covered?",
                  a: "All 50 states! Our CPS Policy Engine includes state-specific regulations, procedures, and case law for every U.S. state and territory."
                }
              ].map((faq, i) => (
                <Card key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-medium">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-black via-gray-900 to-gray-900 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <ImageWithFallback
                  src={logoImage}
                  alt="The CPS Punisher Logo"
                  className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl object-contain"
                />
                <div className="absolute inset-0 blur-2xl bg-red-600/40 -z-10" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl mb-6">
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Ready to Fight Back?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              Join over 1,000 parents who are using The CPS Punisher to analyze their cases, 
              identify violations, and build powerful defense strategies.
            </p>
            
            <p className="text-lg text-red-400 mb-10 font-semibold">
              Your children are counting on you. Start today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-7 text-xl shadow-2xl shadow-red-900/50 border-2 border-red-500 transition-all hover:scale-110 group"
              >
                <Shield className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Start Your Free Account
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Setup in 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-12 border-t border-gray-800">
              <p className="text-gray-500 text-sm mb-6">Trusted and secured by industry leaders</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm">256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">SOC 2 Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <ImageWithFallback
                  src={logoImage}
                  alt="The CPS Punisher Logo"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="text-white font-semibold">The CPS Punisher</div>
                  <div className="text-xs text-gray-500">Fight back with intelligence</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering parents to defend their rights and reunify with their children.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Rights Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">State Policies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p className="mb-2">© 2024-2025 The CPS Punisher. All rights reserved.</p>
              <p className="text-xs font-semibold text-gray-400 mb-2">Copyright Owner: DARREN GUAY</p>
              <p className="text-xs">
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Educational Tool - Not Legal Advice.
                </span>
                {" "}Always consult with a qualified attorney.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to Top ↑
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Comprehensive Legal Disclaimer Footer */}
      <FooterDisclaimer />

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
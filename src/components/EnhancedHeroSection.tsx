import React from 'react';
import { Shield, Scale, Target, Zap, Users, Briefcase } from 'lucide-react';
import logoImage from 'figma:asset/3ff72041057ebb2453918c5fc4ca98f06cbb9c29.png';

interface EnhancedHeroSectionProps {
  onSelectParent?: () => void;
  onSelectAttorney?: () => void;
}

export function EnhancedHeroSection({ onSelectParent, onSelectAttorney }: EnhancedHeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-blue-950" />
        
        {/* Animated Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          {/* Logo Image with Glow */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full" />
            <img 
              src={logoImage} 
              alt="The CPS Punisher" 
              className="relative h-24 sm:h-32 md:h-40 lg:h-48 w-auto object-contain drop-shadow-2xl animate-float"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-center mb-4 sm:mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
              THE CPS
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg">
              PUNISHER
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-bold text-center mb-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            ⚖️ Fight Back With Intelligence
          </p>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-gray-400 text-center max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            The most powerful CPS case defense platform ever created. 
            Analyze documents, identify violations, and build winning strategies.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 sm:mb-16 md:mb-20 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-gradient-to-br from-red-900/40 to-red-950/40 border border-red-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-red-400 mb-1">324+</div>
            <div className="text-xs sm:text-sm text-gray-400">Features</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-400 mb-1">98+</div>
            <div className="text-xs sm:text-sm text-gray-400">Legal Resources</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-400 mb-1">82</div>
            <div className="text-xs sm:text-sm text-gray-400">MS Courts</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 border border-green-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-green-400 mb-1">24/7</div>
            <div className="text-xs sm:text-sm text-gray-400">AI Analysis</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 md:mb-20 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 hover:border-red-500/50 transition-all hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">AI Document Analysis</h3>
            <p className="text-xs sm:text-sm text-gray-400">Instant violation detection on every upload</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 hover:border-blue-500/50 transition-all hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center mb-3">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Federal Court Docs</h3>
            <p className="text-xs sm:text-sm text-gray-400">Section 1983 lawsuits & civil rights claims</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Multi-Case Manager</h3>
            <p className="text-xs sm:text-sm text-gray-400">Track unlimited cases with dedicated dashboards</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 hover:border-green-500/50 transition-all hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Strategy Generator</h3>
            <p className="text-xs sm:text-sm text-gray-400">Custom defense strategies from your evidence</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 hover:border-yellow-500/50 transition-all hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center mb-3">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Legal Resources</h3>
            <p className="text-xs sm:text-sm text-gray-400">Federal & state laws, courts, statutes</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">Community Hub</h3>
            <p className="text-xs sm:text-sm text-gray-400">Connect with advocates & find attorneys</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '1s' }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Choose Your Path</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Select your role to access the most powerful CPS defense tools available
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Parent Card */}
            <button
              onClick={onSelectParent}
              className="group relative bg-gradient-to-br from-red-900/40 via-red-950/40 to-black/40 border-2 border-red-700/50 rounded-2xl p-8 sm:p-10 hover:border-red-500 transition-all hover:scale-105 text-left backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white">I'm a Parent</h3>
                <p className="text-base sm:text-lg text-gray-300 mb-4 leading-relaxed">
                  Fighting a CPS case and need powerful tools to analyze documents, identify violations, and build your defense.
                </p>
                <div className="flex items-center text-red-400 font-bold text-base sm:text-lg">
                  Continue as Parent
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Attorney Card */}
            <button
              onClick={onSelectAttorney}
              className="group relative bg-gradient-to-br from-blue-900/40 via-blue-950/40 to-black/40 border-2 border-blue-700/50 rounded-2xl p-8 sm:p-10 hover:border-blue-500 transition-all hover:scale-105 text-left backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white">I'm an Attorney</h3>
                <p className="text-base sm:text-lg text-gray-300 mb-4 leading-relaxed">
                  Professional litigation tools, federal court documents, multi-case management, and advanced analytics.
                </p>
                <div className="flex items-center text-blue-400 font-bold text-base sm:text-lg">
                  Continue as Attorney
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 md:mt-20 text-center animate-slide-up" style={{ animationDelay: '1.2s' }}>
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-xs sm:text-sm text-gray-300">Trusted by parents nationwide</span>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
          animation-fill-mode: both;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
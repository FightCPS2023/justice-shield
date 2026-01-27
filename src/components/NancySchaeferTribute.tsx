import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Volume2, VolumeX, Play, Pause, X } from 'lucide-react';

interface NancySchaeferTributeProps {
  autoplay?: boolean;
  onClose?: () => void;
}

export function NancySchaeferTribute({ autoplay = false, onClose }: NancySchaeferTributeProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const handleClose = () => {
    setShowVideo(false);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleNeverShowAgain = () => {
    localStorage.setItem('skipSchaeferTribute', 'true');
    handleClose();
  };

  if (!showVideo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-800 border-red-900/50 shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                In Memory of Senator Nancy Schaefer
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Georgia State Senator Nancy Schaefer (1936-2010) was a courageous advocate for families 
                and children. Her groundbreaking 2007 report "The Corrupt Business of Child Protective Services" 
                and her passionate speeches to the Georgia Senate exposed systemic issues in the child welfare system. 
                She dedicated her life to protecting parental rights and reforming CPS.
              </p>
              <p className="text-red-400 text-xs mt-2 italic">
                "Until the parents are guilty of a crime, the children belong to the parents, not the state."
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="ml-4 text-slate-400 hover:text-white hover:bg-red-900/20 flex-shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="p-6">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {/* YouTube Embed - Nancy Schaefer's Georgia Senate Speech */}
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
              src={`https://www.youtube.com/embed/96TVnGQnVAg?autoplay=${autoplay ? '1' : '0'}&rel=0`}
              title="Senator Nancy Schaefer - Georgia Senate Speech on CPS"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Video Information */}
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">
              <strong>📹 Video:</strong> Nancy Schaefer's powerful testimony exposing the corruption and perverse incentives in the Child Protective Services system.
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Senator Schaefer's courage in speaking truth to power continues to inspire advocates nationwide.
            </p>
          </div>
        </div>

        {/* Footer with tribute */}
        <div className="p-6 border-t border-red-900/30 bg-slate-950/50">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">
              Senator Schaefer's work continues to inspire advocates fighting for family preservation 
              and CPS accountability across America.
            </p>
            <p className="text-slate-500 text-xs">
              The CPS Punisher honors her legacy by empowering families with the tools 
              to defend their constitutional rights and fight for their children.
            </p>
          </div>
          
          {/* Action Buttons - Fixed for better visibility */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 mb-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              size="lg"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white min-h-[44px]"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleClose}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]"
            >
              Continue to App
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://www.youtube.com/watch?v=96TVnGQnVAg', '_blank')}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 min-h-[44px]"
            >
              Watch on YouTube
            </Button>
          </div>
          
          {/* Don't Show Again Option */}
          <div className="text-center mt-4 pb-2">
            <button
              onClick={handleNeverShowAgain}
              className="text-slate-500 hover:text-slate-400 text-sm underline transition-colors cursor-pointer min-h-[32px] px-4 py-2"
            >
              Don't show this again
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Alternative: Audio-only version (if video not available)
export function NancySchaeferAudioTribute({ autoplay = false, onClose }: NancySchaeferTributeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-900/20 to-slate-900/20 border border-red-900/30 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlay}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-600 mb-2">
            🎤 Listen: Senator Nancy Schaefer's Historic Georgia Senate Speech
          </h3>
          <p className="text-slate-300 text-sm mb-3">
            Georgia State Senator Nancy Schaefer exposed the truth about CPS corruption 
            in her powerful 2007 testimony. Her courage continues to inspire our fight 
            for family preservation and parental rights.
          </p>
          
          {/* Audio Player */}
          <audio
            ref={audioRef}
            src="/path-to-audio-file.mp3"
            onEnded={() => setIsPlaying(false)}
            className="w-full"
          />
          
          <p className="text-slate-500 text-xs mt-2 italic">
            "Until the parents are guilty of a crime, the children belong to the parents, not the state."
            <br />- Senator Nancy Schaefer
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
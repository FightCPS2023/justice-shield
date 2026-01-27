import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Mic, Play, Pause, Download, Volume2, AlertCircle, CheckCircle, Users, Sparkles } from "lucide-react";
import { Slider } from "./ui/slider";

interface Document {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  analysis?: any;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface CasePodcastProps {
  documents: Document[];
  violations: { [key: string]: boolean };
  timelineEvents: TimelineEvent[];
  caseDetails: {
    caseNumber: string;
    county: string;
    dateOpened: string;
    caseworker: string;
    attorney: string;
  };
}

interface PodcastSegment {
  speaker: string;
  text: string;
  voiceName: string;
  gender: 'female' | 'male';
  pitch: number;
  rate: number;
}

export function CasePodcast({ documents, violations, timelineEvents, caseDetails }: CasePodcastProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [podcast, setPodcast] = useState<PodcastSegment[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [transcript, setTranscript] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [useEnhancedVoices, setUseEnhancedVoices] = useState(true);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Load available voices when component mounts
  useState(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Log available voices for debugging
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    };

    // Voices are loaded asynchronously
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  });

  // Enhanced voice selection with premium voices prioritized
  const getBestVoice = (preferredGender: 'female' | 'male', preferredName?: string) => {
    if (availableVoices.length === 0) return null;

    // Try to find exact match first
    if (preferredName) {
      const exactMatch = availableVoices.find(v => v.name.toLowerCase().includes(preferredName.toLowerCase()));
      if (exactMatch) return exactMatch;
    }

    // Filter English voices
    const englishVoices = availableVoices.filter(v => 
      v.lang.includes('en-') || v.lang === 'en'
    );

    if (englishVoices.length === 0) return availableVoices[0];

    // PRIORITY 1: Google enhanced voices (most natural)
    const googleEnhanced = englishVoices.filter(v => 
      v.name.includes('Google') && 
      (v.name.includes('Neural') || v.name.includes('Wavenet') || v.name.includes('Studio'))
    );

    // PRIORITY 2: Microsoft Natural voices
    const microsoftNatural = englishVoices.filter(v =>
      v.name.includes('Microsoft') && v.name.includes('Natural')
    );

    // PRIORITY 3: Apple premium voices
    const applePremium = englishVoices.filter(v =>
      (v.name.includes('Samantha') || v.name.includes('Alex') || 
       v.name.includes('Karen') || v.name.includes('Daniel')) &&
      v.lang.includes('en-US')
    );

    // Gender-specific voice selection with priority order
    if (preferredGender === 'female') {
      // Priority list for female voices (enhanced first)
      const femaleNames = [
        'neural', 'wavenet', 'studio', 'natural',  // Premium indicators
        'samantha', 'karen', 'victoria', 'zira', 'hazel', 'serena',
        'google us english female', 'microsoft zira natural', 'female'
      ];
      
      // Try Google enhanced first
      for (const voice of googleEnhanced) {
        if (!voice.name.toLowerCase().includes('male') && 
            !voice.name.toLowerCase().includes('david')) {
          return voice;
        }
      }

      // Try Microsoft Natural
      for (const voice of microsoftNatural) {
        if (!voice.name.toLowerCase().includes('male') &&
            !voice.name.toLowerCase().includes('guy')) {
          return voice;
        }
      }

      // Try Apple premium
      for (const voice of applePremium) {
        const nameLower = voice.name.toLowerCase();
        if (nameLower.includes('samantha') || nameLower.includes('karen')) {
          return voice;
        }
      }
      
      // Try specific names
      for (const name of femaleNames) {
        const voice = englishVoices.find(v => v.name.toLowerCase().includes(name));
        if (voice && !voice.name.toLowerCase().includes('male')) return voice;
      }

      // Fallback: any voice that doesn't have male indicators
      const femaleVoice = englishVoices.find(v => 
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('david') &&
        !v.name.toLowerCase().includes('mark') &&
        !v.name.toLowerCase().includes('james')
      );
      if (femaleVoice) return femaleVoice;
    } else {
      // Priority list for male voices (enhanced first)
      const maleNames = [
        'neural', 'wavenet', 'studio', 'natural',  // Premium indicators
        'alex', 'daniel', 'david', 'mark', 'james', 'christopher',
        'google uk english male', 'microsoft david natural', 'male'
      ];
      
      // Try Google enhanced first
      for (const voice of googleEnhanced) {
        const nameLower = voice.name.toLowerCase();
        if (nameLower.includes('male') || nameLower.includes('guy') ||
            nameLower.includes('david') || nameLower.includes('en-gb')) {
          return voice;
        }
      }

      // Try Microsoft Natural
      for (const voice of microsoftNatural) {
        if (voice.name.toLowerCase().includes('guy') ||
            voice.name.toLowerCase().includes('david')) {
          return voice;
        }
      }

      // Try Apple premium
      for (const voice of applePremium) {
        const nameLower = voice.name.toLowerCase();
        if (nameLower.includes('alex') || nameLower.includes('daniel')) {
          return voice;
        }
      }
      
      // Try specific names
      for (const name of maleNames) {
        const voice = englishVoices.find(v => v.name.toLowerCase().includes(name));
        if (voice) return voice;
      }

      // Fallback: any voice with male indicators
      const maleVoice = englishVoices.find(v => 
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('daniel')
      );
      if (maleVoice) return maleVoice;
    }

    // Final fallback
    return englishVoices[0];
  };

  const speakers = {
    host: { 
      name: "Sarah - Host & Defense Strategist", 
      gender: 'female' as const,
      voiceName: 'samantha',
      pitch: 1.1, 
      rate: 1.0 
    },
    attorney: { 
      name: "Michael - Family Rights Attorney", 
      gender: 'male' as const,
      voiceName: 'alex',
      pitch: 0.85, 
      rate: 0.95 
    },
    analyst: { 
      name: "Dr. Chen - Legal Analyst", 
      gender: 'female' as const,
      voiceName: 'karen',
      pitch: 1.05, 
      rate: 0.92 
    },
  };

  const generatePodcastScript = () => {
    const violationCount = Object.values(violations).filter(Boolean).length;
    const hasDocuments = documents.length > 0;
    const hasTimeline = timelineEvents.length > 0;
    
    const script: PodcastSegment[] = [];

    // Opening
    script.push({
      speaker: "Host",
      text: `Welcome to CPS Case Defense Analysis. I'm Sarah, and today we're doing a deep dive into a child protective services case. We have ${documents.length} documents uploaded, ${violationCount} potential violations identified, and ${timelineEvents.length} timeline events to review. Joining me are Michael, a family rights attorney with 15 years of experience, and Dr. Chen, our legal analyst specializing in constitutional law. Let's get started.`,
      voiceName: speakers.host.voiceName,
      gender: speakers.host.gender,
      pitch: speakers.host.pitch,
      rate: speakers.host.rate
    });

    // Case Overview
    if (caseDetails.caseNumber || caseDetails.county) {
      script.push({
        speaker: "Attorney",
        text: `Thanks Sarah. ${caseDetails.caseNumber ? `This is case number ${caseDetails.caseNumber}` : 'Looking at this case'}, ${caseDetails.county ? `in ${caseDetails.county} County` : ''}. ${caseDetails.dateOpened ? `The case was opened on ${new Date(caseDetails.dateOpened).toLocaleDateString()}.` : ''} Right away, I want to emphasize that parents have constitutional rights that CPS cannot simply ignore. The Fourth Amendment protects against unreasonable searches, and the Fourteenth Amendment guarantees due process.`,
        voiceName: speakers.attorney.voiceName,
        gender: speakers.attorney.gender,
        pitch: speakers.attorney.pitch,
        rate: speakers.attorney.rate
      });
    }

    // Violation Analysis
    if (violationCount > 0) {
      const violationList = Object.entries(violations)
        .filter(([_, isViolated]) => isViolated)
        .map(([key]) => key.replace(/_/g, ' '));

      script.push({
        speaker: "Analyst",
        text: `The violation analysis is critical here. We've identified ${violationCount} potential violations. ${violationCount > 5 ? 'This is a significant number that suggests systemic problems with how this case has been handled.' : 'Each of these needs to be carefully documented and challenged.'}`,
        voiceName: speakers.analyst.voiceName,
        gender: speakers.analyst.gender,
        pitch: speakers.analyst.pitch,
        rate: speakers.analyst.rate
      });

      // Discuss first few violations in detail
      const topViolations = violationList.slice(0, 3);
      topViolations.forEach((violation, index) => {
        if (violation.includes('fourth amendment')) {
          script.push({
            speaker: "Attorney",
            text: `The Fourth Amendment violation is huge. This could be grounds for suppressing evidence. In the Ninth Circuit case Wallis versus Spencer from 2022, the court held that CPS workers need either consent, a warrant, or exigent circumstances. If they violated this in your case, everything that came after could be challenged.`,
            voiceName: speakers.attorney.voiceName,
            gender: speakers.attorney.gender,
            pitch: speakers.attorney.pitch,
            rate: speakers.attorney.rate
          });
        } else if (violation.includes('due process')) {
          script.push({
            speaker: "Analyst",
            text: `Due process violations are fundamental. Parents have a right to notice and a meaningful opportunity to be heard. The Supreme Court has consistently held that the interest of parents in the care and custody of their children is perhaps the oldest of the fundamental liberty interests. Any denial of due process should be immediately challenged.`,
            voiceName: speakers.analyst.voiceName,
            gender: speakers.analyst.gender,
            pitch: speakers.analyst.pitch,
            rate: speakers.analyst.rate
          });
        } else if (violation.includes('miranda') || violation.includes('interrogation')) {
          script.push({
            speaker: "Attorney",
            text: `The interrogation issue is something many parents don't realize. If CPS questioned you without informing you of your rights, especially if it felt coercive, that's a problem. You have the right to remain silent and the right to an attorney. Anything you said under those circumstances could potentially be suppressed.`,
            voiceName: speakers.attorney.voiceName,
            gender: speakers.attorney.gender,
            pitch: speakers.attorney.pitch,
            rate: speakers.attorney.rate
          });
        }
      });

      script.push({
        speaker: "Host",
        text: `So we have multiple angles of attack here. Michael, what's your recommended strategy?`,
        voiceName: speakers.host.voiceName,
        gender: speakers.host.gender,
        pitch: speakers.host.pitch,
        rate: speakers.host.rate
      });
    }

    // Document Analysis
    if (hasDocuments) {
      const criticalDocs = documents.filter(doc => 
        doc.analysis?.riskLevel === 'critical' || doc.analysis?.riskLevel === 'high'
      );

      script.push({
        speaker: "Attorney",
        text: `Looking at the documents, ${criticalDocs.length > 0 ? `we have ${criticalDocs.length} that I consider high priority.` : 'we need to examine each one carefully.'} Every statement CPS makes needs to be challenged if it's not supported by evidence. Remember, they have the burden of proof. You don't have to prove your innocence, they have to prove their case.`,
        voiceName: speakers.attorney.voiceName,
        gender: speakers.attorney.gender,
        pitch: speakers.attorney.pitch,
        rate: speakers.attorney.rate
      });

      // Discuss specific document issues
      documents.slice(0, 2).forEach(doc => {
        if (doc.analysis?.identifiedViolations?.length > 0) {
          script.push({
            speaker: "Analyst",
            text: `In the document titled "${doc.title}", we found ${doc.analysis.identifiedViolations.length} specific violations. This document alone could be the basis for multiple motions. ${doc.analysis.summary}`,
            voiceName: speakers.analyst.voiceName,
            gender: speakers.analyst.gender,
            pitch: speakers.analyst.pitch,
            rate: speakers.analyst.rate
          });
        }
      });
    }

    // Strategic Recommendations
    script.push({
      speaker: "Host",
      text: `Let's talk strategy. What should the parent be doing right now?`,
      voiceName: speakers.host.voiceName,
      gender: speakers.host.gender,
      pitch: speakers.host.pitch,
      rate: speakers.host.rate
    });

    script.push({
      speaker: "Attorney",
      text: `First, document everything. Every interaction, every phone call, every visit. Get it in writing. Second, stop talking to CPS without your attorney present. You have that right. Third, file motions challenging these violations. Don't wait. Time is critical in these cases. Fourth, demand discovery. Get every document, every photo, every note they have. Fifth, consider filing a civil rights lawsuit under Section 1983 if your rights were clearly violated.`,
      voiceName: speakers.attorney.voiceName,
      gender: speakers.attorney.gender,
      pitch: speakers.attorney.pitch,
      rate: speakers.attorney.rate
    });

    script.push({
      speaker: "Analyst",
      text: `I'd add that you should request all recordings if any were made. Request all emails between CPS workers. Look for inconsistencies in their reports. CPS workers often write reports that don't match what actually happened. Catch them in those inconsistencies and use them to impeach their credibility.`,
      voiceName: speakers.analyst.voiceName,
      gender: speakers.analyst.gender,
      pitch: speakers.analyst.pitch,
      rate: speakers.analyst.rate
      });

    // Timeline Strategy
    if (hasTimeline) {
      script.push({
        speaker: "Host",
        text: `We have ${timelineEvents.length} events in the timeline. Why is that important?`,
        voiceName: speakers.host.voiceName,
        gender: speakers.host.gender,
        pitch: speakers.host.pitch,
        rate: speakers.host.rate
      });

      script.push({
        speaker: "Attorney",
        text: `The timeline is crucial because CPS has deadlines. They have to file petitions within certain timeframes. They have to hold hearings within certain periods. If they violated any of those deadlines, that's grounds for dismissal. Also, the timeline helps us see patterns. Did they escalate too quickly? Did they fail to offer services? Did they remove children without following proper procedures?`,
        voiceName: speakers.attorney.voiceName,
        gender: speakers.attorney.gender,
        pitch: speakers.attorney.pitch,
        rate: speakers.attorney.rate
      });
    }

    // Specific Motion Recommendations
    script.push({
      speaker: "Analyst",
      text: `Based on what we're seeing, here are specific motions you should consider filing. One: Motion to Suppress Evidence obtained through Fourth Amendment violations. Two: Motion to Dismiss for failure to meet burden of proof. Three: Motion for Reunification with a detailed service plan. Four: Motion to Compel Discovery if they're withholding documents. Five: Motion for Sanctions if they've engaged in misconduct.`,
      voiceName: speakers.analyst.voiceName,
      gender: speakers.analyst.gender,
      pitch: speakers.analyst.pitch,
      rate: speakers.analyst.rate
    });

    // Common Errors Discussion
    script.push({
      speaker: "Host",
      text: `What are the most common errors CPS makes that parents can use in their defense?`,
      voiceName: speakers.host.voiceName,
      gender: speakers.host.gender,
      pitch: speakers.host.pitch,
      rate: speakers.host.rate
    });

    script.push({
      speaker: "Attorney",
      text: `Great question. Number one: they don't have probable cause but they remove anyway. Number two: they fail to offer reasonable services before removal. Number three: they coerce parents into signing safety plans without explaining that it's voluntary. Number four: they threaten parents that if they don't cooperate, they'll lose their kids. Number five: they make findings without actual evidence, just speculation. Number six: they fail to consider placement with relatives. All of these are reversible errors.`,
      voiceName: speakers.attorney.voiceName,
      gender: speakers.attorney.gender,
      pitch: speakers.attorney.pitch,
      rate: speakers.attorney.rate
    });

    // Case Law to Cite
    script.push({
      speaker: "Analyst",
      text: `Let me give you some case law ammunition. Troxel versus Granville, Supreme Court, 2000: parents have a fundamental right to make decisions about their children. Santosky versus Kramer, 1982: the state must prove its case by clear and convincing evidence. Stanley versus Illinois, 1972: parents cannot be separated from children without due process. Cite these cases in every motion and brief.`,
      voiceName: speakers.analyst.voiceName,
      gender: speakers.analyst.gender,
      pitch: speakers.analyst.pitch,
      rate: speakers.analyst.rate
    });

    // Closing Strategy
    script.push({
      speaker: "Host",
      text: `As we wrap up, what's the most important thing to remember?`,
      voiceName: speakers.host.voiceName,
      gender: speakers.host.gender,
      pitch: speakers.host.pitch,
      rate: speakers.host.rate
    });

    script.push({
      speaker: "Attorney",
      text: `Don't give up. These cases are winnable. CPS makes mistakes. They violate rights. They overreach. Your job is to catch every single violation, document it, challenge it, and hold them accountable. You have constitutional rights. The burden is on them, not you. Fight for your children. Use every tool, every motion, every legal argument available. And most importantly, get a good attorney who will actually fight for you.`,
      voiceName: speakers.attorney.voiceName,
      gender: speakers.attorney.gender,
      pitch: speakers.attorney.pitch,
      rate: speakers.attorney.rate
    });

    script.push({
      speaker: "Host",
      text: `Thank you Michael and Dr. Chen. To the parent listening, remember: you are not alone. Document everything. Challenge everything. And never stop fighting for your family. This has been CPS Case Defense Analysis. Stay strong.`,
      voiceName: speakers.host.voiceName,
      gender: speakers.host.gender,
      pitch: speakers.host.pitch,
      rate: speakers.host.rate
    });

    return script;
  };

  const generatePodcast = async () => {
    setIsGenerating(true);
    
    try {
      const script = generatePodcastScript();
      setPodcast(script);
      
      // Generate transcript
      const transcriptText = script.map((segment, index) => 
        `[${segment.speaker}]: ${segment.text}\n\n`
      ).join('');
      setTranscript(transcriptText);
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating podcast:', error);
      setIsGenerating(false);
    }
  };

  const playPodcast = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(true);
    setCurrentSegment(0);
    playSegment(0);
  };

  const playSegment = (index: number) => {
    if (index >= podcast.length) {
      setIsPlaying(false);
      setCurrentSegment(0);
      return;
    }

    const segment = podcast[index];
    const utterance = new SpeechSynthesisUtterance(segment.text);
    
    // Try to find the voice
    const voices = window.speechSynthesis.getVoices();
    const voice = getBestVoice(segment.gender, segment.voiceName) || voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.pitch = segment.pitch;
    utterance.rate = segment.rate * playbackSpeed;
    
    utterance.onend = () => {
      setCurrentSegment(index + 1);
      playSegment(index + 1);
    };

    utterance.onerror = () => {
      console.error('Speech synthesis error');
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pausePodcast = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const stopPodcast = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment(0);
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cps-case-podcast-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const violationCount = Object.values(violations).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1">Case Analysis Podcast</div>
        <p className="text-sm text-muted-foreground">
          Generate an AI-powered podcast discussion analyzing your case with multiple legal perspectives
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">How It Works</AlertTitle>
            <AlertDescription className="text-blue-800">
              This feature generates a podcast-style discussion with three expert voices analyzing your case:
              a defense strategist, a family rights attorney, and a legal analyst. They'll discuss violations,
              strategies, and specific actions you should take.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <Card className="p-4 bg-muted">
              <div className="text-sm mb-2">Your Case Data:</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Documents</div>
                  <div>{documents.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Violations</div>
                  <div>{violationCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Timeline Events</div>
                  <div>{timelineEvents.length}</div>
                </div>
              </div>
            </Card>

            {podcast.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="mb-2">No Podcast Generated Yet</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to generate an AI-powered discussion analyzing your case
                </p>
                <Button 
                  onClick={generatePodcast} 
                  disabled={isGenerating || documents.length === 0}
                  size="lg"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Podcast'}
                </Button>
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Add at least one document to generate a podcast
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">Podcast Ready!</AlertTitle>
                  <AlertDescription className="text-green-800">
                    Your podcast has been generated with {podcast.length} segments. 
                    Estimated length: {Math.ceil(podcast.length * 0.5)} minutes.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2">
                  {!isPlaying && !isPaused ? (
                    <Button onClick={playPodcast} size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Play Podcast
                    </Button>
                  ) : isPlaying ? (
                    <Button onClick={pausePodcast} size="lg" variant="secondary">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <>
                      <Button onClick={playPodcast} size="lg">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                      <Button onClick={stopPodcast} variant="outline">
                        Stop
                      </Button>
                    </>
                  )}
                  
                  <Button onClick={downloadTranscript} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Transcript
                  </Button>

                  <Button onClick={generatePodcast} variant="outline">
                    <Mic className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>

                {isPlaying && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Playback Speed: {playbackSpeed}x</span>
                      <span>Segment {currentSegment + 1} of {podcast.length}</span>
                    </div>
                    <Slider
                      value={[playbackSpeed]}
                      onValueChange={(value) => setPlaybackSpeed(value[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                )}

                <Card className="p-4 bg-muted">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4" />
                    <div className="text-sm">Current Speaker:</div>
                  </div>
                  {isPlaying && podcast[currentSegment] && (
                    <div className="space-y-2">
                      <Badge>{podcast[currentSegment].speaker}</Badge>
                      <p className="text-sm">{podcast[currentSegment].text}</p>
                    </div>
                  )}
                  {!isPlaying && (
                    <p className="text-sm text-muted-foreground">
                      Press play to start the podcast
                    </p>
                  )}
                </Card>

                <details className="mt-4">
                  <summary className="text-sm cursor-pointer hover:text-primary mb-2">
                    View Full Transcript ({podcast.length} segments)
                  </summary>
                  <Card className="p-4 bg-muted max-h-96 overflow-y-auto">
                    <div className="space-y-4 text-sm">
                      {podcast.map((segment, index) => (
                        <div key={index} className={currentSegment === index && isPlaying ? 'bg-blue-100 p-2 rounded' : ''}>
                          <div className="mb-1">
                            <Badge variant={currentSegment === index && isPlaying ? 'default' : 'outline'}>
                              {segment.speaker}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{segment.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </details>
              </div>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Note: This podcast uses your browser's text-to-speech. For best results, use Chrome or Edge.
              The voices will automatically switch between speakers to create a natural conversation.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
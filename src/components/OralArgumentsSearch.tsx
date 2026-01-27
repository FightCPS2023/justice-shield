import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, 
  Headphones, 
  ExternalLink, 
  Loader2,
  AlertCircle,
  Download,
  Play,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { searchCPSOralArguments, formatDuration } from '../utils/courtlistener-api';

interface OralArgumentsSearchProps {
  userState: string;
  violations: any;
}

export function OralArgumentsSearch({ userState, violations }: OralArgumentsSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [audioResults, setAudioResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setAudioResults([]);
    
    try {
      const response = await fetch(
        `https://www.courtlistener.com/api/rest/v4/audio/?format=json&q=${encodeURIComponent(searchQuery)}&order_by=date_created+desc`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setAudioResults(data.results || []);
      setTotalResults(data.count || 0);
      setIsSearching(false);
    } catch (error: any) {
      console.error('Oral Arguments API Error:', error);
      setSearchError(
        error.message || 'Failed to search oral arguments. Please try again.'
      );
      setIsSearching(false);
    }
  };

  // Get active violations
  const activeViolations = Object.entries(violations)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  // Suggested searches based on violations
  const suggestedSearches = [
    'child protective services parental rights',
    'fourth amendment CPS investigation',
    'termination parental rights due process',
    'reasonable efforts family reunification',
    'ICWA Indian Child Welfare Act',
    'juvenile dependency hearing'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <Headphones className="size-6" />
          Oral Arguments Library
        </h2>
        <p className="text-muted-foreground mt-2">
          Listen to actual courtroom arguments to learn persuasive legal techniques
        </p>
      </div>

      <Alert>
        <Sparkles className="size-4" />
        <AlertDescription>
          <strong>Why Listen to Oral Arguments?</strong> Hearing how experienced attorneys argue CPS cases 
          before judges gives you insight into:
          <ul className="mt-2 ml-4 space-y-1 text-sm">
            <li>• Persuasive framing techniques</li>
            <li>• How judges think about these issues</li>
            <li>• Responses to tough questions</li>
            <li>• Which arguments succeed</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5" />
            Search Oral Arguments
          </CardTitle>
          <CardDescription>
            Search the largest collection of oral argument recordings on the Internet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search for Oral Arguments</label>
            <div className="flex gap-2">
              <Input
                placeholder='Try: "child protective services" or "parental rights"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Search Suggestions */}
          <div>
            <p className="text-sm font-medium mb-2">Suggested Searches:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedSearches.map(suggestion => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {/* Educational Info */}
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              <strong>How to Use Oral Arguments:</strong>
              <ol className="mt-2 ml-4 space-y-1 text-sm list-decimal">
                <li>Search for cases related to your violations</li>
                <li>Download the MP3 audio file (high quality @ 48k bitrate)</li>
                <li>Listen to how attorneys present constitutional arguments</li>
                <li>Note how they respond to judicial questions</li>
                <li>Apply these techniques to your own case</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Sample Preview */}
          {audioResults.length === 0 && !isSearching && !searchError && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Sample Oral Argument Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">Smith v. Department of Children Services</h4>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="secondary">9th Circuit</Badge>
                    <Badge variant="outline">
                      <Calendar className="size-3 mr-1" />
                      Argued: Mar 15, 2023
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="size-3 mr-1" />
                      Duration: 45:23
                    </Badge>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <strong>Panel:</strong> Hon. Sandra Ikuta, Hon. Consuelo Callahan, Hon. Mark Bennett
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="size-4 mr-2" />
                    Play Audio
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="size-4 mr-2" />
                    Download MP3
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="size-4 mr-2" />
                    View Docket
                  </Button>
                </div>

                <Alert className="mt-3">
                  <AlertDescription className="text-xs">
                    This is a sample preview. Use the search above to find actual oral argument recordings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {totalResults > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">
                    Found {totalResults.toLocaleString()} oral argument(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Showing {audioResults.length} results
                  </p>
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {audioResults.map((audio, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Case Name */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">
                              {audio.case_name || 'Untitled Case'}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {audio.court_full_name && (
                                <Badge variant="secondary">{audio.court_full_name}</Badge>
                              )}
                              {audio.date_argued && (
                                <Badge variant="outline">
                                  <Calendar className="size-3 mr-1" />
                                  {new Date(audio.date_argued).toLocaleDateString()}
                                </Badge>
                              )}
                              {audio.duration && (
                                <Badge variant="outline">
                                  <Clock className="size-3 mr-1" />
                                  {formatDuration(audio.duration)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Judge Panel */}
                          {audio.judges && (
                            <div className="text-sm">
                              <div className="flex items-start gap-2">
                                <Users className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <strong>Panel:</strong> {audio.judges}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Docket Number */}
                          {audio.docket_number && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Docket No:</strong> {audio.docket_number}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {audio.download_url && (
                              <Button
                                size="sm"
                                variant="default"
                                asChild
                              >
                                <a 
                                  href={audio.download_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <Download className="size-4 mr-2" />
                                  Download Original
                                </a>
                              </Button>
                            )}
                            {audio.local_path_mp3 && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a 
                                  href={`https://www.courtlistener.com${audio.local_path_mp3}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <Download className="size-4 mr-2" />
                                  Download Enhanced MP3
                                </a>
                              </Button>
                            )}
                            {audio.absolute_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a 
                                  href={`https://www.courtlistener.com${audio.absolute_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="size-4 mr-2" />
                                  View on CourtListener
                                </a>
                              </Button>
                            )}
                          </div>

                          {/* Audio Info */}
                          <Alert className="mt-2">
                            <Headphones className="size-4" />
                            <AlertDescription className="text-xs">
                              <strong>Enhanced Audio:</strong> CourtListener provides optimized MP3 files (22050Hz @ 48k bitrate) 
                              with proper ID3 tags and court seal cover art for better listening experience.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="size-4" />
                Learning from Oral Arguments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">What to Listen For:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>How attorneys frame Fourth Amendment violations</li>
                  <li>How they present due process arguments</li>
                  <li>Responses when judges challenge their position</li>
                  <li>Use of case law citations in real arguments</li>
                  <li>Tone and presentation style</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Best Practices:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Listen multiple times - first for content, then for technique</li>
                  <li>Take notes on effective phrases and arguments</li>
                  <li>Pay attention to how attorneys handle hostile questions</li>
                  <li>Notice which arguments judges respond positively to</li>
                  <li>Compare arguments in cases with favorable outcomes</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Apply to Your Case:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Adapt successful arguments to your situation</li>
                  <li>Prepare for similar questions you might face</li>
                  <li>Practice your own responses out loud</li>
                  <li>Use similar citation patterns in your briefs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Attribution */}
      <Alert>
        <Headphones className="size-4" />
        <AlertDescription className="text-xs">
          <strong>Data Source:</strong> Oral argument recordings from CourtListener.com, 
          the largest free collection of oral arguments on the Internet. Sponsored by the non-profit Free Law Project.
        </AlertDescription>
      </Alert>
    </div>
  );
}

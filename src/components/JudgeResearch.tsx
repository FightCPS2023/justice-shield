import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, 
  User, 
  ExternalLink, 
  Loader2,
  AlertCircle,
  GraduationCap,
  MapPin,
  Calendar,
  Scale,
  Users,
  BookOpen,
  Info,
  Shield,
  Gavel,
  Sparkles
} from 'lucide-react';
import { searchJudges, formatJudgeName, getJudgePhotoUrl } from '../utils/courtlistener-api';

interface JudgeResearchProps {
  userState: string;
}

export function JudgeResearch({ userState }: JudgeResearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [judgeResults, setJudgeResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setJudgeResults([]);
    
    try {
      const response = await fetch(
        `https://www.courtlistener.com/api/rest/v4/people/?format=json&name_full__icontains=${encodeURIComponent(searchQuery)}&is_alias_of__isnull=true`,
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
      
      setJudgeResults(data.results || []);
      setTotalResults(data.count || 0);
      setIsSearching(false);
    } catch (error: any) {
      console.error('Judge Research API Error:', error);
      setSearchError(
        error.message || 'Failed to search judge database. Please try again.'
      );
      setIsSearching(false);
    }
  };

  const formatPoliticalParty = (party: string) => {
    const partyMap: Record<string, { label: string; color: string }> = {
      'd': { label: 'Democrat', color: 'bg-blue-600' },
      'r': { label: 'Republican', color: 'bg-red-600' },
      'i': { label: 'Independent', color: 'bg-purple-600' },
      'g': { label: 'Green', color: 'bg-green-600' },
      'l': { label: 'Libertarian', color: 'bg-yellow-600' },
    };
    
    return partyMap[party.toLowerCase()] || { label: party, color: 'bg-gray-600' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <Gavel className="size-6" />
          Judge Research Database
        </h2>
        <p className="text-muted-foreground mt-2">
          Research the judge assigned to your case - background, education, political affiliations, and judicial history
        </p>
      </div>

      <Alert>
        <Shield className="size-4" />
        <AlertDescription>
          <strong>Why Research Your Judge?</strong> Understanding your judge's background, education, prior rulings, 
          and judicial philosophy can help you:
          <ul className="mt-2 ml-4 space-y-1 text-sm">
            <li>• Tailor your arguments to their known judicial approach</li>
            <li>• Identify potential biases or tendencies</li>
            <li>• Find their past CPS or family law opinions</li>
            <li>• Understand their confirmation and appointment process</li>
            <li>• Prepare for their questioning style</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5" />
            Search Judge Database
          </CardTitle>
          <CardDescription>
            Search thousands of federal and state court judges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Judge Name</label>
            <div className="flex gap-2">
              <Input
                placeholder='Enter judge name (e.g., "Smith" or "Hon. Jane Smith")'
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

          {/* Quick Tips */}
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              <strong>Search Tips:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Try just the last name first (e.g., "Smith")</li>
                <li>• If you get too many results, add first name</li>
                <li>• Search by court location if needed</li>
                <li>• Database includes federal and many state judges</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Error message */}
          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {/* Educational Content - Before Results */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="size-4" />
                What You'll Find
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Biographical Information:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Birth date and place</li>
                  <li>Gender and demographic information</li>
                  <li>Professional photograph (if available)</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Educational Background:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Law school attended</li>
                  <li>Undergraduate institution</li>
                  <li>Degrees earned and graduation years</li>
                  <li>Advanced degrees or certifications</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Judicial Career:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Current and past judicial positions</li>
                  <li>Appointment or election details</li>
                  <li>Who appointed them (if federal)</li>
                  <li>Confirmation vote counts</li>
                  <li>Start and end dates for each position</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Political Information:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Party affiliation (if any)</li>
                  <li>Political appointment history</li>
                  <li>Appointing president/governor</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Professional Background:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Prior positions (prosecutor, private practice, etc.)</li>
                  <li>Government service</li>
                  <li>Academic appointments</li>
                  <li>ABA ratings (if available)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sample Preview */}
          {judgeResults.length === 0 && !isSearching && !searchError && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Sample Judge Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="size-20 bg-muted rounded-full flex items-center justify-center">
                    <User className="size-10 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Hon. Jane Smith</h4>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="secondary">District Court</Badge>
                      <Badge variant="outline">
                        <MapPin className="size-3 mr-1" />
                        Northern District of California
                      </Badge>
                      <Badge className="bg-blue-600">Democrat</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="size-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <strong>Education:</strong> Harvard Law School (J.D. 1995), Yale University (B.A. 1992)
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="size-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <strong>Appointed:</strong> 2010 by President Barack Obama
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="size-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <strong>Confirmation:</strong> Confirmed by Senate 78-22
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Scale className="size-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <strong>Prior Service:</strong> Assistant U.S. Attorney (2000-2010), Private Practice (1995-2000)
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="size-4 mr-2" />
                    View Full Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    <BookOpen className="size-4 mr-2" />
                    View Opinions
                  </Button>
                </div>

                <Alert className="mt-3">
                  <AlertDescription className="text-xs">
                    This is a sample preview. Use the search above to find actual judge profiles.
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
                    Found {totalResults.toLocaleString()} judge(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Showing {judgeResults.length} results
                  </p>
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {judgeResults.map((judge, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4 mb-4">
                          {judge.has_photo ? (
                            <div className="size-20 bg-muted rounded-full overflow-hidden flex-shrink-0">
                              <img 
                                src={getJudgePhotoUrl(judge) || ''} 
                                alt={judge.name_full}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="size-20 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="size-10 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-2">
                              {judge.name_full || `${judge.name_first} ${judge.name_last}`}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {judge.gender && (
                                <Badge variant="outline">{judge.gender === 'm' ? 'Male' : 'Female'}</Badge>
                              )}
                              {judge.dob_state && (
                                <Badge variant="outline">
                                  <MapPin className="size-3 mr-1" />
                                  Born in {judge.dob_state}
                                </Badge>
                              )}
                              {judge.date_dob && (
                                <Badge variant="outline">
                                  <Calendar className="size-3 mr-1" />
                                  {new Date(judge.date_dob).getFullYear()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Race/Ethnicity */}
                        {judge.race && judge.race.length > 0 && (
                          <div className="text-sm mb-3">
                            <strong>Background:</strong> {judge.race.join(', ')}
                          </div>
                        )}

                        {/* Positions Count */}
                        {judge.positions && judge.positions.length > 0 && (
                          <div className="text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Scale className="size-4 text-muted-foreground" />
                              <strong>Judicial Positions:</strong> {judge.positions.length} position(s) on record
                            </div>
                          </div>
                        )}

                        {/* Education Count */}
                        {judge.educations && judge.educations.length > 0 && (
                          <div className="text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="size-4 text-muted-foreground" />
                              <strong>Education:</strong> {judge.educations.length} degree(s) listed
                            </div>
                          </div>
                        )}

                        {/* FJC ID */}
                        {judge.fjc_id && (
                          <div className="text-sm mb-3 text-muted-foreground">
                            Federal Judicial Center ID: {judge.fjc_id}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="default"
                            asChild
                          >
                            <a 
                              href={`https://www.courtlistener.com${judge.absolute_url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-4 mr-2" />
                              View Full Profile
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a 
                              href={`https://www.courtlistener.com/api/rest/v4/search/?type=o&judge=${judge.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <BookOpen className="size-4 mr-2" />
                              View Opinions
                            </a>
                          </Button>
                        </div>

                        {/* Educational Note */}
                        <Alert className="mt-3">
                          <Info className="size-4" />
                          <AlertDescription className="text-xs">
                            Click "View Full Profile" to see complete details including education, political affiliations, 
                            appointment history, ABA ratings, and all positions held.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* How to Use This Information */}
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4" />
                How to Use Judge Research
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Before Your Hearing:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Research the judge's background and education</li>
                  <li>Read their past opinions, especially in CPS/family law cases</li>
                  <li>Note their legal philosophy and known tendencies</li>
                  <li>Check if they have a particular view on constitutional issues</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Prepare Your Strategy:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Tailor arguments to align with their known judicial approach</li>
                  <li>If they're strong on Fourth Amendment, emphasize that</li>
                  <li>If they value family reunification, stress that goal</li>
                  <li>Anticipate their likely questions based on past cases</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Find Relevant Precedent:</p>
                <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                  <li>Look for their own prior rulings you can cite</li>
                  <li>Judges appreciate consistency with their own precedent</li>
                  <li>Quote favorable language from their past opinions</li>
                  <li>Show how your case aligns with their judicial record</li>
                </ul>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground italic">
                  <strong>Note:</strong> This research is for strategic preparation only. Never make personal 
                  attacks or suggest bias. Focus on understanding their judicial philosophy to present 
                  your case most effectively.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Attribution */}
      <Alert>
        <Gavel className="size-4" />
        <AlertDescription className="text-xs">
          <strong>Data Source:</strong> Judge information from CourtListener.com, 
          containing biographical data on thousands of federal and state court judges. 
          Data compiled from official sources including the Federal Judicial Center, state court websites, 
          and public records. Sponsored by the non-profit Free Law Project.
        </AlertDescription>
      </Alert>
    </div>
  );
}

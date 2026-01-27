import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Sparkles, 
  Search, 
  ExternalLink, 
  TrendingUp,
  Calendar,
  Scale,
  Loader2,
  Info,
  Lightbulb
} from 'lucide-react';
import { semanticSearch, type SemanticSearchResult } from '../utils/bulk-data-api';
import { toast } from 'sonner@2.0.3';

interface SemanticSearchEngineProps {
  accessToken: string;
}

const CPS_QUERY_TEMPLATES = [
  {
    title: 'Fourth Amendment Violations',
    query: 'warrantless search home entry child protective services without exigent circumstances',
    description: 'Find cases about illegal home entries by CPS workers'
  },
  {
    title: 'Due Process Rights',
    query: 'parental rights termination due process notice hearing family integrity',
    description: 'Search for due process violations in child removal cases'
  },
  {
    title: 'Reasonable Efforts Failures',
    query: 'reasonable efforts reunification services family preservation ASFA requirements',
    description: 'Cases about failure to provide reasonable reunification efforts'
  },
  {
    title: 'False Allegations',
    query: 'fabricated evidence false report malicious prosecution qualified immunity',
    description: 'Find cases involving false CPS allegations'
  },
  {
    title: 'ICWA Violations',
    query: 'Indian Child Welfare Act tribal notice active efforts placement preferences',
    description: 'Cases about ICWA compliance failures'
  },
  {
    title: 'Expert Testimony',
    query: 'expert witness medical testimony child abuse shaken baby syndrome',
    description: 'Cases involving expert testimony in abuse allegations'
  },
];

export function SemanticSearchEngine({ accessToken }: SemanticSearchEngineProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [limit, setLimit] = useState(20);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const searchResults = await semanticSearch(accessToken, query, {
        court: selectedCourt === 'all' ? undefined : selectedCourt,
        dateStart: dateRange.start || undefined,
        dateEnd: dateRange.end || undefined,
        limit,
      });
      
      setResults(searchResults);
      toast.success(`Found ${searchResults.length} semantically similar cases`);
    } catch (error) {
      console.error('Error performing semantic search:', error);
      toast.error('Failed to perform semantic search');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: typeof CPS_QUERY_TEMPLATES[0]) => {
    setQuery(template.query);
    toast.info(`Loaded template: ${template.title}`);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 0.9) return 'Highly Relevant';
    if (score >= 0.8) return 'Very Relevant';
    if (score >= 0.7) return 'Relevant';
    return 'Somewhat Relevant';
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertTitle>AI-Powered Semantic Search</AlertTitle>
        <AlertDescription>
          Uses advanced machine learning embeddings (ModernBERT) to find cases similar in meaning, 
          not just keyword matches. Describe your legal issue in natural language for best results.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Query Templates</CardTitle>
          <CardDescription>
            Quick-start with common CPS legal issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CPS_QUERY_TEMPLATES.map((template, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => loadTemplate(template)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">{template.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Semantic Search</CardTitle>
          <CardDescription>
            Describe your legal issue or question in natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Query</label>
            <Textarea
              placeholder="Example: Cases where CPS entered a home without a warrant or exigent circumstances and violated Fourth Amendment rights..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSearch();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use natural language. Press Ctrl+Enter to search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Court</label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  <SelectItem value="scotus">Supreme Court</SelectItem>
                  <SelectItem value="ca1">1st Circuit</SelectItem>
                  <SelectItem value="ca2">2nd Circuit</SelectItem>
                  <SelectItem value="ca3">3rd Circuit</SelectItem>
                  <SelectItem value="ca4">4th Circuit</SelectItem>
                  <SelectItem value="ca5">5th Circuit</SelectItem>
                  <SelectItem value="ca6">6th Circuit</SelectItem>
                  <SelectItem value="ca7">7th Circuit</SelectItem>
                  <SelectItem value="ca8">8th Circuit</SelectItem>
                  <SelectItem value="ca9">9th Circuit</SelectItem>
                  <SelectItem value="ca10">10th Circuit</SelectItem>
                  <SelectItem value="ca11">11th Circuit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Results: {limit}</label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Search with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {results.length} semantically similar cases found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {result.case_name}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="secondary">
                              <Scale className="mr-1 h-3 w-3" />
                              {result.court}
                            </Badge>
                            <Badge variant="secondary">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(result.date_filed).toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline">
                              {result.citation}
                            </Badge>
                            <Badge 
                              className={getSimilarityColor(result.similarity_score)}
                            >
                              <TrendingUp className="mr-1 h-3 w-3" />
                              {(result.similarity_score * 100).toFixed(1)}% Match
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge variant="default">
                            {getSimilarityBadge(result.similarity_score)}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground italic">
                          "{result.text_snippet}..."
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://www.courtlistener.com${result.absolute_url}`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          View on CourtListener
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && results.length === 0 && query && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results found. Try adjusting your search query or filters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

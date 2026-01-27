import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  WifiOff, 
  Wifi,
  Download, 
  Search,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ExternalLink,
  Calendar,
  Scale
} from 'lucide-react';
import { 
  getOfflineCacheStatus, 
  syncOfflineData, 
  searchOffline,
  clearOfflineCache 
} from '../utils/bulk-data-api';
import { toast } from 'sonner@2.0.3';

interface OfflineModeProps {
  accessToken: string;
}

export function OfflineMode({ accessToken }: OfflineModeProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Offline mode activated', {
        description: 'Using cached data for searches'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadCacheStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheStatus = async () => {
    try {
      setLoading(true);
      const status = await getOfflineCacheStatus(accessToken);
      setCacheStatus(status);
    } catch (error) {
      console.error('Error loading cache status:', error);
      toast.error('Failed to load cache status');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info('Starting offline sync...', {
        description: 'This may take several minutes'
      });

      const result = await syncOfflineData(accessToken, {
        syncOpinions: true,
        syncDockets: true,
        syncCourts: true,
        maxRecords: 10000,
      });

      if (result.success) {
        toast.success('Offline sync complete', {
          description: `Synced ${result.synced} records`
        });
        loadCacheStatus();
      } else {
        toast.error('Sync completed with errors', {
          description: `${result.errors} errors occurred`
        });
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Offline sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setSearching(true);
      const results = await searchOffline(accessToken, searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('No results found in offline cache');
      } else {
        toast.success(`Found ${results.length} results in offline cache`);
      }
    } catch (error) {
      console.error('Error searching offline:', error);
      toast.error('Offline search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all offline data? You will need to re-sync to use offline mode.')) {
      return;
    }

    try {
      await clearOfflineCache(accessToken);
      toast.success('Cache cleared');
      loadCacheStatus();
      setSearchResults([]);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant={isOnline ? 'default' : 'destructive'}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <AlertTitle>Online Mode</AlertTitle>
            <AlertDescription>
              You're online. Sync data now to enable offline access when internet is unavailable.
            </AlertDescription>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Offline Mode Active</AlertTitle>
            <AlertDescription>
              No internet connection. Using cached data from {formatDate(cacheStatus?.lastSync)}.
            </AlertDescription>
          </>
        )}
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Offline Cache Status</CardTitle>
              <CardDescription>
                Manage your local case law database for offline access
              </CardDescription>
            </div>
            <Badge variant={cacheStatus?.enabled ? 'default' : 'secondary'}>
              {cacheStatus?.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {cacheStatus && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cached Opinions</p>
                        <p className="text-2xl font-bold">
                          {cacheStatus.cachedOpinions.toLocaleString()}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cached Dockets</p>
                        <p className="text-2xl font-bold">
                          {cacheStatus.cachedDockets.toLocaleString()}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Size</p>
                        <p className="text-2xl font-bold">
                          {formatBytes(cacheStatus.totalSize)}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">
                    {formatBytes(cacheStatus.totalSize)} / {formatBytes(cacheStatus.availableSpace)}
                  </span>
                </div>
                <Progress 
                  value={(cacheStatus.totalSize / cacheStatus.availableSpace) * 100} 
                />
              </div>

              {cacheStatus.lastSync && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Last Synchronized</AlertTitle>
                  <AlertDescription>
                    {formatDate(cacheStatus.lastSync)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleSync} 
                  disabled={syncing || !isOnline}
                  className="flex-1"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleClearCache} 
                  variant="destructive"
                  className="flex-1"
                >
                  Clear Cache
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline Search</CardTitle>
          <CardDescription>
            Search your local cache without internet connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search cached cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Search Results</h3>
                <Badge>{searchResults.length} results</Badge>
              </div>

              {searchResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold mb-2">{result.case_name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Scale className="mr-1 h-3 w-3" />
                            {result.court}
                          </Badge>
                          <Badge variant="secondary">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(result.date_filed).toLocaleDateString()}
                          </Badge>
                          {result.citation && (
                            <Badge variant="outline">{result.citation}</Badge>
                          )}
                          <Badge variant="default">
                            <Database className="mr-1 h-3 w-3" />
                            Cached
                          </Badge>
                        </div>
                      </div>

                      {result.snippet && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground italic">
                            {result.snippet}
                          </p>
                        </div>
                      )}

                      {isOnline && result.absolute_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://www.courtlistener.com${result.absolute_url}`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          View Online
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Results</AlertTitle>
              <AlertDescription>
                No matching cases found in your offline cache. Try syncing more data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Offline Mode Tips</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Sync regularly when online to keep your cache up to date</li>
            <li>Larger cache means more cases available offline but uses more storage</li>
            <li>Offline search only works with synced data</li>
            <li>Some features like semantic search require internet connection</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

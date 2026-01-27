import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  HardDrive,
  Cloud,
  RefreshCw,
  Trash2,
  Info
} from 'lucide-react';
import {
  listBulkDataFiles,
  importBulkData,
  batchDownloadBulkData,
  getOfflineCacheStatus,
  syncOfflineData,
  clearOfflineCache,
  type BulkDataFile,
  type ImportStatus
} from '../utils/bulk-data-api';
import { toast } from 'sonner@2.0.3';

interface BulkDataManagerProps {
  accessToken: string;
}

export function BulkDataManager({ accessToken }: BulkDataManagerProps) {
  const [bulkFiles, setBulkFiles] = useState<BulkDataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<Record<string, boolean>>({});
  const [importStatus, setImportStatus] = useState<Record<string, ImportStatus>>({});
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadBulkFiles();
    loadCacheStatus();
  }, []);

  const loadBulkFiles = async () => {
    try {
      setLoading(true);
      const files = await listBulkDataFiles(accessToken);
      setBulkFiles(files);
    } catch (error) {
      console.error('Error loading bulk files:', error);
      toast.error('Failed to load bulk data files');
    } finally {
      setLoading(false);
    }
  };

  const loadCacheStatus = async () => {
    try {
      const status = await getOfflineCacheStatus(accessToken);
      setCacheStatus(status);
    } catch (error) {
      console.error('Error loading cache status:', error);
    }
  };

  const handleImport = async (fileType: string) => {
    try {
      setImporting({ ...importing, [fileType]: true });
      
      await importBulkData(accessToken, fileType, (status) => {
        setImportStatus({ ...importStatus, [fileType]: status });
        
        if (status.status === 'completed') {
          toast.success(`Successfully imported ${fileType} data`);
          setImporting({ ...importing, [fileType]: false });
          loadCacheStatus();
        } else if (status.status === 'failed') {
          toast.error(`Failed to import ${fileType} data`);
          setImporting({ ...importing, [fileType]: false });
        }
      });
    } catch (error) {
      console.error('Error importing:', error);
      toast.error(`Failed to import ${fileType} data`);
      setImporting({ ...importing, [fileType]: false });
    }
  };

  const handleBatchImport = async () => {
    const fileTypes = ['courts', 'dockets', 'opinions', 'clusters', 'citations'];
    
    try {
      setLoading(true);
      toast.info('Starting batch import of all datasets...');
      
      const result = await batchDownloadBulkData(accessToken, fileTypes);
      
      toast.success('Batch import started. This may take several hours.');
    } catch (error) {
      console.error('Error batch importing:', error);
      toast.error('Failed to start batch import');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info('Syncing data for offline use...');
      
      const result = await syncOfflineData(accessToken, {
        syncOpinions: true,
        syncDockets: true,
        syncCourts: true,
        maxRecords: 10000,
      });
      
      if (result.success) {
        toast.success(`Synced ${result.synced} records for offline use`);
        loadCacheStatus();
      } else {
        toast.error('Sync completed with errors');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync offline data');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all offline cache? This cannot be undone.')) {
      return;
    }

    try {
      await clearOfflineCache(accessToken);
      toast.success('Cache cleared successfully');
      loadCacheStatus();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>CourtListener Bulk Data Integration</AlertTitle>
        <AlertDescription>
          Import monthly bulk data snapshots from CourtListener to enable powerful offline analysis, 
          citation network visualization, semantic search, and advanced analytics. Data is updated 
          monthly on the last day of each month.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="offline">Offline Cache</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Bulk Data Files</CardTitle>
                  <CardDescription>
                    Download and import CourtListener datasets for local analysis
                  </CardDescription>
                </div>
                <Button onClick={handleBatchImport} disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  Import All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {bulkFiles.map((file) => (
                    <Card key={file.name}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">{file.type.toUpperCase()}</h3>
                              <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {file.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last updated: {new Date(file.lastModified).toLocaleDateString()}
                            </p>
                            
                            {importStatus[file.type] && (
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>
                                    {importStatus[file.type].processed} / {importStatus[file.type].total}
                                  </span>
                                </div>
                                <Progress 
                                  value={
                                    (importStatus[file.type].processed / 
                                     importStatus[file.type].total) * 100
                                  } 
                                />
                                {importStatus[file.type].status === 'failed' && (
                                  <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      {importStatus[file.type].errorMessages?.join(', ')}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleImport(file.type)}
                            disabled={importing[file.type]}
                            variant="outline"
                          >
                            {importing[file.type] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Import
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offline Cache Management</CardTitle>
              <CardDescription>
                Sync data locally for offline access and faster searches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cacheStatus && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{cacheStatus.cachedOpinions.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Cached Opinions</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{cacheStatus.cachedDockets.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Cached Dockets</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatFileSize(cacheStatus.totalSize)}</p>
                          <p className="text-sm text-muted-foreground">Total Size</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatFileSize(cacheStatus.availableSpace)}</p>
                          <p className="text-sm text-muted-foreground">Available Space</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {cacheStatus.lastSync && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Last Sync</AlertTitle>
                      <AlertDescription>
                        {new Date(cacheStatus.lastSync).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={handleSync} disabled={syncing} className="flex-1">
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
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cache
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Status</CardTitle>
              <CardDescription>
                Track the progress of ongoing and completed imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(importStatus).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active or recent imports
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(importStatus).map(([type, status]) => (
                    <Card key={type}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{type.toUpperCase()}</h3>
                            <Badge 
                              variant={
                                status.status === 'completed' ? 'default' :
                                status.status === 'failed' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {status.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-semibold">{status.total.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Processed</p>
                              <p className="font-semibold">{status.processed.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Errors</p>
                              <p className="font-semibold text-destructive">{status.errors}</p>
                            </div>
                          </div>
                          
                          <Progress 
                            value={(status.processed / status.total) * 100} 
                          />
                          
                          {status.errorMessages && status.errorMessages.length > 0 && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <ul className="list-disc list-inside">
                                  {status.errorMessages.slice(0, 3).map((msg, i) => (
                                    <li key={i}>{msg}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

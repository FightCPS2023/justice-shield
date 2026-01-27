import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Network, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  Info,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { getCitationNetwork, getOpinionCitations, type CitationNetwork } from '../utils/bulk-data-api';
import { toast } from 'sonner@2.0.3';

interface CitationNetworkVizProps {
  accessToken: string;
  initialOpinionId?: number;
}

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  caseName: string;
  court: string;
  citation: string;
  importance: number;
  inCitations: number;
  outCitations: number;
}

interface Edge {
  source: number;
  target: number;
  depth: number;
}

export function CitationNetworkViz({ accessToken, initialOpinionId }: CitationNetworkVizProps) {
  const [opinionId, setOpinionId] = useState(initialOpinionId?.toString() || '');
  const [depth, setDepth] = useState([2]);
  const [network, setNetwork] = useState<CitationNetwork | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    if (initialOpinionId) {
      loadNetwork(initialOpinionId);
    }
  }, [initialOpinionId]);

  useEffect(() => {
    if (network && canvasRef.current) {
      initializeVisualization();
      startSimulation();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [network, zoom, pan]);

  const loadNetwork = async (id: number) => {
    try {
      setLoading(true);
      const data = await getCitationNetwork(accessToken, id, depth[0]);
      setNetwork(data);
      toast.success(`Loaded citation network with ${data.nodes.length} cases`);
    } catch (error) {
      console.error('Error loading citation network:', error);
      toast.error('Failed to load citation network');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const id = parseInt(opinionId);
    if (isNaN(id)) {
      toast.error('Please enter a valid opinion ID');
      return;
    }
    loadNetwork(id);
  };

  const initializeVisualization = () => {
    if (!network || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize nodes with physics
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    nodesRef.current = network.nodes.map((node, i) => {
      const angle = (i / network.nodes.length) * 2 * Math.PI;
      const radius = 200;
      
      return {
        id: node.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        caseName: node.caseName,
        court: node.court,
        citation: node.citation,
        importance: node.importance,
        inCitations: node.inCitations,
        outCitations: node.outCitations,
      };
    });

    edgesRef.current = network.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      depth: edge.depth,
    }));
  };

  const startSimulation = () => {
    const simulate = () => {
      updatePhysics();
      draw();
      animationRef.current = requestAnimationFrame(simulate);
    };
    simulate();
  };

  const updatePhysics = () => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    
    // Apply forces
    const damping = 0.9;
    const repulsion = 5000;
    const attraction = 0.01;
    const idealDistance = 100;

    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (distance * distance);
        
        nodes[i].vx -= (dx / distance) * force;
        nodes[i].vy -= (dy / distance) * force;
        nodes[j].vx += (dx / distance) * force;
        nodes[j].vy += (dy / distance) * force;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (distance - idealDistance) * attraction;
        
        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
      }
    });

    // Update positions
    nodes.forEach(node => {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    edgesRef.current.forEach(edge => {
      const source = nodesRef.current.find(n => n.id === edge.source);
      const target = nodesRef.current.find(n => n.id === edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = edge.depth === 1 ? '#3b82f6' : '#94a3b8';
        ctx.lineWidth = edge.depth === 1 ? 2 : 1;
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(target.x, target.y);
        ctx.lineTo(
          target.x - arrowSize * Math.cos(angle - Math.PI / 6),
          target.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          target.x - arrowSize * Math.cos(angle + Math.PI / 6),
          target.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = edge.depth === 1 ? '#3b82f6' : '#94a3b8';
        ctx.fill();
      }
    });

    // Draw nodes
    nodesRef.current.forEach(node => {
      const radius = 5 + node.importance * 10;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.id === network?.rootCase ? '#ef4444' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label for important nodes
      if (node.importance > 0.5) {
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.caseName.substring(0, 30) + (node.caseName.length > 30 ? '...' : ''),
          node.x,
          node.y + radius + 15
        );
      }
    });

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Find clicked node
    const clickedNode = nodesRef.current.find(node => {
      const radius = 5 + node.importance * 10;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    setSelectedNode(clickedNode || null);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 5));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.2));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `citation-network-${opinionId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Citation Network Analysis</AlertTitle>
        <AlertDescription>
          Visualize how CPS cases cite each other. Larger nodes indicate more influential cases. 
          Red node is the root case, blue arrows show direct citations.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Search Citation Network</CardTitle>
          <CardDescription>
            Enter an opinion ID to visualize its citation network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Enter Opinion ID"
              value={opinionId}
              onChange={(e) => setOpinionId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Citation Depth: {depth[0]}</label>
            <Slider
              value={depth}
              onValueChange={setDepth}
              min={1}
              max={5}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Higher depth shows more citations but may be slower
            </p>
          </div>
        </CardContent>
      </Card>

      {network && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Citation Network Visualization</CardTitle>
                <CardDescription>
                  {network.nodes.length} cases • {network.edges.length} citations
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={exportVisualization}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full border rounded-lg cursor-pointer"
                style={{ height: '600px' }}
              />
              
              {selectedNode && (
                <Card className="absolute top-4 right-4 w-80">
                  <CardHeader>
                    <CardTitle className="text-sm">{selectedNode.caseName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Citation</p>
                      <p className="text-sm text-muted-foreground">{selectedNode.citation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Court</p>
                      <p className="text-sm text-muted-foreground">{selectedNode.court}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Cites</p>
                        <Badge variant="secondary">{selectedNode.outCitations}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cited By</p>
                        <Badge variant="secondary">{selectedNode.inCitations}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Importance Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${selectedNode.importance * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(selectedNode.importance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setOpinionId(selectedNode.id.toString());
                        loadNetwork(selectedNode.id);
                      }}
                    >
                      <Network className="mr-2 h-4 w-4" />
                      View Network
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

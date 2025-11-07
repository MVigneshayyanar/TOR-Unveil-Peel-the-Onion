import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

import Header from './components/Header';
import NetworkGraph from './components/NetworkGraph';
import SidePanel from './components/SidePanel';
import Timeline from './components/Timeline';
import AnalysisModal from './components/AnalysisModal';
import { useTorData } from './hooks/useTorData';
import { analyzeNodeWithGemini } from './services/geminiService';
import { TorNode, Link, OriginCandidate, TimelineEvent, NodeType } from './types';

const App: React.FC = () => {
  const initialData = useTorData();
  
  const [nodes, setNodes] = useState<TorNode[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [candidates, setCandidates] = useState<OriginCandidate[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [tracedPath, setTracedPath] = useState<Link[]>([]);

  const [selectedNode, setSelectedNode] = useState<TorNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingPcap, setIsAnalyzingPcap] = useState(false);

  useEffect(() => {
    if (initialData.nodes.length > 0 && nodes.length === 0) {
      setNodes(initialData.nodes);
      setLinks(initialData.links);
      setCandidates(initialData.candidates);
      setTimelineEvents(initialData.timelineEvents);
      setTracedPath(initialData.tracedPath);
    }
  }, [initialData, nodes.length]);

  const handleNodeClick = useCallback(async (node: TorNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
    setIsLoadingAnalysis(true);
    setAnalysisResult('');
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await analyzeNodeWithGemini(ai, node);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? `Failed to analyze node: ${err.message}` : 'An unknown error occurred.');
      setAnalysisResult('');
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handlePcapAnalysis = async (file: File) => {
    if (!file) return;
    setIsAnalyzingPcap(true);

    const startTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
    setTimelineEvents(prev => [
      // FIX: Cast `type` to a specific literal to prevent it from being widened to `string`.
      { timestamp: startTime, description: `PCAP analysis started for "${file.name}".`, type: 'info' as 'info' },
      ...prev
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    await new Promise(resolve => setTimeout(resolve, 3500));

    const newOrigin: TorNode = { id: '172.16.0.5', type: NodeType.Origin, country: 'FR', uptime: 50, bandwidth: 2500 };
    const guardNode = initialData.nodes.find(n => n.id === '141.142.143.144')!;
    const relayNode = initialData.nodes.find(n => n.id === '121.122.123.124')!;
    const exitNode = initialData.nodes.find(n => n.id === '131.132.133.134')!;

    const newTracedPath: Link[] = [
        { source: newOrigin.id, target: guardNode.id },
        { source: guardNode.id, target: relayNode.id },
        { source: relayNode.id, target: exitNode.id },
    ];
    
    const newCandidate: OriginCandidate = {
        ip: newOrigin.id,
        country: 'FR',
        confidence: 85,
        evidence: ['PCAP timestamp match', 'Packet size correlation'],
    };

    const analysisTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
    const newEvents: TimelineEvent[] = [
        { timestamp: analysisTime, description: `High confidence match (85%) found for origin ${newOrigin.id}.`, type: 'identification' },
        { timestamp: analysisTime, description: `Correlated path: ${guardNode.id.substring(0,5)}... -> ${relayNode.id.substring(0,5)}... -> ${exitNode.id.substring(0,5)}...`, type: 'correlation' },
    ];

    setNodes(prev => [...prev.filter(p => p.type !== NodeType.Origin), newOrigin]);
    setTracedPath(newTracedPath);
    setCandidates([newCandidate, ...initialData.candidates.filter(c => c.ip !== '192.168.1.10')]);
    setTimelineEvents(prev => [...newEvents, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    setIsAnalyzingPcap(false);
  };

  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-mono overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Left Column: Origin Candidates */}
        <aside className="w-full md:w-80 xl:w-96 bg-brand-surface border border-brand-border rounded-lg shadow-lg flex-shrink-0 overflow-hidden">
          <SidePanel 
            candidates={candidates} 
            onAnalyzePcap={handlePcapAnalysis}
            isAnalyzing={isAnalyzingPcap}
          />
        </aside>

        {/* Center Column: Network Graph */}
        <div className="flex-1 bg-brand-surface border border-brand-border rounded-lg shadow-lg relative min-h-[400px] md:min-h-0">
          <NetworkGraph nodes={nodes} links={links} tracedPath={tracedPath} onNodeClick={handleNodeClick} />
        </div>
        
        {/* Right Column: Event Timeline */}
        <aside className="w-full md:w-80 xl:w-96 bg-brand-surface border border-brand-border rounded-lg shadow-lg flex-shrink-0 overflow-hidden">
          <Timeline events={timelineEvents} />
        </aside>
      </main>
      {isModalOpen && selectedNode && (
        <AnalysisModal
          node={selectedNode}
          analysis={analysisResult}
          isLoading={isLoadingAnalysis}
          error={error}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default App;
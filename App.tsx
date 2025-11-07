import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

import Header from './components/Header';
import NetworkGraph from './components/NetworkGraph';
import SidePanel from './components/SidePanel';
import Timeline from './components/Timeline';
import AnalysisModal from './components/AnalysisModal';
import { useTorData } from './hooks/useTorData';
import { analyzeNodeWithGemini } from './services/geminiService';
import { TorNode } from './types';

const App: React.FC = () => {
  const { nodes, links, candidates, timelineEvents, tracedPath } = useTorData();
  const [selectedNode, setSelectedNode] = useState<TorNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-mono overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Left Column: Origin Candidates */}
        <aside className="w-full md:w-80 xl:w-96 bg-brand-surface border border-brand-border rounded-lg shadow-lg flex-shrink-0 overflow-hidden">
          <SidePanel candidates={candidates} />
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

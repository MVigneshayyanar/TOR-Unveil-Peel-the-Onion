
import React from 'react';
import { TorNode } from '../types';

interface AnalysisModalProps {
  node: TorNode;
  analysis: string;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
);

const AnalysisModal: React.FC<AnalysisModalProps> = ({ node, analysis, isLoading, error, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-brand-surface border border-brand-border rounded-lg shadow-2xl w-full max-w-2xl text-brand-text relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-brand-border flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold">Node Analysis: <span className="text-brand-primary">{node.id}</span></h2>
          <button onClick={onClose} className="text-brand-text-dim hover:text-brand-text">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div><strong className="block text-brand-text-dim">Type</strong> {node.type.toUpperCase()}</div>
            <div><strong className="block text-brand-text-dim">Country</strong> {node.country}</div>
            <div><strong className="block text-brand-text-dim">Uptime</strong> {node.uptime}h</div>
            <div><strong className="block text-brand-text-dim">Bandwidth</strong> {node.bandwidth} KB/s</div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-brand-primary">AI Threat Assessment</h3>
          <div className="bg-brand-bg p-4 rounded-md min-h-[120px]">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-brand-accent">{error}</p>}
            {!isLoading && !error && (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{analysis}</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-brand-border flex-shrink-0">
          <button 
            onClick={onClose} 
            className="w-full bg-brand-primary/80 hover:bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-md transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;

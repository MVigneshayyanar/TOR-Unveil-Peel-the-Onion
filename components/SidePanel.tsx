import React, { useState } from 'react';
import { OriginCandidate } from '../types';

interface SidePanelProps {
  candidates: OriginCandidate[];
  onAnalyzePcap: (file: File) => void;
  isAnalyzing: boolean;
}

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
    const getColor = () => {
        if (value > 75) return 'bg-brand-primary';
        if (value > 50) return 'bg-yellow-400';
        return 'bg-brand-accent';
    };
    return (
        <div className="w-full bg-brand-border rounded-full h-2">
            <div className={`${getColor()} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
    );
};

const SidePanel: React.FC<SidePanelProps> = ({ candidates, onAnalyzePcap, isAnalyzing }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleAnalyzeClick = () => {
        if (selectedFile) {
            onAnalyzePcap(selectedFile);
        }
    };

    const handleExportCSV = () => {
        const headers = "IP Address,Country,Confidence,Evidence";
        const rows = candidates.map(c => 
            `${c.ip},${c.country},${c.confidence},"${c.evidence.join('; ')}"`
        ).join('\n');
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tor_unveil_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex-shrink-0">
                <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
                    <TargetIcon />
                    Origin Candidates
                </h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 mb-4">
                {candidates.map((candidate) => (
                    <div key={candidate.ip} className={`p-3 rounded-lg border ${candidate.confidence > 80 ? 'bg-brand-primary/10 border-brand-primary' : 'border-brand-border bg-brand-bg'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-brand-text">{candidate.ip} [{candidate.country}]</span>
                            <span className={`font-bold text-sm ${candidate.confidence > 75 ? 'text-brand-primary' : candidate.confidence > 50 ? 'text-yellow-400' : 'text-brand-accent'}`}>
                                {candidate.confidence}%
                            </span>
                        </div>
                        <ConfidenceBar value={candidate.confidence} />
                        <div className="mt-2 text-xs text-brand-text-dim">
                            <p className="font-semibold">Evidence:</p>
                            <ul className="list-disc list-inside">
                                {candidate.evidence.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-shrink-0 space-y-4">
                <div className="pt-4 border-t border-brand-border">
                    <h3 className="text-md font-bold text-brand-text mb-3">Traffic Correlation</h3>
                    <div className="space-y-3">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-bg border border-brand-border rounded-md font-medium text-brand-text-dim hover:text-brand-text focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary block py-2 px-3 text-sm text-center truncate">
                            <span>{selectedFile ? selectedFile.name : 'Upload PCAP File'}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pcap,.cap" disabled={isAnalyzing}/>
                        </label>
                        <button 
                            onClick={handleAnalyzeClick} 
                            disabled={!selectedFile || isAnalyzing}
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 text-sm disabled:bg-brand-border disabled:text-brand-text-dim disabled:cursor-not-allowed hover:bg-blue-500"
                        >
                            {isAnalyzing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : 'Analyze Traffic'}
                        </button>
                    </div>
                </div>
                <div className="pt-4 border-t border-brand-border">
                    <h3 className="text-md font-bold text-brand-text mb-3">Forensic Report</h3>
                    <div className="flex gap-2">
                        <button onClick={handleExportCSV} className="flex-1 bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-all flex items-center justify-center gap-2 text-sm">
                            <DownloadIcon />
                            Export CSV
                        </button>
                        <button disabled className="flex-1 bg-brand-border text-brand-text-dim font-bold py-2 px-4 rounded-md cursor-not-allowed text-sm">
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidePanel;

import { useState, useEffect } from 'react';
import { TorNode, Link, OriginCandidate, TimelineEvent, NodeType } from '../types';

// In a real app, this would be fetched from an API
const mockNodes: TorNode[] = [
  { id: '192.168.1.10', type: NodeType.Origin, country: 'US', uptime: 200, bandwidth: 5000 },
  { id: '12.34.56.78', type: NodeType.Guard, country: 'DE', uptime: 1500, bandwidth: 12000 },
  { id: '98.76.54.32', type: NodeType.Relay, country: 'FR', uptime: 800, bandwidth: 8000 },
  { id: '11.22.33.44', type: NodeType.Relay, country: 'SE', uptime: 2100, bandwidth: 15000 },
  { id: '55.66.77.88', type: NodeType.Exit, country: 'RU', uptime: 500, bandwidth: 7000 },
  { id: '101.102.103.104', type: NodeType.Guard, country: 'CA', uptime: 3000, bandwidth: 18000 },
  { id: '121.122.123.124', type: NodeType.Relay, country: 'GB', uptime: 1200, bandwidth: 9500 },
  { id: '131.132.133.134', type: NodeType.Exit, country: 'NL', uptime: 950, bandwidth: 11000 },
  { id: '141.142.143.144', type: NodeType.Guard, country: 'JP', uptime: 4500, bandwidth: 22000 },
  { id: '151.152.153.154', type: NodeType.Relay, country: 'AU', uptime: 600, bandwidth: 6000 },
];

const mockLinks: Link[] = [
  { source: '12.34.56.78', target: '98.76.54.32' },
  { source: '98.76.54.32', target: '11.22.33.44' },
  { source: '11.22.33.44', target: '55.66.77.88' },
  { source: '101.102.103.104', target: '121.122.123.124' },
  { source: '121.122.123.124', target: '131.132.133.134' },
  { source: '141.142.143.144', target: '151.152.153.154' },
  { source: '151.152.153.154', target: '11.22.33.44' },
];

const tracedPath: Link[] = [
  { source: '192.168.1.10', target: '12.34.56.78'},
  { source: '12.34.56.78', target: '11.22.33.44'},
  { source: '11.22.33.44', target: '55.66.77.88'},
]

const mockCandidates: OriginCandidate[] = [
  { ip: '192.168.1.10', country: 'US', confidence: 92, evidence: ['Timing correlation match', 'Bandwidth signature match'] },
  { ip: '192.168.1.25', country: 'US', confidence: 65, evidence: ['Timing correlation partial match'] },
  { ip: '10.0.0.5', country: 'CA', confidence: 31, evidence: ['Geographic proximity to entry node'] },
];

const mockTimeline: TimelineEvent[] = [
  { timestamp: '2024-07-28 14:35:10Z', description: 'Exit node 55.66.77.88 (RU) sent traffic to target.', type: 'detection' },
  { timestamp: '2024-07-28 14:35:11Z', description: 'Initiating correlation for T-30s window.', type: 'info' },
  { timestamp: '2024-07-28 14:35:18Z', description: 'Entry node 12.34.56.78 (DE) flagged as possible entry point.', type: 'correlation' },
  { timestamp: '2024-07-28 14:35:25Z', description: 'Analyzing traffic patterns from candidate entry nodes.', type: 'correlation' },
  { timestamp: '2024-07-28 14:36:02Z', description: 'Confidence score > 90% for origin 192.168.1.10.', type: 'identification' },
];

export const useTorData = () => {
  const [data, setData] = useState({
    nodes: [] as TorNode[],
    links: [] as Link[],
    tracedPath: [] as Link[],
    candidates: [] as OriginCandidate[],
    timelineEvents: [] as TimelineEvent[],
  });

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData({
        nodes: mockNodes,
        links: mockLinks,
        tracedPath,
        candidates: mockCandidates.sort((a, b) => b.confidence - a.confidence),
        timelineEvents: mockTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return data;
};

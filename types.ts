
export enum NodeType {
  Guard = 'guard',
  Relay = 'relay',
  Exit = 'exit',
  Origin = 'origin'
}

export interface TorNode {
  id: string; // IP Address
  type: NodeType;
  country: string;
  uptime: number; // in hours
  bandwidth: number; // in KB/s
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string; // source node ID
  target: string; // target node ID
}

export interface OriginCandidate {
  ip: string;
  country: string;
  confidence: number; // 0-100
  evidence: string[];
}

export interface TimelineEvent {
  timestamp: string;
  description: string;
  type: 'detection' | 'correlation' | 'identification' | 'info';
}

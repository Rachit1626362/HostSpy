export interface IPRange {
  startIP: string;
  endIP?: string;
  cidr?: string;
}

export interface PortRange {
  startPort: number;
  endPort: number;
}

export interface ScanOptions {
  timeout: number;
  maxConcurrent: number;
  pingOnly: boolean;
}

export interface ScanResults {
  id: string;
  timestamp: number;
  ipRange: IPRange;
  portRange: PortRange;
  options: ScanOptions;
  hosts: HostResult[];
  status: 'idle' | 'scanning' | 'completed' | 'error';
  error?: string;
  progress: {
    scannedHosts: number;
    totalHosts: number;
    scannedPorts: number;
    totalPorts: number;
  };
}

export interface HostResult {
  ip: string;
  status: 'alive' | 'dead' | 'unknown';
  latency?: number;
  ports: PortResult[];
  error?: string;
}

export interface PortResult {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered' | 'unknown';
  error?: string;
}

export interface ScanHistory {
  scans: ScanResults[];
}

export type ExportFormat = 'json' | 'text' | 'csv';
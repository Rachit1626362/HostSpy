import { IPRange, PortRange, ScanOptions, ScanResults, HostResult, PortResult } from '../types';
import { ipToLong, longToIp, generateIpRange, cidrToIpRange } from './ipUtils';
import { getServiceForPort } from './portUtils';

/**
 * Note: This is a simulation of a network scanner since browser JavaScript cannot 
 * directly perform network scanning operations like raw TCP connections or ICMP pings
 * due to security restrictions. In a real-world scenario, you would need:
 * 
 * 1. A backend service to perform the actual scanning
 * 2. WebSockets for real-time updates
 * 3. Or use of the fetch API to call an external scanning service
 */

/**
 * Creates a new scan with initial state
 */
export const createScan = (
  ipRange: IPRange,
  portRange: PortRange,
  options: ScanOptions
): ScanResults => {
  let startIp = ipRange.startIP;
  let endIp = ipRange.endIP || ipRange.startIP;
  
  // Handle CIDR notation
  if (ipRange.cidr) {
    const range = cidrToIpRange(ipRange.cidr);
    startIp = range.startIP;
    endIp = range.endIP;
  }
  
  const ipList = generateIpRange(startIp, endIp);
  const totalHosts = ipList.length;
  const totalPorts = portRange.endPort - portRange.startPort + 1;
  
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ipRange: { 
      startIP: startIp, 
      endIP: endIp,
      cidr: ipRange.cidr
    },
    portRange,
    options,
    hosts: [],
    status: 'idle',
    progress: {
      scannedHosts: 0,
      totalHosts,
      scannedPorts: 0,
      totalPorts: totalHosts * totalPorts
    }
  };
};

/**
 * Simulates scanning a host (checking if it's alive)
 */
const simulatePingHost = async (ip: string, timeout: number): Promise<{ alive: boolean; latency?: number }> => {
  return new Promise((resolve) => {
    const delay = Math.random() * 1000;
    const isAlive = Math.random() > 0.2; // 80% chance the host is alive
    
    setTimeout(() => {
      if (isAlive) {
        resolve({ alive: true, latency: delay });
      } else {
        resolve({ alive: false });
      }
    }, Math.min(delay, timeout));
  });
};

/**
 * Simulates scanning a port
 */
const simulateScanPort = async (
  ip: string, 
  port: number, 
  timeout: number
): Promise<PortResult> => {
  return new Promise((resolve) => {
    const delay = Math.random() * 500;
    const rand = Math.random();
    let status: 'open' | 'closed' | 'filtered' | 'unknown';
    
    // Common ports have a higher chance of being open
    const isCommonPort = [21, 22, 25, 53, 80, 443, 3306, 3389, 5432, 8080].includes(port);
    const openProbability = isCommonPort ? 0.7 : 0.2;
    
    if (rand < openProbability) {
      status = 'open';
    } else if (rand < 0.8) {
      status = 'closed';
    } else {
      status = 'filtered';
    }
    
    setTimeout(() => {
      resolve({
        port,
        service: getServiceForPort(port),
        status
      });
    }, Math.min(delay, timeout));
  });
};

/**
 * Simulates scanning an IP range
 */
export const scanNetwork = async (
  scanState: ScanResults,
  onProgress: (scan: ScanResults) => void
): Promise<ScanResults> => {
  const { ipRange, portRange, options } = scanState;
  let scan: ScanResults = { ...scanState, status: 'scanning', hosts: [] };
  
  try {
    let startIp = ipRange.startIP;
    let endIp = ipRange.endIP || ipRange.startIP;
    
    const ipList = generateIpRange(startIp, endIp);
    
    // Process hosts in batches to control concurrency
    for (let i = 0; i < ipList.length; i += options.maxConcurrent) {
      const batchIps = ipList.slice(i, i + options.maxConcurrent);
      
      const hostPromises = batchIps.map(async (ip) => {
        try {
          // Check if host is alive
          const pingResult = await simulatePingHost(ip, options.timeout);
          
          if (!pingResult.alive) {
            return {
              ip,
              status: 'dead' as const,
              ports: []
            };
          }
          
          // If not doing a ping-only scan, check ports
          let ports: PortResult[] = [];
          if (!options.pingOnly) {
            // Scan ports in smaller batches
            for (let port = portRange.startPort; port <= portRange.endPort; port++) {
              const portResult = await simulateScanPort(ip, port, options.timeout);
              ports.push(portResult);
              
              // Update port scan progress
              scan.progress.scannedPorts++;
              onProgress({ ...scan });
            }
          }
          
          return {
            ip,
            status: 'alive' as const,
            latency: pingResult.latency,
            ports
          };
        } catch (error) {
          return {
            ip,
            status: 'unknown' as const,
            ports: [],
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });
      
      const batchResults = await Promise.all(hostPromises);
      
      // Update scan state with new batch results
      scan.hosts = [...scan.hosts, ...batchResults];
      scan.progress.scannedHosts += batchIps.length;
      
      onProgress({ ...scan });
    }
    
    // Scan completed
    scan.status = 'completed';
    return scan;
    
  } catch (error) {
    scan.status = 'error';
    scan.error = error instanceof Error ? error.message : 'Unknown error';
    return scan;
  }
};
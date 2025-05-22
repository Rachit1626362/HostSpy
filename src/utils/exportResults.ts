import { ScanResults, ExportFormat } from '../types';

/**
 * Formats scan results as JSON
 */
export const formatAsJson = (results: ScanResults): string => {
  return JSON.stringify(results, null, 2);
};

/**
 * Formats scan results as plain text
 */
export const formatAsText = (results: ScanResults): string => {
  const { ipRange, portRange, timestamp, hosts } = results;
  
  const date = new Date(timestamp).toLocaleString();
  let output = `Network Scan Results - ${date}\n`;
  output += `==================================\n\n`;
  
  output += `IP Range: ${ipRange.startIP}${ipRange.endIP ? ` to ${ipRange.endIP}` : ''}${ipRange.cidr ? ` (${ipRange.cidr})` : ''}\n`;
  output += `Port Range: ${portRange.startPort}-${portRange.endPort}\n\n`;
  
  // Count alive hosts
  const aliveHosts = hosts.filter(host => host.status === 'alive');
  output += `Found ${aliveHosts.length} alive hosts out of ${hosts.length} total scanned\n\n`;
  
  // Host details
  hosts.forEach(host => {
    output += `Host: ${host.ip} - Status: ${host.status}\n`;
    
    if (host.status === 'alive') {
      if (host.latency !== undefined) {
        output += `  Latency: ${host.latency.toFixed(2)}ms\n`;
      }
      
      if (host.ports.length > 0) {
        output += `  Open Ports:\n`;
        
        const openPorts = host.ports.filter(port => port.status === 'open');
        
        if (openPorts.length === 0) {
          output += `    No open ports found\n`;
        } else {
          openPorts.forEach(port => {
            output += `    ${port.port}/tcp - ${port.service}\n`;
          });
        }
      }
    }
    
    output += `\n`;
  });
  
  return output;
};

/**
 * Formats scan results as CSV
 */
export const formatAsCsv = (results: ScanResults): string => {
  let output = 'IP,Status,Latency,Port,Service,Port Status\n';
  
  results.hosts.forEach(host => {
    if (host.ports.length === 0) {
      output += `${host.ip},${host.status},${host.latency || ''},,,\n`;
    } else {
      host.ports.forEach((port, index) => {
        if (index === 0) {
          output += `${host.ip},${host.status},${host.latency || ''},${port.port},${port.service},${port.status}\n`;
        } else {
          output += `,,,,${port.port},${port.service},${port.status}\n`;
        }
      });
    }
  });
  
  return output;
};

/**
 * Exports scan results to a file
 */
export const exportResults = (results: ScanResults, format: ExportFormat): void => {
  let content = '';
  let fileExtension = '';
  let mimeType = '';
  
  switch (format) {
    case 'json':
      content = formatAsJson(results);
      fileExtension = 'json';
      mimeType = 'application/json';
      break;
    case 'text':
      content = formatAsText(results);
      fileExtension = 'txt';
      mimeType = 'text/plain';
      break;
    case 'csv':
      content = formatAsCsv(results);
      fileExtension = 'csv';
      mimeType = 'text/csv';
      break;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `network-scan-${timestamp}.${fileExtension}`;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  URL.revokeObjectURL(url);
};
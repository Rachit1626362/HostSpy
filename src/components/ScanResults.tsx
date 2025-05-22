import React, { useState } from 'react';
import { ScanResults, HostResult, ExportFormat } from '../types';
import { exportResults } from '../utils/exportResults';
import { 
  Server, Wifi, AlertTriangle, ArrowDownCircle, Filter, ArrowUpDown, 
  ChevronDown, ChevronUp, Save, FileDown, Copy
} from 'lucide-react';

interface ScanResultsViewProps {
  scan: ScanResults;
}

const ScanResultsView: React.FC<ScanResultsViewProps> = ({ scan }) => {
  const [expandedHosts, setExpandedHosts] = useState<string[]>([]);
  const [filterAlive, setFilterAlive] = useState(true);
  const [filterOpenPorts, setFilterOpenPorts] = useState(true);
  const [sortBy, setSortBy] = useState<'ip' | 'status' | 'openPorts'>('ip');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  if (scan.status !== 'completed') {
    return null;
  }
  
  const toggleHostExpanded = (ip: string) => {
    setExpandedHosts(prev => 
      prev.includes(ip) 
        ? prev.filter(hostIp => hostIp !== ip) 
        : [...prev, ip]
    );
  };
  
  const toggleExpandAll = () => {
    if (expandedHosts.length === filteredHosts.length) {
      setExpandedHosts([]);
    } else {
      setExpandedHosts(filteredHosts.map(host => host.ip));
    }
  };
  
  const isHostExpanded = (ip: string) => {
    return expandedHosts.includes(ip);
  };
  
  // Filter hosts based on criteria
  let filteredHosts = [...scan.hosts];
  
  if (filterAlive) {
    filteredHosts = filteredHosts.filter(host => host.status === 'alive');
  }
  
  if (filterOpenPorts) {
    filteredHosts = filteredHosts.filter(host => 
      !scan.options.pingOnly && 
      host.ports?.some(port => port.status === 'open')
    );
  }
  
  // Sort hosts
  filteredHosts.sort((a, b) => {
    if (sortBy === 'ip') {
      const ipA = a.ip.split('.').map(Number);
      const ipB = b.ip.split('.').map(Number);
      
      for (let i = 0; i < 4; i++) {
        if (ipA[i] !== ipB[i]) {
          return sortDirection === 'asc' 
            ? ipA[i] - ipB[i] 
            : ipB[i] - ipA[i];
        }
      }
      return 0;
    }
    
    if (sortBy === 'status') {
      if (a.status === b.status) return 0;
      if (sortDirection === 'asc') {
        return a.status === 'alive' ? -1 : 1;
      } else {
        return a.status === 'alive' ? 1 : -1;
      }
    }
    
    if (sortBy === 'openPorts') {
      const openPortsA = a.ports?.filter(p => p.status === 'open').length || 0;
      const openPortsB = b.ports?.filter(p => p.status === 'open').length || 0;
      return sortDirection === 'asc' 
        ? openPortsA - openPortsB 
        : openPortsB - openPortsA;
    }
    
    return 0;
  });
  
  const handleExport = (format: ExportFormat) => {
    exportResults(scan, format);
  };
  
  const copyToClipboard = () => {
    const textResults = filteredHosts.map(host => {
      let text = `${host.ip} - ${host.status}`;
      if (host.status === 'alive' && host.ports?.length) {
        const openPorts = host.ports
          .filter(p => p.status === 'open')
          .map(p => `${p.port}/${p.service}`)
          .join(', ');
        text += ` [${openPorts}]`;
      }
      return text;
    }).join('\n');
    
    navigator.clipboard.writeText(textResults)
      .then(() => {
        alert('Results copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Server className="mr-2 text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Scan Results</h2>
        </div>
        
        <div className="flex gap-2">
          <div className="relative group">
            <button
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
            >
              <Save className="mr-1" size={16} />
              Export
              <ChevronDown className="ml-1" size={16} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600"
                >
                  <FileDown className="mr-2" size={16} />
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('text')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600"
                >
                  <FileDown className="mr-2" size={16} />
                  Export as Text
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600"
                >
                  <FileDown className="mr-2" size={16} />
                  Export as CSV
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600"
                >
                  <Copy className="mr-2" size={16} />
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={toggleExpandAll}
          className="flex items-center bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-md text-sm transition-colors"
        >
          {expandedHosts.length === filteredHosts.length ? (
            <>
              <ChevronUp className="mr-1" size={16} />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="mr-1" size={16} />
              Expand All
            </>
          )}
        </button>
        
        <div className="flex items-center">
          <Filter className="mr-1 text-gray-400" size={16} />
          <label className="flex items-center cursor-pointer ml-1 text-gray-300 text-sm">
            <input
              type="checkbox"
              checked={filterAlive}
              onChange={() => setFilterAlive(!filterAlive)}
              className="mr-1"
            />
            Alive Hosts Only
          </label>
        </div>
        
        {!scan.options.pingOnly && (
          <div className="flex items-center">
            <Filter className="mr-1 text-gray-400" size={16} />
            <label className="flex items-center cursor-pointer ml-1 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={filterOpenPorts}
                onChange={() => setFilterOpenPorts(!filterOpenPorts)}
                className="mr-1"
              />
              With Open Ports Only
            </label>
          </div>
        )}
        
        <div className="flex items-center ml-auto">
          <ArrowUpDown className="mr-1 text-gray-400" size={16} />
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [newSortBy, newSortDirection] = e.target.value.split('-');
              setSortBy(newSortBy as any);
              setSortDirection(newSortDirection as any);
            }}
            className="bg-gray-700 text-gray-300 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ip-asc">IP Address (A-Z)</option>
            <option value="ip-desc">IP Address (Z-A)</option>
            <option value="status-asc">Status (Alive First)</option>
            <option value="status-desc">Status (Dead First)</option>
            <option value="openPorts-desc">Open Ports (Most First)</option>
            <option value="openPorts-asc">Open Ports (Least First)</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {scan.options.pingOnly ? 'Details' : 'Open Ports'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {filteredHosts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                  No hosts match the current filters
                </td>
              </tr>
            ) : (
              filteredHosts.map((host) => (
                <React.Fragment key={host.ip}>
                  <tr 
                    className={`${isHostExpanded(host.ip) ? 'bg-gray-700' : 'hover:bg-gray-700'} cursor-pointer`}
                    onClick={() => toggleHostExpanded(host.ip)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-200 font-mono">
                      {host.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${host.status === 'alive' ? 'bg-green-900 text-green-200' : 
                          host.status === 'dead' ? 'bg-red-900 text-red-200' : 
                          'bg-yellow-900 text-yellow-200'}`}
                      >
                        {host.status === 'alive' ? (
                          <Wifi className="mr-1" size={12} />
                        ) : (
                          <AlertTriangle className="mr-1" size={12} />
                        )}
                        {host.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {host.latency !== undefined ? `${host.latency.toFixed(2)} ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {!scan.options.pingOnly && host.status === 'alive' ? (
                        <span className="text-sm">
                          {host.ports.filter(p => p.status === 'open').length} open
                          {isHostExpanded(host.ip) ? (
                            <ChevronUp className="inline ml-1" size={16} />
                          ) : (
                            <ChevronDown className="inline ml-1" size={16} />
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded row for port details */}
                  {isHostExpanded(host.ip) && !scan.options.pingOnly && host.status === 'alive' && (
                    <tr className="bg-gray-700/50">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="border-t border-gray-600 pt-3">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Open Ports</h4>
                          {host.ports.filter(p => p.status === 'open').length === 0 ? (
                            <p className="text-gray-400 text-sm">No open ports found</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {host.ports
                                .filter(p => p.status === 'open')
                                .map(port => (
                                  <div 
                                    key={port.port} 
                                    className="flex items-center bg-gray-800 rounded-md p-2 text-sm"
                                  >
                                    <span className="inline-block w-10 font-mono text-blue-400">{port.port}</span>
                                    <span className="text-gray-300">{port.service}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-right text-sm text-gray-400">
        Showing {filteredHosts.length} of {scan.hosts.length} hosts
      </div>
    </div>
  );
};

export default ScanResultsView;
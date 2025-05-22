import React from 'react';
import { ScanResults } from '../types';
import { History, Clock, RefreshCw, Trash2 } from 'lucide-react';

interface ScanHistoryProps {
  scans: ScanResults[];
  onSelectScan: (scan: ScanResults) => void;
  onDeleteScan: (scanId: string) => void;
  currentScanId?: string;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ 
  scans, 
  onSelectScan, 
  onDeleteScan,
  currentScanId
}) => {
  if (scans.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <History className="mr-2 text-purple-400" size={20} />
        <h2 className="text-xl font-semibold text-white">Scan History</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                IP Range
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ports
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Results
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {scans.map((scan) => (
              <tr 
                key={scan.id} 
                className={`hover:bg-gray-700 ${currentScanId === scan.id ? 'bg-gray-700' : ''}`}
              >
                <td className="px-4 py-2 whitespace-nowrap text-gray-300 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 text-gray-400" size={14} />
                    {new Date(scan.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-300 text-sm">
                  {scan.ipRange.cidr || `${scan.ipRange.startIP}${scan.ipRange.endIP !== scan.ipRange.startIP ? ` to ${scan.ipRange.endIP}` : ''}`}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-300 text-sm">
                  {scan.options.pingOnly ? 'Ping only' : `${scan.portRange.startPort}-${scan.portRange.endPort}`}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-300 text-sm">
                  {scan.hosts.filter(h => h.status === 'alive').length} alive hosts, 
                  {!scan.options.pingOnly ? ` ${scan.hosts.reduce((acc, host) => 
                    acc + (host.ports?.filter(p => p.status === 'open').length || 0), 0)} open ports` : ''}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onSelectScan(scan)}
                      className="text-blue-400 hover:text-blue-300"
                      title="View Scan"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteScan(scan.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete Scan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanHistory;
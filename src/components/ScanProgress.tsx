import React from 'react';
import { ScanResults } from '../types';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface ScanProgressProps {
  scan: ScanResults;
}

const ScanProgress: React.FC<ScanProgressProps> = ({ scan }) => {
  const { status, progress, error } = scan;
  
  const hostProgress = progress.totalHosts > 0
    ? Math.round((progress.scannedHosts / progress.totalHosts) * 100)
    : 0;
    
  const portProgress = progress.totalPorts > 0
    ? Math.round((progress.scannedPorts / progress.totalPorts) * 100)
    : 0;
  
  if (status === 'idle') {
    return null;
  }
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 animate-fadeIn">
      <div className="flex items-center mb-4">
        {status === 'scanning' && (
          <Loader className="mr-2 text-blue-400 animate-spin" size={24} />
        )}
        {status === 'error' && (
          <AlertCircle className="mr-2 text-red-400" size={24} />
        )}
        {status === 'completed' && (
          <CheckCircle className="mr-2 text-green-400" size={24} />
        )}
        
        <h2 className="text-xl font-semibold text-white">
          {status === 'scanning' && 'Scan in Progress'}
          {status === 'error' && 'Scan Error'}
          {status === 'completed' && 'Scan Complete'}
        </h2>
      </div>
      
      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-md text-red-200">
          {error || 'An unknown error occurred during the scan.'}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-gray-300">Hosts Scanned</span>
          <span className="text-gray-300">
            {progress.scannedHosts} / {progress.totalHosts}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${hostProgress}%` }}
          />
        </div>
      </div>
      
      {!scan.options.pingOnly && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-300">Ports Scanned</span>
            <span className="text-gray-300">
              {progress.scannedPorts} / {progress.totalPorts}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${portProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="mt-4 text-gray-200">
          <p>
            Found {scan.hosts.filter(h => h.status === 'alive').length} alive hosts 
            out of {scan.hosts.length} total.
          </p>
          {!scan.options.pingOnly && (
            <p>
              Discovered {scan.hosts.reduce((acc, host) => 
                acc + (host.ports?.filter(p => p.status === 'open').length || 0), 0)
              } open ports.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanProgress;
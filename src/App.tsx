import React, { useState, useEffect, useCallback } from 'react';
import { IPRange, PortRange, ScanOptions, ScanResults, ScanHistory } from './types';
import { createScan, scanNetwork } from './utils/networkScanner';
import ScannerForm from './components/ScannerForm';
import ScanProgress from './components/ScanProgress';
import ScanResultsView from './components/ScanResults';
import ScanHistoryComponent from './components/ScanHistory';
import { Network, Shield, Github } from 'lucide-react';

// Custom hook for persistent storage
const usePersistentState = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
};

function App() {
  const [currentScan, setCurrentScan] = useState<ScanResults | null>(null);
  const [scanHistory, setScanHistory] = usePersistentState<ScanHistory>('hostspy-history', { scans: [] });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!currentScan) {
      document.title = 'HostSpy';
    } else if (currentScan.status === 'scanning') {
      document.title = `Scanning... (${currentScan.progress.scannedHosts}/${currentScan.progress.totalHosts})`;
    } else if (currentScan.status === 'completed') {
      document.title = `Scan Complete - ${currentScan.hosts.filter(h => h.status === 'alive').length} hosts`;
    }
    
    return () => {
      document.title = 'HostSpy';
    };
  }, [currentScan]);

  const handleStartScan = useCallback(async (
    ipRange: IPRange, 
    portRange: PortRange, 
    options: ScanOptions
  ) => {
    const newScan = createScan(ipRange, portRange, options);
    setCurrentScan(newScan);
    setIsScanning(true);
    
    try {
      const completedScan = await scanNetwork(newScan, (updatedScan) => {
        setCurrentScan(updatedScan);
      });
      
      setCurrentScan(completedScan);
      
      if (completedScan.status === 'completed') {
        setScanHistory(prev => ({
          scans: [completedScan, ...prev.scans.slice(0, 9)]
        }));
      }
    } catch (error) {
      console.error('Scan error:', error);
      setCurrentScan(prev => prev ? {
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error during scan'
      } : null);
    } finally {
      setIsScanning(false);
    }
  }, [setScanHistory]);

  const handleStopScan = useCallback(() => {
    if (!currentScan) return;
    
    setCurrentScan(prev => prev ? {
      ...prev,
      status: 'completed',
    } : null);
    
    setIsScanning(false);
  }, [currentScan]);

  const handleSelectScan = useCallback((scan: ScanResults) => {
    setCurrentScan(scan);
  }, []);

  const handleDeleteScan = useCallback((scanId: string) => {
    setScanHistory(prev => ({
      scans: prev.scans.filter(scan => scan.id !== scanId)
    }));
    
    if (currentScan?.id === scanId) {
      setCurrentScan(null);
    }
  }, [currentScan, setScanHistory]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Network className="text-blue-400 mr-3" size={32} />
              <h1 className="text-2xl font-bold">HostSpy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <Github className="mr-1" size={18} />
                <span className="hidden md:inline">GitHub</span>
              </a>
              <div className="flex items-center">
                <Shield className="text-green-400 mr-1" size={18} />
                <span className="text-sm">Secure Scanner</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <ScannerForm 
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
          isScanning={isScanning}
        />
        
        {currentScan && (
          <ScanProgress scan={currentScan} />
        )}
        
        {currentScan && currentScan.status === 'completed' && (
          <ScanResultsView scan={currentScan} />
        )}
        
        {scanHistory.scans.length > 0 && (
          <ScanHistoryComponent 
            scans={scanHistory.scans}
            onSelectScan={handleSelectScan}
            onDeleteScan={handleDeleteScan}
            currentScanId={currentScan?.id}
          />
        )}
      </main>
      
      <footer className="bg-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>HostSpy &copy; {new Date().getFullYear()} - For educational purposes only.</p>
          <p className="mt-1">This tool simulates network scanning and does not perform actual network reconnaissance.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
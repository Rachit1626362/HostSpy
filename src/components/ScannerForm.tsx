import React, { useState } from 'react';
import { IPRange, PortRange, ScanOptions } from '../types';
import { isValidIp, isValidCidr, isValidIpRange } from '../utils/ipUtils';
import { isValidPort, isValidPortRange, portGroups } from '../utils/portUtils';
import { Play, StopCircle, Network, Layers } from 'lucide-react';

interface ScannerFormProps {
  onStartScan: (ipRange: IPRange, portRange: PortRange, options: ScanOptions) => void;
  onStopScan: () => void;
  isScanning: boolean;
}

const ScannerForm: React.FC<ScannerFormProps> = ({ 
  onStartScan, 
  onStopScan, 
  isScanning 
}) => {
  // IP Range state
  const [ipInputType, setIpInputType] = useState<'single' | 'range' | 'cidr'>('single');
  const [startIP, setStartIP] = useState('192.168.1.1');
  const [endIP, setEndIP] = useState('192.168.1.254');
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [ipError, setIpError] = useState('');
  
  // Port Range state
  const [portInputType, setPortInputType] = useState<'single' | 'range' | 'common'>('range');
  const [startPort, setStartPort] = useState(1);
  const [endPort, setEndPort] = useState(1000);
  const [singlePort, setSinglePort] = useState(80);
  const [selectedPortGroup, setSelectedPortGroup] = useState<keyof typeof portGroups>('common');
  const [portError, setPortError] = useState('');
  
  // Validate IP input
  const validateIpInput = (): boolean => {
    switch (ipInputType) {
      case 'single':
        if (!isValidIp(startIP)) {
          setIpError('Invalid IP address format');
          return false;
        }
        break;
      case 'range':
        if (!isValidIp(startIP)) {
          setIpError('Invalid start IP address');
          return false;
        }
        if (!isValidIp(endIP)) {
          setIpError('Invalid end IP address');
          return false;
        }
        if (!isValidIpRange(startIP, endIP)) {
          setIpError('Start IP must be less than or equal to end IP');
          return false;
        }
        break;
      case 'cidr':
        if (!isValidCidr(cidr)) {
          setIpError('Invalid CIDR notation');
          return false;
        }
        break;
    }
    
    setIpError('');
    return true;
  };
  
  // Validate Port input
  const validatePortInput = (): boolean => {
    switch (portInputType) {
      case 'single':
        if (!isValidPort(singlePort)) {
          setPortError('Port must be between 1 and 65535');
          return false;
        }
        break;
      case 'range':
        if (!isValidPort(startPort)) {
          setPortError('Start port must be between 1 and 65535');
          return false;
        }
        if (!isValidPort(endPort)) {
          setPortError('End port must be between 1 and 65535');
          return false;
        }
        if (!isValidPortRange(startPort, endPort)) {
          setPortError('Start port must be less than or equal to end port');
          return false;
        }
        break;
      case 'common':
        // Common ports are pre-validated
        break;
    }
    
    setPortError('');
    return true;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateIpInput() || !validatePortInput()) {
      return;
    }
    
    const ipRange: IPRange = { startIP: startIP };
    
    switch (ipInputType) {
      case 'single':
        ipRange.endIP = startIP;
        break;
      case 'range':
        ipRange.endIP = endIP;
        break;
      case 'cidr':
        ipRange.cidr = cidr;
        break;
    }
    
    let portRange: PortRange;
    
    switch (portInputType) {
      case 'single':
        portRange = { startPort: singlePort, endPort: singlePort };
        break;
      case 'range':
        portRange = { startPort, endPort };
        break;
      case 'common':
        const ports = portGroups[selectedPortGroup];
        portRange = { 
          startPort: Math.min(...ports), 
          endPort: Math.max(...ports) 
        };
        break;
    }
    
    const options: ScanOptions = {
      timeout: 2000,
      maxConcurrent: 10,
      pingOnly: false
    };
    
    onStartScan(ipRange, portRange, options);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <form onSubmit={handleSubmit}>
        {/* IP Range Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Network className="mr-2 text-blue-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Target</h2>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="ipInputType"
                checked={ipInputType === 'single'}
                onChange={() => setIpInputType('single')}
                className="mr-2"
              />
              <span className="text-gray-200">Single IP</span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="ipInputType"
                checked={ipInputType === 'range'}
                onChange={() => setIpInputType('range')}
                className="mr-2"
              />
              <span className="text-gray-200">IP Range</span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="ipInputType"
                checked={ipInputType === 'cidr'}
                onChange={() => setIpInputType('cidr')}
                className="mr-2"
              />
              <span className="text-gray-200">CIDR Notation</span>
            </label>
          </div>
          
          {ipInputType === 'single' && (
            <div>
              <label className="block text-gray-300 mb-2">IP Address</label>
              <input
                type="text"
                value={startIP}
                onChange={(e) => setStartIP(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {ipInputType === 'range' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Start IP</label>
                <input
                  type="text"
                  value={startIP}
                  onChange={(e) => setStartIP(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">End IP</label>
                <input
                  type="text"
                  value={endIP}
                  onChange={(e) => setEndIP(e.target.value)}
                  placeholder="e.g. 192.168.1.254"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          {ipInputType === 'cidr' && (
            <div>
              <label className="block text-gray-300 mb-2">CIDR Notation</label>
              <input
                type="text"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                placeholder="e.g. 192.168.1.0/24"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {ipError && (
            <div className="mt-2 text-red-400 text-sm">{ipError}</div>
          )}
        </div>
        
        {/* Port Range Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Layers className="mr-2 text-green-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Ports</h2>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="portInputType"
                checked={portInputType === 'single'}
                onChange={() => setPortInputType('single')}
                className="mr-2"
              />
              <span className="text-gray-200">Single Port</span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="portInputType"
                checked={portInputType === 'range'}
                onChange={() => setPortInputType('range')}
                className="mr-2"
              />
              <span className="text-gray-200">Port Range</span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="portInputType"
                checked={portInputType === 'common'}
                onChange={() => setPortInputType('common')}
                className="mr-2"
              />
              <span className="text-gray-200">Common Ports</span>
            </label>
          </div>
          
          {portInputType === 'single' && (
            <div>
              <label className="block text-gray-300 mb-2">Port Number</label>
              <input
                type="number"
                value={singlePort}
                onChange={(e) => setSinglePort(parseInt(e.target.value, 10))}
                min="1"
                max="65535"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {portInputType === 'range' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Start Port</label>
                <input
                  type="number"
                  value={startPort}
                  onChange={(e) => setStartPort(parseInt(e.target.value, 10))}
                  min="1"
                  max="65535"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">End Port</label>
                <input
                  type="number"
                  value={endPort}
                  onChange={(e) => setEndPort(parseInt(e.target.value, 10))}
                  min="1"
                  max="65535"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          {portInputType === 'common' && (
            <div>
              <label className="block text-gray-300 mb-2">Port Group</label>
              <select
                value={selectedPortGroup}
                onChange={(e) => setSelectedPortGroup(e.target.value as keyof typeof portGroups)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="common">Common Ports</option>
                <option value="webServices">Web Services</option>
                <option value="mailServices">Mail Services</option>
                <option value="fileTransfer">File Transfer</option>
                <option value="databases">Databases</option>
              </select>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {portGroups[selectedPortGroup].map(port => (
                  <span key={port} className="inline-block bg-gray-600 text-gray-200 px-2 py-1 text-xs rounded">
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {portError && (
            <div className="mt-2 text-red-400 text-sm">{portError}</div>
          )}
        </div>
        
        {/* Scan Controls */}
        <div className="flex flex-wrap justify-between gap-4">
          {!isScanning ? (
            <button
              type="submit"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Play className="mr-2" size={18} />
              Start Scan
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopScan}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <StopCircle className="mr-2" size={18} />
              Stop Scan
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ScannerForm;
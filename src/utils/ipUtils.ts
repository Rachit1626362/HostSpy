/**
 * Validates an IP address
 */
export const isValidIp = (ip: string): boolean => {
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipPattern.test(ip)) return false;
  
  const octets = ip.split('.').map(Number);
  return octets.every(octet => octet >= 0 && octet <= 255);
};

/**
 * Validates a CIDR notation
 */
export const isValidCidr = (cidr: string): boolean => {
  const cidrPattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  if (!cidrPattern.test(cidr)) return false;
  
  const [ip, prefix] = cidr.split('/');
  const prefixNum = parseInt(prefix, 10);
  
  if (!isValidIp(ip) || prefixNum < 0 || prefixNum > 32) return false;
  
  return true;
};

/**
 * Validates an IP range
 */
export const isValidIpRange = (startIp: string, endIp: string): boolean => {
  if (!isValidIp(startIp) || !isValidIp(endIp)) return false;
  
  const startIpNum = ipToLong(startIp);
  const endIpNum = ipToLong(endIp);
  
  return startIpNum <= endIpNum;
};

/**
 * Converts an IP address to a long number
 */
export const ipToLong = (ip: string): number => {
  const octets = ip.split('.').map(Number);
  return (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
};

/**
 * Converts a long number to an IP address
 */
export const longToIp = (long: number): string => {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
};

/**
 * Converts a CIDR notation to an IP range
 */
export const cidrToIpRange = (cidr: string): { startIP: string; endIP: string } => {
  const [ip, prefix] = cidr.split('/');
  const prefixNum = parseInt(prefix, 10);
  
  const ipLong = ipToLong(ip);
  const mask = -1 << (32 - prefixNum);
  const startIpLong = ipLong & mask;
  const endIpLong = startIpLong | (~mask & 0xffffffff);
  
  return {
    startIP: longToIp(startIpLong),
    endIP: longToIp(endIpLong)
  };
};

/**
 * Calculates the number of IP addresses in a range
 */
export const calculateIpCount = (startIp: string, endIp: string): number => {
  const startIpNum = ipToLong(startIp);
  const endIpNum = ipToLong(endIp);
  
  return endIpNum - startIpNum + 1;
};

/**
 * Generates all IP addresses in a range
 */
export const generateIpRange = (startIp: string, endIp: string): string[] => {
  const startIpNum = ipToLong(startIp);
  const endIpNum = ipToLong(endIp);
  const ips: string[] = [];
  
  for (let i = startIpNum; i <= endIpNum; i++) {
    ips.push(longToIp(i));
  }
  
  return ips;
};
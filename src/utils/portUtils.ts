/**
 * Validates a port number
 */
export const isValidPort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

/**
 * Validates a port range
 */
export const isValidPortRange = (startPort: number, endPort: number): boolean => {
  return isValidPort(startPort) && isValidPort(endPort) && startPort <= endPort;
};

/**
 * Common port definitions
 */
export const commonPorts = {
  ftp: 21,
  ssh: 22,
  telnet: 23,
  smtp: 25,
  dns: 53,
  http: 80,
  pop3: 110,
  ntp: 123,
  https: 443,
  smb: 445,
  mysql: 3306,
  rdp: 3389,
  postgres: 5432
};

/**
 * Predefined port groups
 */
export const portGroups = {
  common: [20, 21, 22, 23, 25, 53, 80, 110, 123, 143, 443, 465, 587, 993, 995, 3306, 3389, 5432, 8080, 8443],
  webServices: [80, 443, 8000, 8008, 8080, 8088, 8443, 8888],
  mailServices: [25, 110, 143, 465, 587, 993, 995],
  fileTransfer: [20, 21, 22, 69, 115, 989, 990],
  databases: [1433, 1521, 3306, 5432, 6379, 9042, 27017]
};

/**
 * Gets the service name for a port
 */
export const getServiceForPort = (port: number): string => {
  const services: Record<number, string> = {
    20: 'FTP Data',
    21: 'FTP Control',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    123: 'NTP',
    143: 'IMAP',
    443: 'HTTPS',
    465: 'SMTPS',
    587: 'SMTP Submission',
    993: 'IMAPS',
    995: 'POP3S',
    1433: 'MSSQL',
    1521: 'Oracle DB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    6379: 'Redis',
    8080: 'HTTP Alternate',
    8443: 'HTTPS Alternate',
    9042: 'Cassandra',
    27017: 'MongoDB'
  };
  
  return services[port] || 'Unknown';
};
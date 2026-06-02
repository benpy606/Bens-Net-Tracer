import type { SubnetInfo } from '../types/network';

// Validate IPv4 format
export const validateIp = (ip: string): boolean => {
  const regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip.trim());
};

// Convert IP string to 32-bit integer (unsigned long equivalent)
export const ipToLong = (ip: string): number => {
  const parts = ip.trim().split('.').map(Number);
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
};

// Convert 32-bit integer to IP string
export const longToIp = (long: number): string => {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
};

// Get subnet mask from CIDR
export const cidrToLongMask = (cidr: number): number => {
  if (cidr === 0) return 0;
  return (~(Math.pow(2, 32 - cidr) - 1)) >>> 0;
};

export const cidrToDottedMask = (cidr: number): string => {
  return longToIp(cidrToLongMask(cidr));
};

export const dottedMaskToCidr = (mask: string): number => {
  if (!validateIp(mask)) return 24;
  const long = ipToLong(mask);
  // Count consecutive 1s from MSB
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if (((long >>> i) & 1) === 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
};

// Calculate all details for an IP and CIDR mask
export const calculateSubnetInfo = (ip: string, cidr: number): SubnetInfo | null => {
  if (!validateIp(ip) || cidr < 0 || cidr > 32) return null;

  const ipLong = ipToLong(ip);
  const maskLong = cidrToLongMask(cidr);
  const wildcardLong = (~maskLong) >>> 0;

  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? 0 : totalHosts - 2;

  const firstUsableIpLong = cidr >= 31 ? networkLong : networkLong + 1;
  const lastUsableIpLong = cidr >= 31 ? broadcastLong : broadcastLong - 1;

  return {
    networkAddress: longToIp(networkLong),
    subnetMask: longToIp(maskLong),
    cidr,
    firstUsableIp: longToIp(firstUsableIpLong),
    lastUsableIp: longToIp(lastUsableIpLong),
    broadcastAddress: longToIp(broadcastLong),
    totalHosts,
    usableHosts,
    wildcardMask: longToIp(wildcardLong),
  };
};

// Returns a 32-character binary string representing an IP address
export const ipToBinaryString = (ip: string): string => {
  if (!validateIp(ip)) return '0'.repeat(32);
  const long = ipToLong(ip);
  return (long >>> 0).toString(2).padStart(32, '0');
};

// Returns binary string grouped into 4 octets separated by dots
export const ipToBinaryOctets = (ip: string): string => {
  const binary = ipToBinaryString(ip);
  return [
    binary.substring(0, 8),
    binary.substring(8, 16),
    binary.substring(16, 24),
    binary.substring(24, 32)
  ].join('.');
};

// Decompose IP into segments for styling: network, subnet, host
// baseCidr represents the standard class/network boundary, cidr represents current subnet boundary
export interface BitSegment {
  bit: string;
  type: 'network' | 'subnet' | 'host';
  index: number;
}

export const getBitSegments = (ip: string, baseCidr: number, cidr: number): BitSegment[] => {
  const binary = ipToBinaryString(ip);
  const segments: BitSegment[] = [];

  for (let i = 0; i < 32; i++) {
    let type: 'network' | 'subnet' | 'host' = 'host';
    if (i < baseCidr) {
      type = 'network';
    } else if (i < cidr) {
      type = 'subnet';
    }
    segments.push({
      bit: binary[i],
      type,
      index: i,
    });
  }

  return segments;
};

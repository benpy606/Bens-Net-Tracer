import type { VLSMInput, VLSMResult } from '../types/network';
import { validateIp, ipToLong, longToIp, cidrToLongMask, calculateSubnetInfo } from './subnetCalc';

export const calculateVLSM = (
  baseIp: string,
  baseCidr: number,
  requirements: VLSMInput[]
): { success: boolean; results: VLSMResult[]; error?: string } => {
  if (!validateIp(baseIp)) {
    return { success: false, results: [], error: 'Invalid Base IP Address' };
  }
  if (baseCidr < 0 || baseCidr > 30) {
    return { success: false, results: [], error: 'Base CIDR must be between 0 and 30' };
  }
  if (requirements.length === 0) {
    return { success: false, results: [], error: 'Please add at least one subnet requirement' };
  }

  // Sort requirements by hosts needed descending
  const sortedReqs = [...requirements].sort((a, b) => b.hostsNeeded - a.hostsNeeded);

  const baseLong = ipToLong(baseIp);
  const baseMaskLong = cidrToLongMask(baseCidr);
  const networkLong = (baseLong & baseMaskLong) >>> 0;
  
  const totalIpAvailable = Math.pow(2, 32 - baseCidr);
  const maxAddressLong = networkLong + totalIpAvailable;

  let currentIpLong = networkLong;
  const results: VLSMResult[] = [];

  for (const req of sortedReqs) {
    if (req.hostsNeeded < 0) {
      results.push({
        name: req.name,
        hostsNeeded: req.hostsNeeded,
        allocatedHosts: 0,
        networkAddress: '',
        cidr: 0,
        subnetMask: '',
        firstUsableIp: '',
        lastUsableIp: '',
        broadcastAddress: '',
        success: false,
        error: 'Host count cannot be negative'
      });
      continue;
    }

    // Determine host size. We need hostsNeeded + 2 (network and broadcast)
    // Smallest block size is 4 (for /30, supporting 2 usable hosts)
    const neededIps = req.hostsNeeded + 2;
    const blockSize = Math.max(4, Math.pow(2, Math.ceil(Math.log2(neededIps))));
    const cidr = 32 - Math.log2(blockSize);

    // Align current IP to block size boundary
    const remainder = currentIpLong % blockSize;
    if (remainder !== 0) {
      currentIpLong += (blockSize - remainder);
    }

    // Check if we exceed the allocated base network block
    if (currentIpLong + blockSize > maxAddressLong) {
      results.push({
        name: req.name,
        hostsNeeded: req.hostsNeeded,
        allocatedHosts: 0,
        networkAddress: '',
        cidr: 0,
        subnetMask: '',
        firstUsableIp: '',
        lastUsableIp: '',
        broadcastAddress: '',
        success: false,
        error: 'Insufficient IP space in base network'
      });
      continue;
    }

    const info = calculateSubnetInfo(longToIp(currentIpLong), cidr);

    if (info) {
      results.push({
        name: req.name,
        hostsNeeded: req.hostsNeeded,
        allocatedHosts: blockSize - 2,
        networkAddress: info.networkAddress,
        cidr: info.cidr,
        subnetMask: info.subnetMask,
        firstUsableIp: info.firstUsableIp,
        lastUsableIp: info.lastUsableIp,
        broadcastAddress: info.broadcastAddress,
        success: true
      });
    }

    currentIpLong += blockSize;
  }

  const hasFailures = results.some(r => !r.success);

  return {
    success: !hasFailures,
    results,
    error: hasFailures ? 'Some subnets could not be allocated due to insufficient space' : undefined
  };
};

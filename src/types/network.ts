export type DeviceType = 'router' | 'switch' | 'server' | 'firewall' | 'pc';

export interface DeviceInterface {
  id: string;
  name: string;
  ipAddress?: string;
  subnetMask?: string;
  macAddress: string;
  isConnected: boolean;
  status?: 'active' | 'shutdown';
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
  interfaces: DeviceInterface[];
  powerStatus?: 'on' | 'off'; // For Physical tab power toggle
  modules?: string[];         // Loaded modules in slots
}

export interface Link {
  id: string;
  fromDeviceId: string;
  fromPort: string;
  toDeviceId: string;
  toPort: string;
  status: 'active' | 'inactive';
}

export interface SubnetInfo {
  networkAddress: string;
  subnetMask: string;
  cidr: number;
  firstUsableIp: string;
  lastUsableIp: string;
  broadcastAddress: string;
  totalHosts: number;
  usableHosts: number;
  wildcardMask: string;
}

export interface VLSMInput {
  name: string;
  hostsNeeded: number;
}

export interface VLSMResult {
  name: string;
  hostsNeeded: number;
  allocatedHosts: number;
  networkAddress: string;
  cidr: number;
  subnetMask: string;
  firstUsableIp: string;
  lastUsableIp: string;
  broadcastAddress: string;
  success: boolean;
  error?: string;
}

export interface SimEvent {
  id: string;
  protocol: string;
  source: string;
  dest: string;
  status: string;
}

export interface CanvasNote {
  id: string;
  text: string;
  x: number;
  y: number;
}


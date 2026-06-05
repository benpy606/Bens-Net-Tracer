// src/utils/packetMockData.ts

import type { Packet } from '../types/packet';

const buildHexAndAscii = (hexSequence: number[]): { hex: number[]; ascii: string[] } => {
  const hex: number[] = [];
  const ascii: string[] = [];
  for (let i = 0; i < hexSequence.length; i += 16) {
    for (let j = i; j < Math.min(i + 16, hexSequence.length); j++) {
      hex.push(hexSequence[j]);
      ascii.push(hexSequence[j] >= 32 && hexSequence[j] <= 126 ? String.fromCharCode(hexSequence[j]) : '.');
    }
  }
  return { hex, ascii };
};

const hex = buildHexAndAscii([
  // Ethernet frame
  0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c, 0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12, 0x08, 0x00, 0x45, 0x00,
  0x00, 0x3c, 0x1c, 0x46, 0x40, 0x00, 0x40, 0x06, 0xb1, 0xe6, 0xc0, 0xa8, 0x01, 0x02, 0xc0, 0xa8,
  0x01, 0x03, 0x00, 0x50, 0x1f, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x50, 0x02,
  0x20, 0x00, 0x91, 0x7c, 0x00, 0x00, 0x01, 0x01, 0x08, 0x0a, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05,
]);

const tcpAck = buildHexAndAscii([
  0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c, 0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12, 0x08, 0x00, 0x45, 0x00,
  0x00, 0x28, 0x1c, 0x47, 0x40, 0x00, 0x40, 0x06, 0xb1, 0xfa, 0xc0, 0xa8, 0x01, 0x03, 0xc0, 0xa8,
  0x01, 0x02, 0x00, 0x50, 0x1f, 0x91, 0x1f, 0x90, 0x00, 0x00, 0x00, 0x00, 0x50, 0x10, 0x21, 0x20,
  0xb1, 0xe6, 0x00, 0x00,
]);

const tcpSyn2 = buildHexAndAscii([
  0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12, 0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c, 0x08, 0x00, 0x45, 0x00,
  0x00, 0x3c, 0x1c, 0x48, 0x40, 0x00, 0x40, 0x06, 0xb1, 0xd4, 0xc0, 0xa8, 0x01, 0x03, 0xc0, 0xa8,
  0x01, 0x02, 0x1f, 0x91, 0x00, 0x50, 0x1f, 0x90, 0x1f, 0x91, 0x00, 0x00, 0x00, 0x00, 0x70, 0x02,
  0x20, 0x00, 0x91, 0x70, 0x00, 0x00, 0x01, 0x01, 0x08, 0x0a, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05,
]);

const dnsQuery = buildHexAndAscii([
  0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c, 0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12, 0x08, 0x00, 0x45, 0x00,
  0x00, 0x41, 0x1c, 0x4a, 0x40, 0x00, 0x40, 0x11, 0xb1, 0xe1, 0xc0, 0xa8, 0x01, 0x02, 0xc0, 0xa8,
  0x01, 0x01, 0x00, 0x35, 0x00, 0x35, 0x00, 0x00, 0x00, 0x00, 0x1c, 0x00, 0x06, 0x03, 0x77, 0x77,
  0x77, 0x06, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d, 0x00, 0x00, 0x01, 0x00,
  0x01,
]);

const httpGet = buildHexAndAscii([
  0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c, 0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12, 0x08, 0x00, 0x45, 0x00,
  0x01, 0x39, 0x1c, 0x51, 0x40, 0x00, 0x40, 0x06, 0xb0, 0xe9, 0xc0, 0xa8, 0x01, 0x03, 0xc0, 0xa8,
  0x01, 0x01, 0x00, 0x50, 0x1f, 0x92, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x50, 0x18,
  0x21, 0x20, 0xb1, 0xd2, 0x00, 0x00, 0x47, 0x45, 0x54, 0x20, 0x2f, 0x20, 0x48, 0x54, 0x54, 0x50,
  0x2f, 0x31, 0x2e, 0x31, 0x0d, 0x0a, 0x48, 0x6f, 0x73, 0x74, 0x3a, 0x20, 0x77, 0x77, 0x77, 0x2e,
  0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d, 0x0d, 0x0a, 0x55, 0x73, 0x65,
  0x72, 0x2d, 0x41, 0x67, 0x65, 0x6e, 0x74, 0x3a, 0x20, 0x4d, 0x6f, 0x7a, 0x69, 0x6c, 0x6c, 0x61,
  0x2f, 0x35, 0x2e, 0x30, 0x0d, 0x0a, 0x0d, 0x0a,
]);

export const mockPackets: Packet[] = [
  {
    id: 'pkt-1',
    number: 1,
    time: '0.000000',
    source: '192.168.1.2',
    destination: '192.168.1.3',
    protocol: 'TCP',
    length: hex.hex.length,
    info: '[SYN] Seq=0 Win=65535 Len=0',
    hexBytes: tcpSyn2.hex,
    asciiBytes: tcpSyn2.ascii,
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '00:0c:29:3e:0b:6c', rawBytes: [0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c] },
          { name: 'Source', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Version', value: '4', rawBytes: [0x45] },
          { name: 'Header Length', value: '20 bytes', rawBytes: [0x45] },
          { name: 'Total Length', value: '60', rawBytes: [0x00, 0x3c] },
          { name: 'Identification', value: '0x1c46', rawBytes: [0x1c, 0x46] },
          { name: 'TTL', value: '64', rawBytes: [0x40] },
          { name: 'Protocol', value: 'TCP (6)', rawBytes: [0x06] },
          { name: 'Source', value: '192.168.1.3', rawBytes: [0xc0, 0xa8, 0x01, 0x03] },
          { name: 'Destination', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
        ],
      },
      {
        name: 'Transmission Control Protocol',
        fields: [
          { name: 'Source Port', value: '52305', rawBytes: [0x1f, 0x91] },
          { name: 'Destination Port', value: '80 (http)', rawBytes: [0x00, 0x50] },
          { name: 'Sequence Number', value: '8153', rawBytes: [0x1f, 0x90] },
          { name: 'Acknowledgment Number', value: 'Synchronize', rawBytes: [0x00, 0x00] },
          { name: 'Flags', value: 'SYN (0x002)', rawBytes: [0x70, 0x02] },
          { name: 'Window Size', value: '8192', rawBytes: [0x20, 0x00] },
          { name: 'Checksum', value: '0x9170', rawBytes: [0x91, 0x70] },
        ],
      },
    ],
  },
  {
    id: 'pkt-2',
    number: 2,
    time: '0.001048',
    source: '192.168.1.3',
    destination: '192.168.1.2',
    protocol: 'TCP',
    length: tcpAck.hex.length,
    info: '[SYN, ACK] Seq=0 Ack=1 Win=8448 Len=0',
    hexBytes: tcpAck.hex,
    asciiBytes: tcpAck.ascii,
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Source', value: '00:0c:29:3e:0b:6c', rawBytes: [0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Version', value: '4', rawBytes: [0x45] },
          { name: 'Header Length', value: '20 bytes', rawBytes: [0x45] },
          { name: 'Total Length', value: '40', rawBytes: [0x00, 0x28] },
          { name: 'TTL', value: '64', rawBytes: [0x40] },
          { name: 'Protocol', value: 'TCP (6)', rawBytes: [0x06] },
          { name: 'Source', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
          { name: 'Destination', value: '192.168.1.3', rawBytes: [0xc0, 0xa8, 0x01, 0x03] },
        ],
      },
      {
        name: 'Transmission Control Protocol',
        fields: [
          { name: 'Source Port', value: '80 (http)', rawBytes: [0x00, 0x50] },
          { name: 'Destination Port', value: '52305', rawBytes: [0x1f, 0x91] },
          { name: 'Sequence Number', value: '8154', rawBytes: [0x1f, 0x91] },
          { name: 'Acknowledgment Number', value: '1', rawBytes: [0x1f, 0x90] },
          { name: 'Flags', value: 'SYN, ACK (0x012)', rawBytes: [0x50, 0x10] },
          { name: 'Window Size', value: '8480', rawBytes: [0x21, 0x20] },
        ],
      },
    ],
  },
  {
    id: 'pkt-3',
    number: 3,
    time: '0.002156',
    source: '192.168.1.2',
    destination: '192.168.1.3',
    protocol: 'TCP',
    length: hex.hex.length,
    info: '[ACK] Seq=1 Ack=1 Win=8448 Len=0',
    hexBytes: hex.hex,
    asciiBytes: hex.ascii,
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '00:0c:29:3e:0b:6c', rawBytes: [0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c] },
          { name: 'Source', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Version', value: '4', rawBytes: [0x45] },
          { name: 'Header Length', value: '20 bytes', rawBytes: [0x45] },
          { name: 'Total Length', value: '60', rawBytes: [0x00, 0x3c] },
          { name: 'TTL', value: '64', rawBytes: [0x40] },
          { name: 'Protocol', value: 'TCP (6)', rawBytes: [0x06] },
          { name: 'Source', value: '192.168.1.3', rawBytes: [0xc0, 0xa8, 0x01, 0x03] },
          { name: 'Destination', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
        ],
      },
      {
        name: 'Transmission Control Protocol',
        fields: [
          { name: 'Source Port', value: '52305', rawBytes: [0x00, 0x50] },
          { name: 'Destination Port', value: '80 (http)', rawBytes: [0x1f, 0x90] },
          { name: 'Acknowledgment Number', value: '1', rawBytes: [0x1f, 0x91] },
          { name: 'Flags', value: 'ACK (0x010)', rawBytes: [0x50, 0x10] },
        ],
      },
    ],
  },
  {
    id: 'pkt-4',
    number: 4,
    time: '0.003212',
    source: '192.168.1.2',
    destination: '192.168.1.3',
    protocol: 'DNS',
    length: 65,
    info: 'Standard query A www.google.com',
    hexBytes: dnsQuery.hex,
    asciiBytes: dnsQuery.ascii,
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '00:0c:29:3e:0b:6c', rawBytes: [0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c] },
          { name: 'Source', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Version', value: '4', rawBytes: [0x45] },
          { name: 'Header Length', value: '20 bytes', rawBytes: [0x45] },
          { name: 'Total Length', value: '65', rawBytes: [0x00, 0x41] },
          { name: 'TTL', value: '64', rawBytes: [0x40] },
          { name: 'Protocol', value: 'UDP (17)', rawBytes: [0x11] },
          { name: 'Source', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
          { name: 'Destination', value: '192.168.1.1', rawBytes: [0xc0, 0xa8, 0x01, 0x01] },
        ],
      },
      {
        name: 'User Datagram Protocol',
        fields: [
          { name: 'Source Port', value: '52306', rawBytes: [0x00, 0x35] },
          { name: 'Destination Port', value: '53 (domain)', rawBytes: [0x00, 0x35] },
          { name: 'Length', value: '53', rawBytes: [0x00, 0x35] },
        ],
      },
      {
        name: 'Domain Name System (query)',
        fields: [
          { name: 'Transaction ID', value: '0x1c4a', rawBytes: [0x1c, 0x4a] },
          { name: 'Flags', value: 'Standard query (0x0000)', rawBytes: [0x00, 0x00] },
          { name: 'Questions', value: '1', rawBytes: [0x00, 0x01] },
          { name: 'Query', value: 'www.google.com', rawBytes: [0x03, 0x77, 0x77, 0x77, 0x06, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d, 0x00, 0x00, 0x01, 0x00, 0x01] },
        ],
      },
    ],
  },
  {
    id: 'pkt-5',
    number: 5,
    time: '0.004887',
    source: '192.168.1.2',
    destination: '192.168.1.1',
    protocol: 'DNS',
    length: 75,
    info: 'Standard query response AAAA 2804:...',
    hexBytes: [
      ...dnsQuery.hex.slice(0, 42),
      0x00, 0x35, 0x00, 0x4b, 0x00, 0x00, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x03, 0x77, 0x77, 0x77, 0x06, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x03, 0x63, 0x6f,
      0x6d, 0x00, 0x00, 0x01, 0x00, 0x01, 0xc0, 0x0c, 0x00, 0x1c, 0x00, 0x01, 0x00, 0x00, 0x00,
      0x0e, 0x00, 0x10, 0x28, 0x04, 0x8e, 0x5f, 0x47, 0x21, 0x00, 0x00, 0x00,
    ],
    asciiBytes: [
      ...dnsQuery.ascii.slice(0, 42),
      ...dnsQuery.ascii.slice(0, 21),
      '.', '.', '8', '.', '.', '.', '.', '.', '.', '.', '.',
    ],
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Source', value: '00:0c:29:3e:0b:6c', rawBytes: [0x00, 0x0c, 0x29, 0x3e, 0x0b, 0x6c] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Version', value: '4', rawBytes: [0x45] },
          { name: 'Total Length', value: '75', rawBytes: [0x00, 0x4b] },
          { name: 'Protocol', value: 'UDP (17)', rawBytes: [0x11] },
          { name: 'Source', value: '192.168.1.1', rawBytes: [0xc0, 0xa8, 0x01, 0x01] },
          { name: 'Destination', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
        ],
      },
      {
        name: 'Domain Name System (response)',
        fields: [
          { name: 'Transaction ID', value: '0x1c4a', rawBytes: [0x1c, 0x4a] },
          { name: 'Flags', value: 'Standard query response (0x8180)', rawBytes: [0x81, 0x80] },
          { name: 'Answer', value: '2804:4e5f:4721::', rawBytes: [0x28, 0x04, 0x8e, 0x5f, 0x47, 0x21, 0x00, 0x00, 0x00] },
        ],
      },
    ],
  },
  {
    id: 'pkt-6',
    number: 6,
    time: '0.005934',
    source: '192.168.1.2',
    destination: '93.184.216.34',
    protocol: 'TCP',
    length: 60,
    info: '[SYN] Seq=100 Win=65535 Len=0',
    hexBytes: [
      ...tcpSyn2.hex.slice(0, 12),
      0x08, 0x00, 0x45, 0x00, 0x00, 0x3c, 0x1c, 0x49, 0x40, 0x00, 0x40, 0x06, 0xb1, 0xcb, 0xc0,
      0xa8, 0x01, 0x02, 0x5d, 0xb8, 0xd8, 0x22, 0x00, 0x50, 0x1f, 0x93, 0x00, 0x00, 0x00, 0x00,
      0x50, 0x02, 0x20, 0x00, 0x91, 0x6f, 0x00, 0x00, 0x01, 0x01, 0x08, 0x0a, 0x00, 0x01, 0x02,
      0x03, 0x04, 0x05,
    ],
    asciiBytes: Array(Math.min(60, 60)).fill('.'),
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: 'e8:9c:25:3d:01:ab', rawBytes: [0xe8, 0x9c, 0x25, 0x3d, 0x01, 0xab] },
          { name: 'Source', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Source', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
          { name: 'Destination', value: '93.184.216.34', rawBytes: [0x5d, 0xb8, 0xd8, 0x22] },
          { name: 'TTL', value: '64', rawBytes: [0x40] },
        ],
      },
      {
        name: 'Transmission Control Protocol',
        fields: [
          { name: 'Source Port', value: '52308', rawBytes: [0x1f, 0x93] },
          { name: 'Destination Port', value: '443 (https)', rawBytes: [0x01, 0xbb] },
          { name: 'Flags', value: 'SYN (0x002)', rawBytes: [0x70, 0x02] },
        ],
      },
    ],
  },
  {
    id: 'pkt-7',
    number: 7,
    time: '0.006139',
    source: '93.184.216.34',
    destination: '192.168.1.2',
    protocol: 'TCP',
    length: 44,
    info: '[SYN, ACK] Seq=0 Ack=100 Win=28960 Len=0',
    hexBytes: [
      ...tcpAck.hex.slice(0, 12),
      0x08, 0x00, 0x45, 0x00, 0x00, 0x2c, 0x1c, 0x4a, 0x40, 0x00, 0x40, 0x06, 0xb1, 0xfa, 0x5d,
      0xb8, 0xd8, 0x22, 0xc0, 0xa8, 0x01, 0x02, 0x01, 0xbb, 0x1f, 0x93, 0x00, 0x00, 0x00, 0x00,
      0x1f, 0x64, 0x50, 0x12, 0x60, 0x20, 0xb1, 0xd2, 0x00, 0x00,
    ],
    asciiBytes: Array(Math.min(44, 60)).fill('.'),
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Source', value: 'e8:9c:25:3d:01:ab', rawBytes: [0xe8, 0x9c, 0x25, 0x3d, 0x01, 0xab] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Source', value: '93.184.216.34', rawBytes: [0x5d, 0xb8, 0xd8, 0x22] },
          { name: 'Destination', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
          { name: 'TTL', value: '54', rawBytes: [0x36] },
        ],
      },
      {
        name: 'Transmission Control Protocol',
        fields: [
          { name: 'Source Port', value: '443 (https)', rawBytes: [0x01, 0xbb] },
          { name: 'Destination Port', value: '52308', rawBytes: [0x1f, 0x93] },
          { name: 'Flags', value: 'SYN, ACK (0x012)', rawBytes: [0x50, 0x12] },
        ],
      },
    ],
  },
  {
    id: 'pkt-8',
    number: 8,
    time: '0.007301',
    source: '192.168.1.2',
    destination: '93.184.216.34',
    protocol: 'TCP',
    length: 523,
    info: '[PSH, ACK] Seq=101 Ack=1 Win=8448 Len=483',
    hexBytes: httpGet.hex,
    asciiBytes: httpGet.ascii,
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: 'e8:9c:25:3d:01:ab', rawBytes: [0xe8, 0x9c, 0x25, 0x3d, 0x01, 0xab] },
          { name: 'Source', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Source', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x03] },
          { name: 'Destination', value: '93.184.216.34', rawBytes: [0x5d, 0xb8, 0xd8, 0x22] },
          { name: 'TTL', value: '64', rawBytes: [0x40] },
        ],
      },
      {
        name: 'Transmission Control Protocol',
        fields: [
          { name: 'Source Port', value: '52308', rawBytes: [0x1f, 0x93] },
          { name: 'Destination Port', value: '443 (https)', rawBytes: [0x01, 0xbb] },
          { name: 'Flags', value: 'PSH, ACK (0x018)', rawBytes: [0x50, 0x18] },
        ],
      },
      {
        name: 'Hypertext Transfer Protocol',
        fields: [
          { name: 'Request Method', value: 'GET', rawBytes: [0x47, 0x45, 0x54] },
          { name: 'Request URI', value: '/', rawBytes: [0x2f] },
          { name: 'Host', value: 'www.example.com', rawBytes: [0x48, 0x6f, 0x73, 0x74] },
        ],
      },
    ],
  },
  {
    id: 'pkt-9',
    number: 9,
    time: '0.012450',
    source: '192.168.1.2',
    destination: '224.0.0.251',
    protocol: 'DNS',
    length: 50,
    info: 'Multicast DNS query (mDNS)',
    hexBytes: dnsQuery.hex.slice(0, 58),
    asciiBytes: dnsQuery.ascii.slice(0, 58),
    layers: [
      {
        name: 'Ethernet II',
        fields: [
          { name: 'Destination', value: '01:00:5e:00:00:fb', rawBytes: [0x01, 0x00, 0x5e, 0x00, 0x00, 0xfb] },
          { name: 'Source', value: '00:0c:29:2a:4f:12', rawBytes: [0x00, 0x0c, 0x29, 0x2a, 0x4f, 0x12] },
          { name: 'Type', value: 'IPv4 (0x0800)', rawBytes: [0x08, 0x00] },
        ],
      },
      {
        name: 'Internet Protocol Version 4',
        fields: [
          { name: 'Source', value: '192.168.1.2', rawBytes: [0xc0, 0xa8, 0x01, 0x02] },
          { name: 'Destination', value: '224.0.0.251', rawBytes: [0xe0, 0x00, 0x00, 0xfb] },
          { name: 'TTL', value: '255', rawBytes: [0xff] },
          { name: 'Protocol', value: 'UDP (17)', rawBytes: [0x11] },
        ],
      },
      {
        name: 'Multicast DNS',
        fields: [
          { name: 'Source Port', value: '5353', rawBytes: [0x14, 0xc9] },
          { name: 'Destination Port', value: '5353', rawBytes: [0x14, 0xc9] },
          { name: 'Query', value: '_services._dns-sd._udp.local', rawBytes: [0x09, 0x5f, 0x73, 0x65] },
        ],
      },
    ],
  },
];

export const PROTOCOL_COLORS: Record<string, string> = {
  TCP: '#22d3ee',
  UDP: '#fb923c',
  DNS: '#c084fc',
  HTTP: '#34d399',
  TLS: '#fbbf24',
  ARP: '#f472b6',
  ICMP: '#facc15',
};

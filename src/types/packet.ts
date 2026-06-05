// src/types/packet.ts

export interface PacketField {
  name: string;
  value: string;
  rawBytes: number[];
}

export interface PacketLayer {
  name: string;
  fields: PacketField[];
}

export interface Packet {
  id: string;
  number: number;
  time: string;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
  hexBytes: number[];
  asciiBytes: string[];
  layers: PacketLayer[];
}

export interface HighlightRange {
  layerIndex: number;
  fieldName: string;
  startByte: number;
  endByte: number;
  color: string;
}

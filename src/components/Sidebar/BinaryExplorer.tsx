import React, { useState, useEffect } from 'react';
import {
  validateIp,
  ipToBinaryString,
  getBitSegments,
  longToIp,
  cidrToDottedMask,
  calculateSubnetInfo
} from '../../utils/subnetCalc';

export const BinaryExplorer: React.FC = () => {
  const [ipInput, setIpInput] = useState('192.168.1.50');
  const [cidr, setCidr] = useState(24);
  const [baseCidr, setBaseCidr] = useState(24); // To show 'subnet bits' in between classful base and current cidr


  // Parse standard Classful boundary as base cidr
  useEffect(() => {
    if (!validateIp(ipInput)) return;
    const firstOctet = parseInt(ipInput.split('.')[0]);
    if (firstOctet < 128) setBaseCidr(8);      // Class A
    else if (firstOctet < 192) setBaseCidr(16); // Class B
    else if (firstOctet < 224) setBaseCidr(24); // Class C
    else setBaseCidr(24);
  }, [ipInput]);

  const handleCidrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCidr(Number(e.target.value));
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIpInput(val);
  };

  const handleBitToggle = (index: number, currentBit: string) => {
    if (!validateIp(ipInput)) return;
    const binary = ipToBinaryString(ipInput);
    const newBit = currentBit === '1' ? '0' : '1';
    const newBinary = binary.substring(0, index) + newBit + binary.substring(index + 1);
    
    // Parse binary string back to long
    const long = parseInt(newBinary, 2);
    setIpInput(longToIp(long));
  };

  const isValid = validateIp(ipInput);
  const info = isValid ? calculateSubnetInfo(ipInput, cidr) : null;
  const bitSegments = isValid ? getBitSegments(ipInput, baseCidr, cidr) : [];

  // Group segments into 4 octets (8 bits each) for dotted visual
  const octets = [
    bitSegments.slice(0, 8),
    bitSegments.slice(8, 16),
    bitSegments.slice(16, 24),
    bitSegments.slice(24, 32)
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-default)', paddingBottom: '8px', color: '#fff' }}>
        Interactive Binary IP Explorer
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Learn subnetting by manipulating the binary representation of an IP address.
      </p>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>IP Address</label>
          <input
            type="text"
            className="glass-input"
            value={ipInput}
            onChange={handleIpChange}
            style={{ borderColor: isValid ? 'rgba(255,255,255,0.08)' : 'var(--accent-rose)' }}
          />
        </div>
        <div style={{ width: '80px' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CIDR Mask</label>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '8px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            /{cidr}
          </div>
        </div>
      </div>

      {/* CIDR Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <span>Mask Slider</span>
          <span>/{cidr} ({info?.subnetMask || cidrToDottedMask(cidr)})</span>
        </div>
        <input
          type="range"
          min="0"
          max="32"
          value={cidr}
          onChange={handleCidrChange}
          style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
        />
      </div>

      {/* Bit Category Legends */}
      <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%' }}></span>
          <span style={{ color: 'var(--accent-green)', fontWeight: 500 }}>Network</span>
        </div>
        {cidr > baseCidr && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-amber)', borderRadius: '50%' }}></span>
            <span style={{ color: 'var(--accent-amber)', fontWeight: 500 }}>Subnet</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '50%' }}></span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>Host</span>
        </div>
      </div>

      {/* Interactive Binary Octet Grid */}
      {isValid && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Binary bits (Click bits below to toggle)</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {octets.map((octet, oIdx) => (
              <div key={oIdx} style={{ display: 'flex', gap: '3px', alignItems: 'center', marginRight: oIdx < 3 ? '4px' : 0 }}>
                {octet.map((seg) => {
                  let bitColor = 'var(--accent-blue)';
                  if (seg.type === 'network') bitColor = 'var(--accent-green)';
                  else if (seg.type === 'subnet') bitColor = 'var(--accent-amber)';

                  return (
                    <button
                      key={seg.index}
                      onClick={() => handleBitToggle(seg.index, seg.bit)}
                      style={{
                        width: '20px',
                        height: '28px',
                        background: 'rgba(0,0,0,0.4)',
                        border: `1.5px solid ${bitColor}`,
                        borderRadius: '4px',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'transform 0.1s, background-color 0.1s'
                      }}
                      title={`Bit ${seg.index + 1} (${seg.type} portion). Value: ${Math.pow(2, 7 - (seg.index % 8))}`}
                    >
                      {seg.bit}
                    </button>
                  );
                })}
                {oIdx < 3 && <span style={{ color: 'var(--text-muted)', fontWeight: 700, margin: '0 2px' }}>.</span>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
            {ipInput.split('.').map((dec, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)' }}>Octet {idx + 1}</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{dec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subnetting stats card */}
      {isValid && info && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Network ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{info.networkAddress}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Broadcast IP</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-rose)' }}>{info.broadcastAddress}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Usable IPs</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>{info.firstUsableIp} - {info.lastUsableIp}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Usable Hosts</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)' }}>{info.usableHosts.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
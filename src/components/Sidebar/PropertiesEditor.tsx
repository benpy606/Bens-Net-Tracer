import React, { useState, useEffect } from 'react';
import type { Device } from '../../types/network';
import { validateIp } from '../../utils/subnetCalc';

interface PropertiesEditorProps {
  device: Device | null;
  onUpdateDevice: (updated: Device) => void;
}

export const PropertiesEditor: React.FC<PropertiesEditorProps> = ({
  device,
  onUpdateDevice
}) => {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [subnetMask, setSubnetMask] = useState('');
  const [gateway, setGateway] = useState('');

  // Sync state with selected device
  useEffect(() => {
    if (device) {
      setName(device.name || '');
      setIpAddress(device.ipAddress || '');
      setSubnetMask(device.subnetMask || '24');
      setGateway(device.gateway || '');
    }
  }, [device]);

  if (!device) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.85rem' }}>Select a device on the canvas to configure its interface parameters.</p>
      </div>
    );
  }

  const handleSave = () => {
    // Validate IP only if provided
    const isIpValid = ipAddress === '' || validateIp(ipAddress);
    const isGwValid = gateway === '' || validateIp(gateway);

    if (!isIpValid) {
      alert('Invalid IP Address format (must be standard dotted decimal, e.g. 192.168.1.1)');
      return;
    }
    if (!isGwValid) {
      alert('Invalid Default Gateway format');
      return;
    }

    onUpdateDevice({
      ...device,
      name,
      ipAddress: ipAddress || undefined,
      subnetMask: ipAddress ? subnetMask : undefined,
      gateway: gateway || undefined
    });
  };

  const isIpValid = ipAddress === '' || validateIp(ipAddress);
  const isGwValid = gateway === '' || validateIp(gateway);

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: '#fff' }}>
        Device Settings
      </h3>

      {/* Device Type Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type:</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>{device.type}</span>
      </div>

      {/* Name Input */}
      <div>
        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Device Hostname</label>
        <input
          type="text"
          className="glass-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* IP Configuration (Skip switch since switches are Layer-2 devices) */}
      {device.type !== 'switch' ? (
        <>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>IP Address</label>
            <input
              type="text"
              className="glass-input"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.10"
              style={{ borderColor: isIpValid ? 'rgba(255,255,255,0.08)' : 'var(--accent-rose)' }}
            />
            {!isIpValid && (
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', display: 'block', marginTop: '2px' }}>
                Invalid IPv4 format
              </span>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Subnet Mask (CIDR)</label>
            <select
              className="glass-input"
              value={subnetMask}
              onChange={(e) => setSubnetMask(e.target.value)}
              style={{ appearance: 'none', background: '#0a0d18' }}
              disabled={!ipAddress}
            >
              {Array.from({ length: 25 }, (_, i) => i + 8).map((mask) => (
                <option key={mask} value={String(mask)}>/{mask}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Default Gateway</label>
            <input
              type="text"
              className="glass-input"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              style={{ borderColor: isGwValid ? 'rgba(255,255,255,0.08)' : 'var(--accent-rose)' }}
              disabled={!ipAddress}
            />
          </div>
        </>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          ℹ️ Switches operate at Layer 2 (Data Link) and do not have an IP address configured for general client interfaces.
        </div>
      )}

      {/* Action Buttons */}
      <button
        onClick={handleSave}
        className="glass-button primary"
        style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
      >
        Save Settings
      </button>
    </div>
  );
};

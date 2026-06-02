import React, { useState } from 'react';
import type { VLSMInput, VLSMResult } from '../../types/network';
import { calculateVLSM } from '../../utils/vlsm';

export const VLSMCalculator: React.FC = () => {
  const [baseIp, setBaseIp] = useState('192.168.1.0');
  const [baseCidr, setBaseCidr] = useState(24);
  const [requirements, setRequirements] = useState<VLSMInput[]>([
    { name: 'Engineering', hostsNeeded: 60 },
    { name: 'Sales & Marketing', hostsNeeded: 25 },
    { name: 'R&D', hostsNeeded: 12 },
    { name: 'Admin Staff', hostsNeeded: 4 }
  ]);
  const [newSubnetName, setNewSubnetName] = useState('');
  const [newSubnetHosts, setNewSubnetHosts] = useState<number | ''>('');
  
  const [vlsmResults, setVlsmResults] = useState<VLSMResult[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calcError, setCalcError] = useState<string | undefined>(undefined);

  const handleAddRequirement = () => {
    if (!newSubnetName.trim() || newSubnetHosts === '') return;
    setRequirements([
      ...requirements,
      { name: newSubnetName.trim(), hostsNeeded: Number(newSubnetHosts) }
    ]);
    setNewSubnetName('');
    setNewSubnetHosts('');
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    const res = calculateVLSM(baseIp, baseCidr, requirements);
    setVlsmResults(res.results);
    setCalcError(res.error);
    setHasCalculated(true);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: '#fff' }}>
        VLSM Subnet Planner
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Design complex subnet allocations using Variable Length Subnet Masking.
      </p>

      {/* Base Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Network IP</label>
          <input
            type="text"
            className="glass-input"
            value={baseIp}
            onChange={(e) => setBaseIp(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Base Mask</label>
          <select
            className="glass-input"
            value={baseCidr}
            onChange={(e) => setBaseCidr(Number(e.target.value))}
            style={{ appearance: 'none', background: '#0a0d18' }}
          >
            {Array.from({ length: 23 }, (_, i) => i + 8).map((mask) => (
              <option key={mask} value={mask}>/{mask}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Input List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>Subnet Host Requirements</span>
        
        {requirements.map((req, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#fff', flex: 1 }}>{req.name}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
              {req.hostsNeeded} hosts
            </span>
            <button
              onClick={() => handleRemoveRequirement(idx)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add item row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '6px', marginTop: '4px' }}>
          <input
            type="text"
            placeholder="e.g., Marketing"
            className="glass-input"
            value={newSubnetName}
            onChange={(e) => setNewSubnetName(e.target.value)}
            style={{ height: '32px' }}
          />
          <input
            type="number"
            placeholder="Hosts"
            className="glass-input"
            value={newSubnetHosts}
            onChange={(e) => setNewSubnetHosts(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ height: '32px' }}
          />
          <button
            onClick={handleAddRequirement}
            className="glass-button primary"
            style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="glass-button active"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px 0', border: '1.5px solid var(--accent-cyan)', borderRadius: '10px' }}
      >
        <span>⚡ Calculate Subnets</span>
      </button>

      {/* Calculator Results Panel */}
      {hasCalculated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {calcError && (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              ⚠️ {calcError}
            </div>
          )}

          {/* Allocation Timeline Visualization */}
          {!calcError && vlsmResults.length > 0 && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Allocated Address Space Timeline (Proportional Allocation)
              </span>
              <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#070913' }}>
                {vlsmResults.map((res, idx) => {
                  const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
                  const color = colors[idx % colors.length];
                  const percent = Math.max(8, (res.allocatedHosts / Math.pow(2, 32 - baseCidr)) * 100);

                  return (
                    <div
                      key={idx}
                      style={{
                        width: `${percent}%`,
                        background: color,
                        height: '100%',
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        borderRight: '1px solid rgba(0,0,0,0.2)'
                      }}
                      title={`${res.name}: ${res.networkAddress}/${res.cidr} (${res.hostsNeeded} needed, ${res.allocatedHosts} allocated)`}
                    >
                      {res.name.substring(0, 3)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid table */}
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '6px' }}>Subnet Name</th>
                  <th style={{ padding: '6px' }}>Allocated Block</th>
                  <th style={{ padding: '6px' }}>Usable Host IPs</th>
                </tr>
              </thead>
              <tbody>
                {vlsmResults.map((res, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: res.success ? '#fff' : 'var(--accent-rose)' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>{res.name}</td>
                    <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>
                      {res.success ? `${res.networkAddress}/${res.cidr}` : 'Failed'}
                    </td>
                    <td style={{ padding: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {res.success ? `${res.firstUsableIp} - ${res.lastUsableIp}` : res.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

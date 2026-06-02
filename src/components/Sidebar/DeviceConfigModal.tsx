import React, { useState, useEffect, useRef } from 'react';
import type { Device, DeviceInterface } from '../../types/network';
import { validateIp, cidrToDottedMask, dottedMaskToCidr } from '../../utils/subnetCalc';

interface DeviceConfigModalProps {
  device: Device | null;
  onClose: () => void;
  onUpdateDevice: (updated: Device) => void;
  onTriggerPing?: (sourceId: string, destIp: string) => void;
}

type TabType = 'physical' | 'config' | 'cli';

export const DeviceConfigModal: React.FC<DeviceConfigModalProps> = ({
  device,
  onClose,
  onUpdateDevice,
  onTriggerPing,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('physical');
  const [modalSize, setModalSize] = useState({ width: '80%', height: '80%' });
  const [modalPos, setModalPos] = useState({ top: '5%', left: '10%' });

  // Device Form States
  const [hostname, setHostname] = useState('');
  const [selectedInterfaceIndex, setSelectedInterfaceIndex] = useState(0);
  const [selectedInterface, setSelectedInterface] = useState<DeviceInterface | null>(null);
  const [ipInput, setIpInput] = useState('');
  const [subnetInput, setSubnetInput] = useState('');
  const [isInterfaceShut, setIsInterfaceShut] = useState(false);
  const [devicePower, setDevicePower] = useState<'on' | 'off'>('on');

  // CLI States
  const [cliHistory, setCliHistory] = useState<string[]>([]);
  const [cliInput, setCliInput] = useState('');
  const [cliMode, setCliMode] = useState<'user' | 'privileged' | 'global-config' | 'interface-config'>('user');
  const [cliConfigInterface, setCliConfigInterface] = useState<string>('');
  const cliScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync state with selected device
  useEffect(() => {
    if (device) {
      setHostname(device.name || '');
      setDevicePower(device.powerStatus || 'on');

      // Populate default interfaces if empty
      let updatedInterfaces = [...(device.interfaces || [])];
      if (updatedInterfaces.length === 0) {
        if (device.type === 'router') {
          updatedInterfaces = [
            { id: 'fa0-0', name: 'FastEthernet0/0', ipAddress: device.ipAddress, subnetMask: device.subnetMask ? cidrToDottedMask(Number(device.subnetMask)) : undefined, macAddress: '000A.0011.1111', isConnected: true, status: 'active' },
            { id: 'fa0-1', name: 'FastEthernet0/1', macAddress: '000A.0011.1112', isConnected: false, status: 'shutdown' }
          ];
        } else if (device.type === 'switch') {
          updatedInterfaces = Array.from({ length: 8 }, (_, i) => ({
            id: `fa0-${i + 1}`,
            name: `FastEthernet0/${i + 1}`,
            macAddress: `000B.0022.222${i + 1}`,
            isConnected: false,
            status: 'active'
          }));
        } else {
          // PC or Server
          updatedInterfaces = [
            { id: 'fa0', name: 'FastEthernet0', ipAddress: device.ipAddress, subnetMask: device.subnetMask ? cidrToDottedMask(Number(device.subnetMask)) : undefined, macAddress: '000C.0033.3333', isConnected: true, status: 'active' }
          ];
        }
      }

      if (updatedInterfaces.length > 0) {
        const selectedIndex = Math.min(selectedInterfaceIndex, updatedInterfaces.length - 1);
        setSelectedInterfaceIndex(selectedIndex);
        const iface = updatedInterfaces[selectedIndex];
        setSelectedInterface(iface);
        setIpInput(iface.ipAddress || '');
        setSubnetInput(iface.subnetMask || '255.255.255.0');
        setIsInterfaceShut(iface.status === 'shutdown');
      }

      // Initialize CLI with banner
      if (cliHistory.length === 0) {
        setCliHistory([
          `--- Cisco iOS Simulation Engine v1.0.0 ---`,
          `Device ${device.name} initialized.`,
          `Press Enter or type a command to start.`,
          ``,
        ]);
      }
    }
  }, [device]);

  // Handle auto CLI scroll to bottom
  useEffect(() => {
    if (cliScrollRef.current) {
      cliScrollRef.current.scrollTop = cliScrollRef.current.scrollHeight;
    }
  }, [cliHistory, activeTab]);

  if (!device) return null;

  // Handle Form changes save
  const handleSaveInterfaceConfig = () => {
    if (!selectedInterface) return;

    if (ipInput !== '' && !validateIp(ipInput)) {
      alert('Invalid IP format (must be e.g. 192.168.1.10)');
      return;
    }
    if (subnetInput !== '' && !validateIp(subnetInput)) {
      alert('Invalid Subnet Mask format (must be e.g. 255.255.255.0)');
      return;
    }

    const updatedInterfaces = (device.interfaces || []).map((iface, idx) => {
      if (idx === selectedInterfaceIndex) {
        return {
          ...iface,
          ipAddress: ipInput || undefined,
          subnetMask: subnetInput || undefined,
          status: isInterfaceShut ? ('shutdown' as const) : ('active' as const),
        };
      }
      return iface;
    });

    // Also update main settings if it is interface index 0 for easy view
    const firstIface = updatedInterfaces[0];
    const mainCidr = firstIface.subnetMask ? String(dottedMaskToCidr(firstIface.subnetMask)) : undefined;

    onUpdateDevice({
      ...device,
      name: hostname,
      ipAddress: firstIface.ipAddress,
      subnetMask: mainCidr,
      interfaces: updatedInterfaces,
      powerStatus: devicePower,
    });
  };

  const handlePowerToggle = () => {
    const newPower = devicePower === 'on' ? 'off' : 'on';
    setDevicePower(newPower);
    setCliHistory((prev) => [
      ...prev,
      `%SYS-5-POWER: System power toggled ${newPower.toUpperCase()}`,
      newPower === 'off' ? 'System shutting down... CLI unavailable.' : 'System booted. Cisco iOS ready.',
    ]);
    onUpdateDevice({
      ...device,
      powerStatus: newPower,
    });
  };

  // Cisco CLI Command Interpreter
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = cliInput.trim();
    if (!command) {
      setCliHistory((prev) => [...prev, getPrompt()]);
      setCliInput('');
      return;
    }

    const historyLine = `${getPrompt()}${command}`;
    const output: string[] = [];

    if (devicePower === 'off') {
      setCliHistory((prev) => [...prev, historyLine, 'Error: Device power is OFF. Press power button in Physical tab first.']);
      setCliInput('');
      return;
    }

    const parts = command.toLowerCase().split(/\s+/);
    const mainCommand = parts[0];

    switch (cliMode) {
      case 'user':
        if (mainCommand === 'enable' || mainCommand === 'en') {
          setCliMode('privileged');
        } else if (mainCommand === 'ping') {
          const targetIp = parts[1];
          if (!targetIp) {
            output.push('% IP address required');
          } else {
            output.push(`Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds:`);
            output.push('⚡ Packet created! Watch simulation tab for flow execution.');
            if (onTriggerPing) {
              onTriggerPing(device.id, targetIp);
            }
          }
        } else {
          output.push(`% Invalid input detected: '${mainCommand}'`);
        }
        break;

      case 'privileged':
        if (mainCommand === 'disable') {
          setCliMode('user');
        } else if (mainCommand === 'configure' || mainCommand === 'conf') {
          if (parts[1] === 'terminal' || parts[1] === 't') {
            setCliMode('global-config');
          } else {
            output.push('% Use "configure terminal"');
          }
        } else if (mainCommand === 'ping') {
          const targetIp = parts[1];
          if (!targetIp) {
            output.push('% IP address required');
          } else {
            output.push(`Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds:`);
            output.push('⚡ Packet created! Watch simulation tab for flow execution.');
            if (onTriggerPing) {
              onTriggerPing(device.id, targetIp);
            }
          }
        } else {
          output.push(`% Invalid command: '${mainCommand}'`);
        }
        break;

      case 'global-config':
        if (mainCommand === 'exit') {
          setCliMode('privileged');
        } else if (mainCommand === 'hostname') {
          const newName = parts[1] || 'Device';
          setHostname(newName);
          output.push(`Hostname changed to ${newName}`);
          // Immediate apply
          onUpdateDevice({ ...device, name: newName });
        } else if (mainCommand === 'interface' || mainCommand === 'int') {
          const ifaceName = parts[1];
          if (!ifaceName) {
            output.push('% Interface name required');
          } else {
            // Check if matching interface in device exists
            const matchedIndex = device.interfaces.findIndex(
              (ifc) => ifc.name.toLowerCase() === ifaceName || ifc.id === ifaceName
            );
            if (matchedIndex !== -1) {
              setCliMode('interface-config');
              setCliConfigInterface(device.interfaces[matchedIndex].name);
              setSelectedInterfaceIndex(matchedIndex);
            } else {
              output.push(`% Interface ${ifaceName} not found`);
            }
          }
        } else {
          output.push(`% Invalid config command: '${mainCommand}'`);
        }
        break;

      case 'interface-config':
        if (mainCommand === 'exit') {
          setCliMode('global-config');
          setCliConfigInterface('');
        } else if (mainCommand === 'ip') {
          if (parts[1] === 'address' || parts[1] === 'addr') {
            const ip = parts[2];
            const mask = parts[3];
            if (!ip || !mask) {
              output.push('% Incomplete IP address configuration');
            } else if (!validateIp(ip) || !validateIp(mask)) {
              output.push('% Invalid IP address or subnet mask dotted decimal format');
            } else {
              // Update interface configuration
              setIpInput(ip);
              setSubnetInput(mask);
              const updated = (device.interfaces || []).map((ifc, idx) => {
                if (idx === selectedInterfaceIndex) {
                  return { ...ifc, ipAddress: ip, subnetMask: mask };
                }
                return ifc;
              });
              onUpdateDevice({ ...device, interfaces: updated });
              output.push(`Interface ${cliConfigInterface} configured with IP ${ip} subnet mask ${mask}`);
            }
          }
        } else if (mainCommand === 'shutdown' || mainCommand === 'shut') {
          setIsInterfaceShut(true);
          const updated = (device.interfaces || []).map((ifc, idx) => {
            if (idx === selectedInterfaceIndex) {
              return { ...ifc, status: 'shutdown' as const };
            }
            return ifc;
          });
          onUpdateDevice({ ...device, interfaces: updated });
          output.push(`%LINK-5-CHANGED: Interface ${cliConfigInterface}, changed state to administratively down`);
        } else if (command.toLowerCase() === 'no shutdown' || command.toLowerCase() === 'no shut') {
          setIsInterfaceShut(false);
          const updated = (device.interfaces || []).map((ifc, idx) => {
            if (idx === selectedInterfaceIndex) {
              return { ...ifc, status: 'active' as const };
            }
            return ifc;
          });
          onUpdateDevice({ ...device, interfaces: updated });
          output.push(`%LINK-5-CHANGED: Interface ${cliConfigInterface}, changed state to up`);
        } else {
          output.push(`% Invalid interface sub-command: '${mainCommand}'`);
        }
        break;
    }

    setCliHistory((prev) => [...prev, historyLine, ...output]);
    setCliInput('');
  };

  const dragRef = useRef({ startX: 0, startY: 0, startTop: 0, startLeft: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0 });

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startTop: parseFloat(modalPos.top),
      startLeft: parseFloat(modalPos.left),
    };

    const moveHandler = (ev: MouseEvent | TouchEvent) => {
      const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      setModalPos({
        top: `${dragRef.current.startTop + (cy - dragRef.current.startY) / window.innerHeight * 100}%`,
        left: `${dragRef.current.startLeft + (cx - dragRef.current.startX) / window.innerWidth * 100}%`,
      });
    };
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchend', upHandler);
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchend', upHandler, { passive: true });
  };

  const handleResizeStart = (edge: 'right' | 'bottom' | 'corner') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startW: parseFloat(modalSize.width),
      startH: parseFloat(modalSize.height),
    };

     const moveHandler = (ev: MouseEvent | TouchEvent) => {
       const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
       const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
       const vw = window.innerWidth;
       const vh = window.innerHeight;

       if (edge === 'right' || edge === 'corner') {
         // Calculate new width in px, with minimum of 200px
         const newWpx = Math.max(200, resizeRef.current.startW * vw / 100 + (cx - resizeRef.current.startX));
         const newWpercent = Math.max(10, (newWpx / vw) * 100); // At least 10% of viewport width
         setModalSize(prev => ({ ...prev, width: `${newWpercent}%` }));
       }
       if (edge === 'bottom' || edge === 'corner') {
         // Calculate new height in px, with minimum of 150px
         const newHpx = Math.max(150, resizeRef.current.startH * vh / 100 + (cy - resizeRef.current.startY));
         const newHpercent = Math.max(10, (newHpx / vh) * 100); // At least 10% of viewport height
         setModalSize(prev => ({ ...prev, height: `${newHpercent}%` }));
       }
     };
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchend', upHandler);
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchend', upHandler, { passive: true });
  };

  const getPrompt = () => {
    const host = hostname || 'Router';
    switch (cliMode) {
      case 'user': return `${host}>`;
      case 'privileged': return `${host}#`;
      case 'global-config': return `${host}(config)#`;
      case 'interface-config': return `${host}(config-if)#`;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: modalPos.top,
        left: modalPos.left,
        width: modalSize.width,
        height: modalSize.height,
        background: '#0f172a',
        borderRadius: '8px',
        border: '3px solid #3b82f6',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        zIndex: 5000,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Resize handles */}
      <div
        onMouseDown={handleResizeStart('right')}
        onTouchStart={handleResizeStart('right')}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '8px',
          cursor: 'ew-resize', zIndex: 5001, touchAction: 'none',
        }}
      />
      <div
        onMouseDown={handleResizeStart('bottom')}
        onTouchStart={handleResizeStart('bottom')}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '8px',
          cursor: 'ns-resize', zIndex: 5001, touchAction: 'none',
        }}
      />
      <div
        onMouseDown={handleResizeStart('corner')}
        onTouchStart={handleResizeStart('corner')}
        style={{
          position: 'absolute', right: 0, bottom: 0, width: '16px', height: '16px',
          cursor: 'nwse-resize', zIndex: 5002, background: 'rgba(59,130,246,0.3)',
          borderTopLeftRadius: '4px', touchAction: 'none',
        }}
      />

      {/* Title Bar */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          background: '#1e3a8a',
          color: '#fff',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #3b82f6',
          cursor: 'move',
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
          🖥️ Cisco Device Configuration - {hostname} ({device.type.toUpperCase()})
        </span>
        <button
          onClick={onClose}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '2px 8px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}
        >
          X
        </button>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', background: '#1e293b', borderBottom: '1px solid #3b82f6' }}>
        {(['physical', 'config', 'cli'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#0f172a' : 'transparent',
              color: activeTab === tab ? '#3b82f6' : '#94a3b8',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              fontSize: '0.8rem',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panel Contents */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Tab 1: Physical */}
        {activeTab === 'physical' && (
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
              PHYSICAL DEVICE BACKPLANE VIEW
            </span>

            {/* Device representation */}
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                background: '#1e293b',
                border: '4px solid #475569',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Power Switch */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>POWER</span>
                  <button
                    onClick={handlePowerToggle}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: devicePower === 'on' ? '#22c55e' : '#ef4444',
                      border: '2px solid #fff',
                      cursor: 'pointer',
                      boxShadow: devicePower === 'on' ? '0 2px 8px rgba(0,0,0,0.35)' : 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.55rem', fontWeight: 'bold' }}>{devicePower.toUpperCase()}</span>
                </div>

                {/* Modules info */}
                <div style={{ color: '#fff', fontSize: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold' }}>Slot 1: FastEthernet0/0</span>
                  <span style={{ color: devicePower === 'on' ? '#22c55e' : '#f87171' }}>
                    ● Port Link State: {devicePower === 'on' ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Graphic ports representation */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ border: '2px solid #475569', background: '#0f172a', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.55rem', color: '#94a3b8', display: 'block' }}>Fa0/0</span>
                  <div style={{ width: '16px', height: '10px', background: devicePower === 'on' ? '#22c55e' : '#64748b', margin: '4px auto 0' }} />
                </div>
                <div style={{ border: '2px solid #475569', background: '#0f172a', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.55rem', color: '#94a3b8', display: 'block' }}>Fa0/1</span>
                  <div style={{ width: '16px', height: '10px', background: devicePower === 'on' && !isInterfaceShut ? '#22c55e' : '#64748b', margin: '4px auto 0' }} />
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', width: '100%', maxWidth: '600px', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <strong>📋 Device Information:</strong>
              <p style={{ marginTop: '4px' }}>Mac Address Range: 000A.0011.1111 - 000A.0011.1120</p>
              <p>Hardware support: 10/100 Fast Ethernet ports, internal terminal, custom module slots.</p>
            </div>
          </div>
        )}

        {/* Tab 2: Config form */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
            {/* Global Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>GLOBAL CONFIGURATION</span>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>Hostname</label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Interface Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>INTERFACE CONFIGURATION</span>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>Select Interface</label>
                <select
                  value={selectedInterfaceIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedInterfaceIndex(idx);
                    const ifc = device.interfaces[idx];
                    if (ifc) {
                      setSelectedInterface(ifc);
                      setIpInput(ifc.ipAddress || '');
                      setSubnetInput(ifc.subnetMask || '255.255.255.0');
                      setIsInterfaceShut(ifc.status === 'shutdown');
                    }
                  }}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem' }}
                >
                  {device.interfaces.map((ifc, idx) => (
                    <option key={ifc.id} value={idx}>{ifc.name}</option>
                  ))}
                </select>
              </div>

              {selectedInterface && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#fff', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!isInterfaceShut}
                        onChange={(e) => setIsInterfaceShut(!e.target.checked)}
                      />
                      Port Status: ON
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>IP Address</label>
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      placeholder="e.g. 192.168.1.1"
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>Subnet Mask</label>
                    <input
                      type="text"
                      value={subnetInput}
                      onChange={(e) => setSubnetInput(e.target.value)}
                      placeholder="e.g. 255.255.255.0"
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSaveInterfaceConfig}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.8rem',
                marginTop: '12px',
              }}
            >
              Apply Config Changes
            </button>
          </div>
        )}

        {/* Tab 3: CLI */}
        {activeTab === 'cli' && (
          <div
            style={{
              flex: 1,
              background: '#040711',
              borderRadius: '6px',
              border: '2px solid #1e293b',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'monospace',
              color: '#34d399', // Classic terminal green
              fontSize: '0.8rem',
            }}
          >
            {/* Scrollable history logs */}
            <div ref={cliScrollRef} style={{ flex: 1, overflowY: 'auto', marginBottom: '8px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {cliHistory.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>

            {/* Input prompt form */}
            <form onSubmit={handleCliSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '6px', fontWeight: 'bold' }}>{getPrompt()}</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                disabled={devicePower === 'off'}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#34d399',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                }}
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import type { Device, Link, DeviceType, CanvasNote } from './types/network';
import { CiscoMenuBar, type Theme } from './components/Common/CiscoMenuBar';
import { CiscoToolbar } from './components/Common/CiscoToolbar';
import { LogicalPhysicalBar } from './components/Common/LogicalPhysicalBar';
import { BottomDock } from './components/Common/BottomDock';
import { MainCanvas } from './components/Canvas/MainCanvas';
import { DeviceConfigModal } from './components/Sidebar/DeviceConfigModal';
import { HelpOverlay } from './components/Common/HelpOverlay';
import { BinaryExplorer } from './components/Sidebar/BinaryExplorer';
import { VLSMCalculator } from './components/Sidebar/VLSMCalculator';
import './App.css';

function App() {
   const [devices, setDevices] = useState<Device[]>([
     { id: 'dev-1', type: 'router', name: 'Router_A', x: 200, y: 180, ipAddress: '192.168.1.1', subnetMask: '24', interfaces: [], powerStatus: 'on' },
     { id: 'dev-2', type: 'switch', name: 'Switch_A', x: 400, y: 260, interfaces: [], powerStatus: 'on' },
     { id: 'dev-3', type: 'pc', name: 'PC_Client', x: 300, y: 440, ipAddress: '192.168.1.15', subnetMask: '24', gateway: '192.168.1.1', interfaces: [], powerStatus: 'on' },
     { id: 'dev-4', type: 'server', name: 'Server_A', x: 500, y: 440, ipAddress: '192.168.1.80', subnetMask: '24', gateway: '192.168.1.1', interfaces: [], powerStatus: 'on' }
   ]);

   const [theme, setTheme] = useState<Theme>('default');

   useEffect(() => {
      const savedTheme = localStorage.getItem('net_topology_theme') as Theme | null;
      if (savedTheme) {
         setTheme(savedTheme);
         document.documentElement.setAttribute('data-theme', savedTheme);
      }
   }, []);

   useEffect(() => {
      if (theme !== 'default') {
         document.documentElement.setAttribute('data-theme', theme);
      } else {
         document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('net_topology_theme', theme);
   }, [theme]);

  const [links, setLinks] = useState<Link[]>([
    { id: 'link-1', fromDeviceId: 'dev-1', fromPort: 'port-1', toDeviceId: 'dev-2', toPort: 'port-1', status: 'active' },
    { id: 'link-2', fromDeviceId: 'dev-2', fromPort: 'port-2', toDeviceId: 'dev-3', toPort: 'port-1', status: 'active' },
    { id: 'link-3', fromDeviceId: 'dev-2', fromPort: 'port-3', toDeviceId: 'dev-4', toPort: 'port-1', status: 'active' }
  ]);

  const [notes, setNotes] = useState<CanvasNote[]>([]);

  // Selection states
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);

   // App Layout Settings
  const [activeTab, setActiveTab] = useState<'logical' | 'physical'>('logical');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'delete' | 'note'>('select');
  const [zoom, setZoom] = useState(1.0);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [configModalDeviceId, setConfigModalDeviceId] = useState<string | null>(null);

  // Connection mode toggled from bottom panel
  const [isConnectingMode, setIsConnectingMode] = useState(false);

  // Simulation mode states
  const [simulationMode, setSimulationMode] = useState<'realtime' | 'simulation'>('realtime');
  const [simulationEvents, setSimulationEvents] = useState<Array<{ id: string; protocol: string; source: string; dest: string; status: string }>>([]);
  const [activeSimulationPacket, setActiveSimulationPacket] = useState<{ fromDeviceId: string; toDeviceId: string; progress: number; protocol: string; scaleX?: number; scaleY?: number } | null>(null);

   // Tab selections for Right Sidebar
    const [activeRightTab, setActiveRightTab] = useState<'binary' | 'vlsm'>('binary');

    // Resizable splitter state
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const sidebarStartXRef = useRef(0);
    const sidebarStartWidthRef = useRef(0);
    const [bottomDockHeight, setBottomDockHeight] = useState(200);
    const [isResizingBottom, setIsResizingBottom] = useState(false);
    const bottomStartYRef = useRef(0);
    const bottomStartHeightRef = useRef(0);
    const [simPanelWidth, setSimPanelWidth] = useState(260);

    // Resize handlers - must be defined before useEffect
    const stopResizeSidebar = () => {
      setIsResizingSidebar(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    const resizeSidebar = (e: MouseEvent | TouchEvent) => {
      if (!isResizingSidebar) return;
      const clientX = e.type === 'touchmove' ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const diff = clientX - sidebarStartXRef.current;
      let newWidth = sidebarStartWidthRef.current + diff;
      if (newWidth < 160) newWidth = 160;
      if (newWidth > 500) newWidth = 500;
      setSidebarWidth(newWidth);
    };

    const stopResizeBottom = () => {
      setIsResizingBottom(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    const resizeBottom = (e: MouseEvent | TouchEvent) => {
      if (!isResizingBottom) return;
      const clientY = e.type === 'touchmove' ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const diff = bottomStartYRef.current - clientY;
      let newHeight = bottomStartHeightRef.current + diff;
      if (newHeight < 100) newHeight = 100;
      if (newHeight > 400) newHeight = 400;
      setBottomDockHeight(newHeight);
    };

   const startResizeSidebar = (e: React.MouseEvent | React.TouchEvent) => {
     e.preventDefault();
     setIsResizingSidebar(true);
     sidebarStartXRef.current = e.type === 'touchstart' ? (e as React.TouchEvent).nativeEvent.touches[0].clientX : (e as React.MouseEvent).clientX;
     sidebarStartWidthRef.current = sidebarWidth;
     document.body.style.userSelect = 'none';
     document.body.style.cursor = 'col-resize';
   };

   const startResizeBottom = (e: React.MouseEvent | React.TouchEvent) => {
     e.preventDefault();
     setIsResizingBottom(true);
     bottomStartYRef.current = e.type === 'touchstart' ? (e as React.TouchEvent).nativeEvent.touches[0].clientY : (e as React.MouseEvent).nativeEvent.clientY;
     bottomStartHeightRef.current = bottomDockHeight;
     document.body.style.userSelect = 'none';
     document.body.style.cursor = 'row-resize';
   };

   // Load initial layout if saved in localStorage
   useEffect(() => {
     const savedDevices = localStorage.getItem('net_topology_devices');
     const savedLinks = localStorage.getItem('net_topology_links');
     const savedNotes = localStorage.getItem('net_topology_notes');
     if (savedDevices && savedLinks) {
       try {
         setDevices(JSON.parse(savedDevices));
         setLinks(JSON.parse(savedLinks));
         if (savedNotes) {
           setNotes(JSON.parse(savedNotes));
         }
       } catch (err) {
         console.error('Failed to parse saved layout from localStorage', err);
       }
     }
   }, []);

   useEffect(() => {
     if (!isResizingSidebar) return;
     const moveHandler = (event: MouseEvent | TouchEvent) => resizeSidebar(event);
     const upHandler = () => stopResizeSidebar();
     window.addEventListener('mousemove', moveHandler);
     window.addEventListener('touchmove', moveHandler);
     window.addEventListener('mouseup', upHandler);
     window.addEventListener('touchend', upHandler);
     return () => {
       window.removeEventListener('mousemove', moveHandler);
       window.removeEventListener('touchmove', moveHandler);
       window.removeEventListener('mouseup', upHandler);
       window.removeEventListener('touchend', upHandler);
     };
   }, [isResizingSidebar]);

   useEffect(() => {
     if (!isResizingBottom) return;
     const moveHandler = (event: MouseEvent | TouchEvent) => resizeBottom(event);
     const upHandler = () => stopResizeBottom();
     window.addEventListener('mousemove', moveHandler);
     window.addEventListener('touchmove', moveHandler);
     window.addEventListener('mouseup', upHandler);
     window.addEventListener('touchend', upHandler);
     return () => {
       window.removeEventListener('mousemove', moveHandler);
       window.removeEventListener('touchmove', moveHandler);
       window.removeEventListener('mouseup', upHandler);
       window.removeEventListener('touchend', upHandler);
     };
   }, [isResizingBottom]);


   const handleAddDevice = (type: DeviceType, modelName?: string) => {
    const count = devices.length;
    const x = 140 + (count % 4) * 140;
    const y = 140 + Math.floor(count / 4) * 120;
    const newId = `dev-${Date.now()}`;

    const newDevice: Device = {
      id: newId,
      type,
      name: modelName ? `${modelName.replace(/\s+/g, '_')}_${count + 1}` : `${type.toUpperCase()}_${count + 1}`,
      x,
      y,
      powerStatus: 'on',
      interfaces: type === 'router' ? [
        { id: 'fa0-0', name: 'FastEthernet0/0', macAddress: '000A.0011.1111', isConnected: false, status: 'shutdown' },
        { id: 'fa0-1', name: 'FastEthernet0/1', macAddress: '000A.0011.1112', isConnected: false, status: 'shutdown' }
      ] : type === 'switch' ? [
        { id: 'fa0-0', name: 'FastEthernet0/1', macAddress: '000B.0022.2221', isConnected: false, status: 'active' },
        { id: 'fa0-1', name: 'FastEthernet0/2', macAddress: '000B.0022.2222', isConnected: false, status: 'active' }
      ] : [
        { id: 'fa0-0', name: 'FastEthernet0', macAddress: '000C.0033.3333', isConnected: false, status: 'active' }
      ]
    };

    setDevices((prev) => [...prev, newDevice]);
    setSelectedDeviceId(newId);
    setActiveTool('select');
  };

  const handleUpdateDevicePosition = (id: string, x: number, y: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, x, y } : d))
    );
  };

  const handleUpdateDeviceDetails = (updated: Device) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleStartConnection = (sourceId: string | null) => {
    setConnectionSourceId(sourceId);
  };

  const handleCompleteConnection = (targetId: string) => {
    if (!connectionSourceId || connectionSourceId === targetId) {
      setConnectionSourceId(null);
      setIsConnectingMode(false);
      return;
    }

    const linkExists = links.some(
      (l) =>
        (l.fromDeviceId === connectionSourceId && l.toDeviceId === targetId) ||
        (l.fromDeviceId === targetId && l.toDeviceId === connectionSourceId)
    );

    if (linkExists) {
      alert('A link connection already exists between these two devices.');
      setConnectionSourceId(null);
      setIsConnectingMode(false);
      return;
    }

    const newLink: Link = {
      id: `link-${Date.now()}`,
      fromDeviceId: connectionSourceId,
      fromPort: 'port-a',
      toDeviceId: targetId,
      toPort: 'port-b',
      status: 'active'
    };

    setLinks([...links, newLink]);
    setConnectionSourceId(null);
    setIsConnectingMode(false);
  };

  const handleDeleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setLinks((prev) =>
      prev.filter((l) => l.fromDeviceId !== id && l.toDeviceId !== id)
    );
    if (selectedDeviceId === id) {
      setSelectedDeviceId(null);
    }
    if (configModalDeviceId === id) {
      setConfigModalDeviceId(null);
    }
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    if (selectedLinkId === id) {
      setSelectedLinkId(null);
    }
  };

  const handleAddNote = (text: string, x: number, y: number) => {
    const newNote: CanvasNote = {
      id: `note-${Date.now()}`,
      text,
      x,
      y
    };
    setNotes([...notes, newNote]);
    setActiveTool('select');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // State Persistence
  const handleSaveLayout = () => {
    localStorage.setItem('net_topology_devices', JSON.stringify(devices));
    localStorage.setItem('net_topology_links', JSON.stringify(links));
    localStorage.setItem('net_topology_notes', JSON.stringify(notes));
    alert('Topology successfully saved to browser local storage!');
  };

  const handleLoadLayout = () => {
    const savedDevices = localStorage.getItem('net_topology_devices');
    const savedLinks = localStorage.getItem('net_topology_links');
    const savedNotes = localStorage.getItem('net_topology_notes');
    if (savedDevices && savedLinks) {
      setDevices(JSON.parse(savedDevices));
      setLinks(JSON.parse(savedLinks));
      setNotes(savedNotes ? JSON.parse(savedNotes) : []);
      setSelectedDeviceId(null);
      setSelectedLinkId(null);
      alert('Topology loaded successfully!');
    } else {
      alert('No saved layout found in browser.');
    }
  };

  const handleClearLayout = () => {
    if (window.confirm('Are you sure you want to delete the entire topology and reset?')) {
      setDevices([]);
      setLinks([]);
      setNotes([]);
      setSelectedDeviceId(null);
      setSelectedLinkId(null);
      setConnectionSourceId(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ devices, links, notes }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network_topology_schema.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Simulated CLI Pings / ICMP execution
  const handleTriggerPing = (sourceId: string, destIp: string) => {
    const srcDevice = devices.find((d) => d.id === sourceId);
    if (!srcDevice) return;

    // Find destination device based on IP Address
    const destDevice = devices.find(
      (d) => d.ipAddress === destIp || (d.interfaces && d.interfaces.some((ifc) => ifc.ipAddress === destIp))
    );

    const protocol = 'ICMP';
    const newEventId = `evt-${Date.now()}`;

    if (!destDevice) {
      // Host unreachable
      const newEvent = {
        id: newEventId,
        protocol,
        source: srcDevice.name,
        dest: destIp,
        status: 'Failed'
      };
      setSimulationEvents((prev) => [newEvent, ...prev]);
      alert(`Ping Failed: Host ${destIp} is Unreachable.`);
      return;
    }

    // Ping Success simulation
    const newEvent = {
      id: newEventId,
      protocol,
      source: srcDevice.name,
      dest: destDevice.name,
      status: 'Success'
    };

    if (simulationMode === 'realtime') {
      setSimulationEvents((prev) => [newEvent, ...prev]);
    } else {
      // In simulation mode, kickoff animated path packet envelope
      setActiveSimulationPacket({
        fromDeviceId: srcDevice.id,
        toDeviceId: destDevice.id,
        progress: 0,
        protocol
      });

      // Simple interval simulating frame updates
      let prog = 0;
      const interval = setInterval(() => {
        prog += 0.05;
        if (prog >= 1.0) {
          clearInterval(interval);
          setActiveSimulationPacket(null);
          setSimulationEvents((prev) => [newEvent, ...prev]);
        } else {
          setActiveSimulationPacket((prev) => (prev ? { ...prev, progress: prog } : null));
        }
      }, 50);
    }
  };

  const handlePlaySimulation = () => {
      if (simulationEvents.length > 0) {
        const latest = simulationEvents[0];
        const src = devices.find((d) => d.name === latest.source);
        const dst = devices.find((d) => d.name === latest.dest);
        if (src && dst) {
          setActiveSimulationPacket({
            fromDeviceId: src.id,
            toDeviceId: dst.id,
            progress: 0,
            protocol: latest.protocol
          });
          let prog = 0;
          const interval = setInterval(() => {
            prog += 0.05;
            if (prog >= 1.0) {
              clearInterval(interval);
              setActiveSimulationPacket(null);
            } else {
              setActiveSimulationPacket((prev) => (prev ? { ...prev, progress: prog } : null));
            }
          }, 50);
        }
      } else {
        alert('Use ping command inside a CLI tab first to generate simulation packets!');
      }
    };

    const handleFireEvent = (id: string) => {
      const ev = simulationEvents.find((e) => e.id === id);
      if (!ev) return;
      const src = devices.find((d) => d.name === ev.source);
      const dst = devices.find((d) => d.name === ev.dest || (d.ipAddress && ev.dest.includes(d.ipAddress)));
      if (!src || !dst) return;
      setActiveSimulationPacket({ fromDeviceId: src.id, toDeviceId: dst.id, progress: 0, protocol: ev.protocol });
      let prog = 0;
      const interval = setInterval(() => {
        prog += 0.05;
        if (prog >= 1.0) {
          clearInterval(interval);
          setActiveSimulationPacket(null);
        } else {
          setActiveSimulationPacket((prev) => (prev ? { ...prev, progress: prog } : null));
        }
      }, 50);
    };

    const handleEditEvent = (id: string) => {
      const ev = simulationEvents.find((e) => e.id === id);
      if (!ev) return;
      const newSrc = prompt('Edit source name:', ev.source);
      if (newSrc === null) return;
      const newDst = prompt('Edit destination:', ev.dest);
      if (newDst === null) return;
      const newStatus = prompt('Edit status (Success/Failed/Sent):', ev.status) ?? ev.status;
      setSimulationEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                source: newSrc,
                dest: newDst,
                status: newStatus,
              }
            : e
        )
      );
    };

    const handleDeleteEvent = (id: string) => {
      setSimulationEvents((prev) => prev.filter((e) => e.id !== id));
    };

   const selectedDevice = devices.find((d) => d.id === configModalDeviceId) || null;
   const topologySummary = {
     nodes: devices.length,
     links: links.length,
     notes: notes.length,
     mode: simulationMode === 'realtime' ? 'Realtime' : 'Simulation',
   };

return (
    <div className="cisco-app">
       {/* Top Header Menu Bar */}
       <CiscoMenuBar
        onSave={handleSaveLayout}
        onLoad={handleLoadLayout}
        onClear={handleClearLayout}
        onExportJSON={handleExportJSON}
        onToggleHelp={() => setIsHelpOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

        {/* Navigation and Coordinates */}
        <LogicalPhysicalBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          nodeCount={devices.length}
          linkCount={links.length}
        />

        {/* Main Secondary Icon Toolbar */}
        <CiscoToolbar
          onSave={handleSaveLayout}
          onLoad={handleLoadLayout}
          onClear={handleClearLayout}
          onExportJSON={handleExportJSON}
          onToggleHelp={() => setIsHelpOpen(true)}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          zoom={zoom}
          setZoom={setZoom}
        />

        <div className="workspace-status-bar">
          <div className="workspace-status-chip">
            <span className="workspace-status-dot" />
            <span>{topologySummary.mode}</span>
          </div>
          <div className="workspace-status-group">
            <span>Nodes</span>
            <strong>{topologySummary.nodes}</strong>
          </div>
          <div className="workspace-status-group">
            <span>Links</span>
            <strong>{topologySummary.links}</strong>
          </div>
          <div className="workspace-status-group">
            <span>Notes</span>
            <strong>{topologySummary.notes}</strong>
          </div>
          <div className="workspace-status-hint">
            Drag devices to snap them into place. Double click a node to edit its config.
          </div>
        </div>

        {/* Workspace Area split into canvas and right toolcards */}
        <div className="workspace-shell">
          {/* Main Canvas Area */}
          <div className="workspace-main">
            {activeTab === 'logical' ? (
              devices.length === 0 && links.length === 0 ? (
                <div className="empty-state-container workspace-empty">
                  <div className="empty-state-icon">Network</div>
                  <h1 className="empty-state-title">Welcome to NetTopology</h1>
                  <p className="empty-state-subtitle">
                    Start building your topology from the bottom dock. It’s set up to feel like a live packet lab.
                  </p>
                  <p className="empty-state-hint">
                    Pick a device, drop it on the canvas, then connect ports and inspect traffic with the side tools.
                  </p>
                </div>
              ) : (
                  <MainCanvas
                  devices={devices}
                  links={links}
                  notes={notes}
                  selectedDeviceId={selectedDeviceId}
                  selectedLinkId={selectedLinkId}
                  connectionSourceId={connectionSourceId}
                  activeTool={activeTool}
                  zoom={zoom}
                  viewBox={viewBox}
                  onViewBoxChange={setViewBox}
                  activeSimulationPacket={activeSimulationPacket}
                  onUpdateDevicePosition={handleUpdateDevicePosition}
                  onSelectDevice={(id) => {
                    if (isConnectingMode && connectionSourceId) {
                      handleCompleteConnection(id || '');
                    } else {
                      setSelectedDeviceId(id);
                      if (id) setSelectedLinkId(null);
                    }
                  }}
                  onSelectLink={(id) => {
                    setSelectedLinkId(id);
                    if (id) setSelectedDeviceId(null);
                  }}
                  onStartConnection={handleStartConnection}
                  onCompleteConnection={handleCompleteConnection}
                  onDeleteDevice={handleDeleteDevice}
                  onDeleteLink={handleDeleteLink}
                  onDoubleClickDevice={(id) => setConfigModalDeviceId(id)}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                />
              )
            ) : (
              devices.length === 0 && links.length === 0 ? (
                <div className="empty-state-container workspace-empty">
                  <div className="empty-state-icon">Physical</div>
                  <h1 className="empty-state-title">No physical map yet</h1>
                  <p className="empty-state-subtitle">
                    The physical view is ready, but your lab needs devices before it can show a rack or wiring layout.
                  </p>
                  <p className="empty-state-hint">
                    Add a few devices, then switch back and forth to compare logical topology and physical layout.
                  </p>
                </div>
              ) : (
                <div className="physical-view-card">
                  <span className="physical-view-title">Physical View</span>
                  <strong>Map representation</strong>
                  <p>Corporate wiring closet - inter-building trunk links simulated.</p>
                </div>
              )
            )}
          </div>

{/* Splitter */}
          <div
            onMouseDown={startResizeSidebar}
            onTouchStart={startResizeSidebar}
            style={{
              width: '8px',
              cursor: 'col-resize',
              userSelect: 'none',
              background: 'rgba(255,255,255,0.1)',
              touchAction: 'none',
            }}
          />

  {/* Sidebar panels containing helper tools (Binary / VLSM) */}
  <div
    className="glass-panel"
    style={{
      flex: '0 0 auto',
      width: sidebarWidth,
      minWidth: '160px',
      maxWidth: '500px',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      margin: '6px 6px 6px 0',
    }}
  >
            <div className="cisco-sidebar-tabs">
              <button
                onClick={() => setActiveRightTab('binary')}
                className={`cisco-sidebar-tab ${activeRightTab === 'binary' ? 'active' : ''}`}
              >
                Binary Explorer
              </button>
              <button
                onClick={() => setActiveRightTab('vlsm')}
                className={`cisco-sidebar-tab ${activeRightTab === 'vlsm' ? 'active' : ''}`}
              >
                VLSM Calculator
              </button>
            </div>

            <div className="cisco-dock-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
             {activeRightTab === 'binary' ? <BinaryExplorer /> : <VLSMCalculator />}
           </div>
         </div>
       </div>

       {/* Draggable/floating Device Config Dialog Modal */}
       {configModalDeviceId && selectedDevice && (
         <DeviceConfigModal
           device={selectedDevice}
           onClose={() => setConfigModalDeviceId(null)}
           onUpdateDevice={handleUpdateDeviceDetails}
           onTriggerPing={handleTriggerPing}
         />
       )}

{/* Bottom Splitter */}
        <div
          onMouseDown={startResizeBottom}
          onTouchStart={startResizeBottom}
          style={{
            height: '8px',
            cursor: 'row-resize',
            userSelect: 'none',
            background: 'rgba(255,255,255,0.1)',
            touchAction: 'none',
          }}
        />

        {/* Bottom Category and Simulation panel */}
        <BottomDock
          onAddDevice={handleAddDevice}
          simulationMode={simulationMode}
          setSimulationMode={setSimulationMode}
          onPlaySimulation={handlePlaySimulation}
          onStepSimulation={handlePlaySimulation}
          onResetSimulation={() => setSimulationEvents([])}
          simulationEvents={simulationEvents}
          isConnectingMode={isConnectingMode}
          onCancelConnectingMode={() => {
            setIsConnectingMode(false);
            setConnectionSourceId(null);
          }}
           height={bottomDockHeight}
           onFireEvent={handleFireEvent}
           onEditEvent={handleEditEvent}
           onDeleteEvent={handleDeleteEvent}
           simPanelWidth={simPanelWidth}
           onSimPanelResize={setSimPanelWidth}
         />

      {/* Educational Guide Overlay */}
        <HelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        
        <a href="#" className="privacy-policy-link" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
      </div>
    );
  }

export default App;

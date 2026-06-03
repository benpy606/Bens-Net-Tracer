import React, { useState, useEffect, useRef } from 'react';

export type Theme = 'default' | 'carbon-mint' | 'amethyst-void' | 'cyber-rose';

interface CiscoMenuBarProps {
   onSave: () => void;
   onLoad: () => void;
   onClear: () => void;
   onExportJSON: () => void;
   onToggleHelp: () => void;
   activeTab: 'logical' | 'physical';
   setActiveTab: (tab: 'logical' | 'physical') => void;
   currentTheme?: Theme;
   onThemeChange?: (theme: Theme) => void;
}

const MENU_ITEMS: Record<string, { label: string; icon?: string }[]> = {
  File: [
    { label: 'New Topology', icon: '📄' },
    { label: 'Open / Load Layout', icon: '📂' },
    { label: 'Save Layout', icon: '💾' },
    { label: 'Export JSON', icon: '📥' },
  ],
  Edit: [
    { label: 'Undo (Ctrl+Z)', icon: '↩️' },
    { label: 'Redo (Ctrl+Y)', icon: '↪️' },
    { label: 'Cut', icon: '✂️' },
    { label: 'Copy', icon: '📋' },
    { label: 'Paste', icon: '📥' },
  ],
  Options: [
    { label: 'Preferences', icon: '⚙️' },
    { label: 'User Profile', icon: '🌐' },
  ],
  View: [
    { label: 'Zoom In', icon: '🔍' },
    { label: 'Zoom Out', icon: '🔎' },
    { label: 'Toggle Fullscreen', icon: '🖥️' },
  ],
  Tools: [
    { label: 'Subnet Calculator', icon: '🧮' },
    { label: 'VLSM Calculator', icon: '⚡' },
  ],
  Extensions: [
    { label: 'Activity Wizard', icon: '🔌' },
    { label: 'Multiuser Link', icon: '🌍' },
  ],
  Window: [
    { label: 'Reset Layout', icon: '🧱' },
    { label: 'Toggle Sidebar', icon: '📐' },
    { label: 'Toggle Bottom Dock', icon: '📋' },
  ],
  Help: [
    { label: 'Help Contents', icon: '❓' },
    { label: 'About Cisco Packet Tracer Sim', icon: 'ℹ️' },
  ],
};

export const CiscoMenuBar: React.FC<CiscoMenuBarProps> = ({
   onSave,
   onLoad,
   onClear,
   onExportJSON,
   onToggleHelp,
   currentTheme = 'default',
   onThemeChange,
}) => {
   const [activeMenu, setActiveMenu] = useState<string | null>(null);
   const menuRef = useRef<HTMLDivElement>(null);

   const THEMES: { value: Theme; label: string; icon: string }[] = [
      { value: 'default', label: 'Default Slate', icon: '⚪' },
      { value: 'carbon-mint', label: 'Carbon Mint', icon: '🟢' },
      { value: 'amethyst-void', label: 'Amethyst Void', icon: '🟣' },
      { value: 'cyber-rose', label: 'Cyber Rose', icon: '🟥' },
   ];

   const handleThemeChange = (theme: Theme) => {
      onThemeChange?.(theme);
      setActiveMenu(null);
   };

useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setActiveMenu(null);
        }
      };
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setActiveMenu(null);
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, []);

    const handleInnerAction = (menuKey: string, label: string) => {
      if (menuKey === 'File') {
        if (label.includes('New')) onClear();
        else if (label.includes('Open') || label.includes('Load')) onLoad();
        else if (label.includes('Save')) onSave();
        else if (label.includes('Export')) onExportJSON();
      } else if (menuKey === 'Help') {
        if (label.includes('Help')) onToggleHelp();
        else alert('Cisco Packet Tracer Web Simulator v1.0.0\nDeveloped in React.');
      } else if (menuKey === 'Options' && label.includes('Preferences')) {
        setActiveMenu('preferences-theme');
      } else {
        alert(`${label}: feature coming soon.`);
      }
      if (menuKey !== 'Options' || !label.includes('Preferences')) {
        setActiveMenu(null);
      }
    };

    const ThemeSelectorDropdown = () => (
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          background: 'rgba(16, 20, 30, 0.97)',
          backdropFilter: 'blur(20px) saturate(110%)',
          border: '1px solid var(--border-color-hover)',
          borderRadius: '10px',
          minWidth: '200px',
          padding: '8px',
          zIndex: 1010,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), var(--shadow-glow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={`theme-option ${currentTheme === theme.value ? 'active' : ''}`}
          >
            <span className={`theme-color-preview theme-${theme.value}`} />
            <span style={{ fontSize: '1rem' }}>{theme.icon}</span>
            <span className="theme-option-label">{theme.label}</span>
          </button>
        ))}
      </div>
    );

  return (
    <div
      ref={menuRef}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(10, 14, 23, 0.98)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 12px',
        fontFamily: 'var(--font-sans)',
        userSelect: 'none',
        position: 'relative',
        zIndex: 1000,
        minHeight: '36px',
        boxSizing: 'border-box',
        gap: '6px',
      }}
    >
      {/* Branding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingRight: '14px',
          borderRight: '1px solid var(--border-color)',
          marginRight: '4px',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(96,165,250,0.2))',
            border: '1px solid rgba(34,211,238,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
        >
          🌐
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.4px',
              color: '#e2e8f0',
              lineHeight: '1.1',
            }}
          >
            NetTopology
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: 'var(--accent-cyan)',
              opacity: 0.85,
              lineHeight: '1',
            }}
          >
            Designer
          </span>
        </div>
      </div>

      {/* Menu Tabs */}
      {Object.keys(MENU_ITEMS).map((menuKey) => {
        const isOpen = activeMenu === menuKey;
        return (
          <div key={menuKey} style={{ position: 'relative' }}>
            <button
              onClick={() => setActiveMenu(isOpen ? null : menuKey)}
              onMouseEnter={() => activeMenu && setActiveMenu(menuKey)}
              style={{
                appearance: 'none',
                border: 'none',
                background: isOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isOpen ? '#fff' : '#cbd5e1',
                padding: '0 12px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: isOpen ? 600 : 500,
                letterSpacing: '0.3px',
                borderRadius: '6px',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                height: '100%',
              }}
            >
              {menuKey}
            </button>

{isOpen && menuKey !== 'Options' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'rgba(16, 20, 30, 0.97)',
                  backdropFilter: 'blur(20px) saturate(110%)',
                  border: '1px solid var(--border-color-hover)',
                  borderRadius: '10px',
                  minWidth: menuKey === 'File' || menuKey === 'Help' ? '220px' : '220px',
                  padding: '6px',
                  zIndex: 1010,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), var(--shadow-glow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {MENU_ITEMS[menuKey].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInnerAction(menuKey, item.label)}
                    style={{
                      appearance: 'none',
                      border: 'none',
                      background: 'transparent',
                      color: '#e2e8f0',
                      textAlign: 'left',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      letterSpacing: '0.2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = 'var(--border-active)';
                      el.style.color = '#fff';
                      el.style.boxShadow = 'inset 0 0 0 1px var(--border-active)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = 'transparent';
                      el.style.color = '#e2e8f0';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', width: '16px', textAlign: 'center' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
            {activeMenu === 'preferences-theme' && (
              <ThemeSelectorDropdown />
            )}
          </div>
        );
      })}
    </div>
  );
};

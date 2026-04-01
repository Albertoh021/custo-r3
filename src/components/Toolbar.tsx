import React, { useRef } from 'react';

interface ToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddRow: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClearAll: () => void;
  activeTab: 'spreadsheet' | 'dashboard' | 'summary' | 'coletas' | 'insights' | 'performance';
  setActiveTab: (tab: 'spreadsheet' | 'dashboard' | 'summary' | 'coletas' | 'insights' | 'performance') => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const TABS: { key: 'spreadsheet' | 'dashboard' | 'summary' | 'coletas' | 'insights' | 'performance'; label: string }[] = [
  { key: 'spreadsheet', label: 'Planilha' },
  { key: 'dashboard', label: 'Power BI' },
  { key: 'summary', label: 'Resumo' },
  { key: 'coletas', label: 'Coletas' },
  { key: 'performance', label: 'Performance' },
  { key: 'insights', label: 'Insights IA' },
];

export const Toolbar = ({
  searchQuery, setSearchQuery, onAddRow, onExport, onImport,
  onClearAll, activeTab, setActiveTab,
}: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ marginBottom: 0 }}>
      {/* Toolbar Row */}
      <div style={{
        background: '#d4d0c8',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #808080',
        borderBottom: '1px solid #808080',
        boxShadow: 'inset -1px 0 0 #404040, inset 0 1px 0 #e8e4dc',
        padding: '3px 4px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
        marginBottom: 0,
      }}>
        {/* Toolbar divider label */}
        <div style={{ fontSize: '10px', color: '#808080', marginRight: 2, paddingRight: 6, borderRight: '1px solid #808080', height: 20, display: 'flex', alignItems: 'center' }}>
          Ações
        </div>

        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" style={{ display: 'none' }} />
        
        <button className="win-btn" onClick={() => fileInputRef.current?.click()} title="Importar CSV">
          📂 Importar CSV
        </button>

        {activeTab === 'spreadsheet' && (
          <button className="win-btn" onClick={onExport} title="Exportar CSV">
            💾 Exportar CSV
          </button>
        )}

        {activeTab === 'spreadsheet' && (
          <button className="win-btn" onClick={onAddRow} title="Nova Linha"
            style={{ background: '#d4d0c8', fontWeight: 'bold' }}>
            ➕ Nova Linha
          </button>
        )}

        {activeTab === 'spreadsheet' && (
          <button className="win-btn" title="Limpar Tudo"
            style={{ color: '#800000' }}
            onClick={() => { if (window.confirm('Tem certeza que deseja apagar TODOS os registros?')) onClearAll(); }}>
            🗑 Limpar Tudo
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Search box - only in spreadsheet */}
        {activeTab === 'spreadsheet' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: '11px', color: '#000' }}>🔍 Buscar:</label>
            <input
              type="text"
              className="win-input"
              style={{ width: 200 }}
              placeholder="Nome, contrato, veículo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab Strip - Win2K style */}
      <div style={{ display: 'flex', gap: 0, paddingLeft: 4, paddingTop: 4, background: '#d4d0c8', flexWrap: 'wrap' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: isActive ? '#d4d0c8' : '#bdb8ad',
                borderTop: '2px solid ' + (isActive ? '#ffffff' : '#c0bdb5'),
                borderLeft: '2px solid ' + (isActive ? '#ffffff' : '#c0bdb5'),
                borderRight: '2px solid #808080',
                borderBottom: isActive ? '2px solid #d4d0c8' : '2px solid #808080',
                padding: isActive ? '4px 14px 5px 14px' : '3px 14px 4px 14px',
                marginRight: 2,
                marginBottom: isActive ? '-1px' : 0,
                zIndex: isActive ? 2 : 1,
                position: 'relative' as const,
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
                fontWeight: isActive ? 'bold' : 'normal',
                color: '#000000',
                outline: 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
        {/* Tab bottom border fill */}
        <div style={{ flex: 1, borderBottom: '2px solid #808080', marginBottom: 0 }} />
      </div>
    </div>
  );
};

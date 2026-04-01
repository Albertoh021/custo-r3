import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import type { LogisticsRecord, GlobalCosts } from './types';
import { generateId } from './utils';
import { DashboardHeader } from './components/DashboardHeader';
import { Toolbar } from './components/Toolbar';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { DashboardView } from './components/DashboardView';
import { SummaryView } from './components/SummaryView';
import { ColetaAnalysisView } from './components/ColetaAnalysisView';
import { InsightsView } from './components/InsightsView';
import { DriverPerformanceView } from './components/DriverPerformanceView';

const INITIAL_DATA: LogisticsRecord[] = [];

const INITIAL_COSTS: GlobalCosts = {
  aluguel: 0,
  combustivel: 0,
  manutencao: 0,
  seguro: 0
};

function App() {
  const [activeTab, setActiveTab] = useState<'spreadsheet' | 'dashboard' | 'summary' | 'coletas' | 'insights' | 'performance'>('spreadsheet');
  const [dateRange, setDateRange] = useState(() => localStorage.getItem('logistics_date_range') || '');
  
  const [records, setRecords] = useState<LogisticsRecord[]>(() => {
    const saved = localStorage.getItem('logistics_records_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_DATA; }
    }
    return INITIAL_DATA;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof LogisticsRecord, string[]>>>({});

  const [globalCosts, setGlobalCosts] = useState<GlobalCosts>(() => {
    const saved = localStorage.getItem('logistics_global_costs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_COSTS; }
    }
    return INITIAL_COSTS;
  });

  useEffect(() => { localStorage.setItem('logistics_records_v2', JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem('logistics_date_range', dateRange); }, [dateRange]);
  useEffect(() => { localStorage.setItem('logistics_global_costs', JSON.stringify(globalCosts)); }, [globalCosts]);

  const addRecord = () => {
    const newRecord: LogisticsRecord = {
      id: generateId(), motorista: '', tipoContrato: '', veiculo: '', operacao: '',
      vlrDiaria: 0, diasTrabalhados: 0, entregas: 0, valorFaturado: 0, insucessos: 0,
      vlrDasDiarias: 0, vlrEntregas: 0, bonus: 0, coletas: 0, vlrColetas: 0,
      vlrSabado: 0, pedagio: 0, mudanca: 0, outrosValores: 0, descontos: 0, vlrTotal: 0,
      tckMedio: 0, lucroBruto: 0, pctCusto: 0, entregasDia: 0, coletasDia: 0,
      regiaoEntrega: '', cep: '', pctColetados: 0, pctPorPonto: 0
    };
    setRecords([newRecord, ...records]);
    setActiveTab('spreadsheet');
  };

  const updateRecord = (id: string, field: keyof LogisticsRecord, value: string | number) => {
    setRecords(records.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.vlrDasDiarias = updated.vlrDiaria * updated.diasTrabalhados;
      updated.vlrTotal = updated.vlrDasDiarias + updated.vlrEntregas + updated.bonus +
        updated.vlrColetas + updated.vlrSabado + updated.pedagio +
        updated.mudanca + updated.outrosValores - updated.descontos;
      updated.tckMedio = updated.entregas > 0 ? (updated.vlrTotal / updated.entregas) : 0;
      updated.lucroBruto = updated.valorFaturado - updated.vlrTotal;
      updated.pctCusto = updated.valorFaturado > 0 ? (updated.vlrTotal / updated.valorFaturado) * 100 : 0;
      updated.entregasDia = updated.diasTrabalhados > 0 ? (updated.entregas / updated.diasTrabalhados) : 0;
      updated.coletasDia = updated.diasTrabalhados > 0 ? (updated.coletas / updated.diasTrabalhados) : 0;
      return updated;
    }));
  };

  const deleteRecord = (id: string) => { setRecords(records.filter(r => r.id !== id)); };
  const clearAllRecords = () => { setRecords([]); setDateRange(''); };

  const exportToCSV = () => {
    if (records.length === 0) return;
    const headers = ['Motorista','Tipo Contrato','Veículo','Operação','Vlr Diária','Dias Trabalhados','Entregas','Valor Faturado','Insucessos','Vlr das Diárias','Vlr Entregas','Bônus','Coletas','Vlr Coletas','Vlr Sábado','Pedágio','Mudança','Outros Valores','Descontos','Vlr Total','Tck Médio','Lucro Bruto','% Custo','Entregas/Dia','Coletas/Dia','Região de Entrega','CEP','Pct Coletados','Pct Por Ponto'];
    const rows = filteredRecords.map(r => [r.motorista,r.tipoContrato,r.veiculo,r.operacao,r.vlrDiaria,r.diasTrabalhados,r.entregas,r.valorFaturado,r.insucessos,r.vlrDasDiarias,r.vlrEntregas,r.bonus,r.coletas,r.vlrColetas,r.vlrSabado,r.pedagio,r.mudanca,r.outrosValores,r.descontos,r.vlrTotal,r.tckMedio,r.lucroBruto,r.pctCusto,r.entregasDia,r.coletasDia,r.regiaoEntrega,r.cep,r.pctColetados,r.pctPorPonto]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `analise_custos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = (file: File) => {
    Papa.parse(file, {
      header: false, skipEmptyLines: true,
      complete: function(results) {
        const rows = results.data as string[][];
        let foundDateRange = '';
        const dateRegex = /De\s*\d{2}[\/\-]\d{2}[\/\-](?:\d{4}|\d{2})\s*(?:a|à|ate|até)\s*\d{2}[\/\-]\d{2}[\/\-](?:\d{4}|\d{2})/i;
        for (let i = 0; i < Math.min(15, rows.length); i++) {
          if (!rows[i]) continue;
          for (const cell of rows[i]) {
            if (cell && typeof cell === 'string') {
              const match = cell.match(dateRegex);
              if (match) { foundDateRange = match[0].charAt(0).toUpperCase() + match[0].slice(1); break; }
            }
          }
          if (foundDateRange) break;
        }
        let headerRowIndex = -1; let headers: string[] = [];
        for (let i = 0; i < rows.length; i++) {
          const rowData = rows[i] ? rows[i].map(c => String(c).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\uFFFD/g, 'a')) : [];
          if (rowData.includes('motorista') || rowData.includes('nome do motorista') || rowData.includes('nome')) {
            headerRowIndex = i; headers = rowData; break;
          }
        }
        if (headerRowIndex === -1) { alert('Não foi possível encontrar a coluna "Motorista" no CSV.'); return; }
        const findColIdx = (aliases: string[]) => { for (const alias of aliases) { const idx = headers.findIndex(h => h === alias.toLowerCase() || h.includes(alias.toLowerCase())); if (idx !== -1) return idx; } return -1; };
        const colMap = { motorista: findColIdx(['motorista','nome']), tipoContrato: findColIdx(['tipo contrato','contrato']), veiculo: findColIdx(['veiculo','carro','placa','veaculo']), operacao: findColIdx(['operacao','tipo de operacao','tipo operacao','operaaao','operaao']), vlrDiaria: findColIdx(['vlr diaria','valor diaria','valor da diaria','diaria','vlr diaaria','valor diaaria','diaaria']), diasTrabalhados: findColIdx(['dias trabalhados','dias']), entregas: findColIdx(['entregas','qtd entregas']), valorFaturado: findColIdx(['valor faturado','faturamento']), insucessos: findColIdx(['insucessos']), vlrEntregas: findColIdx(['vlr entregas','vlr das entregas']), bonus: findColIdx(['bônus','bonus']), coletas: findColIdx(['coletas','qtd coletas']), vlrColetas: findColIdx(['vlr coletas','valor coletas']), vlrSabado: findColIdx(['vlr sábado','vlr sabado']), pedagio: findColIdx(['pedágio','pedagio']), mudanca: findColIdx(['mudança','mudanca']), outrosValores: findColIdx(['outros valores','hr parada','outros']), descontos: findColIdx(['descontos','desconto']), regiaoEntrega: findColIdx(['região','regiao']), cep: findColIdx(['cep']), pctColetados: findColIdx(['pct coletados','% coletados']), pctPorPonto: findColIdx(['pct por ponto','% por ponto']) };
        const parsedRecords: LogisticsRecord[] = [];
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i]; if (!row) continue;
          const motoristaName = colMap.motorista !== -1 ? String(row[colMap.motorista] || '').trim().replace(/\uFFFD/g, 'A') : '';
          if (!motoristaName || motoristaName.toLowerCase().includes('total') || motoristaName === '-') continue;
          const getStr = (idx: number) => idx !== -1 && row[idx] ? String(row[idx]).trim().replace(/\uFFFD/g, 'A') : '';
          const parseNum = (idx: number) => { if (idx === -1) return 0; const raw = row[idx] ? String(row[idx]) : ''; let clean = raw.replace(/R\$\s?/, '').replace(/%/, '').trim(); if (!clean || clean === '-') return 0; if (clean.includes(',') && clean.includes('.')) clean = clean.replace(/\./g, '').replace(',', '.'); else if (clean.includes(',') && !clean.includes('.')) clean = clean.replace(',', '.'); return parseFloat(clean) || 0; };
          const motorista = motoristaName, tipoContrato = getStr(colMap.tipoContrato), veiculo = getStr(colMap.veiculo), operacao = getStr(colMap.operacao);
          const vlrDiaria = parseNum(colMap.vlrDiaria), diasTrabalhados = parseNum(colMap.diasTrabalhados), entregas = parseNum(colMap.entregas), valorFaturado = parseNum(colMap.valorFaturado), insucessos = parseNum(colMap.insucessos), vlrEntregas = parseNum(colMap.vlrEntregas), bonus = parseNum(colMap.bonus), coletas = parseNum(colMap.coletas), vlrColetas = parseNum(colMap.vlrColetas), vlrSabado = parseNum(colMap.vlrSabado), pedagio = parseNum(colMap.pedagio), mudanca = parseNum(colMap.mudanca), outrosValores = parseNum(colMap.outrosValores), descontos = parseNum(colMap.descontos), regiaoEntrega = getStr(colMap.regiaoEntrega), cep = getStr(colMap.cep), pctColetados = parseNum(colMap.pctColetados), pctPorPonto = parseNum(colMap.pctPorPonto);
          const vlrDasDiarias = vlrDiaria * diasTrabalhados, vlrTotal = vlrDasDiarias + vlrEntregas + bonus + vlrColetas + vlrSabado + pedagio + mudanca + outrosValores - descontos, tckMedio = entregas > 0 ? vlrTotal / entregas : 0, lucroBruto = valorFaturado - vlrTotal, pctCusto = valorFaturado > 0 ? (vlrTotal / valorFaturado) * 100 : 0, entregasDia = diasTrabalhados > 0 ? entregas / diasTrabalhados : 0, coletasDia = diasTrabalhados > 0 ? coletas / diasTrabalhados : 0;
          parsedRecords.push({ id: generateId(), motorista, tipoContrato, veiculo, operacao, vlrDiaria, diasTrabalhados, entregas, valorFaturado, insucessos, vlrDasDiarias, vlrEntregas, bonus, coletas, vlrColetas, vlrSabado, pedagio, mudanca, outrosValores, descontos, vlrTotal, tckMedio, lucroBruto, pctCusto, entregasDia, coletasDia, regiaoEntrega, cep, pctColetados, pctPorPonto });
        }
        if (foundDateRange) setDateRange(foundDateRange);
        setRecords(prev => [...parsedRecords, ...prev]);
        setActiveTab('spreadsheet');
      }
    });
  };

  const filteredRecords = useMemo(() => {
    let result = records;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(r => r.motorista.toLowerCase().includes(lowerQuery) || r.tipoContrato.toLowerCase().includes(lowerQuery) || r.veiculo.toLowerCase().includes(lowerQuery));
    }
    result = result.filter(r => {
      for (const [key, allowedValues] of Object.entries(columnFilters)) {
        if (allowedValues && allowedValues.length > 0) {
          const val = String(r[key as keyof LogisticsRecord] || '');
          if (!allowedValues.includes(val)) return false;
        }
      }
      return true;
    });
    return result;
  }, [records, searchQuery, columnFilters]);

  const toggleColumnFilter = (field: keyof LogisticsRecord, value: string) => {
    setColumnFilters(prev => {
      const current = prev[field] || [];
      const isSelected = current.includes(value);
      const newValues = isSelected ? current.filter(v => v !== value) : [...current, value];
      if (newValues.length === 0) { const copy = { ...prev }; delete copy[field]; return copy; }
      return { ...prev, [field]: newValues };
    });
  };

  const clearColumnFilter = (field: keyof LogisticsRecord) => {
    setColumnFilters(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  // Get current time for taskbar
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#008080', fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", fontSize: '11px', paddingBottom: '32px' }}>
      
      {/* Window Chrome */}
      <div style={{ margin: '8px', border: '2px solid #ffffff', borderRight: '2px solid #808080', borderBottom: '2px solid #808080', boxShadow: 'inset -1px -1px 0 #404040, inset 1px 1px 0 #e8e4dc, 2px 2px 8px rgba(0,0,0,0.4)' }}>
        
        {/* Title Bar */}
        <div className="win-titlebar" style={{ padding: '3px 4px', gap: 4 }}>
          <img src="/r3-logo.png" alt="R3" style={{ width: 16, height: 16, objectFit: 'contain', imageRendering: 'pixelated' }} />
          <span style={{ flex: 1, fontWeight: 'bold', fontSize: '11px', letterSpacing: 0 }}>
            R3 Express Operacional - Sistema de Custos Logísticos da Frota
            {dateRange ? ` [${dateRange}]` : ''}
          </span>
          {/* Window control buttons */}
          <button className="win-btn" style={{ width: 16, height: 14, padding: 0, fontSize: '9px', lineHeight: '1', fontWeight: 'bold', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>_</button>
          <button className="win-btn" style={{ width: 16, height: 14, padding: 0, fontSize: '9px', lineHeight: '1', fontWeight: 'bold', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>□</button>
          <button className="win-btn" style={{ width: 16, height: 14, padding: 0, fontSize: '9px', lineHeight: '1', fontWeight: 'bold', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000' }}>✕</button>
        </div>

        {/* Menu Bar */}
        <div style={{ background: '#d4d0c8', borderBottom: '1px solid #808080', padding: '2px 4px', display: 'flex', gap: 0, fontSize: '11px' }}>
          {['Arquivo', 'Editar', 'Exibir', 'Ferramentas', 'Ajuda'].map(item => (
            <button key={item} style={{ background: 'transparent', border: 'none', padding: '1px 6px', cursor: 'pointer', fontSize: '11px', fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0a246a', e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#000')}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ background: '#d4d0c8', padding: '4px' }}>
          
          {/* KPI Header - only on spreadsheet tab */}
          {activeTab === 'spreadsheet' && (
            <DashboardHeader records={filteredRecords} darkMode={false} />
          )}

          {/* Toolbar */}
          <Toolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddRow={addRecord}
            onExport={exportToCSV}
            onImport={importCSV}
            onClearAll={clearAllRecords}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={false}
            setDarkMode={() => {}}
          />

          {/* Tab Content Area */}
          <div style={{ background: '#ffffff', border: '2px solid #808080', borderTop: '1px solid #808080', borderRight: '2px solid #ffffff', borderBottom: '2px solid #ffffff', boxShadow: 'inset 1px 1px 0 #404040', padding: '8px', minHeight: '400px' }}>
            {activeTab === 'spreadsheet' ? (
              <SpreadsheetTable 
                records={filteredRecords} allRecords={records}
                onUpdateRecord={updateRecord} onDeleteRecord={deleteRecord}
                columnFilters={columnFilters} onToggleFilter={toggleColumnFilter}
                onClearFilter={clearColumnFilter} darkMode={false}
              />
            ) : activeTab === 'dashboard' ? (
              <DashboardView records={filteredRecords} darkMode={false} globalCosts={globalCosts} setGlobalCosts={setGlobalCosts} />
            ) : activeTab === 'summary' ? (
              <SummaryView records={filteredRecords} darkMode={false} dateRange={dateRange} />
            ) : activeTab === 'coletas' ? (
              <ColetaAnalysisView records={filteredRecords} darkMode={false} dateRange={dateRange} />
            ) : activeTab === 'performance' ? (
              <DriverPerformanceView records={filteredRecords} darkMode={false} dateRange={dateRange} />
            ) : (
              <InsightsView records={filteredRecords} darkMode={false} dateRange={dateRange} />
            )}
          </div>

        </div>

        {/* Status Bar */}
        <div style={{ background: '#d4d0c8', borderTop: '1px solid #808080', padding: '2px 4px', display: 'flex', gap: 4, fontSize: '11px' }}>
          <div className="win-statusbar-item" style={{ flex: 1 }}>
            {records.length} registro(s) | Filtrado: {filteredRecords.length}
          </div>
          <div className="win-statusbar-item">
            R3 Express Operacional v2.0
          </div>
          <div className="win-statusbar-item">
            Pronto
          </div>
        </div>

      </div>

      {/* Windows Taskbar */}
      <div className="win-taskbar">
        <button className="win-start-btn">
          <img src="/r3-logo.png" alt="" style={{ width: 14, height: 14, objectFit: 'contain', imageRendering: 'pixelated' }} />
          <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Iniciar</span>
        </button>
        <div style={{ width: 1, height: 20, background: '#808080', margin: '0 4px' }} />
        <div style={{ flex: 1, display: 'flex', gap: 2 }}>
          <button className="win-btn" style={{ fontWeight: 'bold', fontSize: '11px', padding: '2px 8px', height: 22, background: '#bdb8ad', borderTop: '2px solid #808080', borderLeft: '2px solid #808080', borderRight: '2px solid #ffffff', borderBottom: '2px solid #ffffff' }}>
            📊 R3 Express Operacional
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px', borderLeft: '2px solid #808080', borderTop: '1px solid #808080', fontSize: '11px', fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", height: '100%' }}>
          <span>🔊</span>
          <span style={{ fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", fontSize: '11px' }}>{time}</span>
        </div>
      </div>

    </div>
  );
}

export default App;

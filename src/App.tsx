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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [dateRange, setDateRange] = useState(() => localStorage.getItem('logistics_date_range') || '');
  
  const [records, setRecords] = useState<LogisticsRecord[]>(() => {
    const saved = localStorage.getItem('logistics_records_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof LogisticsRecord, string[]>>>({});

  const [globalCosts, setGlobalCosts] = useState<GlobalCosts>(() => {
    const saved = localStorage.getItem('logistics_global_costs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_COSTS;
      }
    }
    return INITIAL_COSTS;
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Persist to localStorage whenever records change
  useEffect(() => {
    localStorage.setItem('logistics_records_v2', JSON.stringify(records));
  }, [records]);

  // Persist date range
  useEffect(() => {
    localStorage.setItem('logistics_date_range', dateRange);
  }, [dateRange]);

  // Persist global costs
  useEffect(() => {
    localStorage.setItem('logistics_global_costs', JSON.stringify(globalCosts));
  }, [globalCosts]);

  const addRecord = () => {
    const newRecord: LogisticsRecord = {
      id: generateId(),
      motorista: '',
      tipoContrato: '',
      veiculo: '',
      operacao: '',
      vlrDiaria: 0,
      diasTrabalhados: 0,
      entregas: 0,
      valorFaturado: 0,
      insucessos: 0,
      vlrDasDiarias: 0,
      vlrEntregas: 0,
      bonus: 0,
      coletas: 0,
      vlrColetas: 0,
      vlrSabado: 0,
      pedagio: 0,
      mudanca: 0,
      outrosValores: 0,
      descontos: 0,
      vlrTotal: 0,
      tckMedio: 0,
      lucroBruto: 0,
      pctCusto: 0,
      entregasDia: 0,
      coletasDia: 0,
      regiaoEntrega: '',
      cep: '',
      pctColetados: 0,
      pctPorPonto: 0
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

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const clearAllRecords = () => {
    setRecords([]);
    setDateRange('');
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Motorista', 'Tipo Contrato', 'Veículo', 'Operação', 'Vlr Diária', 'Dias Trabalhados', 
      'Entregas', 'Valor Faturado', 'Insucessos', 'Vlr das Diárias', 'Vlr Entregas', 'Bônus', 
      'Coletas', 'Vlr Coletas', 'Vlr Sábado', 'Pedágio', 'Mudança', 'Outros Valores', 'Descontos', 
      'Vlr Total', 'Tck Médio', 'Lucro Bruto', '% Custo', 'Entregas/Dia', 'Coletas/Dia', 
      'Região de Entrega', 'CEP', 'Pct Coletados', 'Pct Por Ponto'
    ];
    
    // Export what's visible in filters
    const rows = filteredRecords.map(r => [
      r.motorista, r.tipoContrato, r.veiculo, r.operacao, r.vlrDiaria, r.diasTrabalhados,
      r.entregas, r.valorFaturado, r.insucessos, r.vlrDasDiarias, r.vlrEntregas, r.bonus,
      r.coletas, r.vlrColetas, r.vlrSabado, r.pedagio, r.mudanca, r.outrosValores, r.descontos,
      r.vlrTotal, r.tckMedio, r.lucroBruto, r.pctCusto, r.entregasDia, r.coletasDia,
      r.regiaoEntrega, r.cep, r.pctColetados, r.pctPorPonto
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analise_custos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = (file: File) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: function(results) {
        const rows = results.data as string[][];

        // Attempt to find Date Range at the top of the CSV
        let foundDateRange = '';
        const dateRegex = /De\s*\d{2}[\/\-]\d{2}[\/\-](?:\d{4}|\d{2})\s*(?:a|à|ate|até)\s*\d{2}[\/\-]\d{2}[\/\-](?:\d{4}|\d{2})/i;
        for (let i = 0; i < Math.min(15, rows.length); i++) {
          if (!rows[i]) continue;
          for (const cell of rows[i]) {
            if (cell && typeof cell === 'string') {
              const match = cell.match(dateRegex);
              if (match) {
                // capitalize the first letter just in case it's lowercased
                const rawDate = match[0];
                foundDateRange = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
                break;
              }
            }
          }
          if (foundDateRange) break;
        }

        let headerRowIndex = -1;
        let headers: string[] = [];
        for (let i = 0; i < rows.length; i++) {
          const rowData = rows[i] ? rows[i].map(c => 
            String(c).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\uFFFD/g, 'a')
          ) : [];
          if (rowData.includes('motorista') || rowData.includes('nome do motorista') || rowData.includes('nome')) {
            headerRowIndex = i;
            headers = rowData;
            break;
          }
        }

        if (headerRowIndex === -1) {
          alert('Não foi possível encontrar a coluna "Motorista" no CSV. Verifique a planilha.');
          return;
        }

        const findColIdx = (aliases: string[]) => {
          for (const alias of aliases) {
            const idx = headers.findIndex(h => h === alias.toLowerCase() || h.includes(alias.toLowerCase()));
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const colMap = {
          motorista: findColIdx(['motorista', 'nome']),
          tipoContrato: findColIdx(['tipo contrato', 'contrato']),
          veiculo: findColIdx(['veiculo', 'carro', 'placa', 'veaculo']),
          operacao: findColIdx(['operacao', 'tipo de operacao', 'tipo operacao', 'operaaao', 'operaao']),
          vlrDiaria: findColIdx(['vlr diaria', 'valor diaria', 'valor da diaria', 'diaria', 'vlr diaaria', 'valor diaaria', 'diaaria']),
          diasTrabalhados: findColIdx(['dias trabalhados', 'dias']),
          entregas: findColIdx(['entregas', 'qtd entregas']),
          valorFaturado: findColIdx(['valor faturado', 'faturamento']),
          insucessos: findColIdx(['insucessos']),
          vlrEntregas: findColIdx(['vlr entregas', 'vlr das entregas']),
          bonus: findColIdx(['bônus', 'bonus']),
          coletas: findColIdx(['coletas', 'qtd coletas']),
          vlrColetas: findColIdx(['vlr coletas', 'valor coletas']),
          vlrSabado: findColIdx(['vlr sábado', 'vlr sabado']),
          pedagio: findColIdx(['pedágio', 'pedagio']),
          mudanca: findColIdx(['mudança', 'mudanca']),
          outrosValores: findColIdx(['outros valores', 'hr parada', 'outros']),
          descontos: findColIdx(['descontos', 'desconto']),
          regiaoEntrega: findColIdx(['região', 'regiao']),
          cep: findColIdx(['cep']),
          pctColetados: findColIdx(['pct coletados', '% coletados']),
          pctPorPonto: findColIdx(['pct por ponto', '% por ponto']),
        };

        const parsedRecords: LogisticsRecord[] = [];

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue;

          const motoristaName = colMap.motorista !== -1 ? String(row[colMap.motorista] || '').trim().replace(/\uFFFD/g, 'A') : '';
          
          if (!motoristaName || motoristaName.toLowerCase().includes('total') || motoristaName === '-') {
            continue;
          }

          const getStr = (idx: number) => {
            if (idx !== -1 && row[idx]) {
               return String(row[idx]).trim().replace(/\uFFFD/g, 'A');
            }
            return '';
          };

          const parseNum = (idx: number) => {
            if (idx === -1) return 0;
            const raw = row[idx] ? String(row[idx]) : '';
            let clean = raw.replace(/R\$\s?/, '').replace(/%/, '').trim();
            if (!clean || clean === '-') return 0;
            
            if (clean.includes(',') && clean.includes('.')) {
                clean = clean.replace(/\./g, '').replace(',', '.');
            } else if (clean.includes(',') && !clean.includes('.')) {
                clean = clean.replace(',', '.');
            }
            return parseFloat(clean) || 0;
          };

          const motorista = motoristaName;
          const tipoContrato = getStr(colMap.tipoContrato);
          const veiculo = getStr(colMap.veiculo);
          const operacao = getStr(colMap.operacao);
          
          const vlrDiaria = parseNum(colMap.vlrDiaria);
          const diasTrabalhados = parseNum(colMap.diasTrabalhados);
          const entregas = parseNum(colMap.entregas);
          const valorFaturado = parseNum(colMap.valorFaturado);
          const insucessos = parseNum(colMap.insucessos);
          const vlrEntregas = parseNum(colMap.vlrEntregas);
          const bonus = parseNum(colMap.bonus);
          const coletas = parseNum(colMap.coletas);
          const vlrColetas = parseNum(colMap.vlrColetas);
          const vlrSabado = parseNum(colMap.vlrSabado);
          const pedagio = parseNum(colMap.pedagio);
          const mudanca = parseNum(colMap.mudanca);
          const outrosValores = parseNum(colMap.outrosValores);
          const descontos = parseNum(colMap.descontos);
          const regiaoEntrega = getStr(colMap.regiaoEntrega);
          const cep = getStr(colMap.cep);
          const pctColetados = parseNum(colMap.pctColetados);
          const pctPorPonto = parseNum(colMap.pctPorPonto);

          const vlrDasDiarias = vlrDiaria * diasTrabalhados;
          const vlrTotal = vlrDasDiarias + vlrEntregas + bonus + vlrColetas + vlrSabado + pedagio + mudanca + outrosValores - descontos;
          const tckMedio = entregas > 0 ? (vlrTotal / entregas) : 0;
          const lucroBruto = valorFaturado - vlrTotal;
          const pctCusto = valorFaturado > 0 ? (vlrTotal / valorFaturado) * 100 : 0;
          const entregasDia = diasTrabalhados > 0 ? (entregas / diasTrabalhados) : 0;
          const coletasDia = diasTrabalhados > 0 ? (coletas / diasTrabalhados) : 0;
          
          parsedRecords.push({
            id: generateId(),
            motorista, tipoContrato, veiculo, operacao, vlrDiaria, diasTrabalhados,
            entregas, valorFaturado, insucessos, vlrDasDiarias, vlrEntregas, bonus,
            coletas, vlrColetas, vlrSabado, pedagio, mudanca, outrosValores, descontos,
            vlrTotal, tckMedio, lucroBruto, pctCusto, entregasDia, coletasDia,
            regiaoEntrega, cep, pctColetados, pctPorPonto
          });
        }

        if (foundDateRange) {
          setDateRange(foundDateRange);
        }
        setRecords(prev => [...parsedRecords, ...prev]);
        setActiveTab('spreadsheet');
      }
    });
  };

  const filteredRecords = useMemo(() => {
    let result = records;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.motorista.toLowerCase().includes(lowerQuery) || 
        r.tipoContrato.toLowerCase().includes(lowerQuery) ||
        r.veiculo.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply column filters
    result = result.filter(r => {
      for (const [key, allowedValues] of Object.entries(columnFilters)) {
        if (allowedValues && allowedValues.length > 0) {
          const val = String(r[key as keyof LogisticsRecord] || '');
          if (!allowedValues.includes(val)) {
            return false;
          }
        }
      }
      return true;
    });

    return result;
  }, [records, searchQuery, columnFilters]);

  // Set column filter
  const toggleColumnFilter = (field: keyof LogisticsRecord, value: string) => {
    setColumnFilters(prev => {
      const current = prev[field] || [];
      const isSelected = current.includes(value);
      
      const newValues = isSelected 
        ? current.filter(v => v !== value) 
        : [...current, value];

      if (newValues.length === 0) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }

      return { ...prev, [field]: newValues };
    });
  };

  const clearColumnFilter = (field: keyof LogisticsRecord) => {
    setColumnFilters(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans p-4 sm:p-8`}>
      <div className="max-w-[1600px] mx-auto">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img src="/r3-logo.png" alt="R3 Express" className="w-14 h-14 object-contain rounded-xl shadow-md" />
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>R3 Express Operacional</h1>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sistema de Custos Logísticos da Frota</p>
            </div>
          </div>
          
          {dateRange && (
            <div className={`px-4 py-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-700'} border rounded-xl shadow-sm flex items-center`}>
              <span className="mr-2 text-lg">📅</span>
              <span className="font-semibold tracking-wide" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {dateRange}
              </span>
            </div>
          )}
        </header>

        {activeTab === 'spreadsheet' && (
          <DashboardHeader records={filteredRecords} darkMode={darkMode} />
        )}

        <Toolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddRow={addRecord}
          onExport={exportToCSV}
          onImport={importCSV}
          onClearAll={clearAllRecords}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {activeTab === 'spreadsheet' ? (
          <SpreadsheetTable 
            records={filteredRecords}
            allRecords={records}
            onUpdateRecord={updateRecord}
            onDeleteRecord={deleteRecord}
            columnFilters={columnFilters}
            onToggleFilter={toggleColumnFilter}
            onClearFilter={clearColumnFilter}
            darkMode={darkMode}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView records={filteredRecords} darkMode={darkMode} globalCosts={globalCosts} setGlobalCosts={setGlobalCosts} />
        ) : activeTab === 'summary' ? (
          <SummaryView records={filteredRecords} darkMode={darkMode} dateRange={dateRange} />
        ) : activeTab === 'coletas' ? (
          <ColetaAnalysisView records={filteredRecords} darkMode={darkMode} dateRange={dateRange} />
        ) : activeTab === 'performance' ? (
          <DriverPerformanceView records={filteredRecords} darkMode={darkMode} dateRange={dateRange} />
        ) : (
          <InsightsView records={filteredRecords} darkMode={darkMode} dateRange={dateRange} />
        )}

      </div>
    </div>
  );
}

export default App;

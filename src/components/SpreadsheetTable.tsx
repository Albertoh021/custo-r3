import { useState, useMemo } from 'react';
import type { LogisticsRecord } from '../types';
import { TableRow } from './TableRow';
import { formatCurrency } from '../utils';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown, Filter, X, CheckSquare, Square } from 'lucide-react';

interface SpreadsheetTableProps {
  records: LogisticsRecord[];
  allRecords: LogisticsRecord[];
  onUpdateRecord: (id: string, field: keyof LogisticsRecord, value: string | number) => void;
  onDeleteRecord: (id: string) => void;
  columnFilters: Partial<Record<keyof LogisticsRecord, string[]>>;
  onToggleFilter: (field: keyof LogisticsRecord, value: string) => void;
  onClearFilter: (field: keyof LogisticsRecord) => void;
  darkMode: boolean;
}

type SortField = keyof LogisticsRecord | null;
type SortDirection = 'asc' | 'desc';

export const SpreadsheetTable = ({ 
  records, 
  allRecords,
  onUpdateRecord, 
  onDeleteRecord,
  columnFilters,
  onToggleFilter,
  onClearFilter,
  darkMode 
}: SpreadsheetTableProps) => {

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const [filterModalField, setFilterModalField] = useState<keyof LogisticsRecord | null>(null);

  // Aggregations
  const totalDias = records.reduce((acc, r) => acc + r.diasTrabalhados, 0);
  const totalEntregas = records.reduce((acc, r) => acc + r.entregas, 0);
  const totalFaturado = records.reduce((acc, r) => acc + r.valorFaturado, 0);
  const totalInsucessos = records.reduce((acc, r) => acc + r.insucessos, 0);
  
  const totalVlrDiarias = records.reduce((acc, r) => acc + r.vlrDasDiarias, 0);
  const totalVlrEntregas = records.reduce((acc, r) => acc + r.vlrEntregas, 0);
  const totalBonus = records.reduce((acc, r) => acc + r.bonus, 0);
  const totalColetas = records.reduce((acc, r) => acc + r.coletas, 0);
  const totalVlrColetas = records.reduce((acc, r) => acc + r.vlrColetas, 0);
  const totalSabado = records.reduce((acc, r) => acc + r.vlrSabado, 0);
  const totalPedagio = records.reduce((acc, r) => acc + r.pedagio, 0);
  const totalMudanca = records.reduce((acc, r) => acc + r.mudanca, 0);
  const totalOutros = records.reduce((acc, r) => acc + r.outrosValores, 0);
  const totalDescontos = records.reduce((acc, r) => acc + r.descontos, 0);
  
  const totalVlrTotal = records.reduce((acc, r) => acc + r.vlrTotal, 0);
  const totalLucro = records.reduce((acc, r) => acc + r.lucroBruto, 0);

  const handleSort = (field: keyof LogisticsRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    if (!sortField) return records;
    return [...records].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [records, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: keyof LogisticsRecord }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' ? <ArrowDownAZ size={14} className="text-blue-500" /> : <ArrowUpZA size={14} className="text-blue-500" />;
  };

  const Th = ({ field, label, widthClass = 'min-w-[120px]', sticky = false }: { field?: keyof LogisticsRecord; label: string; widthClass?: string; sticky?: boolean }) => {
    const isFiltered = field && columnFilters[field] && columnFilters[field]!.length > 0;
    
    return (
      <th 
        className={`p-3 border-r select-none whitespace-normal align-middle ${widthClass} 
          ${darkMode ? 'border-slate-700 bg-slate-900 group hover:bg-slate-800' : 'border-slate-200 bg-slate-50 group hover:bg-slate-100'} 
          ${sticky ? `sticky left-0 z-30 ${darkMode ? 'shadow-[2px_0_5px_rgba(0,0,0,0.5)]' : 'shadow-[2px_0_5px_rgba(0,0,0,0.05)]'}` : ''}`}
      >
        <div className="flex items-center justify-between gap-2 leading-tight">
          <div className="flex-1 cursor-pointer flex items-center gap-1" onClick={() => field && handleSort(field)}>
            <span className={isFiltered ? 'text-blue-500 font-extrabold' : ''}>{label}</span>
            {field && <SortIcon field={field} />}
          </div>
          
          {field && (
            <button 
              onClick={(e) => { e.stopPropagation(); setFilterModalField(field); }}
              className={`p-1 rounded transition-colors ${isFiltered ? (darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600') : (darkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-200')} opacity-50 group-hover:opacity-100`}
            >
              <Filter size={14} />
            </button>
          )}
        </div>
      </th>
    );
  };

  // Extract unique values for filtering modal
  const uniqueValues = useMemo(() => {
    if (!filterModalField) return [];
    const vals = Array.from(new Set(allRecords.map(r => String(r[filterModalField] || ''))));
    return vals.sort((a, b) => a.localeCompare(b));
  }, [allRecords, filterModalField]);

  return (
    <>
      <div className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-auto max-h-[65vh] custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-max text-sm relative border-collapse">
            
            <thead className={`sticky top-0 z-20 shadow-sm uppercase text-[10px] font-bold tracking-wider ${darkMode ? 'bg-slate-900 text-slate-400 border-b-2 border-slate-700' : 'bg-slate-50 text-slate-600 border-b-2 border-slate-300'}`}>
              <tr>
                <Th field="motorista" label="Motorista" widthClass="min-w-[180px]" sticky />
                <Th field="tipoContrato" label="Tipo Contrato" widthClass="min-w-[120px]" />
                <Th field="veiculo" label="Veículo" widthClass="min-w-[100px]" />
                <Th field="operacao" label="Operação" widthClass="min-w-[120px]" />
                
                <Th field="vlrDiaria" label="Vlr Diária" widthClass="min-w-[100px]" />
                <Th field="diasTrabalhados" label="Dias Trabalhados" widthClass="min-w-[100px]" />
                <Th field="entregas" label="Entregas" widthClass="min-w-[80px]" />
                <Th field="valorFaturado" label="Valor Faturado" widthClass="min-w-[110px]" />
                <Th field="insucessos" label="Insucessos" widthClass="min-w-[90px]" />
                
                <Th field="vlrDasDiarias" label="Vlr das Diárias" widthClass="min-w-[110px]" />
                
                <Th field="vlrEntregas" label="Vlr Entregas" widthClass="min-w-[100px]" />
                <Th field="bonus" label="Bônus" widthClass="min-w-[90px]" />
                <Th field="coletas" label="Coletas" widthClass="min-w-[80px]" />
                <Th field="vlrColetas" label="Vlr Coletas" widthClass="min-w-[100px]" />
                <Th field="vlrSabado" label="Vlr Sábado" widthClass="min-w-[100px]" />
                <Th field="pedagio" label="Pedágio" widthClass="min-w-[90px]" />
                <Th field="mudanca" label="Mudança" widthClass="min-w-[90px]" />
                <Th field="outrosValores" label="Outros Valores" widthClass="min-w-[110px]" />
                <Th field="descontos" label="Descontos" widthClass="min-w-[100px]" />
                
                <Th field="vlrTotal" label="Vlr Total Motorista" widthClass="min-w-[130px]" />
                <Th field="tckMedio" label="Tck Médio" widthClass="min-w-[90px]" />
                <Th field="lucroBruto" label="Lucro Bruto" widthClass="min-w-[110px]" />
                <Th field="pctCusto" label="% Custo" widthClass="min-w-[80px]" />
                
                <Th field="entregasDia" label="Entregas / Dia" widthClass="min-w-[100px]" />
                <Th field="coletasDia" label="Coletas / Dia" widthClass="min-w-[100px]" />
                
                <Th field="regiaoEntrega" label="Região Entrega" widthClass="min-w-[120px]" />
                <Th field="cep" label="CEP" widthClass="min-w-[100px]" />
                <Th field="pctColetados" label="% Coletados" widthClass="min-w-[100px]" />
                <Th field="pctPorPonto" label="% Por Ponto" widthClass="min-w-[100px]" />
                
                <th className={`p-3 w-10 border-b ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}></th>
              </tr>
            </thead>
            
            <tbody className="relative z-0">
              {sortedRecords.length > 0 ? (
                sortedRecords.map(record => (
                  <TableRow 
                    key={record.id} 
                    record={record} 
                    onChange={onUpdateRecord}
                    onDelete={onDeleteRecord} 
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={30} className={`p-8 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Nenhum registro encontrado. Adicione uma linha ou ajuste seus filtros.
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot className={`sticky bottom-0 z-20 font-bold text-xs shadow-[0_-2px_10px_rgba(0,0,0,0.1)] ${darkMode ? 'bg-slate-800 text-slate-300 border-t border-slate-700' : 'bg-slate-200 text-slate-800 border-t border-slate-300'}`}>
              <tr>
                <td colSpan={5} className="p-3 text-right">TOTAIS (Filtrados):</td>
                
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{totalDias}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{totalEntregas}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right ${darkMode ? 'text-indigo-400' : 'text-blue-700'}`}>{formatCurrency(totalFaturado)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{totalInsucessos}</td>
                
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalVlrDiarias)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalVlrEntregas)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalBonus)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{totalColetas}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalVlrColetas)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalSabado)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalPedagio)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalMudanca)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>{formatCurrency(totalOutros)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right ${darkMode ? 'text-red-400' : 'text-red-600'}`}>-{formatCurrency(totalDescontos)}</td>
                
                <td className={`p-3 border-r text-right ${darkMode ? 'border-slate-700 bg-slate-700/50 text-white' : 'border-slate-300 bg-slate-300/50 text-slate-900'}`}>{formatCurrency(totalVlrTotal)}</td>
                <td className={`p-3 border-r ${darkMode ? 'border-slate-700' : 'border-slate-300'} text-right`}>-</td>
                <td className={`p-3 border-r text-right ${darkMode ? 'border-slate-700 bg-slate-700/50' : 'border-slate-300 bg-slate-300/50'} ${totalLucro >= 0 ? (darkMode ? 'text-green-400' : 'text-green-700') : (darkMode ? 'text-red-400' : 'text-red-700')}`}>
                  {formatCurrency(totalLucro)}
                </td>
                <td colSpan={7}></td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

      {/* Filter Modal */}
      {filterModalField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Filtrar Coluna</h3>
              <button onClick={() => setFilterModalField(null)} className={`p-1 rounded-md ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                <X size={18} />
              </button>
            </div>
            
            <div className="max-h-[300px] overflow-auto p-2">
              {uniqueValues.map((val, idx) => {
                const isSelected = columnFilters[filterModalField]?.includes(val);
                return (
                  <div 
                    key={idx} 
                    onClick={() => onToggleFilter(filterModalField, val)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                  >
                    {isSelected 
                      ? <CheckSquare size={18} className={darkMode ? 'text-indigo-500' : 'text-blue-500'} /> 
                      : <Square size={18} className={darkMode ? 'text-slate-600' : 'text-slate-300'} />
                    }
                    <span className={`text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'} ${val === '' ? 'italic opacity-60' : ''}`}>
                      {val === '' ? '(Vazio)' : val}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className={`p-4 border-t flex gap-3 ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <button 
                onClick={() => { onClearFilter(filterModalField); setFilterModalField(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Limpar Filtro
              </button>
              <button 
                onClick={() => setFilterModalField(null)}
                className={`flex-1 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

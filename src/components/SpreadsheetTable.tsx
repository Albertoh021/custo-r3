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
}: SpreadsheetTableProps) => {

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterModalField, setFilterModalField] = useState<keyof LogisticsRecord | null>(null);

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
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const sortedRecords = useMemo(() => {
    if (!sortField) return records;
    return [...records].sort((a, b) => {
      const aVal = a[sortField], bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      return 0;
    });
  }, [records, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: keyof LogisticsRecord }) => {
    if (sortField !== field) return <ArrowUpDown size={10} style={{ opacity: 0.4 }} />;
    return sortDirection === 'asc' ? <ArrowDownAZ size={10} style={{ color: '#0000ff' }} /> : <ArrowUpZA size={10} style={{ color: '#0000ff' }} />;
  };

  const thStyle: React.CSSProperties = {
    background: '#0a246a',
    color: '#ffffff',
    fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 6px',
    borderRight: '1px solid #1a3888',
    borderBottom: '2px solid #404040',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  };

  const Th = ({ field, label }: { field?: keyof LogisticsRecord; label: string }) => {
    const isFiltered = field && columnFilters[field] && columnFilters[field]!.length > 0;
    return (
      <th style={{ ...thStyle, background: isFiltered ? '#1a4a8a' : '#0a246a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ cursor: 'pointer', flex: 1 }} onClick={() => field && handleSort(field)}>
            {isFiltered ? '▼ ' : ''}{label}
          </span>
          {field && <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SortIcon field={field} />
            <Filter size={9} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setFilterModalField(field)} />
          </span>}
        </div>
      </th>
    );
  };

  const uniqueValues = useMemo(() => {
    if (!filterModalField) return [];
    return Array.from(new Set(allRecords.map(r => String(r[filterModalField] || '')))).sort((a, b) => a.localeCompare(b));
  }, [allRecords, filterModalField]);

  const tdStyle: React.CSSProperties = {
    padding: '2px 6px',
    borderRight: '1px solid #c0bdb5',
    borderBottom: '1px solid #c0bdb5',
    fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
    fontSize: '11px',
    color: '#000000',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      {/* Win2K Table Container - inset border */}
      <div style={{
        borderTop: '2px solid #808080',
        borderLeft: '2px solid #808080',
        borderRight: '2px solid #ffffff',
        borderBottom: '2px solid #ffffff',
        boxShadow: 'inset 1px 1px 0 #404040',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '60vh', background: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content', tableLayout: 'auto' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <tr>
                <Th field="motorista" label="Motorista" />
                <Th field="tipoContrato" label="Tipo Contrato" />
                <Th field="veiculo" label="Veículo" />
                <Th field="operacao" label="Operação" />
                <Th field="vlrDiaria" label="Vlr Diária" />
                <Th field="diasTrabalhados" label="Dias Trab." />
                <Th field="entregas" label="Entregas" />
                <Th field="valorFaturado" label="Vlr Faturado" />
                <Th field="insucessos" label="Insucessos" />
                <Th field="vlrDasDiarias" label="Vlr Diárias" />
                <Th field="vlrEntregas" label="Vlr Entregas" />
                <Th field="bonus" label="Bônus" />
                <Th field="coletas" label="Coletas" />
                <Th field="vlrColetas" label="Vlr Coletas" />
                <Th field="vlrSabado" label="Vlr Sábado" />
                <Th field="pedagio" label="Pedágio" />
                <Th field="mudanca" label="Mudança" />
                <Th field="outrosValores" label="Outros Vlr." />
                <Th field="descontos" label="Descontos" />
                <Th field="vlrTotal" label="Vlr Total" />
                <Th field="tckMedio" label="Tck Médio" />
                <Th field="lucroBruto" label="Lucro Bruto" />
                <Th field="pctCusto" label="% Custo" />
                <Th field="entregasDia" label="Entr./Dia" />
                <Th field="coletasDia" label="Col./Dia" />
                <Th field="regiaoEntrega" label="Região" />
                <Th field="cep" label="CEP" />
                <Th field="pctColetados" label="% Colet." />
                <Th field="pctPorPonto" label="% Ponto" />
                <th style={{ ...thStyle, width: 30 }}></th>
              </tr>
            </thead>

            <tbody>
              {sortedRecords.length > 0 ? (
                sortedRecords.map((record, idx) => (
                  <TableRow 
                    key={record.id} 
                    record={record} 
                    onChange={onUpdateRecord}
                    onDelete={onDeleteRecord} 
                    darkMode={false}
                    // Pass Win2K style override via style prop
                    style={{ background: idx % 2 === 0 ? '#ffffff' : '#e8e4dc' }}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={30} style={{ ...tdStyle, textAlign: 'center', padding: '20px', color: '#808080', fontStyle: 'italic', background: '#ffffff' }}>
                    Nenhum registro encontrado. Adicione uma linha ou importe um CSV.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Totals Footer */}
            <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
              <tr style={{ background: '#d4d0c8', fontWeight: 'bold', borderTop: '2px solid #808080' }}>
                <td colSpan={5} style={{ ...tdStyle, background: '#d4d0c8', color: '#000080', fontWeight: 'bold', textAlign: 'right', borderRight: '2px solid #808080' }}>TOTAIS:</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{totalDias}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{totalEntregas}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right', color: '#000080' }}>{formatCurrency(totalFaturado)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{totalInsucessos}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalVlrDiarias)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalVlrEntregas)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalBonus)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{totalColetas}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalVlrColetas)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalSabado)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalPedagio)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalMudanca)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(totalOutros)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right', color: '#800000' }}>-{formatCurrency(totalDescontos)}</td>
                <td style={{ ...tdStyle, background: '#bdb8ad', fontWeight: 'bold', textAlign: 'right', color: '#000080', borderLeft: '2px solid #808080', borderRight: '2px solid #808080' }}>{formatCurrency(totalVlrTotal)}</td>
                <td style={{ ...tdStyle, background: '#d4d0c8', fontWeight: 'bold', textAlign: 'right' }}>-</td>
                <td style={{ ...tdStyle, background: '#bdb8ad', fontWeight: 'bold', textAlign: 'right', color: totalLucro >= 0 ? '#006400' : '#800000' }}>{formatCurrency(totalLucro)}</td>
                <td colSpan={7} style={{ background: '#d4d0c8' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Win2K Filter Dialog */}
      {filterModalField && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
          {/* Win2K Dialog Window */}
          <div style={{
            background: '#d4d0c8',
            borderTop: '2px solid #ffffff',
            borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #808080',
            borderBottom: '2px solid #808080',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.5), inset -1px -1px 0 #404040, inset 1px 1px 0 #e8e4dc',
            minWidth: 280,
            maxWidth: 360,
            overflow: 'hidden',
            fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
          }}>
            {/* Dialog Title Bar */}
            <div className="win-titlebar">
              <span style={{ fontSize: '10px' }}>🔍</span>
              <span style={{ flex: 1, fontSize: '11px', fontWeight: 'bold' }}>Filtrar Coluna</span>
              <button className="win-btn" onClick={() => setFilterModalField(null)}
                style={{ width: 16, height: 14, padding: 0, fontSize: '9px', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000', fontWeight: 'bold' }}>
                <X size={10} />
              </button>
            </div>
            
            {/* Dialog Content */}
            <div style={{ padding: '8px' }}>
              <div style={{
                background: '#ffffff',
                borderTop: '2px solid #808080',
                borderLeft: '2px solid #808080',
                borderRight: '2px solid #e8e4dc',
                borderBottom: '2px solid #e8e4dc',
                boxShadow: 'inset 1px 1px 0 #404040',
                maxHeight: 200,
                overflowY: 'auto',
                padding: '2px',
              }}>
                {uniqueValues.map((val, idx) => {
                  const isSelected = columnFilters[filterModalField]?.includes(val);
                  return (
                    <div 
                      key={idx}
                      onClick={() => onToggleFilter(filterModalField, val)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '2px 4px', cursor: 'pointer', fontSize: '11px',
                        background: isSelected ? '#0a246a' : 'transparent',
                        color: isSelected ? '#ffffff' : '#000000',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#0a246a', e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#000'; }}
                    >
                      {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                      <span style={{ fontStyle: val === '' ? 'italic' : 'normal', opacity: val === '' ? 0.6 : 1 }}>{val === '' ? '(Vazio)' : val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dialog Buttons */}
            <div style={{ padding: '4px 8px 8px 8px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              <button className="win-btn" onClick={() => { onClearFilter(filterModalField); setFilterModalField(null); }} style={{ minWidth: 80 }}>
                Limpar
              </button>
              <button className="win-btn" onClick={() => setFilterModalField(null)} style={{ minWidth: 80, fontWeight: 'bold' }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

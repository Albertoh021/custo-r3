import type { LogisticsRecord } from '../types';
import { formatCurrency, formatPercent } from '../utils';
import { Trash2 } from 'lucide-react';

interface TableRowProps {
  record: LogisticsRecord;
  onChange: (id: string, field: keyof LogisticsRecord, value: string | number) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
  style?: React.CSSProperties;
}

const cellStyle: React.CSSProperties = {
  padding: '1px 4px',
  borderRight: '1px solid #c0bdb5',
  borderBottom: '1px solid #c0bdb5',
  fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
  fontSize: '11px',
  color: '#000000',
  whiteSpace: 'nowrap',
  minWidth: 80,
};

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  width: '100%',
  fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
  fontSize: '11px',
  color: '#000000',
  padding: '1px 2px',
  minWidth: 60,
};

export const TableRow = ({ record, onChange, onDelete, style }: TableRowProps) => {
  const rowBg = style?.background || '#ffffff';

  const InputText = ({ field, minW = 80 }: { field: keyof LogisticsRecord; minW?: number }) => (
    <input
      type="text"
      value={record[field] as string}
      onChange={e => onChange(record.id, field, e.target.value)}
      style={{ ...inputStyle, minWidth: minW, background: 'transparent' }}
      placeholder="---"
      onFocus={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.outline = '1px dotted #000000'; }}
      onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.outline = 'none'; }}
    />
  );

  const InputNum = ({ field, minW = 60 }: { field: keyof LogisticsRecord; minW?: number }) => (
    <input
      type="number"
      value={record[field] === 0 ? '' : Number(record[field])}
      onChange={e => onChange(record.id, field, parseFloat(e.target.value) || 0)}
      style={{ ...inputStyle, textAlign: 'right', minWidth: minW }}
      placeholder="0"
      step="any"
      onFocus={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.outline = '1px dotted #000000'; }}
      onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.outline = 'none'; }}
    />
  );

  const computedCellBg = record.lucroBruto >= 0 ? '#e8ffe8' : '#ffe8e8';

  return (
    <tr style={{ background: rowBg }}
      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#d0e8ff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}>
      
      <td style={{ ...cellStyle, minWidth: 140 }}><InputText field="motorista" minW={130} /></td>
      <td style={{ ...cellStyle, minWidth: 110 }}><InputText field="tipoContrato" minW={100} /></td>
      <td style={{ ...cellStyle, minWidth: 90 }}><InputText field="veiculo" minW={80} /></td>
      <td style={{ ...cellStyle, minWidth: 100 }}><InputText field="operacao" minW={90} /></td>
      
      <td style={{ ...cellStyle, minWidth: 80 }}><InputNum field="vlrDiaria" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="diasTrabalhados" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="entregas" /></td>
      <td style={{ ...cellStyle, minWidth: 90 }}><InputNum field="valorFaturado" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="insucessos" /></td>
      
      <td style={{ ...cellStyle, minWidth: 90, background: '#f0f0e8', textAlign: 'right', color: '#000080' }}>
        {formatCurrency(record.vlrDasDiarias)}
      </td>
      
      <td style={{ ...cellStyle, minWidth: 80 }}><InputNum field="vlrEntregas" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="bonus" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="coletas" /></td>
      <td style={{ ...cellStyle, minWidth: 80 }}><InputNum field="vlrColetas" /></td>
      <td style={{ ...cellStyle, minWidth: 80 }}><InputNum field="vlrSabado" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="pedagio" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="mudanca" /></td>
      <td style={{ ...cellStyle, minWidth: 80 }}><InputNum field="outrosValores" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="descontos" /></td>
      
      <td style={{ ...cellStyle, minWidth: 90, background: '#e8e4dc', textAlign: 'right', fontWeight: 'bold', color: '#000080' }}>
        {formatCurrency(record.vlrTotal)}
      </td>
      <td style={{ ...cellStyle, minWidth: 80, textAlign: 'right', color: '#404040' }}>
        {formatCurrency(record.tckMedio)}
      </td>
      <td style={{ ...cellStyle, minWidth: 90, background: computedCellBg, textAlign: 'right', fontWeight: 'bold', color: record.lucroBruto >= 0 ? '#006400' : '#800000' }}>
        {formatCurrency(record.lucroBruto)}
      </td>
      <td style={{ ...cellStyle, minWidth: 70, textAlign: 'right', color: '#404040' }}>
        {formatPercent(record.pctCusto)}
      </td>
      
      <td style={{ ...cellStyle, minWidth: 70, textAlign: 'right', color: '#404040' }}>
        {Number(record.entregasDia).toFixed(1)}
      </td>
      <td style={{ ...cellStyle, minWidth: 70, textAlign: 'right', color: '#404040' }}>
        {Number(record.coletasDia).toFixed(1)}
      </td>
      
      <td style={{ ...cellStyle, minWidth: 100 }}><InputText field="regiaoEntrega" minW={90} /></td>
      <td style={{ ...cellStyle, minWidth: 80 }}><InputText field="cep" minW={70} /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="pctColetados" /></td>
      <td style={{ ...cellStyle, minWidth: 70 }}><InputNum field="pctPorPonto" /></td>
      
      <td style={{ ...cellStyle, minWidth: 30, textAlign: 'center', padding: 2 }}>
        <button
          onClick={() => onDelete(record.id)}
          title="Excluir linha"
          style={{
            background: '#d4d0c8',
            border: 'none',
            cursor: 'pointer',
            padding: '1px 3px',
            fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
            fontSize: '10px',
            color: '#800000',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#c0bdb5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#d4d0c8'; }}
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  );
};
